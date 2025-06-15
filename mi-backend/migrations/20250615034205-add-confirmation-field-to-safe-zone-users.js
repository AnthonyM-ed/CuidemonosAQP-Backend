'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('safe_zone_users', 'confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('safe_zone_users', 'confirmed_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('safe_zone_users', 'confirmed');
    await queryInterface.removeColumn('safe_zone_users', 'confirmed_at');
  }
};
