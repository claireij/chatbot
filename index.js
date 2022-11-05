const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./models/ChatSchema');
const connect = require('./dbconnection');

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

    // TODO NEEDS TO BE DELETED

    socket.on("echo", function (msg, callback) {
      callback = callback || function () {};
  
      socket.emit("echo", msg);
  
      callback(null, "Done.");
    });

    //NEEDS TO BE DELETED UNTIL HERE

    socket.on('chat message', (message) => {
        // TODO backend logic
        // Add a success or no success parameter, only add in database if succesful
        let response;
        var stringTest = /^[a-zA-Z]+$/.test(message);
        //Check if there is something else then operator and number
        var onlyOperatorAndNumberTest = /[^0-9+*/-\s]/g.test(message);
        //Checks if there are both operators and numbers
        var numberTest = /[0-9]+/.test(message);
        var operatorTest = /[+*/-\s]+/.test(message);
        var whitespaceTest = message.includes(" ");
        //TODO add / and -
        if(stringTest) {
          response = "Oh wow, seems like you're using letters in your calculation. I'm so sorry, but we're not that advanced in algebra. Maybe you just give me numbers, alright?"
        } else if (onlyOperatorAndNumberTest) {
          response = "Sorry this is not a calculation! Insert something like 1 + 1."
        } else if (numberTest && !operatorTest && !whitespaceTest) {
          response = "So this is just a number... maybe you want to add an operator and a second one? That'd be great!";
        } else if (!numberTest && operatorTest && !whitespaceTest) {
          response = "So this is just an operator. Try again and put some numbers in there!";
        } else if (!numberTest && !operatorTest && whitespaceTest) {
          response = "Ok, this is just whitespace... Maybe try again?"
        } else if (numberTest && operatorTest && !whitespaceTest) {
          //Doesnt work yet!
          response = "Looks like you wrote your calculation without whitespaces. Please insert something like 1 + 1."
        } else if (!numberTest && operatorTest && whitespaceTest) {
          response = "Looks like you didn't use any numbers in there. Hard one to calculate... try again!";
        } else if (numberTest && !operatorTest && whitespaceTest) {
          response = "Did you forget your operators? Try again!";
        }
        
        

        else {

            response = eval(message);

        connect.then(() => {
          let  chatMessage  =  new Chat({ userMessage: message, botAnswer: response});
          chatMessage.save();
        });
        }  
        
        io.emit('chat message', response);

    })

    socket.on("old messages", () => {
      connect.then(() => {
      Chat.find({}).sort('-createdAt').limit(10).sort('createdAt').then(chats  =>  {
        let variable = JSON.stringify(chats);
        console.log(variable);
        io.emit('old messages', variable);
    });
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

module.exports = server;
