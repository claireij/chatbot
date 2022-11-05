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

//   Client connection test

  it("connect", () => {
    it("should connect socket", (done) => {
      clientSocket.on("connect", () => {
        assert.equal(clientSocket.connected, true);
        clientSocket.disconnect();
        done();
      });
    });
  });

//   Calculation tests

  it("Calculations: Sending a valid calculation to backend", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal("5", response.message);
      assert.equal(true, response.success);
      done();
    });

    clientSocket.emit("chat message", "1 + 4");
  });

  it("Calculations: Sending letters instead of a calculation", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      done();
    });
    clientSocket.emit("chat message", "aa");
  });

  it("Calculations: Sending a message without numbers or operators instead of a calculation", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      done();
    });
    clientSocket.emit("chat message", "&%$§");
  });

//   Old calculations test

  it("Old calculations: ", function (done) {
    clientSocket.on("old messages", function (response) {
      assert.equal(false, response.success);
      done();
    });
    clientSocket.emit("chat message");
  });


});


