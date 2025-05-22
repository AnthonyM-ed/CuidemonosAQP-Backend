'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ReputationStatuses', [
      { status: 'GOOD', description: 'Buen comportamiento', createdAt: new Date(), updatedAt: new Date() },
      { status: 'WARNING', description: 'Advertencia por comportamiento', createdAt: new Date(), updatedAt: new Date() },
      { status: 'BANNED', description: 'Usuario suspendido', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ReputationStatuses', null, {});
  }
};
