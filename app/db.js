const mongoose = require("mongoose");
// mongoose.connect(
//   "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
// );
mongoose.connect(
    process.env.DB_URL
);
module.exports = mongoose;
