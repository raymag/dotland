const express = require('express')();
const http = require('http').createServer(express);
const io = require('socket.io')(http);

const app = require('express');

let players = {};

function gameUpdate(){
    io.emit('gameUpdate', players);
}
function playerStart(socket){
    players[socket.id] = {
        x: 0,
        y: 0
    };
    socket.emit('start', players);
}
function playerMove(socket, move){
    switch(move){
        case 'up':
            if(players[socket.id]['y']>=10){
                players[socket.id]['y'] -= 10;
            }
            break;
        case 'down':
            if(players[socket.id]['y']<540){
                players[socket.id]['y'] += 10;
            }
            break;
        case 'left':
            if(players[socket.id]['x']>=10){
                players[socket.id]['x'] -= 10;
            }
            break;
        case 'right':
            if(players[socket.id]['x']<540){
                players[socket.id]['x'] += 10;
            }
            break;
    }
    gameUpdate();
}

express.use('/static', app.static(__dirname + '/assets/'));

express.get('/', (req, res) => {
    res.sendFile(__dirname+'/views/index.html');
});

io.on('connection', (socket) => {
    playerStart(socket);
    console.log(`User ${socket.id} connected'`);
    socket.on('disconnect', () => {
        delete players[socket.id];
        gameUpdate(players);
        console.log(`User ${socket.id} disconnected`);
    });
    socket.on('playerMove', (move) => {
        playerMove(socket, move);
    });
});

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});