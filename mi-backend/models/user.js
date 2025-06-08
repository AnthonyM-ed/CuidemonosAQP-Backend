'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

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
        as: 'reputationStatus',
      });
    }

    // Método para verificar la contraseña
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }

  User.init(
    {
      dni: { type: DataTypes.STRING, unique: true },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      dni_extension: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: DataTypes.STRING,
      dni_photo_url: DataTypes.STRING,
      profile_photo_url: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      reputation_score: { type: DataTypes.INTEGER, defaultValue: 5 },
      reputation_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'ReputationStatuses', key: 'id' },
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      refresh_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
  return User;
};
