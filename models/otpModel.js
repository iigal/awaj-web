const mongoose = require("mongoose");
const type = require("./type");

mongoose.connect(
    "mongodb+srv://sachiwalayap:LSyx84Iv1dHcNBdY@cluster0.vgru4io.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );
const otpSchema = mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    otp:{
        type: String,
        required: true
    },
    createdAt: { 
        type: Date,  
        default: Date.now 
    },
},{timestamps: true})

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 500 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;



