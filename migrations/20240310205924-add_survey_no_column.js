'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'survey_no', {
      type: Sequelize.STRING,
      defaultValue: "SV_ebd7AWFnBL8r02O"
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "users", "survey_no"
    )
  }
};
