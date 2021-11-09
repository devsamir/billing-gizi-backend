const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const json2xls = require("json2xls");
// own
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const kamarRouter = require("./routes/kamar.route");
const menuRouter = require("./routes/menu.route");
const billingRouter = require("./routes/billing.route");
const riwayatRouter = require("./routes/riwayat.route");
const reportRouter = require("./routes/report.route");
const dashboardRouter = require("./routes/dashboard.route");
const errorHandler = require("./utils/errorHandler");
require("./config/database");
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
// app.use(cors({ origin: "*", credentials: true }));
app.use(
  cors({
    origin: ["http://192.168.100.75:3010", "http://192.168.100.75:4010"],
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  })
);
////////////
// ROUTE //
//////////
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/kamar", kamarRouter);
app.use("/api/menu", menuRouter);
app.use("/api/billing", billingRouter);
app.use("/api/riwayat", riwayatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(json2xls.middleware);
app.use("/report", reportRouter);

const port = process.env.PORT || 5000;

app.use(errorHandler);

app.listen(port, () => {
  console.log(`App Running on Port ${port}`);
});
