const ioClient = require("socket.io-client");
const chai = require("chai");
const server = require("../index");
const assert = chai.assert;
const socketUrl = "http://localhost:4001";
const options = {
  transports: ["websocket"],
  "force new connection": true,
};

describe("chatbot", () => {
  let clientSocket;

  beforeEach(function (done) {
    clientSocket = new ioClient(socketUrl, options);
    clientSocket.on("connect", done);
  });

  afterEach(() => {
    clientSocket.close();
  });

  it("connect", () => {
    it("should connect socket", (done) => {
      clientSocket.on("connect", () => {
        assert.equal(clientSocket.connected, true);
        clientSocket.disconnect();
        done();
      });
    });
  });

  it("Sending messages to backend", function (done) {
    clientSocket.on("chat message", function (message) {
      assert.equal("8", message);
      done();
    });

    clientSocket.emit("chat message", "1 + 4");
  });

  it("Sending messages to backend2", function (done) {
    clientSocket.on("chat message", function (message) {
      assert.equal("7", message);
      done();
    });

    clientSocket.emit("chat message", "1 + 4");
  });

  it("Sending messages to backend8", function (done) {
    clientSocket.on("chat message", function (message) {
      assert.equal(
        "Oh wow, seems like you're using letters in your calculation. I'm so sorry, but we're not that advanced in algebra. Maybe you just give me numbers, alright?",
        message
      );
      done();
    });

    clientSocket.emit("chat message", "aa");
  });
});
