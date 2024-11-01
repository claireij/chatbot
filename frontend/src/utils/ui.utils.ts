export const scrollToBottom = () => {
    const chat = document.querySelector("form");
    if(chat) chat.scrollTop = chat.scrollHeight;
  };