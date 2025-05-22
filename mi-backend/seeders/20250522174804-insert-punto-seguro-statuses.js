'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('PuntoSeguroStatuses', [
      {
        status: 'SAFE',
        description: 'Punto seguro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: 'CAUTION',
        description: 'Punto medianamente inseguro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        status: 'UNSAFE',
        description: 'Punto inseguro',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PuntoSeguroStatuses', null, {});
  }
};