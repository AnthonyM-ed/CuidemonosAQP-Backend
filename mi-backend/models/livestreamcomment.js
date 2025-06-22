'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LivestreamComment extends Model {
    static associate(models) {
      LivestreamComment.belongsTo(models.LiveStream, { foreignKey: 'live_stream_id' });
      LivestreamComment.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  LivestreamComment.init(
    {
      content: DataTypes.TEXT,
      live_stream_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'LivestreamComment', // Nuevo nombre del modelo
      tableName: 'livestream_comments', // 👈 Nuevo nombre de la tabla
      timestamps: false,
    }
  );

  return LivestreamComment;
};