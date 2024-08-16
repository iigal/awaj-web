const mongoose = require("../app/db");

const complaintSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    default: "Queue",
    type: String,
    required: true,
  },
  statusbar: {
    default: "0",
    type: String,
    require: true,
  },
  statusmessege: {
    type: Array,
  },
  Date: {
    default: new Date(),
    type: String,
    required: true,
  },
  images: {
    type: Array,
  },
  username: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  area: {
    type: String,
  },
});
module.exports = mongoose.model("complaints", complaintSchema);
