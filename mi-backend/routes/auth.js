const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');
const { uploadFile, deleteFile, createUploadMiddleware } = require('../controllers/imageController');

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'DNI o Email y contraseña son requeridos' });
    }

    const isEmail = identifier.includes('@');
    const whereClause = isEmail ? { email: identifier } : { dni: identifier };

    const user = await User.findOne({ where: whereClause });
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, dni: user.dni },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await User.update({ refresh_token: refreshToken }, { where: { id: user.id } });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: error.message || error.toString()
    });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

  try {
    const user = await User.findOne({ where: { refresh_token: refreshToken } });
    if (!user) return res.status(403).json({ message: 'Token inválido' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.id !== user.id) {
        return res.status(403).json({ message: 'Refresh token inválido o expirado' });
      }

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al refrescar token', error });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

  try {
    const user = await User.findOne({ where: { refresh_token: refreshToken } });
    if (!user) return res.status(403).json({ message: 'Usuario no encontrado' });

    user.refresh_token = null;
    await user.save();

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar sesión', error });
  }
});

router.post('/register', createUploadMiddleware([
  { name: 'dni_photo', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      dni,
      first_name,
      last_name,
      dni_extension,
      password,
      phone,
      email,
      reputation_status_id,
      address,
    } = req.body;

    if (!password) return res.status(400).json({ message: 'Password es obligatorio' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email ya registrado' });

    const existingDNI = await User.findOne({ where: { dni } });
    if (existingDNI) return res.status(409).json({ message: 'DNI ya registrado' });

    let dni_photo_url = null;
    let profile_photo_url = null;

    try {
      if (req.files['dni_photo']) {
        dni_photo_url = await uploadFile(req.files['dni_photo'][0], 'dni_photos');
      }

      if (req.files['profile_photo']) {
        profile_photo_url = await uploadFile(req.files['profile_photo'][0], 'profile_photos');
      }
    } catch (uploadError) {
      console.error('Error al subir archivos:', uploadError);
      return res.status(500).json({
        message: 'Error al subir archivos',
        error: uploadError.message
      });
    }

    const newUser = await User.create({
      dni,
      first_name,
      last_name,
      dni_extension,
      password,
      phone,
      email,
      reputation_status_id,
      address,
      dni_photo_url,
      profile_photo_url,
    });

    const userData = newUser.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    console.error(error);
    // Validar error de clave duplicada
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors && error.errors[0].path === 'dni') {
        return res.status(409).json({ message: `El DNI ${req.body.dni} ya está registrado` });
      }

      if (error.errors && error.errors[0].path === 'email') {
        return res.status(409).json({ message: `El correo ${req.body.email} ya está registrado` });
      }

      return res.status(409).json({ message: 'Dato duplicado: ya existe un usuario con esa información única' });
    }
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos del usuario', error });
  }
});

// Subir nueva imagen
router.post('/upload-image', authenticateToken, createUploadMiddleware('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    const { type = 'general' } = req.body;

    const imageUrl = await uploadFile(req.file, `${type}_images`);

    res.status(200).json({
      message: 'Imagen subida exitosamente',
      imageUrl,
      type
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      message: 'Error al subir imagen',
      error: error.message
    });
  }
});

// Actualizar foto de perfil
router.put('/update-profile-photo', authenticateToken, createUploadMiddleware('profile_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Eliminar foto anterior
    if (user.profile_photo_url) {
      await deleteFile(user.profile_photo_url);
    }

    // Subir nueva foto
    const newProfilePhotoUrl = await uploadFile(req.file, 'profile_photos');

    await User.update(
      { profile_photo_url: newProfilePhotoUrl },
      { where: { id: req.user.id } }
    );

    res.status(200).json({
      message: 'Foto de perfil actualizada exitosamente',
      profile_photo_url: newProfilePhotoUrl
    });
  } catch (error) {
    console.error('Error al actualizar foto de perfil:', error);
    res.status(500).json({
      message: 'Error al actualizar foto de perfil',
      error: error.message
    });
  }
});

// Obtener imágenes del usuario
router.get('/my-images', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'dni_photo_url', 'profile_photo_url', 'first_name', 'last_name']
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const images = {
      profile_photo: user.profile_photo_url,
      dni_photo: user.dni_photo_url,
      user_info: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      }
    };

    res.json(images);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({
      message: 'Error al obtener imágenes del usuario',
      error: error.message
    });
  }
});

module.exports = router;