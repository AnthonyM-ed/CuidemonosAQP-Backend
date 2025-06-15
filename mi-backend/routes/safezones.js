const express = require('express');
const router = express.Router();
const safeZoneController = require('../controllers/safezoneController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, safeZoneController.getAllSafeZones);
router.post('/', authenticate, safeZoneController.createSafeZone);
router.get('/:id', authenticate, safeZoneController.getSafeZoneById);
router.put('/:id', authenticate, safeZoneController.updateSafeZone);

module.exports = router;