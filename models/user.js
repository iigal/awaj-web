const mongoose = require("../app/db");

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
