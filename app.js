const express = require("express");
const session = require('express-session');
const app = express();
var path = require("path");
var cookieParser = require("cookie-parser");

var cors = require("cors");
app.use(cors());

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());

const citizenRoute = require("./routes/citizen.js");
const adminRoute = require("./routes/admin.js");
const publicRoute = require("./routes/public.js");
const mobileRoute = require("./routes/mobileRoutes.js");

app.use("/", publicRoute);
app.use("/cms", citizenRoute);
app.use("/admin", adminRoute);
app.use("/user/mobile", mobileRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("server is running");
});
