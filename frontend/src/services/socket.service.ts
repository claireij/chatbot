import socketIOClient from 'socket.io-client';


const ENDPOINT = process.env.NODE_ENV === "production" ? "https://chatbot-claire.herokuapp.com" : "http://127.0.0.1:4001";

export const newSocket = socketIOClient(ENDPOINT);
  newSocket.on("connect", () => {
    console.log("socket connected");
  });