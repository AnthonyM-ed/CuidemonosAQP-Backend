const { SafeZone, SafeZoneUsers, PuntoSeguroStatus, User } = require('../models');

module.exports = {
  async getAllSafeZones(req, res) {
    try {
      const zones = await SafeZone.findAll({
        include: [
          { model: PuntoSeguroStatus, as: 'status' },
          { model: User, through: { attributes: [] } }
        ]
      });
      res.json(zones);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener las zonas seguras' });
    }
  },

  async getSafeZoneById(req, res) {
    try {
      const zone = await SafeZone.findByPk(req.params.id, {
        include: [
          { model: PuntoSeguroStatus, as: 'status' },
          { model: User, through: { attributes: [] } }
        ]
      });
      if (!zone) return res.status(404).json({ message: 'Zona no encontrada' });
      res.json(zone);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener la zona' });
    }
  },

  async createSafeZone(req, res) {
    const { latitude, longitude, status_id, user_ids } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length !== 3) {
      return res.status(400).json({ message: 'Se necesitan exactamente 3 usuarios para validar una zona' });
    }

    try {
      const newZone = await SafeZone.create({ latitude, longitude, status_id });

      const associations = user_ids.map(user_id => ({
        safe_zone_id: newZone.id,
        user_id,
      }));

      await SafeZoneUsers.bulkCreate(associations);

      const zoneWithUsers = await SafeZone.findByPk(newZone.id, {
        include: [
          { model: PuntoSeguroStatus, as: 'status' },
          { model: User, through: { attributes: [] } }
        ]
      });

      res.status(201).json(zoneWithUsers);
    } catch (err) {
      res.status(500).json({ message: 'Error al crear la zona segura', error: err.message });
    }
  },

  async updateSafeZone(req, res) {
    const { latitude, longitude, status_id, is_active } = req.body;
    try {
      const zone = await SafeZone.findByPk(req.params.id);
      if (!zone) return res.status(404).json({ message: 'Zona no encontrada' });

      await zone.update({ latitude, longitude, status_id, is_active });
      res.json({ message: 'Zona actualizada correctamente', zone });
    } catch (err) {
      res.status(500).json({ message: 'Error al actualizar la zona', error: err.message });
    }
  }
};
