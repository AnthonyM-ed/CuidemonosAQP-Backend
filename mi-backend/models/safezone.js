'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SafeZone extends Model {
    static associate(models) {
      SafeZone.belongsToMany(models.User, {
        through: 'SafeZoneUsers',
        foreignKey: 'safe_zone_id',
        as: "users"
      });
      SafeZone.belongsTo(models.PuntoSeguroStatus, {
        foreignKey: 'status_id',
        as: 'status',
      });
      SafeZone.hasMany(models.SafeZoneComment, {
        foreignKey: 'safe_zone_id',
        as: 'comments'
      });
      SafeZone.hasOne(models.LiveStream, {
        foreignKey: 'safe_zone_id',
        as: 'liveStream'
      });
    }
  }

  SafeZone.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      category: { type: DataTypes.STRING },
      justification: { // ¿Por qué consideras que es un punto seguro?
        type: DataTypes.TEXT,
        allowNull: false
      },
      photo_url: { type: DataTypes.STRING }, // Evidencia
      assumes_responsibility: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      longitude: DataTypes.FLOAT,
      latitude: DataTypes.FLOAT,
      status_id: {
        type: DataTypes.INTEGER,
        references: { model: 'PuntoSeguroStatuses', key: 'id' }
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: false }, // Solo activo tras confirmación
      rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'SafeZone',
      tableName: 'safe_zones',
      timestamps: true,
      createdAt: true,
      updatedAt: false,
    }
  );
  return SafeZone;
};
