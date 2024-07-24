const jwt = require("jsonwebtoken");
exports.jwtTokenAuth = (req, res, next) => {
  try{
    const token = req.cookies.token;
    let verify = jwt.verify(token, "shhhhh");
    console.log("verify" + verify);
    next();
  }catch(e){
    res.clearCookie("token");
    res.redirect("/login");
  }};
