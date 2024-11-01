import { useEffect, useState } from "react";
import React from "react"
import { getCurrentDate } from "../utils/general.utils";


export enum MessageSenderEnum  {
  "BOT" = "bot",
  "USER" = "user"
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

  useEffect(() => {
    const current_date = getCurrentDate()
    setNewMessageDate(current_date);
  }, []);

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
