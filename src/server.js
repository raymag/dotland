const express = require('express')()
const http = require('http').createServer(express)
const io = require('socket.io')(http)
const app = require('express')

let players = []
let fruits = []

const canvasWidth = 600
const canvasHeight = 600
const dotSize = 60
const defaultNickname = 'DOT'
const fruitSpawnRate = 2;

express.use('/static', app.static(__dirname+'/assets/'))

express.get('/', (req, res) => {
    res.sendFile(__dirname+'/views/index.html')
})

function playerGetFruit(player){
    for(let i=0; i<fruits.length;i++){
        if(fruits[i].x == player.x && fruits[i].y == player.y){
            fruits.splice(i, 1)
            player.score++
            break
        }
    }
    gameUpdate();
}
function addFruit(){
    let fruit = {
        x : Math.floor(Math.random()*(10))*dotSize,
        y: Math.floor(Math.random()*(10))*dotSize
    }
    fruits.push(fruit);
}
function spawnFruit(){
    let n = Math.floor(Math.random() * (100));
    if (n<=fruitSpawnRate){
        addFruit();
    }
}
function gameUpdate(){
    io.emit('gameUpdate', {players,fruits})
    spawnFruit();
}
function playerStart(socket){
    console.log(`Player ${socket.id} connected`)
    let player = {
        id: socket.id,
        x: Math.floor(Math.random()*(10))*dotSize,
        y: Math.floor(Math.random()*(10))*dotSize,
        score: 0,
        nickname: defaultNickname
    }
    players.push(player)
    socket.emit('start', {
        canvas: {
            width: canvasWidth,
            height: canvasHeight
        },
        game: {
            players: players,
            fruits: fruits
        }
    })
}
function playerDisconnect(socket){
    for(let i=0;i<players.length;i++){
        if(players[i].id == socket.id){
            delete players.splice(i, 1)
            gameUpdate(players)
            console.log(`User ${socket.id} disconnected`)
            break;
        }
    }
}
function playerMove(data, socket){
    for(let i=0;i<players.length;i++){
        if(players[i].id == socket.id){
            players[i].nickname = data.nickname
            switch(data.move){
                case 'up':
                    if(players[i].y > 0){
                        players[i].y -= dotSize
                    }
                    break
                case 'right':
                    if(players[i].x < canvasWidth-dotSize ){
                        players[i].x += dotSize
                    }
                    break
                case 'down':
                    if(players[i].y < canvasHeight-dotSize){
                        players[i].y += dotSize
                    }
                    break
                case 'left':
                    if(players[i].x > 0){
                        players[i].x -= dotSize
                    }
            }
            playerGetFruit(players[i])
        }
    }
    gameUpdate()
}

io.on('connection', (socket) => {
    playerStart(socket);
    socket.on("disconnect", () => {
      playerDisconnect(socket)
    });
    socket.on("playerMove", move => {
      playerMove(socket, move)
    });
    socket.on('playerMove', (data) => {
        playerMove(data, socket)
    })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})