const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');

// Загрузка SSL-сертификатов
const server = https.createServer({
    cert: fs.readFileSync('./cert.pem'),
    key: fs.readFileSync('./key.pem')
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("Пользователь подключился");
    ws.on("message", (message) => {
        console.log(`Получено сообщение: ${message}`);
        ws.send(message);
    });
});

server.listen(8080, () => {
    console.log('Сервер запущен на https://localhost:8080');
});

