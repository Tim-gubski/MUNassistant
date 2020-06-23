var mongoose = require('mongoose')
var itemSchema = new mongoose.Schema({
    name: {type:String, unique:true},
    presentVoting: String,
    speakingTime: {
        type:Number,
        default:0
    },
    notes: {
        type:String,
        default:""
    },
    committee:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Committee"
    }
})

module.exports = mongoose.model("Delegation", itemSchema)