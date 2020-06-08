export default function createGame() {
    let state = {
        thisPlayerId: null,
        players: {},
        fruits: {},
        screen: {
            width: 50,
            height: 50,
        },
    }

    function setScreen(command) {
        const width = command.width
        const height = command.height
        state.screen = {
            width,
            height
        }
        notifyAll({
            type: 'screen-change',
            width,
            height
        })
    }

    const observers = []

    function start() {
        const frequencyOfSpawFruts = 2000
        const frequencyOfAutoMove = 500

        setInterval(autoMove, frequencyOfAutoMove)
        setInterval(addFruit, frequencyOfSpawFruts)
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        console.log(newState)
        Object.assign(state, newState)
    }

    function addPlayer(command) {
        const nickname = command.nickname
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        const score = 0

        console.log(`Player ${playerId} with ${nickname} was add`)
        state.players[playerId] = {
            nickname: nickname,
            x: playerX,
            y: playerY,
            moveDirection: [0, 0],
            tail: [],
            score,
            keyPressed: null
        }

        notifyAll({
            type: 'add-player',
            playerId: playerId,
            nickname: nickname,
            playerX: playerX,
            playerY: playerY
        })
    }

    function removePlayer(command) {
        const playerId = command.playerId

        delete state.players[playerId]

        notifyAll({
            type: 'remove-player',
            playerId: playerId
        })
    }

    function addFruit(command) {
        let number_of_fruits = 0
        for (const fruit in state.fruits) {
            number_of_fruits++
        }

        if (number_of_fruits < 20) {
            const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
            const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
            const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)
    
            state.fruits[fruitId] = {
                x: fruitX,
                y: fruitY
            }
    
            notifyAll({
                type: 'add-fruit',
                fruitId: fruitId,
                fruitX: fruitX,
                fruitY: fruitY
            })
        }
    }

    function removeFruit(command) {
        const fruitId = command.fruitId

        delete state.fruits[fruitId]

        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        })
    }

    function autoMove() {
        for(const playerId in state.players) {
            if (state.players[playerId].keyPressed) {
                //console.log(`Player ${playerId} auto-moved to ${state.players[playerId].keyPressed}`)
                const command = {
                    type: 'auto-move-player',
                    playerId: playerId,
                    keyPressed: state.players[playerId].keyPressed
                }
                movePlayer(command)
            }
        }      
    }

    function movePlayer(command) {
        notifyAll(command)

        const acceptedMoves = {
            ArrowUp(player) {
                player.moveDirection = [0, 1]
                if (player.y - 1 >= 0) {
                    player.y = player.y - 1
                } else {
                    player.y = state.screen.height - 1
                }
            },
            ArrowRight(player) {
                player.moveDirection = [1, 0]
                if (player.x + 1 < state.screen.width) {
                    player.x = player.x + 1
                } else {
                    player.x = 0
                }
            },
            ArrowDown(player) {
                player.moveDirection = [0, -1]
                if (player.y + 1 < state.screen.height) {
                    player.y = player.y + 1
                } else {
                    player.y = 0
                }
            },
            ArrowLeft(player) {
                player.moveDirection = [-1, 0]
                if (player.x - 1 >= 0) {
                    player.x = player.x - 1
                } else {
                    player.x = state.screen.width - 1
                }
            }
        }
        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (player && moveFunction) {
            state.players[playerId].keyPressed = keyPressed
            moveFunction(player)
            moveTail(playerId)
            checkForFruitCollision(playerId)
            checkForPlayersCollision(playerId)
        }

    }

    function checkForFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]
            //console.log(`Checking ${playerId} and ${fruitId}`)

            if (player.x === fruit.x && player.y === fruit.y) {
                //console.log(`COLLISION between ${playerId} and ${fruitId}`)
                removeFruit({ fruitId: fruitId })
                updateScore(playerId)
                addTail(playerId)
            }
        }
    }

    function checkForPlayersCollision(playerId) {
        const player = state.players[playerId]
        for (const otherPlayerId in state.players) {
            if (otherPlayerId !== playerId) {
                const otherPlayer = state.players[otherPlayerId]
                let collision = false
                if (otherPlayer.x === player.x && otherPlayer.y === player.y) {
                    collision = true
                }
                for (let i = 0; i < otherPlayer.tail.length; i++) {
                    //console.log(`Collission to test with: ${otherPlayerId} | Tail: ${i} of ${otherPlayer.tail.length} | x: ${otherPlayer.tail[i].x} y: ${otherPlayer.tail[i].y}`)
                    if (collision === false) {
                        if (player.x === otherPlayer.tail[i].x && player.y === otherPlayer.tail[i].y) {
                            collision = true
                        }
                    }
                }
                if (collision) {
                    playerCollision(playerId, otherPlayerId)
                }
            }
        }
    }

    function playerCollision(playerId, otherPlayerId) {
        notifyAll({
            type: 'player-collision',
            playerId,
            otherPlayerId
        })

        const player = state.players[playerId]
        const otherPlayer = state.players[otherPlayerId]
        const tailsToTransfere = player.tail.length

        //console.log(`Collision with ${playerId} with ${otherPlayerId} | Numbers of tails to transfere ${tailsToTransfere}`)

        for (let i = 0; i < tailsToTransfere; i++) {
            console.log(state.players[playerId].tail[i])
            state.players[otherPlayerId].tail.push(state.players[playerId].tail[i])
            //addTail(otherPlayerId)
        }
        for (let i = 0; i < tailsToTransfere; i++) {
            removeTail(playerId)
        }

        otherPlayer.score += player.score
        player.score = 0
    }

    function updateScore(playerId) {
        const player = state.players[playerId]
        player.score++

        notifyAll({
            type: 'udate-score',
            playerId,
        })
    }

    function addTail(playerId) {
        const player = state.players[playerId]
        const partsOfTails = player.tail.length
        //console.log(`Add tail to player: ${playerId} with ${player.tail.length} parts`)
        if (partsOfTails == 0) {
            player.tail.push({
                x: player.x - player.moveDirection[0],
                y: player.y + player.moveDirection[1],
                moveDirection: []
            })
        } else {
            player.tail.push({
                x: player.tail[partsOfTails - 1].x - player.tail[partsOfTails - 1].moveDirection[0],
                y: player.tail[partsOfTails - 1].y + player.tail[partsOfTails - 1].moveDirection[1],
                moveDirection: []
            })
        }
    }

    function removeTail(playerId) {
        const player = state.players[playerId]
        //console.log(`Remove tail to player: ${playerId} with ${player.tail.length} parts`)
        player.tail.shift()
    }

    function moveTail(playerId) {
        const player = state.players[playerId]
        if (player.tail.length) {
            const tailBeforeMoveX = player.tail[0].x
            const tailBeforeMoveY = player.tail[0].y
            player.tail[0].x = player.x - player.moveDirection[0]
            player.tail[0].y = player.y + player.moveDirection[1]

            player.tail[0].moveDirection[0] = player.tail[0].x - tailBeforeMoveX
            player.tail[0].moveDirection[1] = - player.tail[0].y + tailBeforeMoveY

            for (let part = 1; part < player.tail.length; part++) {
                const tailBeforeMoveX = player.tail[part].x
                const tailBeforeMoveY = player.tail[part].y

                player.tail[part].x = player.tail[part - 1].x - player.tail[part - 1].moveDirection[0]
                player.tail[part].y = player.tail[part - 1].y + player.tail[part - 1].moveDirection[1]
                player.tail[part].moveDirection[0] = player.tail[part].x - tailBeforeMoveX
                player.tail[part].moveDirection[1] = - player.tail[part].y + tailBeforeMoveY
            }
        }
    }

    return {
        addPlayer,
        removePlayer,
        movePlayer,
        addFruit,
        removeFruit,
        state,
        setState,
        subscribe,
        start,
        setScreen,
        updateScore,
        playerCollision,
    }
}