'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SafeZoneComment extends Model {
    static associate(models) {
      SafeZoneComment.belongsTo(models.SafeZone, { foreignKey: 'safe_zone_id' });
      SafeZoneComment.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  SafeZoneComment.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      safe_zone_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'SafeZones', key: 'id' },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'SafeZoneComment',
      tableName: 'safe_zone_comments',
      timestamps: false,
    }
  );
  return SafeZoneComment;
};
