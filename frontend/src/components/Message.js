import {useState} from 'react';

function Message ({sender, message, date})  {

    const [clicked, setClicked] = useState(false);

    const handleMessageClick = () => {
        setClicked(!clicked);
    }

    const classNameBubble = "bubble " + sender;

    return (
        <div className="message">
            {
                clicked ?
                <div className="time">{date}</div> :
                <></>
            }
            
            <div 
            className={classNameBubble}
            onClick={handleMessageClick}
            >
                <p>{message}</p>
            </div>
        </div>
    )
}

export default Message;