const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // puede ser dni o email

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'DNI o Email y contraseña son requeridos' });
    }

    // Determinar si es email o dni
    const isEmail = identifier.includes('@');
    const whereClause = isEmail ? { email: identifier } : { dni: identifier };

    const user = await User.findOne({ where: whereClause });
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, email: user.email, dni: user.dni },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
});

module.exports = router;
