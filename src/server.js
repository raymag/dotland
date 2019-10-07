const express = require("express")();
const http = require("http").createServer(express);
const io = require("socket.io")(http);

const app = require("express");

let players = {};
let fruits = []; 
const speed = 60;
const size = 600;
const fruitSpawnRate = 5;

function playerGetFruit(player){
    for(let i=0; i<fruits.length;i++){
        if(fruits[i].x == player.x && fruits[i].y == player.y){
            fruits.splice(i, 1);
            player.score++;
            break;
        }
    }
    gameUpdate();
}
function addFruit(){
    let fruit = {
        x : Math.floor(Math.random()*(10))*speed,
        y: Math.floor(Math.random()*(10))*speed
    }
    fruits.push(fruit);
}
function spawnFruit(){
    let n = Math.floor(Math.random() * (100));
    if (n<=fruitSpawnRate){
        addFruit();
    }
}
function gameUpdate() {
  io.emit("gameUpdate", {players:players, fruits:fruits});
  spawnFruit();
}
function playerStart(socket) {
  players[socket.id] = {
    x: 0,
    y: 0,
    score: 0,
    nickname: 'guess'
  };
  socket.emit("start", {players:players, fruits:fruits});
}
function playerMove(socket, playerData) {
  players[socket.id]['nickname'] = playerData['nickname'];
  switch (playerData['move']) {
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
  playerGetFruit(players[socket.id]);
}

express.use("/static", app.static(__dirname + "/assets/"));

express.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

io.on("connection", (socket) => {
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
