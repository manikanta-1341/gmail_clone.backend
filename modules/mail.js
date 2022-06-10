const Users = require('../models/users')
const mailer = require('nodemailer')
const mongoose = require('mongoose')



module.exports.SendMail = async (req, res) => {
    try {
        const receiver = await Users.findOne({ username: req.body.to })
        const sender = await Users.findOne({ username: req.body.from })
        
        if (receiver) {
            
            let time = new Date().toLocaleTimeString().split("")
            let res_Time = ""
            let id = mongoose.Types.ObjectId()
            if (time.length === 11) {
                res_Time = time.filter((e, i) => i != 5 && i != 6 && i !== 7)
            }
            else {
                res_Time = time.filter((e, i) => i != 4 && i != 5 && i !== 6)
            }
            let res_date = new Date().toUTCString().split(" ").filter((e, i) => i === 1 || i === 2).join(" ")

            receiver.inbox.push({ _id: mongoose.Types.ObjectId(), id: id, date: res_date, Time: res_Time.join(""), from: req.body.from, subject: req.body.subject, msg: req.body.textarea, read: "no" })
            sender.sentMail.push({ _id: id, date: res_date, Time: res_Time.join(""), to: req.body.to, subject: req.body.subject, msg: req.body.textarea, read: "no" })
           
            receiver.save()
            sender.save()
            res.send("success")
        }
        else {
            // console.log("email address not found")
            res.send({ msg: "email address not found" })
        }
    }
    catch (err) {
        res.send(err)
    }
}


module.exports.Inbox = async (req, res) => {
    try {
        let response = await Users.findOne({ _id: req.params.id })
        // console.log(response)
        if (response) {
            res.send(response)
        }
    }
    catch (err) {
        res.send(err)
    }
}

module.exports.InboxModify = async (req, res) => {
    try {
        // console.log("in func")

        let response = await Users.findOneAndUpdate(
            { "inbox._id": mongoose.Types.ObjectId(req.params.id) },
            { $set: { "inbox.$.read": "yes" } },
            { new: true }
        )
        res.send(response)
    }
    catch (err) {
        // //console.log(err)
        res.send(err)
    }
}
module.exports.SentModify = async (req, res) => {
    try {
        // console.log("in func")

        let response = await Users.findOneAndUpdate(
            { "sentMail._id": mongoose.Types.ObjectId(req.params.id) },
            { $set: { "sentMail.$.read": "yes" } },
            { new: true }
        )
        res.send(response)
    }
    catch (err) {
        // //console.log(err)
        res.send(err)
    }
}
module.exports.StarredModify = async (req, res) => {
    try {
        // console.log("in func")

        let response = await Users.findOneAndUpdate(
            { "starred._id": mongoose.Types.ObjectId(req.params.id) },
            { $set: { "starred.$.read": "yes" } },
            { new: true }
        )
        res.send(response)
    }
    catch (err) {
        //console.log(err)
        res.send(err)
    }
}

module.exports.deleteFromInbox = async (req, res) => {
    try {
        let arr = req.body.arr
        let response = ""
        arr.map(async (e) => {
            let getMsg = await Users.findOne(
                { _id: mongoose.Types.ObjectId(req.params.id), "inbox._id": mongoose.Types.ObjectId(e._id) },
                { "inbox.$": 1, _id: 0 })
            await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { inbox: { _id: mongoose.Types.ObjectId(e._id) } } })
            let pushObject = getMsg.inbox[0]
            if (pushObject.starred) {
                await Users.findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $pull: { starred: { _id: mongoose.Types.ObjectId(e._id) } } },
                    { new: true }
                )
                response = await Users.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { bin: pushObject } },
                    { new: true }
                )
            }
            else {

                response = await Users.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { bin: pushObject } },
                    { new: true }
                )
            }
        })
        res.send(response)
    } catch (error) {
        // console.log(error)
        res.send(error)
    }
}

module.exports.deleteFromSentMail = async (req, res) => {
    try {
        let arr = req.body.arr
        let response = ""
        arr.map(async (e) => {
            let getMsg = await Users.findOne(
                { _id: mongoose.Types.ObjectId(req.params.id), "sentMail._id": mongoose.Types.ObjectId(e._id) },
                { "sentMail.$": 1, _id: 0 })
            await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { sentMail: { _id: mongoose.Types.ObjectId(e._id) } } }
            )
            let pushObject = getMsg.sentMail[0]
            if (pushObject.starred) {
                await Users.findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $pull: { starred: { _id: mongoose.Types.ObjectId(e._id) } } },
                    { new: true }
                )
                response = await Users.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { bin: pushObject } },
                    { new: true }
                )

            }
            response = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { bin: pushObject } },
                { new: true }
            )

        })
        res.send(response)
    } catch (error) {
        // console.log(error)
        res.send(error)
    }
}
module.exports.deleteFromDraft = async (req, res) => {
    try {
        let arr = req.body.arr
        let response = ""
        arr.map(async (e) => {
            let getMsg = await Users.findOne(
                { _id: mongoose.Types.ObjectId(req.params.id), "draft._id": mongoose.Types.ObjectId(e._id) },
                { "draft.$": 1, _id: 0 })
            await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { draft: { _id: mongoose.Types.ObjectId(e._id) } } }
            )
            response = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { bin: {...getMsg.draft[0],draft:"yes"} } },
                { new: true }
            )

        })
        res.send(response)
    } catch (error) {
        // console.log(error)
        res.send(error)
    }
}

module.exports.deleteFromStarred = async (req, res) => {
    try {
        let arr = req.body.arr
        let response = ""
        arr.map(async (e) => {
            let getMsg = await Users.findOne(
                { _id: mongoose.Types.ObjectId(req.params.id), "starred._id": mongoose.Types.ObjectId(e._id) },
                { "starred.$": 1, _id: 0 })
            await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { starred: { _id: mongoose.Types.ObjectId(e._id) } } })
            let pushObject = getMsg.starred[0]
            if (pushObject.from) {
                await Users.findOneAndUpdate(
                    { "inbox._id": mongoose.Types.ObjectId(e._id) },
                    { $unset: { "inbox.$.starred": "yes" } },
                    { new: true }
                )
            }
            else if (pushObject.to) {
                await Users.findOneAndUpdate(
                    { "sentMail._id": mongoose.Types.ObjectId(e._id) },
                    { $unset: { "sentMail.$.starred": "yes" } },
                    { new: true }
                )
            }
            response = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { bin: pushObject } },
                { new: true }
            )
        })
        res.send(response)
    } catch (error) {
        // console.log(error)
        res.send(error)
    }
}

module.exports.PermanentDelete = async (req, res) => {
    try {
        let arr = req.body.arr
        let response = ""
        arr.map(async (e) => {
            response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $pull: { bin: { _id: mongoose.Types.ObjectId(e._id) } } },
                { new: true }
            )
        })
        res.send(response)
    } catch (err) {
        //console.log(err)
        res.send({ msg: err })
    }
}

module.exports.StarredMsg = async (req, res) => {
    try {
        let getmsg = await Users.findOne(
            { _id: mongoose.Types.ObjectId(req.params.id), "inbox._id": mongoose.Types.ObjectId(req.body.id) },
            { "inbox.$": 1, _id: 0 }
        )
        let response = await Users.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.params.id) }, { $push: { starred: getmsg.inbox[0] } },
            { new: true }
        )
        if (response.starred.length > 0) {
            let result = await Users.findOneAndUpdate(
                { "inbox._id": mongoose.Types.ObjectId(req.body.id) },
                { $set: { "inbox.$.starred": "yes" } },
                { new: true }
            )
            res.send(result)
        }
    } catch (err) {
        //console.log(err)
        res.send(err)
    }
}
module.exports.StarredMsg_Sentbox = async (req, res) => {
    try {
        let getmsg = await Users.findOne(
            { _id: mongoose.Types.ObjectId(req.params.id), "sentMail._id": mongoose.Types.ObjectId(req.body.id) },
            { "sentMail.$": 1, _id: 0 }
        )
        let response = await Users.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.params.id) }, { $push: { starred: getmsg.sentMail[0] } },
            { new: true }
        )
        if (response.starred.length > 0) {
            let result = await Users.findOneAndUpdate(
                { "sentMail._id": mongoose.Types.ObjectId(req.body.id) },
                { $set: { "sentMail.$.starred": "yes" } },
                { new: true }
            )
            res.send(result)
        }
    } catch (err) {
        //console.log(err)
        res.send(err)
    }
}


module.exports.UnStarredMsg = async (req, res) => {
    try {
        let response = await Users.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.params.id) },
            { $pull: { starred: { _id: mongoose.Types.ObjectId(req.body.id) } } },
            { new: true }
        )

        let result = await Users.findOneAndUpdate(
            { "inbox._id": mongoose.Types.ObjectId(req.body.id) },
            { $unset: { "inbox.$.starred": "yes" } },
            { new: true }
        )
        res.send(result)

    } catch (err) {
        //console.log(err)
        res.send(err)
    }
}
module.exports.UnStarredMsg_Sentbox = async (req, res) => {
    try {
        let response = await Users.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.params.id) },
            { $pull: { starred: { _id: mongoose.Types.ObjectId(req.body.id) } } },
            { new: true }
        )

        let result = await Users.findOneAndUpdate(
            { "sentMail._id": mongoose.Types.ObjectId(req.body.id) },
            { $unset: { "sentMail.$.starred": "yes" } },
            { new: true }
        )
        res.send(result)

    } catch (err) {
        //console.log(err)
        res.send(err)
    }
}

module.exports.Allread = async (req, res) => {
    // console.log("in all read")
    switch (req.query.s) {
        case "inbox":
            let inbox_response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { "inbox.$[].read": "yes" } },
                { new: true }
            )
            res.send(inbox_response)
            break;
        case "sent":
            let sent_response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { "sentMail.$[].read": "yes" } },
                { new: true }
            )
            res.send(sent_response)
            break;
        case "starred":
            let starred_response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { "starred.$[].read": "yes" } },
                { new: true }
            )
            res.send(starred_response)
            break;

        default:
            break;
    }
}

module.exports.Allunread = async (req, res) => {
    switch (req.query.s) {
        case "inbox":
            let inbox_response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { "inbox.$[].read": "no" } },
                { new: true }
            )
            // console.log("inbox_response:",inbox_response)
            res.send(inbox_response)
            break;
        case "sent":
            let sent_response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { "sentMail.$[].read": "no" } },
                { new: true }
            )
            res.send(sent_response)
            break;
        case "starred":
            let starred_response = await Users.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(req.params.id) },
                { $set: { "starred.$[].read": "no" } },
                { new: true }
            )
            res.send(starred_response)
            break;

        default:
            break;
    }
}

module.exports.RestoreAll = async (req, res) => {
    try {
        let arr = req.body.arr
        let response = ""
        arr.map(async (e) => {
            // console.log("in restore", e)
            let getmsg = await Users.findOne(
                { _id: mongoose.Types.ObjectId(req.params.id), "bin._id": mongoose.Types.ObjectId(e._id) },
                { "bin.$": 1, _id: 0 }
            )
            if (getmsg.bin[0].starred) {
                await Users.findOneAndUpdate(
                    { "bin._id": mongoose.Types.ObjectId(e._id) },
                    { $unset: { "bin.$.starred": "yes" } },
                    { new: true }
                )
            }
            if(getmsg.bin[0].draft){
                await Users.findOneAndUpdate(
                    { "bin._id": mongoose.Types.ObjectId(e._id) },
                    { $unset: { "bin.$.draft": "yes" } },
                    { new: true }
                )
                response = await Users.findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $push: { draft: getmsg.bin[0] } },
                    { new: true }
                )
            }
            if (getmsg.bin[0].from) {
                await Users.findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $pull: { bin: { _id: mongoose.Types.ObjectId(e._id) } } },
                    { new: true }
                )
                let duplicate = await Users.findOne(
                    { "inbox._id": mongoose.Types.ObjectId(e._id) },
                    { "inbox.$": 1, _id: 0 }
                )
                if (duplicate === null) {

                    response = await Users.findOneAndUpdate(
                        { _id: mongoose.Types.ObjectId(req.params.id) },
                        { $push: { inbox: getmsg.bin[0] } },
                        { new: true }
                    )
                }
                // console.log(response)
            }
            else if (getmsg.bin[0].to) {
                await Users.findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(req.params.id) },
                    { $pull: { bin: { _id: mongoose.Types.ObjectId(e._id) } } },
                    { new: true }
                )
                let duplicate = await Users.findOne(
                    { "sentMail._id": mongoose.Types.ObjectId(e._id) },
                    { "sentMail.$": 1, _id: 0 }
                )
                if (duplicate === null) {
                    response = await Users.findOneAndUpdate(
                        { _id: mongoose.Types.ObjectId(req.params.id) },
                        { $push: { sentMail: getmsg.bin[0] } },
                        { new: true }
                    )
                }
                // console.log(response)
            }
            
        })
        res.send(response)
    } catch (err) {
        console.log(err)
        res.send({ msg: err })
    }
}

// module.exports.RestoreOne = async (req, res) => {
//     try {
//         let arr = req.body.arr
//         let response = ""
//         arr.map(async (e) => {
//             // console.log("in restore", e)
//             let getmsg = await Users.findOne(
//                 { _id: mongoose.Types.ObjectId(req.params.id), "bin._id": mongoose.Types.ObjectId(e._id) },
//                 { "bin.$": 1, _id: 0 }
//             )
//             if (getmsg.bin[0].starred) {
//                 await Users.findOneAndUpdate(
//                     { "bin._id": mongoose.Types.ObjectId(e._id) },
//                     { $unset: { "bin.$.starred": "yes" } },
//                     { new: true }
//                 )
//             }
//             if(getmsg.bin[0].draft){
//                 await Users.findOneAndUpdate(
//                     { "bin._id": mongoose.Types.ObjectId(e._id) },
//                     { $unset: { "bin.$.draft": "yes" } },
//                     { new: true }
//                 )
//                 response = await Users.findOneAndUpdate(
//                     { _id: mongoose.Types.ObjectId(req.params.id) },
//                     { $push: { draft: getmsg.bin[0] } },
//                     { new: true }
//                 )
//             }
//             if (getmsg.bin[0].from) {
//                 await Users.findOneAndUpdate(
//                     { _id: mongoose.Types.ObjectId(req.params.id) },
//                     { $pull: { bin: { _id: mongoose.Types.ObjectId(e._id) } } },
//                     { new: true }
//                 )
//                 let duplicate = await Users.findOne(
//                     { "inbox._id": mongoose.Types.ObjectId(e._id) },
//                     { "inbox.$": 1, _id: 0 }
//                 )
//                 if (duplicate === null) {

//                     response = await Users.findOneAndUpdate(
//                         { _id: mongoose.Types.ObjectId(req.params.id) },
//                         { $push: { inbox: getmsg.bin[0] } },
//                         { new: true }
//                     )
//                 }
//                 // console.log(response)
//             }
//             else if (getmsg.bin[0].to) {
//                 await Users.findOneAndUpdate(
//                     { _id: mongoose.Types.ObjectId(req.params.id) },
//                     { $pull: { bin: { _id: mongoose.Types.ObjectId(e._id) } } },
//                     { new: true }
//                 )
//                 let duplicate = await Users.findOne(
//                     { "sentMail._id": mongoose.Types.ObjectId(e._id) },
//                     { "sentMail.$": 1, _id: 0 }
//                 )
//                 if (duplicate === null) {
//                     response = await Users.findOneAndUpdate(
//                         { _id: mongoose.Types.ObjectId(req.params.id) },
//                         { $push: { sentMail: getmsg.bin[0] } },
//                         { new: true }
//                     )
//                 }
//                 // console.log(response)
//             }
            
//         })
//         res.send(response)
//     } catch (err) {
//         console.log(err)
//         res.send({ msg: err })
//     }
// }

module.exports.Draft = async (req, res) => {
    try {
        let time = new Date().toLocaleTimeString().split("")
        let res_Time = ""
        let id = mongoose.Types.ObjectId()
        if (time.length === 11) {
            res_Time = time.filter((e, i) => i != 5 && i != 6 && i !== 7)
        }
        else {
            res_Time = time.filter((e, i) => i != 4 && i != 5 && i !== 6)
        }
        let res_date = new Date().toUTCString().split(" ").filter((e, i) => i === 1 || i === 2).join(" ")
        let response = await Users.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.params.id) },
            { $push: { draft: {...req.body.msg,_id:id,Time:res_Time.join(""),date:res_date,} } },
            { new: true }
        )
        res.send(response)
    } catch (err) {
        res.send({ msg: err })
    }
}