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
      //TODO add other operators
      result: /[^0-9+*/-\s]/g.test(message),
      failMessage:
        "Sorry this is not a calculation! Insert something like 1 + 1.",
    },
    numberTest: {
      result: /[0-9]+/.test(message),
    },
    operatorTest: {
      //TODO add other operators
      result: /[+*/-\s]+/.test(message),
    },
    whitespaceTest: {
      //TODO umschreiben in RegEx?
      result: message.includes(" "),
    },
  };

  console.log("String test" + inputTests.stringTest.result);
  if (inputTests.stringTest.result) {
    return (response = {
      success: false,
      message: inputTests.stringTest.failMessage,
    });
  } else if (inputTests.onlyOperatorAndNumberTest.result) {
    return (response = {
      success: false,
      message: inputTests.onlyOperatorAndNumberTest.failMessage,
    });
  } else if (
    inputTests.numberTest.result &&
    !inputTests.operatorTest.result &&
    !inputTests.whitespaceTest.result
  ) {
    return (response = {
      success: false,
      message:
        "So this is just a number... maybe you want to add an operator and a second one? That'd be great!",
    });
  } else if (
    !inputTests.numberTest.result &&
    inputTests.operatorTest.result &&
    !inputTests.whitespaceTest.result
  ) {
    return (response = {
      success: false,
      message:
        "So this is just an operator. Try again and put some numbers in there!",
    });
  } else if (
    !inputTests.numberTest.result &&
    !inputTests.operatorTest.result &&
    inputTests.whitespaceTest.result
  ) {
    return (response = {
      success: false,
      message: "Ok, this is just whitespace... Maybe try again?",
    });
  }
  // else if (numberTest && operatorTest && !whitespaceTest) {
  //   //Doesnt work yet!

  //   response = {
  //     success: false,
  //     message:
  //       "Looks like you wrote your calculation without whitespaces. Please insert something like 1 + 1.",
  //   };
  if (
    !inputTests.numberTest.result &&
    inputTests.operatorTest.result &&
    inputTests.whitespaceTest.result
  ) {
    return (response = {
      success: false,
      message:
        "Looks like you didn't use any numbers in there. Hard one to calculate... try again!",
    });
  } else if (
    inputTests.numberTest.result &&
    !inputTests.operatorTest.result &&
    inputTests.whitespaceTest.result
  ) {
    return (response = {
      success: false,
      message: "Did you forget your operators? Try again!",
    });
  } else {
    return null;
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
          if (/[0-9]+/.test(messageArray[i])) {
            messageArray.splice(i, 1, parseInt(messageArray[i]));
          } else {
            return (response = {
              success: false,
              message:
                "There seem's to be a problem with the order in your calculation.",
            });
          }
        } else {
          //TODO put all operators
          if (!/[+*/-\s]+/.test(messageArray[i])) {
            response = {
              success: false,
              message:
                "There seem's to be a problem with the order in your calculation.",
            };
          }
        }
      }
      let result = calculate(messageArray);

      response = {
        success: true,
        message: result,
      };

      console.log(response);

      connect.then(() => {
        let chatMessage = new Chat({
          userMessage: message,
          botAnswer: response.message,
        });
        chatMessage.save();
      });
    }

    io.emit("chat message", response);
  });

  socket.on("old messages", () => {
    //TODO delete connect again?
    connect.then(() => {
      Chat.find({})
        .sort("-createdAt")
        .limit(10)
        .sort("createdAt")
        .then((chats) => {
          // TODO: if nothing gets returned
          //TODO stringify whole response? Change in readme
          
          let response = {
            success: true,
            oldMessagesList: chats,
          };
          response = JSON.stringify(response)
          io.emit("old messages", response);
          console.log(response);
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
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

module.exports = server;
