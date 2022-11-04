let clientId = null;
let controller = null;
let roomData = null;

const commands = { gameStart: "GameStart", addCard:"AddCard"};

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
    console.log(obj);
    socket.send(JSON.stringify(obj));
}

class Card {
    cardType;
    id;

    constructor(type, idIndex) {
        this.cardType = type;
        this.id = `${type.prefix}-${type.count}-${idIndex}`;
    }
}