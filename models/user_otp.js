module.exports = (sequelize, DataTypes) => {
  const UserOtp = sequelize.define(
    "user_otps",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      otp: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      expiresAt: {
        type: DataTypes.DATE,
      },

    }
  )
  return UserOtp;
}