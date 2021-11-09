const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const { printBilling, downloadDataMaster, downloadDataDetail } = require("../controllers/report.controller");

router.use(protect);
router.use(restrictTo("admin", "gizi"));

router.get("/billing/:id", printBilling);
router.get("/master/:tanggalAwal/:tanggalAkhir", downloadDataMaster);
router.get("/detail/:tanggalAwal/:tanggalAkhir", downloadDataDetail);
module.exports = router;
