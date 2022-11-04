class PlayerController {
    hostClientId;

    constructor() {
    }

    onGameMessage(message){
        message.body.commands.forEach(command=>{
            switch(command.name){
                case commands.gameStart:
                    this.hostClientId = message.from;
                    break;
            }
        });
    }

    joinNewPlayer(obj){
    }
}