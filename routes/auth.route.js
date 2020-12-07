const router = require("express").Router();
const { signupUser, loginUser, checkJwtIsValid, logoutUser } = require("../controllers/auth.controller");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/check", checkJwtIsValid);
router.post("/logout", logoutUser);

module.exports = router;
