const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models'); // importa modelo Sequelize
const authenticateToken = require('../middleware/authenticateToken');
const { uploadFile, deleteFile, createUploadMiddleware } = require('../controllers/imageController');

// GET /users - lista todos los usuarios (protegido)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // no devolver contraseña
      include: ['reputationStatus'], // opcional: si quieres cargar asociaciones
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

// POST /users - crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { dni, first_name, last_name, dni_extension, password, phone, email, reputation_status_id } = req.body;

    if (!password) return res.status(400).json({ message: 'Password es obligatorio' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email ya registrado' });

    const newUser = await User.create({
      dni,
      first_name,
      last_name,
      dni_extension,
      password,
      phone,
      email,
      reputation_status_id,
    });

    // No devolver password en la respuesta
    const userData = newUser.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
});

// GET /users/:id - obtener un usuario por su ID 
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error });
  }
});

// PUT /users/:id - actualizar un usuario existente
router.put(
  '/:id',
  authenticateToken,
  createUploadMiddleware([
    { name: 'dni_photo', maxCount: 1 },
    { name: 'profile_photo', maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      // Validación opcional: asegurar que 'dni' no esté vacío si lo estás actualizando
      if (updateData.dni === '') {
        return res.status(400).json({ message: 'El DNI no puede estar vacío.' });
      }

      // Manejar archivos subidos
      if (req.files?.dni_photo?.[0]) {
        // Eliminar foto anterior si existe
        if (user.dni_photo_url) {
          await deleteFile(user.dni_photo_url);
        }
        updateData.dni_photo_url = await uploadFile(req.files.dni_photo[0], 'dni_photos');
      }

      if (req.files?.profile_photo?.[0]) {
        // Eliminar foto anterior si existe
        if (user.profile_photo_url) {
          await deleteFile(user.profile_photo_url);
        }
        updateData.profile_photo_url = await uploadFile(req.files.profile_photo[0], 'profile_photos');
      }

      await user.update(updateData);

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
  }
);

// PATCH /users/:id/password - cambiar contraseña
router.patch('/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la contraseña', error });
  }
});

module.exports = router;