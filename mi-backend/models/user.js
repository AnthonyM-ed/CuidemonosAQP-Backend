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
      User.hasMany(models.LivestreamComment, { foreignKey: 'user_id' });
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
      dni: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isNumeric: {
            msg: 'El DNI debe contener solo números'
          },
          len: {
            args: [8, 8],
            msg: 'El DNI debe tener 8 dígitos'
          }
        }
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      dni_extension: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: DataTypes.STRING,
      dni_photo_url: {
        type: DataTypes.STRING,
        defaultValue: null, // o alguna imagen genérica
      },
      profile_photo_url: {
        type: DataTypes.STRING,
        defaultValue: null, // o alguna imagen genérica
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      reputation_score: { type: DataTypes.INTEGER, defaultValue: 5 },
      reputation_status_id: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
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
