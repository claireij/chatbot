
import React from "react"
import { Message, MessageBubble } from "./MessageBubble";

interface MessageListInterface {
  messageList: Array<Message>
}

function MessageList({ messageList }: MessageListInterface) {
  return (
    <div className="message-list">
      {messageList.map((message, key) => {
        return (
          <MessageBubble
            key={key}
            message={message}
          />
        );
      })}
    </div>
  );
}

export default MessageList;
