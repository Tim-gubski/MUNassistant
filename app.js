var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    middleware = require("./middleware");

var Committee = require("./models/committee"),
    Delegation = require("./models/delegation"),
    User = require("./models/user"),
    Motion = require("./models/motion");

const delegation = require("./models/delegation");

var app = express()
var port = process.env.PORT || 3000;

var indexRoutes = require("./routes/index")

var eloRange = 100



// seedDB()
//mongodb://localhost/munassistant
//mongodb+srv://tim:loki@ eyelpcamp-mvsim.mongodb.net/yelp_camp?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://tim:loki@yelpcamp-mvsim.mongodb.net/yelp_camp?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
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
    Committee.find({creator:req.user},function(err,committees){
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
    Committee.create({name:req.body.name, user:req.user},function(err,newCommittee){
        if(err){
            req.flash("error","Something went wrong. Please try again.")
            res.redirect("/committees/new")
        } else{
            req.flash("success","Successfully Created " + newCommittee.name)
            res.redirect("/committees")
        }
    })
})

// ROLL CALL!

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

//SPEAKING LIST!!

app.get("/:id/speakinglist",function(req,res){
    Committee.findById(req.params.id).populate("speakingList").populate("delegations").exec(function(err,committee){
        res.render("speakinglist",{committee:committee})
    })  
})

app.post("/:id/speakinglist",function(req,res){
    Committee.findByIdAndUpdate(
        { _id: req.params.id},
        { $set: { speakingList: [] }},
        function(err,committee){
            if(err){
                console.log(err)
            } else {
                console.log(committee)
            }
        }
    )
    req.body.delegations.forEach(function(del){
        Delegation.findById(del.id,function(err,delegation){
            if(err){
                console.log(err)
            } else {
                console.log("addingSpeaker")
                Committee.findByIdAndUpdate(
                    req.params.id,
                    { $push: {speakingList: delegation} },
                    function(err,committee){
                        if(err){
                            console.log(err)
                        } else {
                            console.log(committee)
                        }
                    }
                )
            }
        });
    })
    res.redirect("/"+req.params.id+"/speakinglist")
})

//MOTION GET
app.get("/:id/motions",function(req,res){
    Committee.findById(req.params.id).populate("delegations").populate("motions").exec(function(err,committee){
        console.log(committee.motions)
        res.render("motions",{committee:committee})
    })  
})

//SAVE MOTIONS
app.post("/:id/motions",function(req,res){
    Committee.findById(req.params.id,function(err,committee){
        if(err){
            console.log(err)
        }else{
            committee.motions.forEach(function(motion){
                Motion.findByIdAndDelete(mongoose.Types.ObjectId(motion.id),function(err,deleted){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("Deleted")
                    }
                })
            })
        }
    })
    Committee.findByIdAndUpdate(
        { _id: req.params.id},
        { $set: { motions: [] }},
        function(err,committee){
            if(err){
                console.log(err)
            } else {
                console.log(committee)
            }
        }
    )

    if(req.body.motions!=null){
        req.body.motions.forEach(function(motion){
            Delegation.findById(mongoose.Types.ObjectId(motion.delegation),function(err,delegation){
                Motion.create({
                    delegation:delegation,
                    type:motion.type,
                    duration:motion.duration,
                    speakingTime:motion.speakingTime,
                    topic:motion.topic
                },function(err,newMotion){
                    Committee.findByIdAndUpdate(
                        req.params.id,
                        {$push:{motions:newMotion}},
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
        })
    }
    

    res.redirect("/"+req.params.id+"/motions")
})

app.get("/:id/mod",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        res.render("mod",{committee:committee})
    })  
})

app.get("/:id/unmod",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        res.render("unmod",{committee:committee})
    })  
})

app.get("/:id/voting",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        res.render("voting",{committee:committee})
    })  
})

app.get("/:id/statistics",function(req,res){
    Committee.findById(req.params.id).populate("delegations").exec(function(err,committee){
        res.render("statistics",{committee:committee})
    })  
})

app.listen(port,function(){
    console.log("MUN Assistant has Started")
})