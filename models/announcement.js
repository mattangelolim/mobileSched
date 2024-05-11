const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const announcement = sequelize.define("announcement", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  announcement: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiration_date:{
    type: DataTypes.DATE,
    allowNull: false,
  }
});
// announcement.sync()


module.exports = announcement;
