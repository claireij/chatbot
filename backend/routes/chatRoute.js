const  express  = require("express");
const  connect  = require("./../dbconnection");
const  Chat  = require("./../models/ChatSchema");

const  router  =  express.Router();

router.route("/").get((req, res, next) =>  {
    console.log("In chat route");
        res.setHeader("Content-Type", "application/json");
        res.statusCode  =  200;
        connect.then(db  =>  {
            Chat.find({}).then(chat  =>  {
            res.json(chat);
        });
    });
});

module.exports  =  router;