"use strict";
const firstCardCount = 5;

class HostController {
    playerController = null;
    deck = new Array();
    players = new Map();

    constructor() {
        this.playerController = new PlayerController();
    }

    gameStart() {
        let startMessage = new MessageBuilder().game();
        startMessage.addCommand(commands.gameStart).send();

        // すべてのカードを生成
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

        // プレイヤーに5枚ずつ配布
        for (const player of this.players) {
            // 本人通達用
            let messageBuilder = new MessageBuilder(player[0]).game();
            // 他人通達用
            let messageBuilderForRoom = new MessageBuilder().game();
            for (let j = 0; j < firstCardCount; ++j) {
                player[1].cards.push(this.deck[0]);
                messageBuilder.addCommand(commands.addCard, player[0], this.deck[0].cardType.id, this.deck[0].idIndex);
                messageBuilderForRoom.addCommand(commands.addCard, player[0], cardTypes.unknown.id, -1)
                this.deck.splice(0, 1);
            }
            messageBuilder.send();
            messageBuilderForRoom.send();
        }
    }

    onGameMessage(message) {
        this.playerController.onGameMessage(message);
    }

    joinNewPlayer(obj) {
        this.players.set(obj.from, new Player(obj.from));
        let messageBuilder = new MessageBuilder().game();
        messageBuilder.addCommand(commands.syncRoomData, null, clientId, [...this.players.keys()]);
        messageBuilder.send();
    }
}