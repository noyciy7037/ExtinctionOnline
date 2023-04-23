"use strict";
function discard(target, card) {
    console.log("DIS!CAR!D!");
    postMessage({ type: "game", game: { command: "discard", target: target, card: card } });
}

function selectUser() {

}

function selectCard(count, target) {

}

onmessage = e => {
    console.log(e);
    switch (e.data.type) {
        case "run":
            let fun = new Function("target", "players", e.data.function);
            fun(e.data.target, e.data.players);
            break;
    }
}