const mongoose = require('mongoose')

module.exports.connect = async (req, res, next) => {
    try{
        let connection = await mongoose.connect(process.env.mongodb_url)
        
    }
    catch(err){
        res.send(err)
    }
}