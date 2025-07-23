"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SafeZoneUsers extends Model {
    static associate(models) {
      SafeZoneUsers.belongsTo(models.SafeZone, {
        foreignKey: "safe_zone_id",
        as: "safeZone",
      });

      SafeZoneUsers.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  SafeZoneUsers.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      safe_zone_id: {
        type: DataTypes.INTEGER,
        references: { model: "SafeZones", key: "id" },
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_seen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "SafeZoneUsers",
      tableName: "safe_zone_users",
      timestamps: false,
    }
  );
  return SafeZoneUsers;
};
