"use strict";
// WebSocket 接続を作成
const socket = new WebSocket('ws://localhost:1234');

// 接続が開いたときのイベント
socket.addEventListener('open', function (event) {

});

// メッセージの待ち受け
socket.addEventListener('message', function (event) {
    let obj = JSON.parse(event.data);
    console.log('Server>', obj);
    if (obj.messageType == "SYSTEM") {
        onSystemMessage(obj);
    } else if (obj.messageType == "GAME") {
        controller.onGameMessage(obj);
    }
});