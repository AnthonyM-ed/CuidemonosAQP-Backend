'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReputationStatus extends Model {
    static associate(models) {
      ReputationStatus.hasMany(models.User, {
        foreignKey: 'reputation_status_id',
        as: 'users',
      });
    }
  }

  ReputationStatus.init({
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ReputationStatus',
    tableName: 'reputation_statuses',
    timestamps: true,
  }
  );

  return ReputationStatus;
};
