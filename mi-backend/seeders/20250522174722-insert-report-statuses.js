'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ReportStatuses', [
      {
        status: 'PENDING',
        description: 'Pendiente de revisión',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: 'REVIEWED',
        description: 'Revisado',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: 'RESOLVED',
        description: 'Resuelto',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: 'REJECTED',
        description: 'Rechazado',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ReportStatuses', null, {});
  }
};
