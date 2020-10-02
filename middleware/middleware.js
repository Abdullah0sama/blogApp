const Blog = require("../models/blog");
var middleware = {};
middleware.isLoggedOut = function(req, res, next){
    if(req.isUnauthenticated()){
        return next();
    }
    res.redirect("/");
}

middleware.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.redirectUrl = req.originalUrl;
    res.redirect(`/login`);
}

middleware.ownedBlog = function(req, res, next){
    if(req.isAuthenticated()){
        Blog.findById(req.params.id)
        .then((blog) => {
            if(blog.author.equals(req.user._id)){
                return next();
            }else{
                res.redirect("back");
            }
        })
        .catch((err) => console.log(err));
    }else{
        res.redirect("/login");
    }
}


module.exports = middleware;