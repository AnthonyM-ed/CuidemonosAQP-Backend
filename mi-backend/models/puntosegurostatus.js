'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PuntoSeguroStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PuntoSeguroStatus.hasMany(models.SafeZone, {
        foreignKey: 'status_id',
        as: 'safe_zones',
      });
    }
  }
  PuntoSeguroStatus.init({
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
    modelName: 'PuntoSeguroStatus',
    tableName: 'punto_seguro_statuses',
    timestamps: true,
  });
  return PuntoSeguroStatus;
};