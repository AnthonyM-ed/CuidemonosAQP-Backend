'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserReport extends Model {
    static associate(models) {
      UserReport.belongsTo(models.User, { foreignKey: 'reported_user_id', as: 'ReportedUser' });
      UserReport.belongsTo(models.User, { foreignKey: 'reporter_user_id', as: 'ReporterUser' });
      UserReport.belongsTo(models.ReportReason, {
        foreignKey: 'reason_id',
        as: 'reasonDetail'
      });
      UserReport.belongsTo(models.ReportStatus, {
        foreignKey: 'status_id',
        as: 'statusDetail'
      });
    }
  }
  UserReport.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reported_user_id: DataTypes.INTEGER,
      reporter_user_id: DataTypes.INTEGER,
      reason_id: {
        type: DataTypes.INTEGER,
        references: { model: 'ReportReasons', key: 'id' }
      },
      description: DataTypes.TEXT,
      status_id: {
        type: DataTypes.INTEGER,
        references: { model: 'ReportStatuses', key: 'id' }
      },
      timestamp: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'UserReport',
      tableName: 'user_reports',
      timestamps: false,
    }
  );
  return UserReport;
};
