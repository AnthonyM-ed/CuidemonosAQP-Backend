const express = require('express');
const router = express.Router();
const safeZoneInvitationController = require('../controllers/safeZoneUserController');
const authenticateToken = require('../middleware/authenticateToken');

// Obtener todas las invitaciones de un usuario específico
router.get('/:id', authenticateToken, safeZoneInvitationController.getUserSafeZoneInvitations);

module.exports = router;