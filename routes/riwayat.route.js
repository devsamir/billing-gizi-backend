const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const { getRiwayatBilling, getOneRiwayat, updateRiwayat, deleteRiwayat } = require("../controllers/riwayat.controller");
router.use(protect);

router.get("/", restrictTo("admin", "gizi", "keuangan"), getRiwayatBilling);
router.delete("/", restrictTo("admin"), deleteRiwayat);
router.get("/:id", restrictTo("admin", "gizi", "keuangan"), getOneRiwayat);
router.patch("/:id", restrictTo("admin"), updateRiwayat);

module.exports = router;
