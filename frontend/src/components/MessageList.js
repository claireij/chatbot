import Message from "./Message";

function MessageList({ messageList }) {
  return (
    <div className="message-list">
      {messageList.map((message, key) => {
        return (
          <Message
            key={key}
            sender={message.sender}
            message={message.message}
            date={message.date}
          />
        );
      })}
    </div>
  );
}

export default MessageList;
