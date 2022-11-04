const  express  = require("express");
const  connect  = require("./../dbconnection");
const  Chats  = require("./../models/ChatSchema");

const  router  =  express.Router();

router.route("/chats").get((req, res, next) =>  {
        res.setHeader("Content-Type", "application/json");
        res.statusCode  =  200;
        connect.then(db  =>  {
            Chats.find({}).then(chat  =>  {
            res.json(chat);
        });
    });
});

module.exports  =  router;