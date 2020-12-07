const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const {
  createBilling,
  getBillingBelum,
  getNoRawat,
  getOneBilling,
  updateBilling,
  deleteBilling,
  updateBillingTerlayani,
  getOneBillingTerlayani,
  updateBillingSudah,
  getBillingNoRawatBelum,
} = require("../controllers/billing.controller");
router.use(protect);

router.post("/", restrictTo("admin", "gizi"), createBilling);
router.delete("/", restrictTo("admin", "gizi"), deleteBilling);

router.get("/belum", restrictTo("admin", "gizi"), getBillingBelum);
router.get("/norawat", restrictTo("admin", "gizi"), getNoRawat);
router.get("/norawat-belum", restrictTo("admin", "keuangan"), getBillingNoRawatBelum);
router.patch("/terlayani", restrictTo("admin", "gizi"), updateBillingTerlayani);

// KEUANGAN
router.get("/terlayani/:noRawat", restrictTo("admin", "keuangan"), getOneBillingTerlayani);
router.patch("/sudah", restrictTo("admin", "keuangan"), updateBillingSudah);

// GENERAL
router.get("/:id", restrictTo("admin", "gizi"), getOneBilling);
router.patch("/:id", restrictTo("admin", "gizi"), updateBilling);

module.exports = router;
