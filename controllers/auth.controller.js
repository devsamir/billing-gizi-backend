const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");

// @Method POST /api/auth/signup
// @Desc Create New User in Database
// @Public
exports.signupUser = catchAsync(async (req, res, next) => {
  const { username, password, name } = req.body;
  const role = req.body.role || "gizi";
  if (!username || !password) return next(new AppError("Username atau Password Tidak Boleh Kosong !", 400));
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) return next(new AppError("Username Sudah Dipakai, Tolong Gunakan Username Lain !", 400));
  if (password.length < 8) return next(new AppError("Password Minimal Harus Memiliki 8 Karakter !", 400));
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ id: uuidv4(), username, password: hashPassword, role, name });
  res.status(201).json(newUser);
});

// @Method POST /api/auth/login
// @Desc Login User and Get Token
// @Public
exports.loginUser = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return next(new AppError("Username atau Password Salah !", 401));
  const user = await User.findOne({ where: { username } });
  if (!user) return next(new AppError("Username atau Password Salah !", 401));
  if (!(await bcrypt.compare(password, user.password)))
    return next(new AppError("Username atau Password Salah !", 401));
  const token = await jwt.sign(
    {
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 1 Hari
    },
    process.env.JWT_SECRET_KEY
  );
  user.password = undefined;
  res.cookie("jwt", token, { httpOnly: true });
  res.status(200).json(user);
});

// @Method POST /api/auth/check
// @Desc Login User and Get Token
// @Public
exports.checkJwtIsValid = catchAsync(async (req, res, next) => {
  const token = req.cookies["jwt"];
  if (!token) return next(new AppError("Token Tidak Ditemukan, Silakan Login Terlebih Dahulu !", 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded.id || !decoded.exp) return next(new AppError("Token Tidak Valid, Silakan Login Terlebih Dahulu !", 401));
  const timeNow = new Date().getTime() / 1000;
  if (timeNow > decoded.exp) return next(new AppError("Token Kadaluarsa, Silakan Login Lagi !", 401));
  const user = await User.findOne({ where: { id: decoded.id } });
  if (!user) return next(new AppError("Token Salah, Silakan Login Terlebih Dahulu !", 401));
  user.password = undefined;
  res.status(200).json(user);
});
// @Method POST /api/auth/logout
// @Desc Remove JWT Token From cookie
// @Public
exports.logoutUser = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt").json(null);
});

// @Middleware
// @Desc Check JWT
exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies["jwt"];
  if (!token) return next(new AppError("Token Tidak Ditemukan, Silakan Login Terlebih Dahulu !", 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded.id || !decoded.exp) return next(new AppError("Token Tidak Valid, Silakan Login Terlebih Dahulu !", 401));
  const timeNow = new Date().getTime() / 1000;
  if (timeNow > decoded.exp) return next(new AppError("Token Kadaluarsa, Silakan Login Lagi !", 401));
  const user = await User.findOne({ where: { id: decoded.id } });
  if (!user) return next(new AppError("Token Salah, Silakan Login Terlebih Dahulu !", 401));
  req.user = user;
  next();
});
// @Desc Restrict To
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("User Tidak Memiliki Hak Untuk Melakukan Operasi Ini !", 400));
    next();
  };
};
