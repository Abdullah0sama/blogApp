var router = require("express").Router();
var User = require("../models/user");
var Blog = require("../models/blog");
var middleware = require("../middleware/middleware");
var passport = require("passport");
var bcrypt = require("bcrypt");

var salt = bcrypt.genSaltSync(10);
router.get("/signup", middleware.isLoggedOut, function(req, res){
    res.render("signup");
});


router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});
router.get("/u/:username", function(req, res){
    User.findOne({username:req.params.username}).populate("blogs")
    .then((user) => res.render("userprofile",{userInfo:user}))
    .catch((err) => console.log(err));
});


router.post("/", function(req, res){
    User.create(req.body.user)
    .then((user) => {
        user.password = bcrypt.hashSync(user.password, salt);
        user.salt =  salt;
        user.save();
        res.redirect("/");
    })
    .catch((err) => console.log(err));
});
router.get("/login", function(req, res){
    res.render("login");
});
router.post("/login" , passport.authenticate("local", {failureRedirect:"/login", successRedirect:"/"}), function(req, res){})

router.get("/", function (req, res) {
    console.log(req);
    Blog.find(function(err, blogsData){
        if(err){
            console.log("error in retreving the data", err);
        }else{
            res.render("index", {blogs:blogsData});
        }
    });  
});



module.exports = router;

