const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define("Schedule", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  professor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  display: {
    type: DataTypes.ENUM("0", "1"),
    defaultValue: "0",
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Schedule.sync();

module.exports = Schedule;
