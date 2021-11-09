const Sequelize = require("sequelize");
const db = require("../config/database");

const Menu = db.define(
  "menu",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    namaMakanan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    harga: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Menu;
