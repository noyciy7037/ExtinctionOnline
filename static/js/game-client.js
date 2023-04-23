"use strict";
let clientId = null;
let controller = null;
let roomData = null;

const commands = {
    syncRoomData: "SyncRoomData", // args: ホストのPlayerID, [PlayerID...]
    gameStart: "GameStart", // args: PlayerID(ターン順)...
    addCard: "AddCard", // target: 追加するPlayerID; args: 追加するカードのID, カードのIndex
    worker: "Worker", //
};

const side = {
    host: "HOST",
    player: "PLAYER",
    both: "BOTH"
}

function onSystemMessage(obj) {
    if (clientId === null) {
        clientId = obj.deliveryTo.clientId;
    } else if (obj.from === clientId) {
        roomData = obj.roomData;
        controller.joinNewPlayer(obj);
    } else {
        controller.joinNewPlayer(obj);
    }
}

function joinToRoom(id, name) {
    if (id == null)
        controller = new HostController();
    else
        controller = new PlayerController();

    let obj = {
        messageType: "SYSTEM",
        from: clientId,
        roomData: {
            roomId: id,
            roomName: name
        }
    };
    socket.send(JSON.stringify(obj));
    EXOUtils.init();
}

class Card {
    cardType;
    idIndex;
    id;

    constructor(type, idIndex) {
        this.cardType = type;
        this.idIndex = idIndex;
        this.id = `${type.prefix}-${type.count}-${idIndex}`;
    }
}

class Player {
    clientId;
    cards = new Array();

    constructor(id) {
        this.clientId = id;
    }

    async addCard(card) {
        this.cards.push(card);
        new MessageBuilder(this.clientId).game().addCommand(commands.addCard, this.clientId, card.cardType.id, card.idIndex).send();
        new MessageBuilder().game().addCommand(commands.addCard, this.clientId, cardTypes.unknown.id, -1).send();
        if (card.cardType.onGet) {
            await new Promise(resolve => setTimeout(resolve, 700));
            EXOUtils.capsuleExecute(card.cardType.onGet, this);
            await new Promise(resolve => setTimeout(resolve, 700));
        }
    }
}

class MessageBuilder {
    object;

    constructor(to, trSide = side.player) {
        this.object = {
            from: clientId,
            roomData: roomData,
            deliveryTo: {
                type: to == null ? "ROOM" : "CLIENT",
                clientId: to
            },
            body: {
                side: trSide,
                commands: []
            }
        };
    }

    game() {
        this.object.messageType = "GAME";
        return this;
    }

    addCommand(name, target, ...args) {
        this.object.body.commands.push({
            name: name,
            target: target,
            args: args
        });
        return this;
    }

    send() {
        socket.send(JSON.stringify(this.object));
    }
}

class EXOUtils {
    static worker;

    static init() {
        if (controller instanceof HostController) {
            this.worker = new Worker("static/js/card-module.js");
            this.worker.onmessage = this.#onMessage;
        }
    }

    static shuffleArray(array) {
        let currentIndex = array.length;
        while (currentIndex) {
            let j = Math.floor(Math.random() * currentIndex);
            let t = array[--currentIndex];
            array[currentIndex] = array[j];
            array[j] = t;
        }
        return array;
    }

    static capsuleExecute(funText, target, players) {
        this.worker.postMessage({ type: "run", function: funText, target: target, players: players });
    }

    // Worker Commands
    static #onMessage(e) {
        switch (e.data.type) {
            case "game":
                switch (e.data.game.command) {
                    case "discard":
                        controller.cardCommands.remove(e.data.game.target.clientId, e.data.game.card, null, true);
                        break;
                }
                break;
        }
    }
}