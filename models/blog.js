const { json } = require("body-parser");
var mongoose = require("mongoose");
var Comment = require("./comment");
var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:JSON,
    preview:String,
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
    },
    tags:[{
        type:String
    }]
});
blogSchema.pre("remove", function(){
    console.log(this._conditions);
    // this._conditions.comments.forEach((comment)=> Comment.findOneAndRemove(comment))
    console.log(this);
})

module.exports = mongoose.model("Blog", blogSchema);