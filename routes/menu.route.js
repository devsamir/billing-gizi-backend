const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const { getAllMenu, createMenu, getOneMenu, updateMenu, deleteMenu } = require("../controllers/menu.controller");
router.use(protect);
router.use(restrictTo("admin", "gizi"));
router.route("/").get(getAllMenu).post(createMenu).delete(deleteMenu);
router.route("/:id").get(getOneMenu).patch(updateMenu);
module.exports = router;
