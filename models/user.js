const mongoose = require("mongoose");

const { required } = require("nodemon/lib/config");
// mongoose.connect(
//   "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
// );

const type = require("./type");
// mongoose.connect(
//   "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
// );


mongoose.connect("mongodb+srv://sachiwalayap:LSyx84Iv1dHcNBdY@cluster0.vgru4io.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  voterid: {
    type: String,
    required: true,
  },
  accountstatus:{
    type:String,
    required: true
  }
});
module.exports = mongoose.model("user", userSchema);
