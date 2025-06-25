const express = require('express');
const router = express.Router();
const { UserReview, User } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');

// POST /user-review - Crear una reseña
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { reviewer_id, reviewed_id, comment, score } = req.body;

    if (!reviewer_id || !reviewed_id || !score) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Validar que no se reseñe a sí mismo
    if (reviewer_id === reviewed_id) {
      return res.status(400).json({ message: 'Un usuario no puede evaluarse a sí mismo' });
    }

    // Crear la reseña
    const review = await UserReview.create({
      reviewer_id,
      reviewed_id,
      comment,
      score,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la reseña', error });
  }
});

// GET /user-review/:userId - Obtener todas las reseñas recibidas por un usuario
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const reviews = await UserReview.findAll({
      where: { reviewed_id: userId },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'first_name', 'last_name', 'profile_photo_url'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas', error });
  }
});

module.exports = router;