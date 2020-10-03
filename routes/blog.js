var router = require("express").Router();

var Blog = require("../models/blog");
var User = require("../models/user");
var middleware  = require("../middleware/middleware");
router.post("/", function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function (err, success) {  
        if(err){
            console.log("err");
        }else{
            success.author = req.user;
            success.save();
            User.findOneAndUpdate({_id:req.user._id},{$push:{blogs:success}})
            .then((user) => res.redirect("/")).catch((err)=>console.log(err));
        }
    })
});

router.get("/new", middleware.isLoggedIn, function (req, res) { 
    res.render("blogs/new");
});

router.get("/:id", function (req, res) {  
    Blog.findById(req.params.id).populate([{path:"author", select:"username"}, 
                                            {path:"comments", populate:{path:"author", select:"username"}},
                                            {path:"comments", populate:{path:"replies", populate:{path:"author", select:"username"}}}])
        .exec(function (err, blog) {  
        if(err){
            console.log(req.params.id);
            console.log(err);
            res.redirect("/");
        }else{
            // console.log(blog);
            res.render("blogs/show", {blog:blog});
        }
    })
});
router.get("/:id/edit", middleware.ownedBlog, function (req, res) {  
    Blog.findById(req.params.id, function (err, blog) {  
        if(err){
            res.redirect("/b/" + req.params.id);
        }else{
            res.render("blogs/edit", {blog:blog});
        }
    })
})

router.put("/:id", middleware.ownedBlog, function (req, res) {  
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, success) {  
        if(err){
            console.log("error");
            res.redirect("/");
        }else{
            res.redirect("/b/" + req.params.id);
        }
    })
});
router.delete("/:id", middleware.ownedBlog, function (req, res) {  
    Blog.findById(req.params.id)
    .then((blog) => blog.remove())
    .then(() => res.redirect("/"))
    .catch((err) => res.redirect("/b/" + req.params.id));
});

module.exports = router;