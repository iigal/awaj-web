const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://sachiwalayap:LSyx84Iv1dHcNBdY@cluster0.vgru4io.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// mongoose.connect(
//   "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
// );


const userSchema = mongoose.Schema({
  type: {
    type: String,
  },
});
module.exports = mongoose.model("type", userSchema);
