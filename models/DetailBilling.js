const Sequelize = require("sequelize");
const db = require("../config/database");

const DetailBilling = db.define(
  "detail_billing",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },

    idBilling: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    namaMakanan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    harga: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    qty: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    totalHarga: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = DetailBilling;
