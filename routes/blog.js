var router = require("express").Router();

var Blog = require("../models/blog");
var User = require("../models/user");
router.post("/", function (req, res) {
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

router.get("/:id", function (req, res) {  
    Blog.findById(req.params.id).populate(["author", "comments"]).exec(function (err, blog) {  
        if(err){
            res.redirect("/");
        }else{
            // console.log(blog);
            res.render("blogs/show", {blog:blog});
        }
    })
});
router.get("/:id/edit",  function (req, res) {  
    Blog.findById(req.params.id, function (err, blog) {  
        if(err){
            res.redirect("/b/" + req.params.id);
        }else{
            res.render("blogs/edit", {blog:blog});
        }
    })
})

router.put("/:id", function (req, res) {  
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
router.delete("/:id", function (req, res) {  
    Blog.findByIdAndDelete(req.params.id, function (err) {  
        if(err){
            res.redirect("/b/" + req.params.id);
        }else{
            res.redirect("/");
        }
    })
});

module.exports = router;