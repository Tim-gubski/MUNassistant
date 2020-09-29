var mongoose = require('mongoose')
var itemSchema = new mongoose.Schema({
    name: {type:String, unique:true},
    image: {
        type:String, 
        default:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_the_United_Nations_%281945-1947%29.svg/2000px-Flag_of_the_United_Nations_%281945-1947%29.svg.png"
    },
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    delegations:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Delegation"
        }
    ],
    speakingList:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Delegation"
        }
    ],
    motions:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Motion"
        }
    ]
})

module.exports = mongoose.model("Committee", itemSchema)