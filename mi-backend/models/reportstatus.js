'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ReportStatus.hasMany(models.UserReport, {
        foreignKey: 'status_id',
        as: 'user_reports',
      });
    }
  }
  ReportStatus.init({
    status: {
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
    modelName: 'ReportStatus',
    tableName: 'report_statuses',
    timestamps: true,
  });
  return ReportStatus;
};