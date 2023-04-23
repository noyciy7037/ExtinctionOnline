"use strict";
class PlayerController {
    hostClientId;
    players = new Map();
    discarded = new Array();
    turnOrder;
    turn = 0;

    constructor() {
    }

    onGameMessage(message) {
        message.body.commands.forEach(command => {
            switch (command.name) {
                case commands.syncRoomData:
                    if (message.from !== command.args[0]) { socket.close(); return; }
                    this.hostClientId = command.args[0];
                    this.players = new Map(command.args[1].map(playerId => [playerId, new Player(playerId)]));
                    break;
                case commands.gameStart:
                    if (message.from !== this.hostClientId) { socket.close(); return; }
                    this.turn = 0;
                    this.turnOrder = command.args;
                    break;
                case commands.addCard:
                    if (message.from !== this.hostClientId) { socket.close(); return; }
                    if (command.target == clientId && command.args[0] == cardTypes.unknown.id) return;
                    this.players.get(command.target).cards.push(new Card(cardTypes[command.args[0]], command.args[1]));
                    break;
                case commands.worker:
                    if (message.from !== this.hostClientId) { socket.close(); return; }
                    this.cardCommands[command.args[0]](...command.args[1]);
                    break;
            }
        });
    }

    joinNewPlayer() { }

    cardCommands = {
        remove: (target, card, index, canRecycle) => {
            const player = this.players.get(target);
            player.cards.splice(index, 1);
            if (canRecycle)
                this.discarded.push(new Card(cardTypes[card.cardType.id], card.idIndex));
        },
    };
}