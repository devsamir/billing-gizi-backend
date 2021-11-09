const { v4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const MasterBilling = require("../models/MasterBilling");
const DetailBilling = require("../models/DetailBilling");
const db = require("../config/database");
const { formatTime } = require("../utils/formatDate");
const {
  Op,
  QueryTypes: { SELECT },
} = require("sequelize");

// @Method GET /api/riwayat
// @Desc Get Data Riwayat Billing, Dibuat untuk datatable
// @Private To ['admin','gizi','keuangan']
exports.getRiwayatBilling = catchAsync(async (req, res, next) => {
  const { page, limit, search, sort } = req.query;
  if ((page && !limit) || (!page && limit))
    return next(
      new AppError("Pagination Memperlukan query page dan limit !", 400)
    );
  let query = "where active=true";
  let queryCount = "where active=true";
  if (search) {
    const searchFields = [
      "id",
      "noRawat",
      "namaPasien",
      "namaPemesan",
      "namaKamar",
      // "noKamar",
      "tanggal",
      "totalTarif",
      "status",
      // "tanggalTerlayani",
      // "tanggalBayar",
    ];
    query += ` and (${searchFields
      .map((item) => `${item} like '%${search}%'`)
      .join(" or ")})`;
    queryCount += ` and (${searchFields
      .map((item) => `${item} like '%${search}%'`)
      .join(" or ")})`;
  }
  if (sort) {
    query += ` order by ${Object.keys(sort)[0]} ${sort[Object.keys(sort)[0]]}`;
  }
  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    query += ` limit ${offset}, ${Number(limit)}`;
  }
  const resBilling = db.query(`select * from master_billing ${query}`, {
    type: SELECT,
  });
  const resResult = db.query(
    `select count(*) as count from master_billing ${queryCount}`,
    {
      type: SELECT,
    }
  );
  const [billing, result] = await Promise.all([resBilling, resResult]);
  res.status(200).json({
    data: billing,
    result: result[0].count,
  });
});
// @Method GET /api/riwayat/:id
// @Desc Get One Riwayat In Database
// @Private To ['admin','gizi','keuangan']
exports.getOneRiwayat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const getBilling = MasterBilling.findOne({ where: { id } });
  const getDetail = DetailBilling.findAll({ where: { idBilling: id } });
  const [billing, detail] = await Promise.all([getBilling, getDetail]);
  if (!billing || !detail)
    return next(new AppError("Data Tidak Ditemukan !", 400));
  billing.dataValues.tanggal = formatTime(billing.dataValues.tanggal);
  billing.dataValues.tanggalTerlayani = billing.dataValues.tanggalTerlayani
    ? formatTime(billing.dataValues.tanggalTerlayani)
    : "";
  billing.dataValues.tanggalBayar = billing.dataValues.tanggalBayar
    ? formatTime(billing.dataValues.tanggalBayar)
    : "";
  billing.dataValues.pesanan = detail;
  res.status(200).json(billing);
});
// @Method PATCH /api/riwayat/:id
// @Desc Update One Riwayat In Database
// @Private To ['admin']
exports.updateRiwayat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    noRawat,
    namaPasien,
    namaPemesan,
    namaKamar,
    noKamar,
    tanggal,
    pesanan,
    totalTarif,
    status,
    tanggalTerlayani,
    tanggalBayar,
  } = req.body;
  if (
    !noRawat ||
    !namaPasien ||
    !namaPemesan ||
    !namaKamar ||
    !noKamar ||
    !tanggal ||
    !totalTarif ||
    !status
  )
    return next(new AppError("Data Billing Tidak Lengkap !", 400));
  if (pesanan && pesanan.length < 1)
    return next(new AppError("Pesanan Tidak Boleh Kosong !", 400));
  const user = req.user.name;
  const master = await MasterBilling.findOne({ where: { id } });
  if (!master)
    return next(
      new AppError("Billing Dengan ID Yang Diberikan Tidak Ada !", 400)
    );
  master.noRawat = noRawat;
  master.namaPasien = namaPasien;
  master.namaPemesan = namaPemesan;
  master.namaKamar = namaKamar;
  master.noKamar = noKamar;
  master.tanggal = tanggal;
  master.totalTarif = totalTarif;
  master.status = status;
  master.tanggalTerlayani = tanggalTerlayani;
  master.tanggalBayar = tanggalBayar;
  master.user = user;
  await master.save();
  await DetailBilling.destroy({ where: { idBilling: id } });
  const reqDetailBill = pesanan.map((item) => {
    const data = {
      ...item,
      id: v4(),
      idBilling: id,
      totalHarga: item.qty * item.harga,
    };
    DetailBilling.create(data);
  });
  const detailBill = await Promise.all(reqDetailBill);
  master.dataValues.pesanan = detailBill;
  res.status(200).json(master);
});
// @Method DELETE /api/riwayat
// @Desc Delete Riwayat In Database By Id Pesanan
// @Private To ['admin']
exports.deleteRiwayat = catchAsync(async (req, res, next) => {
  const { riwayat } = req.body;
  if (!riwayat || riwayat.length < 1)
    return next(new AppError("Id Riwayat Tidak Ada !", 400));
  const user = req.user.name;
  const deletedRiwayat = riwayat.map((id) => {
    return MasterBilling.update({ active: false, user }, { where: { id } });
  });
  await Promise.all(deletedRiwayat);
  res.status(200).json(null);
});
