'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Renombrar tabla antigua a la nueva
    await queryInterface.renameTable('punto_seguro_statuses', 'safe_zone_statuses');
  },

  async down(queryInterface, Sequelize) {
    // Revertir nombre de tabla a la original
    await queryInterface.renameTable('safe_zone_statuses', 'punto_seguro_statuses');
  }
};
