const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

console.log("Activate");

wss.on("connection", (ws) => {
    console.log("Пользователь подключился");
    ws.on("message", (message) => {
        console.log(`Получено сообщение: ${message}`);
        ws.send(message);
    });
});