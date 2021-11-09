const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");

// @Method GET /api/user
// @Desc Get All User In Database
// @Private To ['admin']
exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.findAll({ attributes: { exclude: ["password"] } });
  res.status(200).json(user);
});
// @Method POST /api/user
// @Desc Create User
// @Private To ['admin']
exports.createUser = catchAsync(async (req, res, next) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) return next(new AppError("Data Tidak Lengkap !", 400));
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) return next(new AppError("User Dengan Username yang Diberikan Sudah Ada !", 400));
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ id: uuidv4(), username, password: hashPassword, name, role });
  res.status(201).json(newUser);
});

// @Method GET /api/user/:id
// @Desc Get One User In Database By ID
// @Private To ['admin']
exports.getOneUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ attributes: { exclude: ["password"] }, where: { id } });
  if (!user) return next(new AppError("User Tidak Ditemukan !", 400));
  res.status(200).json(user);
});

// @Method PATCH /api/user/:id
// @Desc Update User By ID
// @Private To ['admin']
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) return next(new AppError("Data Tidak Lengkap !", 400));
  const user = await User.findOne({ attributes: { exclude: ["password"] }, where: { id } });
  if (!user) return next(new AppError("User Tidak Ditemukan !", 400));
  if (user.role === "admin" && role !== "admin")
    return next(new AppError("Tidak Bisa Mengubah Role Admin Ke Role Yang Lebih Rendah !", 400));
  user.username = username;
  user.password = await bcrypt.hash(password, 10);
  user.name = name;
  user.role = role;
  await user.save();
  res.status(200).json(user);
});
// @Method DELETE /api/user/:id
// @Desc Delete One User In Database
// @Private To ['admin']
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ attributes: { exclude: ["password"] }, where: { id } });
  if (!user) return next(new AppError("User Tidak Ditemukan !", 400));
  if (user.role === "admin") {
    const adminUser = await User.findAll({ where: { role: "admin" } });
    if (adminUser.length <= 1)
      return next(new AppError("User Setidaknya Harus memiliki Satu user dengan role Admin", 400));
  }
  await User.destroy({ where: { id } });
  res.status(204).json(null);
});
