import "./App.css";
import MessageList from "./components/MessageList";

import socketIOClient from "socket.io-client";

import { useState, useEffect, useRef, createRef } from "react";
import MessageInput from "./components/MessageInput";

let ENDPOINT = "http://127.0.0.1:4001";

if (process.env.NODE_ENV === "production") {
  ENDPOINT = "https://chatbot-claire.herokuapp.com";
}

const newSocket = socketIOClient(ENDPOINT);
newSocket.on("connect", (socket) => {
  console.log("socket connected", socket);
});

function App() {
  const [messageList, setMessageList] = useState([
    // First messages, when the website is opened
    {
      sender: "bot",
      message: "Hi!",
    },
    {
      sender: "bot",
      message: "What do you want to do today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [calculate, setCalculate] = useState(false);

  // Keep the scrollbar at the bottom
  const scrollToBottom = () => {
    const chat = document.querySelector("form");
    chat.scrollTop = chat.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

    // Receives a message with the old messages from the server and adds them to the message list to be displayed
  newSocket.on("old messages", function (response) {
    let parsedResponse = JSON.parse(response);
    let newArray = [...messageList];

    // if there aren't any old messages, the bot sends a error message
    if (parsedResponse.success == false) {
      setMessageList([
        ...messageList,
        {
          message: parsedResponse.botAnswer,
          sender: "bot",
        },
      ]);
      return;
    }

    // if there are old messages, they are added to the message list
    parsedResponse.oldMessagesList.map((oldMessages) => {
      const incomingDate = new Date(oldMessages.createdAt);
      const formattedIncomingDate = `${incomingDate.getDate()}.${
        incomingDate.getMonth() + 1
      }.${incomingDate.getFullYear()}  ${incomingDate.getHours()}:${incomingDate.getMinutes()}:${incomingDate.getSeconds()}`;

      const oldUserMessage = {
        sender: "user",
        message: oldMessages.userMessage,
        date: formattedIncomingDate,
      };
      const oldBotAnswer = {
        sender: "bot",
        message: oldMessages.botAnswer,
        date: formattedIncomingDate,
      };

      newArray.push(oldUserMessage);
      newArray.push(oldBotAnswer);
    });

    newArray.push({
      message: "Great! What do you want to do next?",
      sender: "bot",
    });

    setMessageList(newArray);

    // Starts at the top and scrolls down, so that the user has a quick overview of the newly added old messages
    scrollToBottom();
  });

  // Send a message to the server to get the old messages
  const getOldMessages = () => {
    newSocket.emit("old messages");
  };

  // Receives the result of the calculation from the server and pushs it to the message list
  newSocket.on("chat message", function (response) {
    let newMessageList = [
        ...messageList,
        {
          message: response.message,
          sender: "bot",
        },
        
      ];
      if(response.success) {
        newMessageList.push({
          message: "Great! What do you want to do next?",
          sender: "bot",
        })
      } else {
        // If the server sends back that the calculation was unsuccessful, then keeps the input open
        setCalculate(true)
      }
   
    setMessageList(newMessageList);
  });

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleMessageSend = () => {
    if (message.length == 0) {
      setError(true);
    } else {
      setError(false);
    }
    if (message.length != 0) {
      // Sends the message from the user to the server
      newSocket.emit("chat message", message);

      // Adds the message to the message list
      const newMessageList = [
        ...messageList,
        {
          message: message,
          sender: "user",
        },
      ];
      setMessageList(newMessageList);

      // closes input field
      setCalculate(false);

      // set back the message to an empty string
      setMessage("");
    }
  };

  return (
    <div className="div--chat">
      <form className="chat">
        <div className="messages">
          <MessageList messageList={messageList} />
        </div>
        {calculate ? (
          <MessageInput
            handleInputChange={handleInputChange}
            handleMessageSend={handleMessageSend}
            message={message}
            error={error}
          />
        ) : (
          <div className="options">
            <div className="bubble option" onClick={getOldMessages}>
              See older calculations!
            </div>
            <div
              className="bubble option"
              onClick={() => {
                setCalculate(true);

                setMessageList([
                  ...messageList,
                  { sender: "bot", message: "Ok, let's go then!" },
                ]);
              }}
            >
              Make a new calculation!
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default App;
