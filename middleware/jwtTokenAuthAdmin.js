const jwt = require("jsonwebtoken");
exports.jwtTokenAuthAdmin = (req, res, next) => {
  const token = req.cookies.admin;
  console.log(token);
  try {
    let verify = jwt.verify(token, "admin");
    next();
  } catch (e) {
    res.clearCookie("admin");
    res.redirect("/login");
  }
};
