import { WebSocketServer } from 'ws';
import http from 'http';

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running\n');
});

// Создаем WebSocket сервер, привязывая его к HTTP серверу
const wss = new WebSocketServer({ noServer: true });

// Обрабатываем HTTP запросы и обновления WebSocket соединений
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Обработка соединений WebSocket
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        if (message === 'join-call') {
            ws.send('join-call');
        } else if (message === 'leave-call') {
            ws.send('leave-call');
        } else {
            // Обработка аудиосообщений
            broadcastAudioMessage(message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('Error occurred:', error);
    });
});

// Функция для широковещательной передачи аудиосообщений
function broadcastAudioMessage(audioData) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(audioData);
        }
    });
}

// Запускаем сервер на порту 8081
server.listen(8081, () => {
    console.log('Server started on port 8081');
});