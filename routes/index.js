var express = require("express");
var router = express.Router({mergeParams:true});
var passport = require("passport");
var User = require("../models/user");


//AUTH ROUTES

router.get("/register",function(req,res){
    res.render("authentication/register");
})

router.post("/register",function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password,function(err,user){
        if(err){
            req.flash("error", err.message);
            res.redirect("/register")
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success", "Welcome to Misogyny Inc." + user.username);
            res.redirect("/committees");
        })
    });
})

//LOGIN

router.get("/login",function(req,res){
    res.render("authentication/login")
})

router.post("/login",passport.authenticate("local",
    {
        successRedirect: "/committees",
        failureRedirect:"/login",
        failureFlash:true
    }), function(req,res){
})

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out!")
    res.redirect("/");
})

module.exports = router;