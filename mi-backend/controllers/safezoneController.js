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

        // Asegúrate de que el usuario esté en sesión
        const creatorUserId = req.user?.id;
        if (!creatorUserId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Agregar automáticamente al usuario autenticado si no está en el array
        let fullUserIds = [...new Set([...user_ids, creatorUserId])]; // sin duplicados

        if (fullUserIds.length !== 3) {
            return res.status(400).json({ message: 'Se necesitan exactamente 3 usuarios distintos para validar una zona (incluyendo al creador)' });
        }

        try {
            // Verificar duplicado de zona activa en la misma ubicación
            const existingZone = await SafeZone.findOne({
                where: {
                    latitude,
                    longitude,
                    is_active: true
                }
            });

            if (existingZone) {
                return res.status(400).json({ message: 'Ya existe una zona activa en esta ubicación' });
            }

            // Verificar que todos los usuarios estén activos
            const validUsers = await User.findAll({
                where: {
                    id: fullUserIds,
                    is_active: true
                }
            });

            if (validUsers.length !== 3) {
                return res.status(400).json({ message: 'Todos los usuarios deben estar activos' });
            }

            // Crear zona segura
            const newZone = await SafeZone.create({ latitude, longitude, status_id });

            // Asociar usuarios
            const associations = fullUserIds.map(user_id => ({
                safe_zone_id: newZone.id,
                user_id,
            }));

            await SafeZoneUsers.bulkCreate(associations);

            // Retornar con relaciones
            const zoneWithUsers = await SafeZone.findByPk(newZone.id, {
                include: [
                    { model: PuntoSeguroStatus, as: 'status' },
                    { model: User, through: { attributes: [] } }
                ]
            });

            res.status(201).json(zoneWithUsers);
        } catch (err) {
            console.error('❌ Error al crear zona segura:', err);
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
