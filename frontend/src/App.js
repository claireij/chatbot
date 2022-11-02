import logo from './logo.svg';
import './App.css';
import MessageList from './components/MessageList';
import {BiCalculator} from 'react-icons/bi';

function App() {
  const messageList = [
    {
      sender: "bot",
      message: "some message",
      date: "24.02.2031 14:03"
    },
    {
      sender: "user",
      message: "some other message",
      date: "03.02.2001 14:00"
    }
  ]

  return (
    <div className="div--chat">
      <form className="chat">
        <a className="link--older-posts">See older calculations</a>
        <div className="messages">
          <MessageList messageList={messageList} />
        </div>
        <div className="div--input">
          <input type="text"></input>
          <button>
            <BiCalculator className="button--icon" />
            Calculate me now!
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
