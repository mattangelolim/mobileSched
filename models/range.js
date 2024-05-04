const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Range = sequelize.define("Range", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate:{
    type:DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate:{
    type:DataTypes.DATEONLY,
    allowNull: true,
  }
});

// Range.sync();

module.exports = Range;
