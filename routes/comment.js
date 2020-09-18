var router = require("express").Router();
var Comment = require("../models/comment");
router.post("/:id/comments", function(req, res){
    Comment.create(req.body.comment)
    .then(function(comment){
        return Blog.findByIdAndUpdate(req.params.id,{$push : {"comments" : comment }});
    })
    .then(() => res.redirect("/" + req.params.id))
    .catch(function(err){
        console.log(err);
    });
});
router.post("/:id/comments/:comment_id/reply", function(req, res){
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

module.exports = router;