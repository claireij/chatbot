import './App.css';
import MessageList from './components/MessageList';
import {BiCalculator} from 'react-icons/bi';
import socketIOClient from "socket.io-client";

import {useState, useEffect, useRef, createRef} from 'react';

let ENDPOINT = "http://127.0.0.1:4001";

if(process.env.NODE_ENV === 'production'){  
  ENDPOINT = "https://chatbot-claire.herokuapp.com";
}

//TODO prüfen ob es einen besseren Weg gibt, das einzubinden
const newSocket = socketIOClient(ENDPOINT);
    newSocket.on('connect', (socket) => {
      console.log('socket connected', socket);
    })

function App() {

  const [messageList, setMessageList] = useState([
    {
      sender: "bot",
      message: "Hi!",
    }, 
    {
      sender: "bot",
      message: "What do you want to do today?",
    }
  ]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [calculate, setCalculate] = useState(false);


  const scrollToBottom = () => {
    const chat = document.querySelector("form");
    console.log(chat);
    chat.scrollTop = chat.scrollHeight;
    console.log(chat.scrollHeight);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList])

  

  
  

  newSocket.on('old messages', function(response) {
    let parsedResponse = JSON.parse(response);
    console.log(parsedResponse.oldMessagesList);
    let newArray = [];

    if(parsedResponse.success == false) {
      setMessageList([...messageList, {
        message: parsedResponse.botAnswer,
        sender: "bot",
      }])
      return;
    }
  
    parsedResponse.oldMessagesList.map(data  =>  {
      
      const incomingDate = new Date(data.createdAt);
      const formattedIncomingDate = `${incomingDate.getDate()}.${incomingDate.getMonth()+1}.${incomingDate.getFullYear()}  ${incomingDate.getHours()}:${incomingDate.getMinutes()}:${incomingDate.getSeconds()}`;
      
      const oldUserMessage = {
        sender: "user",
        message: data.userMessage,
        date: formattedIncomingDate
      };
      const oldBotAnswer = {
        sender: "bot",
        message: data.botAnswer,
        date: formattedIncomingDate
      }
      newArray.push(oldUserMessage);
      newArray.push(oldBotAnswer);
    });
    newArray.push({
      message: "Great! What do you want to do next?",
      sender: "bot"
    })
    setMessageList(newArray);
    scrollToBottom();
  });

  const getOldMessages = () => {
    newSocket.emit('old messages');
  }
  

  newSocket.on('chat message', function(response) {
    const newMessageList = [...messageList, {
      message: response.message,
      sender: "bot"    
    }, {
      message: "Great! What do you want to do next?",
      sender: "bot",
    }]
    setMessageList(newMessageList);
  })

  const handleInputChange = (e) => {
    setMessage(e.target.value)
  }

  const handleMessageSend = (e) => {
    e.preventDefault();
    if(message.length == 0) {
      setError(true);
    }
    if(message.length !=0) {
      newSocket.emit('chat message', message);
      const newMessageList = [...messageList, {
        message: message,
        sender: "user"
      }]
      setMessageList(newMessageList);
      setCalculate(false);
      setMessage('');
    }
  }

  return (
    <div className="div--chat">
      <form className="chat">
        
        <div className="messages">
          <MessageList messageList={messageList} />
        </div>
        {
        calculate ?
         <div className="div--input">
          <input 
          placeholder="Enter your calculation"
          type="text"
          value={message}
          onChange={handleInputChange}
          ></input>
          {error ? <p className="error">This field is required.</p> : <></>}
          <button
          onClick={handleMessageSend}
          >
            <BiCalculator className="button--icon" />
          </button>
        </div> 
        : <div className="options">
        <div className="bubble option" onClick={getOldMessages}>See older calculations!</div>
        <div className="bubble option" onClick={()=>{
          setCalculate(true) 
          setMessageList([...messageList, {sender: "bot", message: "Ok, let's go then!"}])
          }}>Make a new calculation!</div>
      </div>
        }
        
      </form>
    </div>
  );
}

export default App;
