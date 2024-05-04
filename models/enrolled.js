const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Enroll = sequelize.define("Enroll", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  student_code:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  code:{
    type:DataTypes.STRING,
    allowNull: true,
  }
});

// Enroll.sync();

module.exports = Enroll;
