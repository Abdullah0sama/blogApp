var express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local").Strategy,
    session = require("express-session"),
    bcrypt = require("bcrypt");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
//creates database and connects to it
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/blogApp", {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true})
.then(() => console.log("Connected to db successfully!"))
.catch((err) => console.log("error connecting to db", err));
const blog = require("./models/blog");
//creates the schema
var Blog = require("./models/blog");
var Comment = require("./models/comment");
const user = require("./models/user");
var User = require("./models/user");

app.use(session({
    secret:"HELLO it is me i was wondering",
    saveUninitialized:false,
    resave:false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done){
    done(null, user._id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        user.password = undefined;
        user.salt = undefined;
        done(err, user);
    });
});

app.use(function(req, res, next){
    res.locals.user = req.user;
    return next();
});
passport.use(new localStrategy(function(username, password, done){
    User.findOne({username:username},function(err, user){
        if(err) return done(err);
        if(!user){
            return done(null, false, {message:"incorrect username"});
        }
        if(!bcrypt.compareSync(password, user.password)){
            return done(null, false, {message:"incorrect password"});
        }
        return done(null, user);
    })
}));

// Comment.create({text:"Hello"}).then((comment)=>{
// Blog.create({title:"TEST", body:"NHHHH", image:"Http://www.google.com"})
// .then((blog)=> blog)
// .catch((err)=>console.log(err))
// .then( (blog) => Blog.findOneAndRemove({_id:blog._id}))
// .then( (c) => console.log("done"))
// .catch((err) => console.log(err));
// })

var blogs = require("./routes/blog");
var comments = require("./routes/comment");
var index = require("./routes/index");
app.use("/b",blogs);
app.use(comments);
app.use(index);
app.listen("3000", function () {  
    console.log("Blog app server started successfully!");
})