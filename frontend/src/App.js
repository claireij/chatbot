import './App.css';
import MessageList from './components/MessageList';
import {BiCalculator} from 'react-icons/bi';
import socketIOClient from "socket.io-client";

import {useState, useEffect, useRef} from 'react';

// TODO: favicon austauschen

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
      date: Date.now()
    }, 
    {
      sender: "bot",
      message: "What do you want to do today?",
      date: Date.now()
    }
  ]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [calculate, setCalculate] = useState(false);

  newSocket.on('old messages', function(response) {
    let newArray = [];
    let parsedList = JSON.parse(response.oldMessagesList);
    parsedList.map(data  =>  {

      const oldUserMessage = {
        sender: "user",
        message: data.userMessage,
        date: data.createdAt
      };
      const oldBotAnswer = {
        sender: "bot",
        message: data.botAnswer,
        date: data.createdAt
      }
      newArray.push(oldUserMessage);
      newArray.push(oldBotAnswer);
    });
    newArray.push({
      message: "Great! What do you want to do next?",
      sender: "bot",
      //TODO change date to date from the database
      date: Date.now()
    })
    setMessageList(newArray);
  });

  const getOldMessages = () => {
    newSocket.emit('old messages');
  }
  

  newSocket.on('chat message', function(response) {
    const newMessageList = [...messageList, {
      message: response.message,
      sender: "bot",
      //TODO change date to date from the database
      date: Date.now()
    }, {
      message: "Great! What do you want to do next?",
      sender: "bot",
      //TODO change date to date from the database
      date: Date.now()
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
        sender: "user",
        date: Date.now()
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
          setMessageList([...messageList, {sender: "bot", message: "Ok, let's go then!", date: Date.now()}])
          }}>Make a new calculation!</div>
      </div>
        }
        
      </form>
    </div>
  );
}

export default App;
