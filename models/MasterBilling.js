const Sequelize = require("sequelize");
const db = require("../config/database");

const MasterBilling = db.define(
  "master_billing",
  {
    id: {
      type: Sequelize.NUMBER,
      primaryKey: true,
    },
    noRawat: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    namaPasien: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    namaPemesan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    namaKamar: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    noKamar: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tanggal: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    totalTarif: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("belum", "terlayani", "sudah"),
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastupdate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    tanggalTerlayani: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    tanggalBayar: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = MasterBilling;
