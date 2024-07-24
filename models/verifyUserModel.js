const mongoose = require("mongoose");
const type = require("./type");
// mongoose.connect(
//   "mongodb+srv://complaintmgmt1366:GLz2blyKA3RttsWx@cluster0.lcpvryx.mongodb.net/?retryWrites=true&w=majority"
// );
mongoose.connect(
  "mongodb+srv://sachiwalayap:LSyx84Iv1dHcNBdY@cluster0.vgru4io.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
const jwt = require('jsonwebtoken');

const verifyUserSchema = mongoose.Schema({
    number:{
        type:String,
        required: true
    },
    email:{
        type: String,
        required:true
    }
}, {timestamps: true});

userSchema.methods.generateJWT = function(){
    const token = jwt.sign({
        _id: this._id,
        number: this.number,

    }, process.env.JWT_SECRET_KEY, {expiresIn: "7d"});
    return token;
}

module.exports.verifyUser = model('verifyUser', verifyUserSchema);
