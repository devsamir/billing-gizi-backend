const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const {
  getGiziOverview,
  getCountPesanan,
  getCountMenuFavorit,
  getCountRuanganTerbanyak,
} = require("../controllers/dashboard.controller");

router.use(protect);
router.post("/gizi/overview", restrictTo("admin", "gizi"), getGiziOverview);
router.post("/gizi/pesanan-count", restrictTo("admin", "gizi"), getCountPesanan);
router.post("/gizi/menu-favorit", restrictTo("admin", "gizi"), getCountMenuFavorit);
router.post("/gizi/ruangan-terbanyak", restrictTo("admin", "gizi"), getCountRuanganTerbanyak);

module.exports = router;
