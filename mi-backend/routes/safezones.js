    const express = require('express');
    const router = express.Router();
    const safeZoneController = require('../controllers/safezoneController');
    const authenticateToken = require('../middleware/authenticateToken');
    const multer = require('multer');
    const path = require('path');

    const { createUploadMiddleware } = require('../controllers/imageController');
    const upload = createUploadMiddleware('photo_url'); 

    router.post('/', authenticateToken, upload, safeZoneController.createSafeZone);
    router.get('/', authenticateToken, safeZoneController.getAllSafeZones);
    router.get('/:id', authenticateToken, safeZoneController.getSafeZoneById);
    router.put('/:id', authenticateToken, upload, safeZoneController.updateSafeZone);

    module.exports = router;
