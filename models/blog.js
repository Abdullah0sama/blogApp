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
    this.model("User").updateOne(
        {_id: this.author},
        {$pull: {blogs: this._id}}
    ,function(err, number){
        if(err) console.log(err);
    });
    this.model("Comment").deleteMany(
        {_id: {$in: this.comments}}, 
        function(err){
            if(err) console.log(err);
        }
    )   
})

module.exports = mongoose.model("Blog", blogSchema);