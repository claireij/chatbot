import socketIOClient from 'socket.io-client';


const ENDPOINT = process.env.ENDPOINT || ""

export const newSocket = socketIOClient(ENDPOINT);
  newSocket.on("connect", () => {
    console.log("socket connected");
  });