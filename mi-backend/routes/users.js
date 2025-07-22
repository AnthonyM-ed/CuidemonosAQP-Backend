const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // importa modelo Sequelize
const authenticateToken = require('../middleware/authenticateToken');
const { uploadFile, deleteFile, createUploadMiddleware } = require('../controllers/imageController');

// GET /users - lista todos los usuarios (protegido)
/*router.get('/', authenticateToken, async (req, res) => {
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
*/

router.post('/', 
  createUploadMiddleware([
    { name: 'dni_photo', maxCount: 1 },
    { name: 'profile_photo', maxCount: 1 },
  ]),
  async (req, res) => {
  try {
    const {
      dni,
      first_name,
      last_name,
      dni_extension,
      password,
      phone,
      email,
      address,
      reputation_status_id,
    } = req.body;

    // Agrega estas líneas para extraer las coordenadas:
    const address_latitude = req.body.address_latitude ? parseFloat(req.body.address_latitude) : null;
    const address_longitude = req.body.address_longitude ? parseFloat(req.body.address_longitude) : null;

    // Y también maneja las imágenes:
    let dni_photo_url = null;
    let profile_photo_url = null;

    if (req.files?.dni_photo?.[0]) {
      dni_photo_url = await uploadFile(req.files.dni_photo[0], 'dni_photos');
    }
    if (req.files?.profile_photo?.[0]) {
      profile_photo_url = await uploadFile(req.files.profile_photo[0], 'profile_photos');
    }

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
      address,
      reputation_status_id,
      address_latitude,  // Ya parseados
      address_longitude, // Ya parseados
      dni_photo_url,     // Agregar si hay imagen
      profile_photo_url  // Agregar si hay imagen
    });

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

      if (updateData.dni === '') {
        return res.status(400).json({ message: 'El DNI no puede estar vacío.' });
      }

      // Archivos
      if (req.files?.dni_photo?.[0]) {
        if (user.dni_photo_url) await deleteFile(user.dni_photo_url);
        updateData.dni_photo_url = await uploadFile(req.files.dni_photo[0], 'dni_photos');
      }
      if (req.files?.profile_photo?.[0]) {
        if (user.profile_photo_url) await deleteFile(user.profile_photo_url);
        updateData.profile_photo_url = await uploadFile(req.files.profile_photo[0], 'profile_photos');
      }

      // **Aquí agregamos lat/lng**
      if (req.body.address_latitude !== undefined)  updateData.address_latitude  = req.body.address_latitude;
      if (req.body.address_longitude !== undefined) updateData.address_longitude = req.body.address_longitude;

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