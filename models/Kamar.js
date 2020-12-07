const Sequelize = require("sequelize");
const db = require("../config/database");

const Kamar = db.define(
  "kamar",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    nm_kamar: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    no_kamar: {
      type: Sequelize.STRING,
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

module.exports = Kamar;
