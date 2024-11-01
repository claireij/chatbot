import { BiCalculator } from "react-icons/bi";
import { useEffect, useRef } from "react";
import React from "react"

interface MessageInputInterface {
  handleInputChange,
  handleMessageSend,
  messageText: string,
  isError: boolean,
}

const MessageInput = ({
  handleInputChange,
  handleMessageSend,
  messageText,
  isError,
}: MessageInputInterface) => {

  const inputClassName = isError ? "error" : "";

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus()
  }, []);

  return (
    <>
      {isError ? <p className="error">This field is required.</p> : <></>}
      <div className="div--input">
        <input
          className={inputClassName}
          placeholder="Enter your calculation"
          type="text"
          value={messageText}
          onChange={handleInputChange}
          ref={inputRef}
        ></input>

        <button onClick={handleMessageSend}>
          <BiCalculator className="button--icon" />
        </button>
      </div>
    </>
  );
}

export default MessageInput;
