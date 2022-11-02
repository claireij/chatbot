function Message ({sender, message, date})  {

    const classNameBubble = "bubble " + sender;

    return (
        <div className="message">
            <div className="time">{date}</div>
            <div className={classNameBubble}>
                <p>{message}</p>
            </div>
        </div>
    )
}

export default Message;