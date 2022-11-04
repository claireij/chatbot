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
        io.emit('chat message', response);

        //TODO save bot answers too
        let  chatMessage  =  new Chat({ userMessage: message, botAnswer: response});
        chatMessage.save();
    })

    socket.on("old messages", () => {
      
      Chat.find({}).then(chats  =>  {
        let variable = JSON.stringify(chats);
        console.log(variable);
        io.emit('old messages', variable);
    });
      });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
})


server.listen(port, () => console.log(`Listening on port ${port}`))

if(process.env.NODE_ENV === 'production'){    
  app.use(express.static('frontend/build'))  // set static folder 
  //returning frontend for any route other than api 
  app.get('*',(req,res)=>{     
      res.sendFile (path.resolve(__dirname,'frontend','build',         
                    'index.html' ));    
  });
}