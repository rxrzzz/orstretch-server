module.exports = (sequelize, DataTypes) => {
  const BaselineSurvey = sequelize.define(
    "baseline_survey",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pain_open_surgery: {
        type: DataTypes.INTEGER,
      },
      pain_laparoscopic_surgery: {
        type: DataTypes.INTEGER,
      },
      pain_robotic_surgery: {
        type: DataTypes.INTEGER,
      },
      pain_past_six_months: {
        type: DataTypes.INTEGER,
      },
      pain_interfered_relations: {
        type: DataTypes.INTEGER,
      },
      pain_interfered_sleep: {
        type: DataTypes.INTEGER,
      },
      height: {
        type: DataTypes.STRING(8),
      },
      age: {
        type: DataTypes.INTEGER,
      },
      gender: {
        type: DataTypes.INTEGER,
      },
      handness: {
        type: DataTypes.INTEGER,
      },
      glove_size: {
        type: DataTypes.STRING(5),
      },
      surgical_procedures_day: {
        type: DataTypes.INTEGER,
      },
      days_per_week: {
        type: DataTypes.INTEGER,
      },
      exercise: {
        type: DataTypes.INTEGER,
      },
      primary_speciality: {
        type: DataTypes.STRING(50),
      },
      years_open_surgery: {
        type: DataTypes.INTEGER,
      },
      years_laparoscopic_surgery: {
        type: DataTypes.INTEGER,
      },
      years_robotic_surgery: {
        type: DataTypes.INTEGER,
      },
      most_common_procedures_a: {
        type: DataTypes.STRING(45),
      },
      most_common_procedures_b: {
        type: DataTypes.STRING(45),
      },
      most_common_procedures_c: {
        type: DataTypes.STRING(45),
      },
      pain_endoscopic_surgery: {
        type: DataTypes.INTEGER
      },
      pain_orifice_surgery: {
        type: DataTypes.INTEGER
      },
      weight: {
        type: DataTypes.INTEGER
      },
      years_endoscopic_surgery: {
        type: DataTypes.INTEGER
      },
      years_orifice_surgery: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "create_timestamp",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "update_timestamp",
      },
    },
    { freezeTableName: true, tableName: "baseline_survey" }
  );

  return BaselineSurvey;
};
