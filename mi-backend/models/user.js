'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.SafeZone, {
        through: 'SafeZoneUsers',
        foreignKey: 'user_id',
      });
      User.hasMany(models.LiveStream, { foreignKey: 'user_id' });
      User.hasMany(models.Comment, { foreignKey: 'user_id' });
      User.belongsTo(models.ReputationStatus, {
        foreignKey: 'reputation_status_id',
        as: 'reputationStatus'
      });
    }
  }
  User.init(
    {
      dni: { type: DataTypes.STRING, unique: true },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      dni_extension: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      reputation_score: { type: DataTypes.INTEGER, defaultValue: 5 },
      reputation_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'ReputationStatuses', key: 'id' }
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    }
  );
  return User;
};