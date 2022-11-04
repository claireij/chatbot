const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);

// db settings
const  Chat  = require("./models/ChatSchema");
const  connect  = require("./dbconnection");

const  bodyParser  = require("body-parser");
const  chatRouter  = require("./routes/chatRoute");

//bodyparser middleware
app.use(bodyParser.json());

//routes
app.use("/chats", chatRouter);

const io = socketIo(server, {
    cors: {
        // TODO hardcodierung auflösen
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on('chat message', (message) => {
        // TODO backend logic
        let response;
        var value = /(\+|-|\*|\/)/.test(message);
        //TODO add / and -
        if(!value) {
            response = "Sorry this is not a calculation! Insert something like 1 + 1"
        } else {
            response = eval(message);
        }
        console.log("message" + message);
        io.emit('chat message', response);

        //TODO save bot answers too
        let  chatMessage  =  new Chat({ userMessage: message, botAnswer: response});
        chatMessage.save();
    })

    socket.on("older messages", () => {
        console.log("older messages");
      });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
})


server.listen(port, () => console.log(`Listening on port ${port}`))

