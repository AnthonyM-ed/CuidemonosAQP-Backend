'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //await queryInterface.renameTable('comments', 'livestream_comments');
    console.log('INFO: La tabla ya fue renombrada manualmente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('livestream_comments', 'comments');
  }
};
