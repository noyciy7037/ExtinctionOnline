"use strict";
const firstCardCount = 5;

class HostController {
    playerController = null;
    deck = new Array();
    discarded = new Array();
    players = new Map();
    turnOrder;
    turn = -1;

    constructor() {
        this.playerController = new PlayerController();
    }

    gameStart() {
        // ターンを決定
        this.turnOrder = EXOUtils.shuffleArray([...this.players.keys()]);

        // ゲームを開始
        let startMessage = new MessageBuilder().game();
        startMessage.addCommand(commands.gameStart, null, ...this.turnOrder).send();

        // すべてのカードを生成
        Object.keys(cardTypes).forEach(key => {
            for (let i = 0; i < cardTypes[key].count; ++i)
                this.deck.push(new Card(cardTypes[key], i + 1));
        });

        // 山札をシャッフル
        EXOUtils.shuffleArray(this.deck);

        this.distributionCards();
    }

    async distributionCards() {
        for (let i = 0; i < firstCardCount; ++i) {
            for (const player of this.players) {
                await player[1].addCard(this.deck[0]);
                this.deck.splice(0, 1);
                await new Promise(resolve => setTimeout(resolve, 700));
            }
        }
        /*
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
        }*/
    }

    onGameMessage(message) {
        if (message.body.side != side.host)
            this.playerController.onGameMessage(message);
    }

    joinNewPlayer(obj) {
        this.players.set(obj.from, new Player(obj.from));
        let messageBuilder = new MessageBuilder().game();
        messageBuilder.addCommand(commands.syncRoomData, null, clientId, [...this.players.keys()]);
        messageBuilder.send();
    }

    cardCommands = {
        remove: (target, card, index, canRecycle) => {
            const player = controller.players.get(target);
            index = player.cards.findIndex(it => it.id == card.id);
            card = player.cards[index];
            if (canRecycle)
                this.discarded.push(...player.cards.splice(index, 1));
            else
                this.cardCommands.backIntoDeck(card);
            new MessageBuilder().game().addCommand(commands.worker, target, "remove", [target, card, index, canRecycle]).send();
        },
        backIntoDeck: (card) => {
            this.deck.splice(Math.floor(Math.random() * (this.deck.length + 1)), 0, card);
        },
    };
}