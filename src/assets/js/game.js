let game = {
    players: [],
    fruits: [],
    canvas: undefined,
    scoreBox: undefined,
    socket: undefined,
    load: (data) => {
        console.log('Loading')
        game.canvas = data.canvas
        game.scoreBox = data.scoreBox
        game.socket = data.socket
    },
    update: (data) => {
        game.players = data.players
        game.fruits = data.fruits
        game.render.render()
    },
    render: {
        render: () => {
            console.log('Rendering')
            let render = game.render
            render.clear()
            game.players = game.players.sort((a,b) => {
                return parseFloat(a.score) - parseFloat(b.score)
            }).reverse()
            render.clearScore()
            let players = game.players
            for(let i=0;i<players.length;i++){
                let isPlayer = false;
                let fill = '#2700ff66'
                if(players[i].id == game.socket.id){
                    isPlayer = true
                    fill = '#a400ff66'
                    render.drawPlayerScore(players[i])
                }
                render.drawPlayer(players[i], fill)
                render.drawScore(players[i], isPlayer)
            }
            for(let i=0;i<game.fruits.length;i++){
                render.drawFruit(game.fruits[i], '#eeff0066');
            }
        },
        clear: () => {
            let ctx = game.canvas.getContext('2d')
            ctx.beginPath()
            ctx.rect(0, 0, game.canvas.width, game.canvas.height)
            ctx.fillStyle = "#dedede"
            ctx.fill()
        },
        clearScore: () => {
            game.scoreBox.innerHTML = ''
        },
        drawPlayerScore: (player) => {
            let ctx = game.canvas.getContext('2d')
            ctx.font = "30px Monospace"
            ctx.fillStyle = '#2a2a2aaa'
            ctx.fillText(`Fruits: ${player.score}`, 30, 30)
        },
        drawPlayer: (player, fill) => {
            let ctx = game.canvas.getContext('2d')
            ctx.beginPath();
            ctx.rect(player.x, player.y, 60, 60);
            ctx.fillStyle = fill;
            ctx.fill();
        },
        drawScore: (player, isPlayer) => {
            let score = document.createElement('p')
            let scorePoints = document.createElement('span')
            scorePoints.innerText = player.score
            score.appendChild(scorePoints)
            if(isPlayer == true){
                let nickname = document.createElement('span')
                nickname.innerText = player.nickname
                score.innerHTML += ' | '
                score.appendChild(nickname)
            }else{
                score.innerHTML += ` | ${player.nickname}`
            }
            game.scoreBox.appendChild(score)
        },
        drawFruit: (fruit, fill) => {
            let ctx = game.canvas.getContext('2d')
            ctx.beginPath()
            ctx.rect(fruit.x, fruit.y, 60, 60)
            ctx.fillStyle = fill
            ctx.fill()
        }
    }
}

const socket = io();
const canvas = document.querySelector('#canvas');

socket.on('start', (data) => {
    canvas.width = data.canvas.width
    canvas.height = data.canvas.height
    game.load({
        canvas: canvas,
        scoreBox: document.querySelector('#score-box'),
        socket: socket
    })
    game.update(data.game)
});

socket.on('gameUpdate', (data) => {
    game.update(data)
})

window.addEventListener('keyup', (e) => {
    let nickname  = document.querySelector('#nickname-input').value
    switch(e.keyCode){
        case 38:
            socket.emit('playerMove', {move:'up', nickname:nickname})
            break
        case 39:
            socket.emit('playerMove', {move:'right', nickname:nickname})
            break
        case 40:
            socket.emit('playerMove', {move:'down', nickname:nickname})
            break
        case 37:
            socket.emit('playerMove', {move:'left', nickname:nickname})
            break
    }
})
