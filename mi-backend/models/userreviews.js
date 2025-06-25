'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserReview extends Model {
    static associate(models) {
      // Usuario que hizo la reseña
      UserReview.belongsTo(models.User, {
        foreignKey: 'reviewer_id',
        as: 'reviewer',
      });

      // Usuario que recibió la reseña
      UserReview.belongsTo(models.User, {
        foreignKey: 'reviewed_id',
        as: 'reviewed',
      });
    }
  }

  UserReview.init(
    {
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reviewed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: 1,
            msg: 'La puntuación mínima es 1',
          },
          max: {
            args: 5,
            msg: 'La puntuación máxima es 5',
          },
        },
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      report_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'UserReview',
      tableName: 'user_reviews',
      timestamps: true,
    }
  );

  return UserReview;
};