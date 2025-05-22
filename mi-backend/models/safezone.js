'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SafeZone extends Model {
    static associate(models) {
      SafeZone.belongsToMany(models.User, {
        through: 'SafeZoneUsers',
        foreignKey: 'safe_zone_id',
      });
      SafeZone.belongsTo(models.PuntoSeguroStatus, {
        foreignKey: 'status_id',
        as: 'status'
      });
    }
  }
  SafeZone.init(
    {
      longitude: DataTypes.FLOAT,
      latitude: DataTypes.FLOAT,
      status_id: {
        type: DataTypes.INTEGER,
        references: { model: 'PuntoSeguroStatuses', key: 'id' }
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
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