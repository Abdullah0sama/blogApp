var router = require("express").Router();
var Comment = require("../models/comment");
var Blog = require("../models/blog");
var middleware = require("../middleware/middleware");

router.post("/b/:id/comments", middleware.isLoggedIn, function(req, res){
    req.body.comment.author = req.user;
    Comment.create(req.body.comment)
    .then(function(comment){
        return Blog.findByIdAndUpdate(req.params.id,{$push : {"comments" : comment }});
    })
    .then(() => res.redirect("/b/" + req.params.id))
    .catch(function(err){
        console.log("err");
    });
});
router.post("/b/:id/comments/:comment_id/reply", middleware.isLoggedIn, function(req, res){
    var newReply = new Comment({
        text: req.body.reply.text,
        author:req.user
    });
    Comment.findById(req.params.comment_id)
    .then((comment) => {
        comment.replies.push(newReply);
        comment.save();
        res.redirect("/b/" + req.params.id)
    })
    .catch((err) => console.log(err));
});

router.get("/b/:id/comments", function(req, res){
    res.redirect(`/b/${req.params.id}/#comments`);
});
module.exports = router;