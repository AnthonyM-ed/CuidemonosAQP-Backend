const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');

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

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, dni: user.dni },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    await User.update({ refresh_token: refreshToken }, { where: { id: user.id } });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
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

router.post('/register', async (req, res) => {
  try {
    const { dni, first_name, last_name, dni_extension, password, phone, email, reputation_status_id } = req.body;

    if (!password) return res.status(400).json({ message: 'Password es obligatorio' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      dni,
      first_name,
      last_name,
      dni_extension,
      password: hashedPassword,
      phone,
      email,
      reputation_status_id,
    });

    const userData = newUser.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error });
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
module.exports = router;
