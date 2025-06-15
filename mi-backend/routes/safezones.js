const express = require('express');
const router = express.Router();
const safeZoneController = require('../controllers/safezoneController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, safeZoneController.getAllSafeZones);
router.post('/', authenticateToken, safeZoneController.createSafeZone);
router.get('/:id', authenticateToken, safeZoneController.getSafeZoneById);
router.put('/:id', authenticateToken, safeZoneController.updateSafeZone);

module.exports = router;