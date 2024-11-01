import { Message, MessageSenderEnum } from "../components/MessageBubble";
import { newSocket } from "./socket.service";

export const MessageService = {
    addOldMessages: ({response, currentMessageList}: {response: any, currentMessageList: Array<Message>}) => {
        const parsedResponse = JSON.parse(response);
        const newArray = [...currentMessageList];
    
        // if there aren't any old messages, the bot sends a error message
        if (!parsedResponse.success) {
          return [
            ...currentMessageList,
            {
              messageText: parsedResponse.botAnswer,
              sender: MessageSenderEnum.BOT,
            },
          ];
          
        }
    
        // if there are old messages, they are added to the message list
        parsedResponse.oldMessagesList.map((oldMessages: any) => {
          const incomingDate = new Date(oldMessages.createdAt);
          const formattedIncomingDate = `${incomingDate.getDate()}.${
            incomingDate.getMonth() + 1
          }.${incomingDate.getFullYear()}  ${incomingDate.getHours()}:${incomingDate.getMinutes()}:${incomingDate.getSeconds()}`;
    
          const oldUserMessage = {
            sender: MessageSenderEnum.USER,
            messageText: oldMessages.userMessage,
            date: formattedIncomingDate,
          };
          const oldBotAnswer = {
            sender: MessageSenderEnum.BOT,
            messageText: oldMessages.botAnswer,
            date: formattedIncomingDate,
          };
    
          newArray.push(oldUserMessage);
          newArray.push(oldBotAnswer);
        });
    
        newArray.push({
          messageText: "Great! What do you want to do next?",
          sender: MessageSenderEnum.BOT,
        });
    
        return newArray
    
        
      },

      getOldMessages: () => {
        newSocket.emit("old messages");
      }
}