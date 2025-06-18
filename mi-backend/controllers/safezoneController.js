const { SafeZone, SafeZoneUsers, PuntoSeguroStatus, User } = require('../models');
const { uploadFile, deleteFile } = require('../controllers/imageController');

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
        const {
            name,
            description,
            category,
            justification,
            assumes_responsibility,
            latitude,
            longitude,
            status_id,
            user_ids,
            rating
        } = req.body;

        const creatorUserId = req.user?.id;
        if (!creatorUserId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Convertir user_ids a array de números
        const parsedUserIds = typeof user_ids === 'string'
            ? user_ids.split(',').map(id => parseInt(id))
            : Array.isArray(user_ids) ? user_ids : [];

        let fullUserIds = [...new Set([...parsedUserIds, creatorUserId])];

        if (fullUserIds.length < 3) {
            return res.status(400).json({
                message: 'Se necesitan al menos 3 usuarios distintos para validar una zona (incluyendo al creador)'
            });
        }

        try {
            // Validación de zona duplicada
            const existingZone = await SafeZone.findOne({
                where: { latitude, longitude, is_active: true }
            });

            if (existingZone) {
                return res.status(400).json({ message: 'Ya existe una zona activa en esta ubicación' });
            }

            // Validación de usuarios activos
            const validUsers = await User.findAll({
                where: { id: fullUserIds, is_active: true }
            });

            if (validUsers.length !== fullUserIds.length) {
                return res.status(400).json({ message: 'Todos los usuarios deben estar activos' });
            }
            
            if (rating !== undefined && (rating < 0 || rating > 5)) {
                return res.status(400).json({ message: 'El rating debe estar entre 0 y 5' });
            }

            // Manejar foto subida
            let photo_url = null;
            if (req.file) {
                try {
                    photo_url = await uploadFile(req.file, 'safezones');
                } catch (uploadError) {
                    console.error('Error al subir imagen de zona segura:', uploadError);
                    return res.status(500).json({ 
                        message: 'Error al subir imagen', 
                        error: uploadError.message 
                    });
                }
            } else if (req.body.photo_url) {
                photo_url = req.body.photo_url;
            }

            const newZone = await SafeZone.create({
                name,
                description,
                category,
                justification,
                photo_url,
                assumes_responsibility,
                latitude,
                longitude,
                status_id,
                rating: rating ?? 0
            });

            const associations = fullUserIds.map(user_id => ({
                safe_zone_id: newZone.id,
                user_id
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
            console.error('❌ Error al crear zona segura:', err);
            res.status(500).json({ message: 'Error al crear la zona segura', error: err.message });
        }
    },

    async updateSafeZone(req, res) {
        const {
            name,
            description,
            category,
            justification,
            assumes_responsibility,
            latitude,
            longitude,
            status_id,
            is_active,
            rating
        } = req.body;

        try {
            const zone = await SafeZone.findByPk(req.params.id);
            if (!zone) {
                return res.status(404).json({ message: 'Zona no encontrada' });
            }

            if (rating !== undefined && (rating < 0 || rating > 5)) {
                return res.status(400).json({ message: 'El rating debe estar entre 0 y 5' });
            }

            let photo_url = zone.photo_url; // Mantener la URL actual por defecto

            // Manejar nueva imagen subida
            if (req.file) {
                try {
                    // Eliminar imagen anterior si existe
                    if (zone.photo_url) {
                        await deleteFile(zone.photo_url);
                    }
                    // Subir nueva imagen
                    photo_url = await uploadFile(req.file, 'safezones');
                } catch (uploadError) {
                    console.error('Error al actualizar imagen de zona segura:', uploadError);
                    return res.status(500).json({ 
                        message: 'Error al actualizar imagen', 
                        error: uploadError.message 
                    });
                }
            } else if (req.body.photo_url) {
                // Si se proporciona una nueva URL en el body
                photo_url = req.body.photo_url;
            }

            await zone.update({
                name,
                description,
                category,
                justification,
                photo_url,
                assumes_responsibility,
                latitude,
                longitude,
                status_id,
                is_active,
                rating: rating ?? zone.rating
            });

            const updatedZone = await SafeZone.findByPk(zone.id, {
                include: [
                    { model: PuntoSeguroStatus, as: 'status' },
                    { model: User, through: { attributes: [] } }
                ]
            });

            res.json({ message: 'Zona actualizada correctamente', zone: updatedZone });
        } catch (err) {
            res.status(500).json({ message: 'Error al actualizar la zona', error: err.message });
        }
    }
};