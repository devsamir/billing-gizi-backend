module.exports = (err, req, res, next) => {
  console.log(err);
  const message = err.message || "Internal Server Error :(";
  const status = err.status || "error";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status,
    message: `${statusCode} : ${message}`,
  });
};
