'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dni: { type: Sequelize.STRING, unique: true },
      first_name: Sequelize.STRING,
      last_name: Sequelize.STRING,
      dni_extension: Sequelize.STRING,
      password: Sequelize.STRING,
      phone: Sequelize.STRING,
      email: { type: Sequelize.STRING, unique: true },
      reputation_score: { type: Sequelize.INTEGER, defaultValue: 5 },
      reputation_status_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ReputationStatuses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};