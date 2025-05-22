'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportReason extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ReportReason.hasMany(models.UserReport, {
        foreignKey: 'reason_id',
        as: 'user_reports',
      });
    }
  }
  ReportReason.init({
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'ReportReason',
    tableName: 'report_reasons',
    timestamps: true,
  });
  return ReportReason;
};