import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Chat } from "./models/ChatSchema";
import express, { Request, Response } from "express";
import path from "path";
import { calculate, inputfieldValidation, parseMessage, saveAndEmitChatMessage } from "./helpers";

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

  socket.on("chat message", async (message: string) => {
    const validationError = inputfieldValidation(message);
    if (validationError) {
      await saveAndEmitChatMessage(socket, message, validationError.message, false);
      return;
    }

    const messageArray = parseMessage(message);
    const result = calculate(messageArray);
    const response = result
      ? { success: true, message: result }
      : { success: false, message: "Sorry, we were unable to solve this calculation." };

    await saveAndEmitChatMessage(socket, message, response.message, response.success);
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
});

server.listen(port, () => console.log(`Listening on port ${port}`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

export default server;
