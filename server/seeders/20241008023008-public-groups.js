'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Groups', [
      {
        name: 'General Discussion',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Learning',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Groups', null, {});
  }
};
