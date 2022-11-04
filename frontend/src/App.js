import './App.css';
import MessageList from './components/MessageList';
import {BiCalculator} from 'react-icons/bi';
import socketIOClient from "socket.io-client";

import {useState, useEffect} from 'react';

// TODO: favicon austauschen

const ENDPOINT = "http://127.0.0.1:4001";

//TODO prüfen ob es einen besseren Weg gibt, das einzubinden
const newSocket = socketIOClient(ENDPOINT);
    newSocket.on('connect', (socket) => {
      console.log('socket connected', socket);
    })

function App() {

  const [messageList, setMessageList] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  // fetching initial chat messages from the database
const getOldMessages = () => {
  fetch(ENDPOINT + "/chats")
  .then(data  =>  {
  return  data.json();
  })
.then(json  =>  {
  console.log(json);
  let newArray = [];
  json.map(data  =>  {
    //TODO sollten die Daten im Frontend nicht gleich aufgebaut sein, wie im Backend?
    // Sonst hier data.createAt in eine Zeile schreiben
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
  setMessageList(newArray);
});
};

  // const messageList = [
  //   {
  //     sender: "bot",
  //     message: "some message",
  //     date: "24.02.2031 14:03"
  //   },
  //   {
  //     sender: "user",
  //     message: "some other message",
  //     date: "03.02.2001 14:00"
  //   }
  // ]

  newSocket.on('chat message', function(msg) {
    const newMessageList = [...messageList, {
      message: msg,
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
    if(!error) {
      newSocket.emit('chat message', message);
      const newMessageList = [...messageList, {
        message: message,
        sender: "user",
        date: Date.now()
      }]
      setMessageList(newMessageList);
    }
  }

  return (
    <div className="div--chat">
      <form className="chat">
        <div className="link--older-posts" onClick={getOldMessages}>See older calculations</div>
        <div className="messages">
          <MessageList messageList={messageList} />
        </div>
        <div className="div--input">
          <input 
          type="text"
          value={message}
          onChange={handleInputChange}
          ></input>
          <button
          onClick={handleMessageSend}
          >
            <BiCalculator className="button--icon" />
            Calculate me now!
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
