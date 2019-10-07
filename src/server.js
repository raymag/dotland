const express = require("express")();
const http = require("http").createServer(express);
const io = require("socket.io")(http);

const app = require("express");

let players = {};

function gameUpdate() {
  io.emit("gameUpdate", players);
}
function playerStart(socket) {
  players[socket.id] = {
    x: 0,
    y: 0
  };
  socket.emit("start", players);
}
function playerMove(socket, move) {
  const speed = 60;
  const size = 600;
  switch (move) {
    case "up":
      if (players[socket.id]["y"] >= speed) {
        players[socket.id]["y"] -= speed;
      }
      break;
    case "down":
      if (players[socket.id]["y"] < size - speed) {
        players[socket.id]["y"] += speed;
      }
      break;
    case "left":
      if (players[socket.id]["x"] >= speed) {
        players[socket.id]["x"] -= speed;
      }
      break;
    case "right":
      if (players[socket.id]["x"] < size - speed) {
        players[socket.id]["x"] += speed;
      }
      break;
  }
  gameUpdate();
}

express.use("/static", app.static(__dirname + "/assets/"));

express.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

io.on("connection", socket => {
  playerStart(socket);
  console.log(`User ${socket.id} connected'`);
  socket.on("disconnect", () => {
    delete players[socket.id];
    gameUpdate(players);
    console.log(`User ${socket.id} disconnected`);
  });
  socket.on("playerMove", move => {
    playerMove(socket, move);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
