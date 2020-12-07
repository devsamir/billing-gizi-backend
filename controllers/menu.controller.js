const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Menu = require("../models/Menu");

// @Method GET /api/menu
// @Desc Get All Menu In Database
// @Private To ['admin','gizi']
exports.getAllMenu = catchAsync(async (req, res, next) => {
  const menu = await Menu.findAll({ attributes: { exclude: ["active"] }, where: { active: true } });
  res.status(200).json(menu);
});
// @Method POST /api/menu
// @Desc Create Menu In Database
// @Private To ['admin','gizi']
exports.createMenu = catchAsync(async (req, res, next) => {
  const { namaMakanan, harga } = req.body;
  const id = uuidv4();
  if (!namaMakanan || !harga) return next(new AppError("Data Menu Tidak Lengkap !", 400));
  const newMenu = await Menu.create({ id, namaMakanan, harga });
  newMenu.active = undefined;
  res.status(201).json(newMenu);
});
// @Method GET /api/menu/:id
// @Desc Get One Menu In Database
// @Private To ['admin','gizi']
exports.getOneMenu = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const menu = await Menu.findOne({ attributes: { exclude: ["active"] }, where: { id, active: true } });
  if (!menu) return next(new AppError("Menu Dengan ID Yang Diberikan Tidak Ditemukan !", 400));
  res.status(200).json(menu);
});
// @Method PATCH /api/menu/:id
// @Desc Update Menu In Database
// @Private To ['admin','gizi']
exports.updateMenu = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { namaMakanan, harga } = req.body;
  const menu = await Menu.findOne({ where: { id } });
  if (!menu) return next(new AppError("Menu Dengan ID Yang Diberikan Tidak Ditemukan !", 400));
  menu.namaMakanan = namaMakanan;
  menu.harga = harga;
  await menu.save();
  menu.active = undefined;
  res.status(200).json(menu);
});

// @Method DELETE /api/menu
// @Desc Delete Menu In Database
// @Private To ['admin','gizi']
exports.deleteMenu = catchAsync(async (req, res, next) => {
  const { menu } = req.body;
  const deletedMenu = menu.map((id) => Menu.update({ active: false }, { where: { id } }));
  await Promise.all(deletedMenu);

  res.status(204).json(null);
});
