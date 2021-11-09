const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const MasterBilling = require("../models/MasterBilling");
const DetailBilling = require("../models/DetailBilling");
const db = require("../config/database");
const {
  formatDatabase,
  formatUi,
  formatTime,
  formatTimeUI,
  getArrayOfMonth,
  getArrayOfDate,
  getArrayOfYear,
} = require("../utils/formatDate");
const {
  Op,
  QueryTypes: { SELECT },
} = require("sequelize");

exports.getGiziOverview = catchAsync(async (req, res, next) => {
  let { tanggalAwal, tanggalAkhir } = req.body;
  tanggalAwal = `${tanggalAwal} 00:00:00`;
  tanggalAkhir = `${tanggalAkhir} 23:59:59`;

  const resTotalPesanan = MasterBilling.count({
    where: {
      tanggal: {
        [Op.between]: [tanggalAwal, tanggalAkhir],
      },
      active: true,
    },
  });
  const resPesananBelum = MasterBilling.count({
    where: {
      tanggal: {
        [Op.between]: [tanggalAwal, tanggalAkhir],
      },
      status: "belum",
      active: true,
    },
  });
  const resPesananTerlayani = MasterBilling.count({
    where: {
      tanggal: {
        [Op.between]: [tanggalAwal, tanggalAkhir],
      },
      status: "terlayani",
      active: true,
    },
  });
  const resPesananSudah = MasterBilling.count({
    where: {
      tanggal: {
        [Op.between]: [tanggalAwal, tanggalAkhir],
      },
      status: "sudah",
      active: true,
    },
  });
  const [total, belum, terlayani, sudah] = await Promise.all([
    resTotalPesanan,
    resPesananBelum,
    resPesananTerlayani,
    resPesananSudah,
  ]);
  res.status(200).json({
    total,
    belum,
    terlayani,
    sudah,
  });
});
exports.getCountPesanan = catchAsync(async (req, res, next) => {
  const { tanggalAwal, tanggalAkhir, satuan } = req.body;
  if (satuan === "harian") {
    const tanggals = getArrayOfDate(tanggalAwal, tanggalAkhir);
    const reqCount = tanggals.map(async (tanggal) => {
      const res = await db.query(
        "SELECT count(*) as value FROM master_billing WHERE tanggal like ?",
        {
          type: SELECT,
          replacements: [`${tanggal}%`],
        }
      );
      return { label: formatUi(tanggal), value: res[0].value };
    });
    const count = await Promise.all(reqCount);
    res.status(200).json(count);
  } else if (satuan === "bulanan") {
    const tanggals = getArrayOfMonth(tanggalAwal, tanggalAkhir);
    const reqCount = tanggals.map(async (tanggal) => {
      const res = await db.query(
        "SELECT count(*) as value FROM master_billing WHERE tanggal like ? and (tanggal >= ? and tanggal <= ?)",
        {
          type: SELECT,
          replacements: [
            `${tanggal}%`,
            `${tanggalAwal} 00:00:01`,
            `${tanggalAkhir} 23:59:59`,
          ],
        }
      );
      return {
        label: tanggal.split("-").reverse().join("/"),
        value: res[0].value,
      };
    });
    const count = await Promise.all(reqCount);
    res.status(200).json(count);
  } else if (satuan === "tahunan") {
    const tanggals = getArrayOfYear(tanggalAwal, tanggalAkhir);
    const reqCount = tanggals.map(async (tanggal) => {
      const res = await db.query(
        "SELECT count(*) as value FROM master_billing WHERE tanggal like ? and (tanggal >= ? and tanggal <= ?)",
        {
          type: SELECT,
          replacements: [
            `${tanggal}%`,
            `${tanggalAwal} 00:00:01`,
            `${tanggalAkhir} 23:59:59`,
          ],
        }
      );
      return { label: tanggal, value: res[0].value };
    });
    const count = await Promise.all(reqCount);
    res.status(200).json(count);
  } else {
    return next(new AppError("Satuan Yang Diberikan Salah !", 400));
  }
});
exports.getCountMenuFavorit = catchAsync(async (req, res, next) => {
  let { tanggalAwal, tanggalAkhir } = req.body;
  tanggalAwal = `${tanggalAwal} 00:00:00`;
  tanggalAkhir = `${tanggalAkhir} 23:59:59`;
  const resCount = await db.query(
    "SELECT d.namaMakanan as label,sum(d.qty) as value FROM detail_billing d,master_billing m where d.idBilling = m.id and m.tanggal between ? and ? GROUP by namaMakanan order by value desc",
    {
      type: SELECT,
      replacements: [tanggalAwal, tanggalAkhir],
    }
  );

  const final = resCount.filter((item, index) => {
    if (index < 5) return true;
    return false;
  });
  const others = resCount.slice(5, resCount.length).reduce((acc, curr) => {
    acc += Number(curr.value);
    return acc;
  }, 0);
  final.push({ label: "Others", value: others });
  res.status(200).json(final);
});
exports.getCountRuanganTerbanyak = catchAsync(async (req, res, next) => {
  let { tanggalAwal, tanggalAkhir } = req.body;
  tanggalAwal = `${tanggalAwal} 00:00:00`;
  tanggalAkhir = `${tanggalAkhir} 23:59:59`;
  const kamar = await db.query(
    "select distinct(nm_kamar) as nm_kamar from kamar",
    {
      type: SELECT,
    }
  );
  const resCount = kamar.map(async (item) => {
    const count = await MasterBilling.count({
      where: {
        tanggal: {
          [Op.between]: [tanggalAwal, tanggalAkhir],
        },
        active: true,
        namaKamar: item.nm_kamar,
      },
    });
    return { label: item.nm_kamar, value: count };
  });
  const countAll = await Promise.all(resCount);
  res.status(200).json(countAll);
});
exports.getCountBadge = catchAsync(async (req, res, next) => {
  const pesanan = await MasterBilling.count({
    where: { status: "belum", active: true },
  });
  const billing = await MasterBilling.count({
    where: { status: "terlayani", active: true },
  });
  res.status(200).json({
    pesanan,
    billing,
  });
});
