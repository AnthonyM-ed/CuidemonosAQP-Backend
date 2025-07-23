const { SafeZoneUsers, SafeZone, User } = require("../models");

const safeZoneInvitationController = {
  async getUserSafeZoneInvitations(req, res) {
    const userId = req.params.id;

    try {
      const invitations = await SafeZoneUsers.findAll({
        where: { user_id: userId },
        attributes: [
          "id",
          "safe_zone_id",
          "user_id",
          "confirmed_at",
          "is_seen",
          "status",
        ],
        include: [
          {
            model: SafeZone,
            as: "safeZone",
            attributes: [
              "id",
              "name",
              "description",
              "photo_url",
              "latitude",
              "longitude",
              "rating",
            ],
          },
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "profile_photo_url",
              "reputation_score",
            ],
          },
        ],
        order: [["confirmed_at", "DESC"]],
      });

      res.json(invitations);
    } catch (error) {
      console.error("Error al obtener invitaciones:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

  async updateUserSafeZoneInvitation(req, res) {
    const updates = req.body;
    const { id } = req.params;
    console.log("SAFE_Z0NE_INVITATION", id);

    try {
      const invitation = await SafeZoneUsers.findByPk(id);

      if (!invitation) {
        return res.status(404).json({ error: "Invitación no encontrada" });
      }

      await invitation.update(updates);

      //Hacer lo q te dije
      // Obtener el `safe_zone_id` del registro actualizado
      const { safe_zone_id } = invitation;

      // Verificar cuántos usuarios han aceptado esta zona
      const acceptedCount = await SafeZoneUsers.count({
        where: {
          safe_zone_id,
          status: "ACCEPTED", // Asegúrate de que esto coincida con el enum/string que guardas
        },
      });
      console.log("USUARIOS_ACEPTADOS", acceptedCount);
      

      if (acceptedCount >= 3) {
        console.log("ACTIVANDO ZONA SEGURA!!!!!!!!");
        await SafeZone.update(
          { is_active: true },
          { where: { id: safe_zone_id } }
        );
      }

      const updatedInvitation = await SafeZoneUsers.findByPk(id, {
        attributes: [
          "id",
          "safe_zone_id",
          "user_id",
          "status",
          "confirmed_at",
          "is_seen",
        ],
        include: [
          {
            model: SafeZone,
            as: "safeZone",
            attributes: [
              "id",
              "name",
              "description",
              "photo_url",
              "latitude",
              "longitude",
              "rating",
            ],
          },
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "profile_photo_url",
              "reputation_score",
            ],
          },
        ],
      });

      res.json(updatedInvitation);
    } catch (error) {
      console.error("Error al actualizar la invitación:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
};

module.exports = safeZoneInvitationController;
