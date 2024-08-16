const mongoose = require("../app/db");

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
