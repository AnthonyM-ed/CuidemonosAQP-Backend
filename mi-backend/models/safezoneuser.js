'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SafeZoneUsers extends Model {
    static associate(models) {}
  }
  SafeZoneUsers.init(
    {
      safe_zone_id: {
        type: DataTypes.INTEGER,
        references: { model: 'SafeZones', key: 'id' },
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: { model: 'Users', key: 'id' },
      },
    },
    {
      sequelize,
      modelName: 'SafeZoneUsers',
      tableName: 'safe_zone_users',
      timestamps: false,
    }
  );
  return SafeZoneUsers;
};