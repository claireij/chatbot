import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Chat } from "./models/ChatSchema";
import express, { Request, Response } from "express";
import path from "path";
import { calculate, inputfieldValidation } from "./helpers";

// Connects to database
const connect = require("./dbconnection");

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  socket.on("chat message", (message: string) => {
    let response;

    const validation = inputfieldValidation(message);
    console.log("tryyyying")
    if (validation) {
      response = validation;
    } else {
      const messageArray = message.split(" ").map((element, index) => (index % 2 === 0 ? parseInt(element) : element));
      const result = calculate(messageArray);

      response = result == null
        ? { success: false, message: "Sorry, we were unable to solve this calculation." }
        : { success: true, message: result };

      const chatMessage = new Chat({
        userMessage: message,
        botAnswer: response.message,
      });
      chatMessage.save();
    }
    io.emit("chat message", response);
  });

  socket.on("old messages", () => {
    Chat.find({})
      .sort("-createdAt")
      .limit(10)
      .sort("createdAt")
      .then((chats: any) => {
        const response = chats.length === 0
          ? { success: false, botAnswer: "Oh, nothing has been calculated yet, start calculating!" }
          : { success: true, oldMessagesList: chats };
        io.emit("old messages", JSON.stringify(response));
      });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

export default server;
