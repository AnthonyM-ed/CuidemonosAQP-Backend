'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.LiveStream, { foreignKey: 'live_stream_id' });
      Comment.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Comment.init(
    {
      content: DataTypes.TEXT,
      live_stream_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      timestamps: false,
    }
  );
  return Comment;
};