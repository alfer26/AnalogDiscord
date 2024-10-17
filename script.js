// const joinButton = document.querySelector("button#joinButton");
// const leaveButton = document.querySelector("button#leaveButton");
// // const sendMessageButton = document.querySelector("button#sendMessage");
// // const messagePlace = document.querySelector("div#messagePlace");

// let socketActive = false;

// function callJoin() {
//     const socket = new WebSocket("ws://localhost:8080");

//     socket.addEventListener("open", () => {
//         console.log("Соединение WebSocket установленно");
//         socketActive = true;
//     });

//     socket.addEventListener("message", (message) => {
//         console.log(message.data);
//         if (message.data instanceof Blob) {
//             playAudio(message.data);
//         } else {
//             console.error("Полученные данные не являются Blob:", message.data);
//         }
//     });

//     socket.onclose = () => {
//         console.log("Соединение WebSocket разорванно");
//         socketActive = false;
//     };

//     recorder(socket);

//     // sendMessageButton.addEventListener("click", () => {
//     //     const message = document.querySelector("input#messageInput").value;
//     //     socket.send(message);
//     //     document.querySelector("input#messageInput").value = "";
//     // });
// }

// joinButton.addEventListener("click", () => {
//     if (!socketActive) {
//         callJoin();
//     }
// });

// function recorder(socket) {
//     let mediaRecorder;
//     let recordingInterval;

//     navigator.mediaDevices
//         .getUserMedia({ audio: true })
//         .then((stream) => {
//             mediaRecorder = new MediaRecorder(stream);

//             mediaRecorder.start(2000);

//             mediaRecorder.ondataavailable = (event) => {
//                 if (socket.readyState === WebSocket.OPEN) {
//                     socket.send(event.data);
//                     console.log(event.data);
//                 } else {
//                     console.error("WebSocket не открыт");
//                 }
//             };

//             mediaRecorder.onerror = (event) => {
//                 console.error("Ошибка MediaRecorder:", event.error);
//             };;
//         })
//         .catch((error) => console.error("Ошибка доступа к микрофону:", error));

//     // Функция для остановки записи

//     // Пример вызова функции остановки записи
//     // stopRecording(); // Вызовите эту функцию, когда хотите остановить запись

//     leaveButton.addEventListener("click", () => {
//         if (socket.readyState == WebSocket.OPEN) {
//             mediaRecorder.stop(); // Останавливаем запись
//             clearInterval(recordingInterval); // Останавливаем интервал
//             console.log("Запись остановлена");
//             socket.close();
//         }
//     });
// }

// async function playAudio(message) {
//     const audioBlob = new Blob([message], { type: "audio/wav" });
//     console.log(audioBlob);
//     if (audioBlob.size == 0) {
//         console.error("Создан пустой Blob, воспроизведение невозможно");
//         return;
//     }


//     var url = window.URL.createObjectURL(audioBlob);
//   // Создать объект Audio и установить его источник на URL Blob
//   window.audio = new Audio();
//   window.audio.src = url;
//   // Воспроизвести аудио
//   window.audio.play();


//     // const audioUrl = URL.createObjectURL(audioBlob);
//     // const audioElement = document.createElement("audio");
//     // audioElement.src = audioUrl;

//     // document.body.appendChild(audioElement);
//     // console.log(audioElement);

//     // await audioElement.play().catch((error) => {
//     //     console.error("Ошибка воспроизведения:", error);
//     // });

//     // audioElement.addEventListener("ended", () => {
//     //     document.querySelector("audio").remove();
//     //     console.log("Оhjhj");

//     //     audioChunks = []; // Очищаем массив
//     //     URL.revokeObjectURL(audioUrl); // Освобождаем память
//     // });
// }

// // // Обработчик события на получение аудио
// // socket.onmessage = (event) => {
// //     // Создаем объект Blob для хранения аудио
// //     const audioBlob = new Blob([event.data], { type: "audio/wav" });

// //     // Создаем объект URL для воспроизведения аудио
// //     const audioUrl = URL.createObjectURL(audioBlob);

// //     // Создаем элемент <audio> для воспроизведения звука
// //     const audioElement = document.createElement("audio");
// //     audioElement.src = audioUrl;

// //     // Добавляем элемент <audio> на страницу
// //     document.body.appendChild(audioElement);

// //     // Воспроизводим звук
// //     audioElement.play();
// // };

// // // Обработчик события на ошибку
// // socket.onerror = (error) => {
// //     console.log("Ошибка:", error);
// // };






// const joinButton = document.querySelector("button#joinButton");
// const leaveButton = document.querySelector("button#leaveButton");

// let socketActive = false;
// let audioContext;
// let recorderNode;
// let socket;

// async function callJoin() {
//     socket = new WebSocket("ws://localhost:8080");

//     socket.addEventListener("open", () => {
//         console.log("Соединение WebSocket установлено");
//         socketActive = true;
//     });

//     socket.addEventListener("message", (message) => {
//         if (message.data instanceof Blob) {
//             playAudio(message.data);
//         } else {
//             console.error("Полученные данные не являются Blob:", message.data);
//         }
//     });

//     socket.onclose = () => {
//         console.log("Соединение WebSocket разорвано");
//         socketActive = false;
//     };

//     socket.onerror = (error) => {
//         console.error('Ошибка WebSocket:', error);
//     };

//     await recorderAudio();
// }

// joinButton.addEventListener("click", () => {
//     if (!socketActive) {
//         callJoin();
//     }
// });

// async function recorderAudio() {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioContext = new (window.AudioContext || window.webkitAudioContext)();
//         const mediaStreamSource = audioContext.createMediaStreamSource(stream);
//         recorderNode = audioContext.createScriptProcessor(4096, 1, 1);

//         mediaStreamSource.connect(recorderNode);
//         recorderNode.connect(audioContext.destination);

//         recorderNode.onaudioprocess = (event) => {
//             const inputBuffer = event.inputBuffer.getChannelData(0);
//             const audioBlob = createWavBlob(inputBuffer);
//             if (socketActive && socket.readyState === WebSocket.OPEN) {
//                 socket.send(audioBlob);
//                 console.log("Аудио отправлено на сервер");
//             }
//         };

//         leaveButton.addEventListener("click", () => {
//             audioContext.close().then(() => {
//                 console.log("Запись остановлена");
//                 recorderNode.disconnect();
//                 socket.close();
//             });
//         });
//     } catch (error) {
//         console.error("Ошибка доступа к микрофону:", error);
//     }
// }

// function createWavBlob(audioData) {
//     const sampleRate = 44100; // Частота дискретизации
//     const numChannels = 1; // Количество каналов (моно)
//     const buffer = new ArrayBuffer(44 + audioData.length * 2);
//     const view = new DataView(buffer);

//     // Запись заголовка WAV
//     writeString(view, 0, 'RIFF');
//     view.setUint32(4, 36 + audioData.length * 2, true);
//     writeString(view, 8, 'WAVE');
//     writeString(view, 12, 'fmt ');
//     view.setUint32(16, 16, true);
//     view.setUint16(20, 1, true);
//     view.setUint16(22, numChannels, true);
//     view.setUint32(24, sampleRate, true);
//     view.setUint32(28, sampleRate * numChannels * 2, true);
//     view.setUint16(32, numChannels * 2, true);
//     view.setUint16(34, 16, true);
//     writeString(view, 36, 'data');
//     view.setUint32(40, audioData.length * 2, true);
//     // Запись аудиоданных
// for (let i = 0; i < audioData.length; i++) {
//     view.setInt16(44 + i * 2, audioData[i] * 0x7FFF, true); // Преобразование в 16-битный формат
// }

// return new Blob([buffer], { type: 'audio/wav' });
// }

// function writeString(view, offset, string) {
// for (let i = 0; i < string.length; i++) {
//     view.setUint8(offset + i, string.charCodeAt(i));
// }
// }

// function playAudio(blob) {
// const audioUrl = URL.createObjectURL(blob);
// const audio = new Audio(audioUrl);
// audio.play().catch(error => {
//     console.error("Ошибка воспроизведения аудио:", error);
// });
// }





const joinButton = document.querySelector("button#joinButton");
const leaveButton = document.querySelector("button#leaveButton");

let socketActive = false;
let audioContext;
let recorderNode;
let socket;

async function callJoin() {
    socket = new WebSocket("wss://172.24.128.1:8080");

    socket.addEventListener("open", () => {
        console.log("Соединение WebSocket установлено");
        socketActive = true;
    });

    socket.addEventListener("message", (message) => {
        if (message.data instanceof Blob) {
            playAudio(message.data);
        } else {
            console.error("Полученные данные не являются Blob:", message.data);
        }
    });

    socket.onclose = () => {
        console.log("Соединение WebSocket разорвано");
        socketActive = false;
    };

    socket.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
    };

    await recorderAudio();
}

joinButton.addEventListener("click", () => {
    if (!socketActive) {
        callJoin();
    }
});

async function recorderAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        recorderNode = audioContext.createScriptProcessor(8192, 2, 2); // Два канала

        mediaStreamSource.connect(recorderNode);
        recorderNode.connect(audioContext.destination);

        recorderNode.onaudioprocess = (event) => {
            const leftChannel = event.inputBuffer.getChannelData(0);
            const rightChannel = event.inputBuffer.getChannelData(1);
            const audioBlob = createWavBlob(leftChannel, rightChannel);
            if (socketActive && socket.readyState === WebSocket.OPEN) {
                socket.send(audioBlob);
                console.log("Аудио отправлено на сервер");
            }
        };

        leaveButton.addEventListener("click", () => {
            audioContext.close().then(() => {
                console.log("Запись остановлена");
                recorderNode.disconnect();
                socket.close();
            });
        });
    } catch (error) {
        console.error("Ошибка доступа к микрофону:", error);
    }
}

function createWavBlob(leftChannel, rightChannel) {
    const sampleRate = 44100; // Изменено на 44100 Гц
    const numChannels = 2; // Количество каналов (стерео)
    const buffer = new ArrayBuffer(44 + leftChannel.length * 2 * numChannels);
    const view = new DataView(buffer);

    // Запись заголовка WAV
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + leftChannel.length * 2 * numChannels, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, leftChannel.length * 2 * numChannels, true);

    // Запись аудиоданных
    for (let i = 0; i < leftChannel.length; i++) {
        view.setInt16(44 + i * 4, leftChannel[i] * 0x7FFF, true); // Левый канал
        view.setInt16(44 + i * 4 + 2, rightChannel[i] * 0x7FFF, true); // Правый канал
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function playAudio(blob) {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error("Ошибка воспроизведения аудио:", error);
    });
}