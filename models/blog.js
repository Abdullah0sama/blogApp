var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    date:{
        type:Date, 
        default:Date.now
    },
    comments: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports = mongoose.model("Blog", blogSchema);