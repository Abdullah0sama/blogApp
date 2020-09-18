var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text:String,
    date:{
        type:Date,
        default:Date()
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
});
commentSchema.add({
    replies:[commentSchema]
});
module.exports = mongoose.model("Comment", commentSchema);