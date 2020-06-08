export default function renderScreen(screen, game, requestAnimationFrame) {
    const currentPlayerId = game.state.thisPlayerId

    const context = screen.getContext('2d')
    context.fillStyle = '101010'
    context.clearRect(0, 0, game.state.screen.width, game.state.screen.height)

    for (const playerId in game.state.players) {
        const player = game.state.players[playerId]
        context.fillStyle = '#ffffff60'
        context.fillRect(player.x, player.y, 1, 1)
        context.fillStyle = '#ffffff2c'
        player.tail.forEach(part => {
            context.fillRect(part.x, part.y, 1, 1)
        })
    }

    for (const fruitId in game.state.fruits) {
        const fruit = game.state.fruits[fruitId]
        context.fillStyle = '#d01050'
        context.fillRect(fruit.x, fruit.y, 1, 1)
    }

    if (currentPlayerId) {
        const currentPlayer = game.state.players[currentPlayerId]
    
        if(currentPlayer) {
            context.fillStyle = '#80f040'
            context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1)
            context.fillStyle = '#81f0405d'
            currentPlayer.tail.forEach(part => {
                context.fillRect(part.x, part.y, 1, 1)
            })
        }
    } 
    
    renderScore()  

    function renderScore() {
        const players = []

        for (let player in game.state.players) {
            const nickmane = game.state.players[player].nickname
            const score = game.state.players[player].score
            players.push({player: nickmane, score})
        }
        players.sort(function (a, b) {
            return b.score - a.score;
        })

        const trs = document.querySelectorAll('.variable')
        trs.forEach(tr => tr.remove())

        players.forEach(player => {
            const tr = document.createElement('tr')
            tr.className = 'variable'
            const tdId = document.createElement('td')
            const tdScore = document.createElement('td')
            tdId.innerHTML = player.player
            tdScore.innerHTML = player.score
            tr.appendChild(tdId)
            tr.appendChild(tdScore)
            if (player.player === currentPlayerId) {
                tr.className = 'myPlayer variable'
            }
            document.querySelector('#tfoot').insertAdjacentElement('beforebegin', tr)
        })

        const trFoot = document.querySelector('#tr-foot')
        const totalPlayer = document.createElement('td')
        totalPlayer.className = 'tfoot variable'
        totalPlayer.innerHTML = players.length
        trFoot.appendChild(totalPlayer)
    }

    requestAnimationFrame(() => {
        renderScreen(screen, game, requestAnimationFrame)
    })
}
