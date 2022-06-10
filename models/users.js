const mongoose = require('mongoose')
const schema = mongoose.Schema

const UserSchema= new schema({
    username:{
        type:String,
        required:true
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verification:{
        type:String,
        default:"no"

    },
    inbox:{
        type:Array,
        default:[]
    },
    sentMail:{
        type:Array,
        default:[]

    },
    draft:{
        type:Array,
        default:[]
    },
    starred:{
        type:Array,
        default:[]

    },
    bin:{
        type:Array,
        default:[]
    },
    rndString:{
        type : String
    }

})

const Users = mongoose.model('users' , UserSchema)
module.exports = Users