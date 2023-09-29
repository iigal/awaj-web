const jwt = require("jsonwebtoken");
exports.jwtTokenAuth = (req, res, next) => {
  const token = req.cookies.token;
  try{
    let verify = jwt.verify(token, "shhhhh");
    console.log("verify" + verify.user);
    next();
  }catch(e){
    res.clearCookie("token");
    res.redirect("/login");
  }};
