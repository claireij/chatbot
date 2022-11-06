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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const inputfieldValidation = (message) => {
  const inputTests = {
    // Checks of there are any string in the test
    stringTest: {
      result: /^[a-zA-Z]+$/.test(message),
      failMessage:
        "Oh wow, seems like you're using letters in your calculation. I'm so sorry, but we're not that advanced in algebra. Maybe you just give me numbers, alright?",
    },
    // Checks if there are only operators or numbers in the string
    onlyOperatorAndNumberTest: {
      result: /[^0-9+*/-%^\s]/g.test(message),
      failMessage:
        "Sorry this is not a calculation! Insert something like 1 + 1.",
    },
    numberTest: {
      result: /[0-9]+/.test(message),
    },
    operatorTest: {
      
      result: /[+*/-%^]+/.test(message),
    },
    whitespaceTest: {
      result: /^[\s]+$/.test(message)
    }
  };

  if (inputTests.stringTest.result) {
    return (response = {
      success: false,
      error: "letters",
      message: inputTests.stringTest.failMessage,
    });
  } else if (inputTests.onlyOperatorAndNumberTest.result) {
    return (response = {
      success: false,
      error: "not_only_numbers_and_operators",
      message: inputTests.onlyOperatorAndNumberTest.failMessage,
    });
  } else if (
    inputTests.whitespaceTest.result
  ) {
    return (response = {
      success: false,
      error: "just_whitespaces",
      message: "Ok, this is just whitespace... Maybe try again?",
    });
  }
  if (
    !inputTests.numberTest.result &&
    inputTests.operatorTest.result
  ) {
    return (response = {
      success: false,
      error: "no_numbers",
      message:
        "Looks like you didn't use any numbers in there. Hard one to calculate... try again!",
    });
  } else if (
    inputTests.numberTest.result &&
    !inputTests.operatorTest.result
  ) {
    return (response = {
      success: false,
      error: "no_operators",
      message: "Did you forget your operators? Try again!",
    });
  } else {
    let messageArray = message.split(" ");

    if(messageArray.length == 1) {
      return response = {
        success: false,
        error: "no_whitespaces",
        message: "Seems like you forgot to add some whitespaces between the numbers and the operator, try again!"
      }
    }
   

    if (!/^[0-9]+$/.test(messageArray[0]) || !/^[0-9]+$/.test(messageArray[messageArray.length - 1])) {
      return response = {
        success: false,
        error: "wrong_order",
        message: "Your calculation needs to beginn and end with a number. Try again!"
      }
    }

    for (let i = 0; i < messageArray.length; i++) {
      if (i % 2 === 0) {
        
        if (!/^[0-9]+$/.test(messageArray[i])) {
          
          return response = {
            success: false,
            error: "other_problem",
            message:
              "There seem's to be a problem with your calculation. Maybe your missing a part of it or you forgot the whitespaces between the numbers and the operators.",
          };
        }     
      } else {
        if(!/^[+*/-%^]+$/.test(messageArray[i])) {
          return response = {
            success: false,
            error: "other_problem",
            message:
              "There seem's to be a problem with your calculation. Maybe your missing a part of it or you forgot the whitespaces between the numbers and the operators.",
          };
        } 
      }
      return null;
    }
    
  }

  

};

function calculate(messageArray) {
  var operator = {
    add: "+",
    sub: "-",
    div: "/",
    mlt: "*",
    mod: "%",
    exp: "^",
  };

  // Create array for Order of Operation and precedence
  operator.ooo = [
    [[operator.mlt], [operator.div], [operator.mod], [operator.exp]],
    [[operator.add], [operator.sub]],
  ];

  var output;
  for (var i = 0, n = operator.ooo.length; i < n; i++) {
    // Regular Expression check for operators 
    var re = new RegExp("[" + operator.ooo[i] + "]");
    re.lastIndex = 0; // take precautions and reset re starting pos

    
    for (let j = 0; j < messageArray.length; j++) {
      // Loop while there is still calculation for level of precedence
      if (re.test(messageArray[j]) == true) {
        output = _calculate(
          messageArray[j - 1],
          messageArray[j],
          messageArray[j + 1]
        );
        messageArray.splice(j - 1, 3, output);
        console.log(messageArray);
      } 
    }
  }

  return output;

  function _calculate(a, op, b) {
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

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("chat message", (message) => {
    let response;

    // Checks if the format of the input is valid
    if (inputfieldValidation(message)) {
      console.log(inputfieldValidation(message));
      response = inputfieldValidation(message);
    } else {
      let messageArray = message.split(" ");


      for (let i = 0; i < messageArray.length; i++) {
        if (i % 2 === 0) {
          if (/^[0-9]+$/.test(messageArray[i])) {
            messageArray.splice(i, 1, parseInt(messageArray[i]));
          } 
        } 
      }

      let result = calculate(messageArray);

      response = {
        success: true,
        message: result,
      };

        let chatMessage = new Chat({
          userMessage: message,
          botAnswer: response.message,
        });
        chatMessage.save();
    }

    io.emit("chat message", response);
  });

  socket.on("old messages", () => {

    
      Chat.find({})
        .sort("-createdAt")
        .limit(10)
        .sort("createdAt")
        .then((chats) => {

          

          if(chats.length == 0) {
            response = {
              success: false,
              botAnswer: "Oh, nothing has been calculated yet, start calculating!",
            };
          } else {
            response = {
              success: true,
              oldMessagesList: chats,
            };
          }
 
          
         
          response = JSON.stringify(response)
          io.emit("old messages", response);
          console.log(response);
        
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build")); // set static folder
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

module.exports = server;
