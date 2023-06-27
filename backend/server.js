const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);

// const _path = path.join(__dirname)

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});

const messages = [];
const user_msg = [];
let usernameList = [];
const chatBotMsg = ["안녕"];

let roomName = "";

io.on("connection", (socket) => {
  socket.on("loginInfo", (username) => {
    if (username) {
      usernameList.push({ username, id: socket.id });
    } else {
      usernameList.push({ username: "익명", id: socket.id });
    }
    console.log("유저이름:", usernameList);
    io.to(roomName).emit("userList", usernameList);
  });

  // 방 가입
  socket.on("roomJoin", (data) => {
    roomName = data.room;
    socket.join(data.room);
    console.log("들어간 후 방목록:", socket.rooms);
  });

  // 방 나가기
  socket.on("leaveRoom", (data) => {
    data = data.room;
    socket.leave(data.room);
    console.log("나간 후 방목록:", socket.rooms);
    usernameList.forEach((v, i) => {
      if (v.id === socket.id) {
        usernameList.splice(i, 1);
        io.to(roomName).emit("userList", usernameList);
      }
    });
  });
  // 방 나갈 때 유저 리스트 제거
  socket.on("leaveList", (data) => {
    data = data.room;
    socket.leave(data.room);
    console.log("나간 후 방목록:", socket.rooms);
  });
  // 클라이언트로 부터 메시지 수신 받음
  socket.on("sendMessage", (data) => {
    console.log("유저한테 받음:", data);

    console.log("방이름", roomName);
    if (data.message == "안녕") {
      io.to(roomName).emit(
        "messages",
        messages.push({ message: "꺼정" + "(챗봇)", id: "chat_bot" })
      );
    }
    usernameList.forEach((v) => {
      if (v.id === socket.id) {
        messages.push({
          message: data.message,
          id: v.username,
        });
      }
    });

    // 수신 받은 메시지의 목록을 클라이언트에게 돌려줌
    io.to(roomName).emit("messages", messages);
    // ===============================

    //개인 메세지 방 가입
    let user_id = "";
    socket.on("user_message", (data) => {
      user_id = data;
      console.log(data);
      // socket.join("room");
      // io.to("room").emit("user_messages", {
      //   username: "환영봇",
      //   message: "환영합니다",
      // });
      // // socket.join("room").emit("user_messages", "환영합니다");
      // console.log("개인방1:", socket.rooms);
    });

    socket.on("send_user", (data) => {
      console.log(data);
      // user_msg.push(data);
      // io.to("room").emit("user_messages", user_msg);
      // console.log("개인방2:", socket.rooms);
    });
  });

  socket.on("disconnecting", () => {
    socket.emit("leave", "55");
    console.log(`${socket.id}님이 방을 나가셨습니다.`);
  });
});

server.listen(8001, () => {
  console.log("----서버 정상 오픈----");
});
