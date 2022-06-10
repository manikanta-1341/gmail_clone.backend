const Users = require('../models/users')
const bcrypt = require('bcrypt')


module.exports.Start =(req,res)=>{
    res.send({msg:"started successfully"})
}

module.exports.Register = async (req ,res, next) =>{
    if(req.body.user){
        const user = new Users(req.body.user)
        let check = await Users.findOne({username : user.username})
        if(check == null){
            const string = await bcrypt.genSalt(5)
            user.password = await bcrypt.hash(user.password,string)
            try{
                let response = await user.save()
                res.send(response)
            }
            catch(err){
                // console.log(err)
                res.send(err)
            }
        }
        else{
            res.send({msg : "Email already Registered , Procced with Login"})
        }
    }
    else{
        res.send({msg : "input should be object & key must be user "})
    }
    
}