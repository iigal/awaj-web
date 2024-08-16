const mongoose = require("../app/db");

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



