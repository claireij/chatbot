import { BiCalculator } from "react-icons/bi";
import { useEffect, useRef } from "react";

function MessageInput({
  handleInputChange,
  handleMessageSend,
  message,
  error,
}) {
  // Adds the error class, to style the element if there an error
  const inputClassName = error ? "error" : "";

  // sets the focus on the input field
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <>
      {error ? <p className="error">This field is required.</p> : <></>}
      <div className="div--input">
        <input
          className={inputClassName}
          placeholder="Enter your calculation"
          type="text"
          value={message}
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
