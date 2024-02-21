const dbConfig = require("../db.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connected");
  })
  .catch((err) => console.log(err));

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.accounts = require("./account.js")(sequelize, DataTypes);
db.users = require("./user.js")(sequelize, DataTypes);
db.tags = require("./tag.js")(sequelize, DataTypes);
db.events = require("./event.js")(sequelize, DataTypes);
db.links = require("./link.js")(sequelize, DataTypes);
db.baseline_survey = require("./baseline_survey.js")(sequelize, DataTypes);
db.endofday_survey = require("./endofday_survey.js")(sequelize, DataTypes);
db.user_tags = require("./user_tags.js")(sequelize, DataTypes);
db.user_otps = require("./user_otp.js")(sequelize, DataTypes)
db.survey = require("./survey.js")(sequelize, DataTypes)
db.survey_responses = require("./survey_response.js")(sequelize, DataTypes)
db.users.hasMany(db.events, {
  foreignKey: "userid",
  as: "event",
});
db.events.belongsTo(db.users, {
  foreignKey: "userid",
  as: "user",
});
db.users.hasOne(db.baseline_survey, {
  foreignKey: "userid",
  as: "baseline_survey",
});
db.baseline_survey.belongsTo(db.users, {
  foreignKey: "userid",
  as: "user",
});
db.users.hasMany(db.endofday_survey, {
  foreignKey: "userid",
  as: "endofday_survey",
});
db.endofday_survey.belongsTo(db.users, {
  foreignKey: "userid",
  as: "user",
});
db.survey.hasMany(db.survey_responses, {
  foreignKey: "surveyid",
  as: "survey_response"
})
db.survey_responses.belongsTo(db.survey, {
  foreignKey: "surveyid",
  as: "survey"
})
module.exports = db;
