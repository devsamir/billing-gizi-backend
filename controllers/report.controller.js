const { v4: uuidv4 } = require("uuid");
const request = require("request");
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
const currency = new Intl.NumberFormat("id", {
  style: "currency",
  currency: "IDR",
});
const reportUrl = "http://localhost:7000/api/report";

exports.printBilling = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const reqMaster = MasterBilling.findOne({ where: { id }, active: true });
  const reqDetail = DetailBilling.findAll({ where: { idBilling: id } });
  const [master, detail] = await Promise.all([reqMaster, reqDetail]);
  if (!master) return next(new AppError("Data Tidak Ada !", 400));
  const body = {
    id,
    tanggal: formatUi(master.tanggal),
    noRawat: master.noRawat,
    nama: master.namaPasien,
    namaKamar: master.namaKamar,
    noKamar: master.noKamar,
    pesanan: detail.map((item) => {
      return {
        namaMenu: item.namaMakanan,
        qty: `${item.qty}`,
        harga: currency.format(item.harga).split(",")[0],
        hargaTotal: currency.format(item.totalHarga).split(",")[0],
      };
    }),
    tarifTotal: currency.format(master.totalTarif),
  };
  console.log(body);
  const data = {
    template: { shortid: "XhI2-EVGEH" },
    options: { preview: true },
    data: body,
  };
  const options = {
    uri: reportUrl,
    method: "POST",
    json: data,
  };
  request(options).pipe(res);
});

exports.downloadDataMaster = catchAsync(async (req, res, next) => {
  let { tanggalAwal, tanggalAkhir } = req.params;
  tanggalAwal = `${tanggalAwal} 00:00:00`;
  tanggalAkhir = `${tanggalAkhir} 23:59:59`;
  const resCount = await db.query("select * from master_billing where tanggal between ? and ? order by tanggal desc", {
    type: SELECT,
    replacements: [tanggalAwal, tanggalAkhir],
  });
  const data = resCount.map((item) => {
    delete item.lastupdate;
    delete item.user;
    delete item.active;
    item.id = `${item.id}`;
    item.tanggal = formatTimeUI(item.tanggal);
    item.tanggalTerlayani = item.tanggalTerlayani ? formatTimeUI(item.tanggalTerlayani) : "-";
    item.tanggalBayar = item.tanggalBayar ? formatTimeUI(item.tanggalBayar) : "-";
    return item;
  });
  res.status(200).xls(`master-${tanggalAwal.split(" ")[0]}-${tanggalAkhir.split(" ")[0]}.xlsx`, data);
});
exports.downloadDataDetail = catchAsync(async (req, res, next) => {
  let { tanggalAwal, tanggalAkhir } = req.params;
  tanggalAwal = `${tanggalAwal} 00:00:00`;
  tanggalAkhir = `${tanggalAkhir} 23:59:59`;
  const data = await db.query(
    "select d.idBilling,d.namaMakanan,d.harga,d.qty,d.totalHarga from detail_billing d,master_billing m where d.idBilling = m.id and m.tanggal between ? and ? order by m.tanggal desc",
    {
      type: SELECT,
      replacements: [tanggalAwal, tanggalAkhir],
    }
  );
  res.status(200).xls(`detail-${tanggalAwal.split(" ")[0]}-${tanggalAkhir.split(" ")[0]}.xlsx`, data);
});
