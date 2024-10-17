const joinButton = document.querySelector("button#joinButton");
const leaveButton = document.querySelector("button#leaveButton");
const sendMessageButton = document.querySelector("button#sendMessage");
const messagePlace = document.querySelector("div#messagePlace");

let socketActive = false;

function callJoin() {
    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", () => {
        console.log("Соединение WebSocket установленно");
        socketActive = true;
    });

    socket.addEventListener("message", (message) => {
        console.log(message.data);
    });

    socket.onclose = () => {
        console.log("Соединение WebSocket разорванно");
        socketActive = false;
    };

    // Обработчик события на ошибку
    socket.onerror = (error) => {
        console.error("Ошибка:", error);
    };

    sendMessageButton.addEventListener("click", () => {
        const message = document.querySelector("input#messageInput").value;
        socket.send(message);
        document.querySelector("input#messageInput").value = "";
    });

    recorder(socket);

    socket.onmessage = (event) => {
        if (event.data instanceof Blob) {
            console.log("Получен Blob:", event.data);
            const audioChunks = [];
            audioChunks.push(event.data);
            playAudio(audioChunks); // Вызываем функцию воспроизведения аудио
        } else {
            console.error("Полученные данные не являются Blob:", event.data);
        }
    };
}

joinButton.addEventListener("click", () => {
    if (!socketActive) {
        callJoin();
    }
});

function recorder(socket) {
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            let mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.start(1000);

            mediaRecorder.onstart = () => {
                console.log("Запись начата");
            };
            mediaRecorder.ondataavailable = (event) => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(event.data);
                    console.log(event);
                } else {
                    console.error("WebSocket не открыт");
                }
            };

            leaveButton.addEventListener("click", () => {
                if (socket.readyState == WebSocket.OPEN) {
                    mediaRecorder.stop();
                    socket.close();
                }
            });

            mediaRecorder.onstop = () => {
                console.log("Запись остановлена");
            };

            mediaRecorder.onerror = (event) => {
                console.error("Ошибка MediaRecorder:", event.error);
            };
        })
        .catch((error) => console.error("Ошибка доступа к микрофону:", error));
}

async function playAudio(audioChunks) {
    if (audioChunks.length == 0) {
        console.error("Нет данных для воспроизведения");
        return; // Проверяем, есть ли данные для воспроизведения
    }

    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    if (audioBlob.size == 0) {
        console.error("Создан пустой Blob, воспроизведение невозможно");
        return;
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audioElement = document.createElement("audio");
    audioElement.src = audioUrl;

    document.body.appendChild(audioElement);
    console.log(audioElement);

    await audioElement.play().catch((error) => {
        console.error("Ошибка воспроизведения:", error);
    });

    audioElement.addEventListener("ended", () => {
        audioChunks = []; // Очищаем массив
        URL.revokeObjectURL(audioUrl); // Освобождаем память
    });
}

// // Обработчик события на получение аудио
// socket.onmessage = (event) => {
//     // Создаем объект Blob для хранения аудио
//     const audioBlob = new Blob([event.data], { type: "audio/wav" });

//     // Создаем объект URL для воспроизведения аудио
//     const audioUrl = URL.createObjectURL(audioBlob);

//     // Создаем элемент <audio> для воспроизведения звука
//     const audioElement = document.createElement("audio");
//     audioElement.src = audioUrl;

//     // Добавляем элемент <audio> на страницу
//     document.body.appendChild(audioElement);

//     // Воспроизводим звук
//     audioElement.play();
// };

// // Обработчик события на ошибку
// socket.onerror = (error) => {
//     console.log("Ошибка:", error);
// };
