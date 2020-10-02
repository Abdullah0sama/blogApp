var router = require("express").Router();
var User = require("../models/user");
var Blog = require("../models/blog");
var middleware = require("../middleware/middleware");
var passport = require("passport");
var bcrypt = require("bcrypt");

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
        var salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
        user.salt =  salt;
        user.save();
        res.redirect("/login");
    })
    .catch((err) => {
        res.redirect("/signup");
        console.log(err);
    });
});

router.get("/login", middleware.isLoggedOut, function(req, res){
    res.render("login");
});
router.post("/login", function(req, res, next){
    passport.authenticate("local", function(error, user, info){
        if(error) return next(error);
        if(!user) return res.redirect(req.get("referer"));
        req.logIn(user, function(err){
            if(err) return next(err);
            if(!req.session.redirectUrl) return res.redirect("/");
                res.redirect(req.session.redirectUrl);
                delete req.session.redirectUrl;
                req.session.save();
        });
    })(req, res, next);
});

router.get("/", function (req, res) {
    console.log(req.session, "index");
    Blog.find(function(err, blogsData){
        if(err){
            console.log("error in retreving the data", err);
        }else{
            res.render("index", {blogs:blogsData});
        }
    });  
});



module.exports = router;

