var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    middleware = require("./middleware");

var Committee = require("./models/committee"),
    Delegation = require("./models/delegation"),
    User = require("./models/user")

var app = express()
var port = process.env.PORT || 3000;

var indexRoutes = require("./routes/index")

var eloRange = 100



// seedDB()
//mongodb://localhost/comparitor
//mongodb+srv://tim:loki@ eyelpcamp-mvsim.mongodb.net/yelp_camp?retryWrites=true&w=majority
mongoose.connect("mongodb://localhost/munassistant", {useNewUrlParser: true, useUnifiedTopology: true})
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));
app.use(flash())

//AUTHENTICATION
app.use(require("express-session")({
    secret: "Dogs are cute",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//PASS VARIABLES
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    // res.locals.success = req.flash("success");
    next();
})

//USE ROUTES
app.use(indexRoutes)


//ROUTES
app.get("/",function(req,res){
    res.render("landing")
})

app.get("/committees",function(req,res){
    Committee.find({},function(err,committees){
        if(err){
            req.flash("error","Something went wrong. Please try again.")
            res.redirect("/")
        } else{
            res.render("committees",{committees:committees})
        }
    })
    
})

app.get("/committees/new",function(req,res){
    res.render("newCommittee")
})

app.post("/committees",function(req,res){
    Committee.create({name:req.body.name},function(err,newCommittee){
        if(err){
            req.flash("error","Something went wrong. Please try again.")
            res.redirect("/committees/new")
        } else{
            req.flash("success","Successfully Created " + newCommittee.name)
            res.redirect("/committees")
        }
    })
})

app.get("/:id/rollcall",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        // console.log(committee)
        res.render("rollCall",{committee:committee})
    })  
})

app.post("/:id/rollcall",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        if(err){
            console.log(err)
            res.redirect("back")
        } else{
            var toDelete = []
            var toAdd = []
            var toUpdate = []

            var current = committee.delegations.map(a => a._id.toString());
            console.log(current)

            req.body.delegations.forEach(function(delegation){
                //if already in del list
                if(current.includes(delegation.id)) {
                    toUpdate.push(delegation)
                } 
                //not already in del list
                else {
                    toAdd.push(delegation)
                }
            })
            var newDels = req.body.delegations.map(a => a.id.toString());
            console.log(newDels)
            current.forEach(function(delegationID){
                if (!newDels.includes(delegationID)) {
                    toDelete.push(delegationID)
                }
            })
            console.log("to Delete " + toDelete)
            console.log("to Add " + toAdd)
            console.log("to Update " + toUpdate)
            //update delete and add
            toAdd.forEach(function(delegation){
                Delegation.create({name:delegation.name,presentVoting:delegation.presentVoting},function(err,newDel){
                    Committee.findByIdAndUpdate(
                        req.params.id,
                        {$push:{delegations:newDel}},
                        function(err){
                            if(err){
                                console.log(err)
                            } else {
                                console.log("added")
                            }
                        }
                    )
                })
            })
            toDelete.forEach(function(delegationID){
                Delegation.deleteOne({_id:delegationID},function(err,deleted){
                    Committee.findByIdAndUpdate(
                        req.params.id,
                        {$pull:{delegations:deleted}},
                        function(err){
                            if(err){
                                console.log(err)
                            } else {
                                console.log("Deleted")
                            }
                        }
                    )
                })
            })
            toUpdate.forEach(function(delegation){
                Delegation.findOneAndUpdate({_id:delegation.id},{name:delegation.name, presentVoting:delegation.presentVoting},function(err,updatedDel){
                })
            })
            
            res.redirect("/"+req.params.id+"/rollcall")
        }
    })
})

app.get("/:id/speakinglist",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        res.render("speakinglist",{committee:committee})
    })  
})



app.listen(port,function(){
    console.log("MUN Assistant has Started")
})