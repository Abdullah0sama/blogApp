var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    email:String,
    mobile:Number,
    username:String,
    password:String,
    salt:String,
    blogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }]
});

module.exports = mongoose.model("User", userSchema);