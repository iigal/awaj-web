const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
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
