'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('safe_zones', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Sin nombre temporal...',
    });
    await queryInterface.addColumn('safe_zones', 'description', {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('safe_zones', 'category', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('safe_zones', 'justification', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: 'Sin justificacion temporal...',
    });
    await queryInterface.addColumn('safe_zones', 'photo_url', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('safe_zones', 'assumes_responsibility', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('safe_zones', 'rating', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('safe_zones', 'name');
    await queryInterface.removeColumn('safe_zones', 'description');
    await queryInterface.removeColumn('safe_zones', 'category');
    await queryInterface.removeColumn('safe_zones', 'justification');
    await queryInterface.removeColumn('safe_zones', 'photo_url');
    await queryInterface.removeColumn('safe_zones', 'assumes_responsibility');
    await queryInterface.removeColumn('safe_zones', 'rating');
  }
};
