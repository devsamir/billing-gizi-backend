const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const { createKamar, getAllKamar, getOneKamar, updateKamar, deleteKamar } = require("../controllers/kamar.controller");
router.use(protect);
router.use(restrictTo("admin", "gizi"));
router.route("/").get(getAllKamar).post(createKamar).delete(deleteKamar);
router.route("/:id").get(getOneKamar).patch(updateKamar);

module.exports = router;
