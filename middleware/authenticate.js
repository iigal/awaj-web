const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) =>{
    try{

        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token, 'hgfhd6ej4jhF3')

        req.room = decode
        next()

    }
    catch(error){
        res.send("Authentication failed")
    }
}


module.exports = authenticate