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

/*
// ユーザのスクリプトを実行する
var funText = "\"use strict\";return \"TEST MESSAGE\";";

var workerFile = "\
function testFunction(){" + funText +
    "}\
postMessage(testFunction());\
onmessage = function(e){console.log(e);\
}"

var blob = new Blob([workerFile], {
    type: "text/javascript"
});

var worker = new Worker(window.URL.createObjectURL(blob));
worker.onmessage = function (e) {
    console.log('Function result:', e.data);
}*/