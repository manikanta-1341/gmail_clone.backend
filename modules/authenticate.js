const Users = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailer = require('nodemailer')
const mongoose = require('mongoose')

module.exports.Login = async (req, res, next) => {
    
    const username = req.body.username
    const password = req.body.password
    try {
        const user = await Users.findOne({ username: username })
        if (user) {
            const token = jwt.sign({user}, process.env.SECRET_KEY, { expiresIn: "1hr" })
            console.log("token::",token)
            if(user.verification === "yes"){
                const isvalid = await bcrypt.compare(password, user.password)
                if (isvalid) {
                    console.log(token)
                    res.send(token)
                }
                else {
                    res.send({ msg: "invalid password" })
                }
            }
            else{
                var transporter = mailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'office@gmail.com',
                        pass: 'office@123'
                    }
                });
                let info = await transporter.sendMail({
                    from: 'office@gmail.com',
                    to: user.username,
                    subject: "Email Verification",
                    text: `${process.env.backend_url}/verify/${user._id}/?s=${token}`,
                }, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.send({ msg: "verify  your email"})
            }
        }
        else {
            res.send({ msg: "username not registered" })
        }
    }
    catch (err) {
        // console.log(err)
        res.send(err)
    }

}

module.exports.EmailVerify = async (req, res, next) => {
    try{
        let response = await Users.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id)},{$set : {verification: "yes"}})
        
        res.redirect(`${process.env.frontend_url}/activated`)
    }
    catch (err) {
        res.send(err)
    }
}


module.exports.Forgetpassword = async (req, res, next) => {
    try {
        const email = req.body.email
        const user = await Users.findOne({ username : email })
        if (user) {
            
            const randomString = await bcrypt.genSalt(7)
            const token = jwt.sign({ randomString }, process.env.RESET_KEY, { expiresIn: '10m' })
            
            let user_update = await Users.findOneAndUpdate({ _id: user._id }, { $set: { rndString: token } })
            let result = await user_update.save()
            var transporter = mailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'office@gmail.com',
                    pass: 'office@123'
                }
            });
            let info = await transporter.sendMail({
                from: 'office@gmail.com',
                to: user.username,
                subject: "Password Reset",
                text: `${process.env.backend_url}/forgetpassword/verify/${user._id}/?s=${token}`,
            }, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.status(200).send("success")
        }
        else {
            res.status(404).send(user)
        }
    }
    catch (err) {
        // console.log(err)
        res.send("failed")
    }

}


module.exports.ForgetPasswordVerify = async (req, res, next) => {
    try {
        const tokenFromUser = req.query.s
        const user = await Users.findById({ _id: mongoose.Types.ObjectId(req.params.id) })
        if (tokenFromUser === user.rndString) {
            res.redirect(`${process.env.frontend_url}/resetpassword/${req.params.id}/?s=${req.query.s}`)
        }
        else{
            res.send("Token Not Matched / Token Expired")
        }
    }
    catch (err) {
        res.send(err)
    }
}


module.exports.savePassword = async (req, res, next) => {
    try{
        const string = await bcrypt.genSalt(6)
        // console.log("in save",req.body.password)
        const hashPassword = await bcrypt.hash(req.body.password, string)
        await Users.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, { $set: { password: hashPassword } })
        await Users.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, { $unset: { rndString: '' } })
        res.send({msg : "saved successfully"})
    }
    catch(err){
        // console.log(err)
        res.send(err)
    }
    
}
