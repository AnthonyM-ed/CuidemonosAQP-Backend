'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LiveStream extends Model {
    static associate(models) {
      LiveStream.belongsTo(models.User, { foreignKey: 'user_id' });
      LiveStream.hasMany(models.Comment, { foreignKey: 'live_stream_id' });
    }
  }
  LiveStream.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      start_time: DataTypes.DATE,
      end_time: DataTypes.DATE,
      status: DataTypes.ENUM('LIVE', 'ENDED'),
      expiration_date: DataTypes.DATE,
      user_id: DataTypes.INTEGER,
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'LiveStream',
      tableName: 'live_streams',
      timestamps: true,
    }
  );
  return LiveStream;
};