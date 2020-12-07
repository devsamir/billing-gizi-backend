const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/auth.controller");
const { getAllUser, createUser, getOneUser, updateUser, deleteUser } = require("../controllers/user.controller");
router.use(protect);
router.use(restrictTo("admin"));

router.route("/").get(getAllUser).post(createUser);
router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);
module.exports = router;
