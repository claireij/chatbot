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
      assert.equal("letters", response.error);
      done();
    });
    clientSocket.emit("chat message", "aa");
  });

  it("Calculations: Sending a message without numbers or operators instead of a calculation", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("not_only_numbers_and_operators", response.error);
      done();
    });
    clientSocket.emit("chat message", "&%$§");
  });
  it("Calculations: Sending a message with only one number", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("no_operators", response.error);
      done();
    });
    clientSocket.emit("chat message", "6678");
  });
  it("Calculations: Sending a message with only one operator", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("no_numbers", response.error);
      done();
    });
    clientSocket.emit("chat message", "+");
  });
  it("Calculations: Sending a message with only whitespace", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("just_whitespaces", response.error);
      done();
    });
    clientSocket.emit("chat message", "  ");
  });
  it("Calculations: Sending a message without number", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("no_numbers", response.error);
      done();
    });
    clientSocket.emit("chat message", "++");
  });
  it("Calculations: Sending a message without a operator", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("no_operators", response.error);
      done();
    });
    clientSocket.emit("chat message", "234 234");
  });
  it("Calculations: Sending a calculation without whitespaces", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("no_whitespaces", response.error);
      done();
    });
    clientSocket.emit("chat message", "1+1");
  });
  it("Calculations: Sending a calculation with the wrong order", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(false, response.success);
      assert.equal("wrong_order", response.error);
      done();
    });
    clientSocket.emit("chat message", "+ 1 +");
  });
  it("Calculations: Check if result it right from long calculations", function (done) {
    clientSocket.on("chat message", function (response) {
      assert.equal(true, response.success);
      assert.equal(eval("10 * 10 * 10 + 3 + 5"), response.message);
      done();
    });
    clientSocket.emit("chat message", "10 * 10 * 10 + 3 + 5");
  });

  //   Old calculations test

  it("Old calculations: Getting the last ten calcuations", function (done) {
    clientSocket.on("old messages", function (response) {
      const parsedResponse = JSON.parse(response);
      assert.equal(true, parsedResponse.success);
      assert.equal(true, parsedResponse.oldMessagesList.length <= 10);
      done();
    });
    clientSocket.emit("old messages");
  });
});
