'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('baseline_survey', 'pain_endoscopic_surgery', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('baseline_survey', 'pain_orifice_surgery', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('baseline_survey', 'weight', {
      type: Sequelize.STRING(8),
    });
    await queryInterface.addColumn('baseline_survey', 'years_endoscopic_surgery', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn('baseline_survey', 'years_orifice_surgery', {
      type: Sequelize.INTEGER,
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('baseline_survey', 'pain_endoscopic_surgery');
    await queryInterface.removeColumn('baseline_survey', 'pain_orifice_surgery');
    await queryInterface.removeColumn('baseline_survey', 'weight');
    await queryInterface.removeColumn('baseline_survey', 'years_endoscopic_surgery');
    await queryInterface.removeColumn('baseline_survey', 'years_orifice_surgery');
  }
};
