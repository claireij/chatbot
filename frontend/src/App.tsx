import "./App.css";
import MessageList from "./components/MessageList";
import React from "react"

import { useState, useEffect} from "react";
import MessageInput from "./components/MessageInput";
import { newSocket } from "./services/socket.service";
import { Message, MessageSenderEnum } from "./components/MessageBubble";
import { scrollToBottom } from "./utils/ui.utils";
import { MessageService } from "./services/message.service";
import { initialMessages } from "./messages/standardMessage";


export const App = () => {
  const [messageList, setMessageList] = useState<Array<Message>>(initialMessages);

  const [messageText, setMessageText] = useState("");
  const [isError, setIsError] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  
  newSocket.on("old messages", (response) => {
    const messageListWithOldMessages = MessageService.addOldMessages({response, currentMessageList: messageList})
    setMessageList(messageListWithOldMessages)
  });

  
  // Receives the result of the calculation from the server and pushs it to the message list
  newSocket.on("chat message", function (response) {
    const newMessageList = [
        ...messageList,
        {
          messageText: response.message,
          sender: MessageSenderEnum.BOT,
        },
        
      ];
      if(response.success) {
        newMessageList.push({
          messageText: "Great! What do you want to do next?",
          sender: MessageSenderEnum.BOT,
        })
      } else {
        // If the server sends back that the calculation was unsuccessful, then keeps the input field open
        setIsCalculating(true)
      }
   
    setMessageList(newMessageList);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  const handleMessageSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsError(messageText.length === 0)
    
    if (messageText.length !== 0) {
      // Sends the message from the user to the server
      newSocket.emit("chat message", messageText);

      // Adds the message to the message list
      const newMessageList = [
        ...messageList,
        {
          messageText: messageText,
          sender: MessageSenderEnum.USER,
        },
      ];
      setMessageList(newMessageList);

      setIsCalculating(false);

      setMessageText("");
    }
  };

  return (
    <div className="div--chat">
      <form className="chat">
        <div className="messages">
          <MessageList messageList={messageList} />
        </div>
        {isCalculating ? (
          <MessageInput
            handleInputChange={handleInputChange}
            handleMessageSend={handleMessageSend}
            messageText={messageText}
            isError={isError}
          />
        ) : (
          <div className="options">
            <div className="bubble option" onClick={MessageService.getOldMessages}>
              See older calculations!
            </div>
            <div
              className="bubble option"
              onClick={() => {
                setIsCalculating(true);

                setMessageList([
                  ...messageList,
                  { sender: MessageSenderEnum.BOT, messageText: "Ok, let's go then!" },
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
