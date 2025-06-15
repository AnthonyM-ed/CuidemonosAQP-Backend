const express = require('express');
const router = express.Router();
const safeZoneController = require('../controllers/safezoneController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/safezones/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + file.fieldname + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

router.post('/', authenticateToken, upload.single('photo_url'), safeZoneController.createSafeZone);
router.get('/', authenticateToken, safeZoneController.getAllSafeZones);
router.get('/:id', authenticateToken, safeZoneController.getSafeZoneById);
router.put('/:id', authenticateToken, upload.single('photo_url'), safeZoneController.updateSafeZone);

module.exports = router;
