var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    email:{type:String, unique:true},
    mobile:{type:Number, unique:true},
    username:{type:String, unique:true},
    password:String,
    salt:String,
    blogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog"
    }]
});

module.exports = mongoose.model("User", userSchema);