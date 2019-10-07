const socket = io();
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let players = {}
let fruits = [];

function clearScore(){
    document.querySelector('#score-box').innerHTML = '';
}
function drawScore(player){
    let score = document.createElement('p');
    let scorePoints = document.createElement('span');
    scorePoints.innerText = player.score;
    score.appendChild(scorePoints);
    score.innerHTML += ` - ${player.nickname}`;
    document.querySelector('#score-box').appendChild(score);
}
function drawPlayerScore(player){
    ctx.font = "30px Monospace";
    ctx.fillStyle = '#2a2a2aaa';
    ctx.fillText(`Fruits: ${player.score}`, 30, 30);
}
function drawFruit(fruit, fill){
    ctx.beginPath();
    ctx.rect(fruit.x, fruit.y, 60, 60);
    ctx.fillStyle = fill;
    ctx.fill();
}
function drawPlayer(player, fill){
    ctx.beginPath();
    ctx.rect(player.x, player.y, 60, 60);
    ctx.fillStyle = fill;
    ctx.fill();
}
function clearCanvas(){
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#dedede";
    ctx.fill();
}
function drawGame(){
    clearCanvas();
    clearScore();
    for(player in players){
        fill = "#2700ff66"
        if(player == socket.id){
            fill = "#a400ff66";
            drawPlayerScore(players[player]);
        }
        drawPlayer(players[player], fill);
        drawScore(players[player]);
    }
    for(let i=0;i<fruits.length;i++){
        drawFruit(fruits[i], '#eeff0066');
    }
}

socket.on('start', (game) => {
    players = game.players;
    fruits = game.fruits;
    drawGame();
});

socket.on('gameUpdate', (game) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players = game.players;
    fruits = game.fruits;
    drawGame();
});

window.addEventListener('keydown', (e) => {
    let nickname = document.querySelector('#nickname-input').value;
    switch(e.keyCode){
        case 38:
            socket.emit('playerMove', {move:'up', nickname:nickname});
            break
        case 39:
            socket.emit('playerMove', {move:'right', nickname:nickname});
            break
        case 40:
            socket.emit('playerMove', {move:'down', nickname:nickname});
            break
        case 37:
            socket.emit('playerMove', {move:'left', nickname:nickname});
            break
    }
});