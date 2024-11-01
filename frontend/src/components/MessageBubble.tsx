import { useEffect, useState } from "react";
import React from "react"


export enum MessageSenderEnum  {
  "BOT",
  "USER"
}

export type Message = {
  sender: MessageSenderEnum,
  messageText: string, 
  date?: string
}

interface MessageInterface {
  message: Message
}

export const MessageBubble = ({ message }: MessageInterface) => {
  const {sender, messageText, date} = message
  const [hovered, setHovered] = useState(false);
  const [newMessageDate, setNewMessageDate] = useState("");

  // formats date
  useEffect(() => {
    const current = new Date();
    const current_date = `${current.getDate()}.${
      current.getMonth() + 1
    }.${current.getFullYear()}  ${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}`;
    setNewMessageDate(current_date);
  }, []);

  // changes the bubble style depending on the sender
  const classNameBubble = "bubble " + sender;

  return (
    <div
      className="message"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {hovered ? (
        <div className="time">{date ? date : newMessageDate}</div>
      ) : (
        <></>
      )}

      <div className={classNameBubble}>
        <p>{messageText}</p>
      </div>
    </div>
  );
}
