const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);

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
        io.emit('chat message', response)
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
})


server.listen(port, () => console.log(`Listening on port ${port}`))

