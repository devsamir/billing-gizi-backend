const { v4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const MasterBilling = require("../models/MasterBilling");
const DetailBilling = require("../models/DetailBilling");
const db = require("../config/database");
const { formatDatabase, formatUi, formatTime, formatTimeUI } = require("../utils/formatDate");
const {
  Op,
  QueryTypes: { SELECT },
} = require("sequelize");

const generateIdBilling = async (tanggalParam) => {
  const tanggal = formatDatabase(tanggalParam).split("-").join("");
  const idBilling = await db.query("select * from master_billing where id like ? order by id desc limit 1", {
    type: SELECT,
    replacements: [`${tanggal}%`],
  });
  if (idBilling.length < 1) return `${tanggal}0001`;
  const splitId = `${idBilling[0].id}`.split(tanggal)[1];
  let id = Number(splitId) + 1;
  if (id < 10) return `${tanggal}000${id}`;
  if (id < 100) return `${tanggal}00${id}`;
  if (id < 1000) return `${tanggal}0${id}`;
  return `${tanggal}${id}`;
};
// @Method POST /api/billing
// @Desc Create Billing In Database
// @Private To ['admin','gizi']
exports.createBilling = catchAsync(async (req, res, next) => {
  const { noRawat, namaPasien, namaPemesan, namaKamar, noKamar, tanggal, pesanan, totalTarif } = req.body;
  if (!noRawat || !namaPasien || !namaKamar || !noKamar || !tanggal || !totalTarif || !namaPemesan)
    return next(new AppError("Data Billing Tidak Lengkap !", 400));
  if (pesanan && pesanan.length < 1) return next(new AppError("Pesanan Tidak Boleh Kosong !", 400));
  const id = await generateIdBilling(tanggal);
  const status = "belum";
  const user = req.user.name;
  const newBill = await MasterBilling.create({
    id,
    noRawat,
    namaPasien,
    namaPemesan,
    namaKamar,
    noKamar,
    tanggal,
    totalTarif,
    status,
    user,
  });
  console.log(pesanan);
  const reqDetailBill = pesanan.map((item) => {
    const data = { ...item, id: v4(), idBilling: id, totalHarga: item.qty * item.harga };
    DetailBilling.create(data);
  });
  const detailBill = await Promise.all(reqDetailBill);
  newBill.pesanan = detailBill;
  res.status(201).json(newBill);
});

// @Method GET /api/billing/:id
// @Desc Get One Billing In Database
// @Private To ['admin','gizi']
exports.getOneBilling = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const getBilling = MasterBilling.findOne({ where: { id, active: true } });
  const getDetail = DetailBilling.findAll({ where: { idBilling: id } });
  const [billing, detail] = await Promise.all([getBilling, getDetail]);
  if (!billing || !detail) return next(new AppError("Data Tidak Ditemukan !", 400));
  billing.dataValues.tanggal = formatTime(billing.dataValues.tanggal);
  billing.dataValues.tanggalTerlayani = billing.dataValues.tanggalTerlayani
    ? formatTime(billing.dataValues.tanggalTerlayani)
    : "";
  billing.dataValues.tanggalBayar = billing.dataValues.tanggalBayar ? formatTime(billing.dataValues.tanggalBayar) : "";
  billing.dataValues.pesanan = detail;
  res.status(200).json(billing);
});
// @Method PATCH /api/billing/:id
// @Desc Update One Billing In Database
// @Private To ['admin','gizi']
exports.updateBilling = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { noRawat, namaPasien, namaPemesan, namaKamar, noKamar, tanggal, pesanan, totalTarif } = req.body;
  if (!noRawat || !namaPasien || !namaPemesan || !namaKamar || !noKamar || !tanggal || !totalTarif)
    return next(new AppError("Data Billing Tidak Lengkap !", 400));
  if (pesanan && pesanan.length < 1) return next(new AppError("Pesanan Tidak Boleh Kosong !", 400));
  const user = req.user.name;
  const master = await MasterBilling.findOne({ where: { id } });
  if (!master) return next(new AppError("Pesanan Dengan ID Tidak Ada", 400));
  master.noRawat = noRawat;
  master.namaPasien = namaPasien;
  master.namaPemesan = namaPemesan;
  master.namaKamar = namaKamar;
  master.noKamar = noKamar;
  master.tanggal = tanggal;
  master.totalTarif = totalTarif;
  master.user = user;
  await master.save();
  await DetailBilling.destroy({ where: { idBilling: id } });
  const reqDetailBill = pesanan.map((item) => {
    const data = { ...item, id: v4(), idBilling: id, totalHarga: item.qty * item.harga };
    DetailBilling.create(data);
  });
  const detailBill = await Promise.all(reqDetailBill);
  master.dataValues.pesanan = detailBill;
  res.status(200).json(master);
});

// @Method GET /api/billing/norawat
// @Desc Get No Rawat Unik Seminggu Terakhir
// @Private To ['admin','gizi']
exports.getNoRawat = catchAsync(async (req, res, next) => {
  const tanggal = formatDatabase(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  const noRawat = await db.query(
    "select noRawat,namaPasien,namaKamar,noKamar from master_billing where tanggal > ? and active = true group by noRawat",
    {
      type: SELECT,
      replacements: [tanggal],
    }
  );
  res.status(200).json(noRawat);
});

// @Method GET /api/billing/belum
// @Desc Get Biltling Dengan Status Belum dari Database
// @Private To ['admin','gizi']
exports.getBillingBelum = catchAsync(async (req, res, next) => {
  const billing = await MasterBilling.findAll({
    attributes: { exclude: ["active", "user", "lastupdate"] },
    where: { status: "belum", active: true },
  });
  const finalBilling = billing.map((item) => {
    let hours = new Date(item.dataValues.tanggal).getHours();
    let minutes = new Date(item.dataValues.tanggal).getMinutes();
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    item.dataValues.tanggal = `${formatUi(item.dataValues.tanggal)} - ${hours}:${minutes}`;
    item.dataValues.namaKamar = `${item.dataValues.namaKamar} - ${item.dataValues.noKamar}`;
    console.log(item.dataValues.status);
    if (item.dataValues.status === "belum") item.dataValues.status = "Belum Terlayani";
    return item;
  });
  res.status(200).json(finalBilling);
});

// @Method DELETE /api/billing/
// @Desc Delete Billing dari Database berdasarkan Array ID
// @Private To ['admin','gizi']
exports.deleteBilling = catchAsync(async (req, res, next) => {
  const { pesanan } = req.body;
  const user = req.user.name;
  const deletedPesan = pesanan.map((id) => {
    return MasterBilling.update({ active: false, user }, { where: { id } });
  });
  await Promise.all(deletedPesan);
  res.status(204).json(null);
});

// @Method PATCH /api/billing/terlayani
// @Desc Update Status Billing Menjadi Terlayani berdasarkan Array ID
// @Private To ['admin','gizi']
exports.updateBillingTerlayani = catchAsync(async (req, res, next) => {
  const { pesanan, tanggalTerlayani } = req.body;
  if (!tanggalTerlayani) return next(new AppError("Tanggal Terlayani Harus Diisi !", 400));
  const user = req.user.name;
  const updatedTerlayani = pesanan.map((id) => {
    return MasterBilling.update({ status: "terlayani", tanggalTerlayani: tanggalTerlayani, user }, { where: { id } });
  });
  const update = await Promise.all(updatedTerlayani);
  res.status(200).json(update);
});

// @Method GET /api/billing/terlayani/:noRawat
// @Desc Get Billing Dengan Terlayani Belum dari Database Berdasarkan No Rawat
// @Private To ['admin','gizi']
exports.getOneBillingTerlayani = catchAsync(async (req, res, next) => {
  const { noRawat } = req.params;
  const master = await MasterBilling.findAll({
    attributes: { exclude: ["active", "user", "lastupdate"] },
    where: {
      noRawat,
      status: {
        [Op.ne]: "belum",
      },
      active: true,
    },
  });
  if (master.length === 0)
    return next(new AppError("Billing Dengan Nomor Rawat Yang Diberikan Tidak Ditemukan !", 400));

  const data = master.map((item) => {
    item.dataValues.tanggal = formatTimeUI(item.dataValues.tanggal);
    item.dataValues.tanggalTerlayani = formatTimeUI(item.dataValues.tanggalTerlayani);
    item.dataValues.tanggalBayar = item.dataValues.tanggalBayar ? formatTimeUI(item.dataValues.tanggalBayar) : "";
    item.dataValues.namaKamar = `${item.dataValues.namaKamar} - ${item.dataValues.noKamar}`;
    item.dataValues.status === "terlayani"
      ? (item.dataValues.status = "Belum")
      : item.dataValues.status === "sudah"
      ? (item.dataValues.status = "Sudah")
      : null;
    return item;
  });
  res.status(200).json(data);
});

// @Method PATCH /api/billing/sudah
// @Desc Update Status Billing Menjadi Terlayani berdasarkan Array ID
// @Private To ['admin','gizi']
exports.updateBillingSudah = catchAsync(async (req, res, next) => {
  const { pesanan, tanggalBayar } = req.body;
  const user = req.user.name;
  if (!tanggalBayar) return next(new AppError("Tanggal Bayar Harus Diisi !", 400));
  const updatedSudah = pesanan.map((id) => {
    return MasterBilling.update({ status: "sudah", tanggalBayar, user }, { where: { id } });
  });
  const update = await Promise.all(updatedSudah);
  res.status(200).json(update);
});

// @Method GET /api/billing/norawat-belum
// @Desc Get Nomor Rawat dengan Status Billing Belum Membayar
// @Private To ['admin','gizi']
exports.getBillingNoRawatBelum = catchAsync(async (req, res, next) => {
  const noRawat = await db.query(`select distinct(noRawat) as noRawat from master_billing where status = "terlayani"`, {
    type: SELECT,
  });
  const data = noRawat.map((item) => item.noRawat);
  res.status(200).json(data);
});
