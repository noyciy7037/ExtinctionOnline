const firstCardCount = 5;

class HostController {
    playerController = null;
    deck = new Array();
    players = new Array();

    constructor() {
        this.playerController = new PlayerController();
    }

    gameStart() {
        socket.send(JSON.stringify({
            from: clientId,
            messageType: "GAME",
            roomData: roomData,
            deliveryTo: {
                type: "ROOM"
            },
            body: {
                commands: [{ name: commands.gameStart }]
            }
        }));
        Object.keys(cardTypes).forEach(key => {
            for (let i = 0; i < cardTypes[key].count; ++i)
                this.deck.push(new Card(cardTypes[key], i + 1));
        });
        // 山札をシャッフル
        let currentIndex = this.deck.length;
        while (currentIndex) {
            let j = Math.floor(Math.random() * currentIndex);
            let t = this.deck[--currentIndex];
            this.deck[currentIndex] = this.deck[j];
            this.deck[j] = t;
        }
        for (let i = 0; i < this.players.length; ++i) {
            let messageObject = {
                from: clientId,
                messageType: "GAME",
                roomData: roomData,
                deliveryTo: {
                    type: "CLIENT",
                    clientId: this.players[i].clientId
                },
                body: {
                    commands: []
                }
            };
            for (let j = 0; j < firstCardCount; ++j) {
                messageObject.body.commands.push({
                    name: commands.addCard,
                    target: this.players[i].clientId,
                    args: [
                        this.deck[0].cardType.id,
                        this.deck[0].id
                    ]
                });
                this.deck.splice(0, 1);
            }
            socket.send(JSON.stringify(messageObject));
        }
    }

    onGameMessage(message) {
    }

    joinNewPlayer(obj) {
        this.players.push(new Player(obj.from));
    }
}

class Player {
    clientId;
    cards = new Array();

    constructor(id) {
        this.clientId = id;
    }
}