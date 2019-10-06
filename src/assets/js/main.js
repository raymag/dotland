const socket = io();
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let players = {}

function drawPlayer(player, fill){
    ctx.beginPath();
    ctx.rect(player.x, player.y, 60, 60);
    ctx.fillStyle = fill;
    ctx.fill();
}
function drawGame(){
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#dedede";
    ctx.fill()
    for(player in players){
        fill = "#2700ff66"
        if(player == socket.id){
            fill = "#a400ff66";
        }
        drawPlayer(players[player], fill);
    }
}

socket.on('start', (playersData) => {
    players = playersData;
    drawGame();
});

socket.on('gameUpdate', (playersData) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players = playersData;
    drawGame();
});

window.addEventListener('keydown', (e) => {
    switch(e.keyCode){
        case 38:
            socket.emit('playerMove', 'up');
            break
        case 39:
            socket.emit('playerMove', 'right');
            break
        case 40:
            socket.emit('playerMove', 'down');
            break
        case 37:
            socket.emit('playerMove', 'left');
            break
    }
});