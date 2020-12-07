const { v4: uuidv4 } = require("uuid");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Kamar = require("../models/Kamar");

// @Method GET /api/kamar
// @Desc Get All Kamar In Database
// @Private To ['admin','gizi']
exports.getAllKamar = catchAsync(async (req, res, next) => {
  const kamar = await Kamar.findAll({ attributes: { exclude: ["active"] }, where: { active: true } });
  res.status(200).json(kamar);
});
// @Method POST /api/kamar
// @Desc Create Kamar In Database
// @Private To ['admin','gizi']
exports.createKamar = catchAsync(async (req, res, next) => {
  const { nm_kamar, no_kamar } = req.body;
  const id = uuidv4();
  if (!nm_kamar || !no_kamar) return next(new AppError("Data Kamar Tidak Lengkap !", 400));
  const newKamar = await Kamar.create({ id, nm_kamar, no_kamar });

  newKamar.active = undefined;
  res.status(201).json(newKamar);
});
// @Method GET /api/kamar/:id
// @Desc Get One Kamar In Database
// @Private To ['admin','gizi']
exports.getOneKamar = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const kamar = await Kamar.findOne({ attributes: { exclude: ["active"] }, where: { id, active: true } });
  if (!kamar) return next(new AppError("Kamar Dengan ID Yang Diberikan Tidak Ditemukan !", 400));
  res.status(200).json(kamar);
});
// @Method PATCH /api/kamar/:id
// @Desc Updat Kamar In Database
// @Private To ['admin','gizi']
exports.updateKamar = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { nm_kamar, no_kamar } = req.body;
  const kamar = await Kamar.findOne({ where: { id } });
  if (!kamar) return next(new AppError("Kamar Dengan ID Yang Diberikan Tidak Ditemukan !", 400));
  kamar.nm_kamar = nm_kamar;
  kamar.no_kamar = no_kamar;
  await kamar.save();

  kamar.active = undefined;
  res.status(200).json(kamar);
});

// @Method DELETE /api/kamar
// @Desc Delete Kamar In Database
// @Private To ['admin','gizi']
exports.deleteKamar = catchAsync(async (req, res, next) => {
  const { kamar } = req.body;
  const deletedKamar = kamar.map((id) => Kamar.update({ active: false }, { where: { id } }));
  await Promise.all(deletedKamar);
  res.status(204).json(null);
});
