var mongoose = require('mongoose')
var itemSchema = new mongoose.Schema({
    delegation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delegation"
    },
    type: {
        type:String,
        default:"Mod"
    },
    duration: {
        type:String,
        default:""
    },
    speakingTime: {
        type:String,
        default:""
    },
    topic: {
        type:String,
        default:""
    },
})

module.exports = mongoose.model("Motion", itemSchema)