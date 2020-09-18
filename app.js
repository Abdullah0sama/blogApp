var express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local").Strategy,
    session = require("express-session");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
//creates database and connects to it
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/blogApp", {useNewUrlParser:true, useUnifiedTopology:true})
.then(() => console.log("Connected to db successfully!"))
.catch((err) => console.log("error connecting to db", err));
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
            return done(null, false,{message:"incorrect username"});
        }
        if(!user.password == password){
            return(null, false, {message:"incorrect password"});
        }
        return done(null, user);
    })
}));

app.get("/signup", isLoggedOut, function(req, res){
    res.render("signup");
});

function isLoggedOut(req, res, next){
    if(req.isUnauthenticated()){
        return next();
    }
    res.redirect("/");
}
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});
app.get("/u/:username", function(req, res){
    User.findOne({username:req.params.username}).populate("blogs")
    .then((user) => res.render("userprofile",{userInfo:user}))
    .catch((err) => console.log(err));
});


app.post("/", function(req, res){
    User.create(req.body.user)
    .then((user) => {
        res.redirect("/");
    })
    .catch((err) => console.log(err));
});
app.get("/login", function(req, res){
    res.render("login");
});
app.post("/login" , passport.authenticate("local", {failureRedirect:"/login", successRedirect:"/"}), function(req, res){})

app.get("/", function (req, res) {
    console.log(req);
    Blog.find(function(err, blogsData){
        if(err){
            console.log("error in retreving the data", err);
        }else{
            res.render("index", {blogs:blogsData});
        }
    });  
});

app.get("/new",isLoggedIn, function (req, res) {  
    res.render("new");
    req.isAuthenticated
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

app.post("/blog", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function (err, success) {  
        if(err){
            console.log("err");
            
        }else{
            success.author = req.user._id;
            success.save();
            User.findOneAndUpdate({_id:req.user._id},{$push:{blogs:success}})
            .then((user) => res.redirect("/")).catch((err)=>console.log(err));
        }
    })
});

app.get("/:id", function (req, res) {  
    Blog.findById(req.params.id).populate(["author", "comments"]).exec(function (err, blog) {  
        if(err){
            res.redirect("/");
        }else{
            console.log(blog);
            res.render("show", {blog:blog});
        }
    })
});

app.get("/:id/edit",  function (req, res) {  
    Blog.findById(req.params.id, function (err, blog) {  
        if(err){
            res.redirect("/" + req.params.id);
        }else{
            res.render("edit", {blog:blog});
        }
    })
})

app.put("/:id", function (req, res) {  
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, success) {  
        if(err){
            console.log("error");
            res.redirect("/");
        }else{
            res.redirect("/" + req.params.id);
        }
    })
})

app.delete("/:id", function (req, res) {  
    Blog.findByIdAndDelete(req.params.id, function (err) {  
        if(err){
            res.redirect("/" + req.params.id);
        }else{
            res.redirect("/");
        }
    })
});

app.post("/:id/comments", function(req, res){
    Comment.create(req.body.comment)
    .then(function(comment){
        return Blog.findByIdAndUpdate(req.params.id,{$push : {"comments" : comment }});
    })
    .then(() => res.redirect("/" + req.params.id))
    .catch(function(err){
        console.log(err);
    });
});
app.post("/:id/comments/:comment_id/reply", function(req, res){
    var newReply = new Comment({
        text: req.body.reply.text
    });
    Comment.findById(req.params.comment_id)
    .then((comment) => {
        comment.replies.push(newReply);
        comment.save();
        console.log(comment);
        res.redirect("/" + req.params.id)
    })
    .catch((err) => console.log(err));
});


app.listen("3000", function () {  
    console.log("Blog app server started successfully!");
})