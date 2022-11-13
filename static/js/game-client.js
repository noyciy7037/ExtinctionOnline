"use strict";
let clientId = null;
let controller = null;
let roomData = null;

const commands = { syncRoomData: "SyncRoomData", gameStart: "GameStart", addCard: "AddCard" };

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
}

class MessageBuilder {
    object;

    constructor(to) {
        this.object = {
            from: clientId,
            roomData: roomData,
            deliveryTo: {
                type: to == null ? "ROOM" : "CLIENT",
                clientId: to
            },
            body: {
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