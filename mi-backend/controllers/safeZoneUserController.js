const { SafeZoneUsers, SafeZone, User } = require('../models');

const safeZoneInvitationController = {
  async getUserSafeZoneInvitations(req, res) {
    const userId = req.params.id;

    try {
      const invitations = await SafeZoneUsers.findAll({
        where: { user_id: userId },
        include: [
          {
            model: SafeZone,
            as: 'safeZone',
            attributes: ['id', 'name', 'description', 'photo_url', 'latitude', 'longitude', 'rating'],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'profile_photo_url', 'reputation_score'],
          }
        ],
        order: [['confirmed', 'ASC'], ['confirmed_at', 'DESC']],
      });

      res.json(invitations);
    } catch (error) {
      console.error('Error al obtener invitaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = safeZoneInvitationController;
