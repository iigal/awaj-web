const mongoose = require("mongoose");
// mongoose.connect(
//   "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
// );
mongoose.connect(
  "mongodb+srv://sachiwalayap:LSyx84Iv1dHcNBdY@cluster0.vgru4io.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);


const userSchema = mongoose.Schema({
  message: {
    type: String,
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "complaints",
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  reply: {
    type: [
      {
        message: {
          type: String,
        },
        username: {
          type: String,
        },
        userid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],
  },
  Date: {
    default: new Date(),
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("comment", userSchema);
