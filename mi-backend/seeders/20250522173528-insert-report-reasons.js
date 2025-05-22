'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ReportReasons', [
      {
        reason: 'SPAM',
        description: 'Contenido no solicitado o molesto',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reason: 'INAPPROPRIATE',
        description: 'Contenido inapropiado o ofensivo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reason: 'SUSPICIOUS_ACTIVITY',
        description: 'Actividad sospechosa o fraudulenta',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reason: 'OTHER',
        description: 'Otro motivo no especificado',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ReportReasons', null, {});
  }
};

