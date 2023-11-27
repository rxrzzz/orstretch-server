// models/user_tags.js

module.exports = (sequelize, DataTypes) => {
  const UserTags = sequelize.define(
    "user_tags",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
      tableName: "user_tags",
    }
  );

  return UserTags;
};
