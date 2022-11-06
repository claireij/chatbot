const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Chat = require("./models/ChatSchema");
const connect = require("./dbconnection");
const { findOneAndReplace } = require("./models/ChatSchema");

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    // TODO hardcodierung auflösen
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
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

  socket.on("chat message", (message) => {
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
    if (stringTest) {
      response = {
        success: false,
        message:
          "Oh wow, seems like you're using letters in your calculation. I'm so sorry, but we're not that advanced in algebra. Maybe you just give me numbers, alright?",
      };
    } else if (onlyOperatorAndNumberTest) {
      response = {
        success: false,
        message:
          "Sorry this is not a calculation! Insert something like 1 + 1.",
      };
    } else if (numberTest && !operatorTest && !whitespaceTest) {
      response = {
        success: false,
        message:
          "So this is just a number... maybe you want to add an operator and a second one? That'd be great!",
      };
    } else if (!numberTest && operatorTest && !whitespaceTest) {
      response = {
        success: false,
        message:
          "So this is just an operator. Try again and put some numbers in there!",
      };
    } else if (!numberTest && !operatorTest && whitespaceTest) {
      response = {
        success: false,
        message: "Ok, this is just whitespace... Maybe try again?",
      };
    // } else if (numberTest && operatorTest && !whitespaceTest) {
    //   //Doesnt work yet!

    //   response = {
    //     success: false,
    //     message:
    //       "Looks like you wrote your calculation without whitespaces. Please insert something like 1 + 1.",
    //   };
    } else if (!numberTest && operatorTest && whitespaceTest) {
      response = {
        success: false,
        message:
          "Looks like you didn't use any numbers in there. Hard one to calculate... try again!",
      };
    } else if (numberTest && !operatorTest && whitespaceTest) {
      response = {
        success: false,
        message: "Did you forget your operators? Try again!",
      };
    } else {
      const messageArray = message.split(" ");
      if(typeof messageArray[0] == "number" && typeof messageArray[messageArray.length] == "number") {
        response = {
          success: false,
          message: "Your calculation needs to start and end with a number... try again!"
        }

        

      } else {
        // WE need  a test if odds are all operators and if even are all numbers
        for (let i = 0; i < messageArray.length; i++) {
          if ( i % 2 === 0) { 
            if(/[0-9]+/.test(messageArray[i])) {
              messageArray.splice(i, 1, parseInt(messageArray[i]))
            }
           }
          else { 
            console.log('trying this');
           
           }
        }

        console.log(/[0-9]+/.test(messageArray[0]));

        function calculate(input) {

          var operator = {
            add: '+',
            sub: '-',
            div: '/',
            mlt: '*',
            mod: '%',
            exp: '^'
          };
        
          // Create array for Order of Operation and precedence
          operator.ooo = [
            [
              [operator.mlt],
              [operator.div],
              [operator.mod],
              [operator.exp]
            ],
            [
              [operator.add],
              [operator.sub]
            ]
          ];
        
          var output;
          for (var i = 0, n = operator.ooo.length; i < n; i++) {
            
            // Regular Expression to look for operators between floating numbers or integers
            var re = new RegExp('[' + operator.ooo[i] + ']');
            console.log(re);
            re.lastIndex = 0; // take precautions and reset re starting pos
            console.log(messageArray[1], re.test(messageArray[1]));
            // Loop while there is still calculation for level of precedence
            for(let j = 0; j < messageArray.length; j++) {
              if (re.test(messageArray[j]) == true) {
                output = _calculate(messageArray[j - 1], messageArray[j], messageArray[j + 1]);
                messageArray.splice(j-1, 3, output);
                console.log(messageArray);
              } else {
                //odd elements are here, you can access it by box
              }
            }
            // while(re.test(messageArray[1])) {
              // console.log(messageArray[0], messageArray[1], messageArray[2]);
              // output = _calculate(messageArray[0], messageArray[1], messageArray[2]);
              // if (isNaN(output) || !isFinite(output)) 
              //   return output; // exit early if not a number
              // input = input.replace(re, output);
            // }
          }
        
          return output;
        
          function _calculate(a, op, b) {
            // a = a * 1;
            // b = b * 1;
            switch (op) {
              case operator.add:
                return a + b;
                break;
              case operator.sub:
                return a - b;
                break;
              case operator.div:
                return a / b;
                break;
              case operator.mlt:
                return a * b;
                break;
              case operator.mod:
                return a % b;
                break;
              case operator.exp:
                return Math.pow(a, b);
                break;
              default:
                null;
            }
          }
        }

        let result = calculate(message)
        console.log("This is the result" + result);
        
        response = {
          success: true,
          message: result,
        };

        // response = {
        //   success: true,
        //   message: eval(message),
        // };
  
        connect.then(() => {
          let chatMessage = new Chat({
            userMessage: message,
            botAnswer: response.message,
          });
          chatMessage.save();
        });
      }
      
    }

    io.emit("chat message", response);
  });

  socket.on("old messages", () => {
    connect.then(() => {
      Chat.find({})
        .sort("-createdAt")
        .limit(10)
        .sort("createdAt")
        .then((chats) => {
          let oldMessagesListJson = JSON.stringify(chats);
          let response = {
            success: true,
            oldMessagesList: oldMessagesListJson,
          };
          io.emit("old messages", response);
        });
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build")); // set static folder
  //returning frontend for any route other than api
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

module.exports = server;
