const express = require('express');
const router = express.Router();
const { User } = require('../models'); // importa modelo Sequelize
const authenticateToken = require('../middleware/authenticateToken');

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

module.exports = router;
