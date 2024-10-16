const socket = new WebSocket('ws://localhost:8081');

let audioContext = null;
let microphoneStream = null;

document.getElementById('join-call-button').addEventListener('click', () => {
    socket.send('join-call');
});

document.getElementById('leave-call-button').addEventListener('click', () => {
    socket.send('leave-call');
});

socket.onopen = () => {
    console.log('Соединение WebSocket открыто');
    document.getElementById('status').innerHTML = 'Статус: Подключен';
};

socket.onclose = () => {
    console.log('Соединение WebSocket закрыто');
    document.getElementById('status').innerHTML = 'Статус: Не подключен';
};

socket.onmessage = (event) => {
    console.log(`Получено сообщение: ${event.data}`);
    if (event.data === 'join-call') {
        joinCall();
    } else if (event.data === 'leave-call') {
        leaveCall();
    } else {
        handleAudioMessage(event.data);
    }
};

socket.onerror = (event) => {
    console.error('Ошибка WebSocket:', event);
};

function joinCall() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            microphoneStream = stream;
            audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const gain = audioContext.createGain();
            gain.gain.value = 1;
            source.connect(gain);
            gain.connect(audioContext.destination);
            document.getElementById('leave-call-button').disabled = false;
        })
        .catch(error => {
            console.error('Ошибка доступа к микрофону:', error);
        });
}

function leaveCall() {
    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    document.getElementById('leave-call-button').disabled = true;
}

function handleAudioMessage(audioData) {
    if (audioContext) {
        const audioBuffer = new AudioBuffer({
            length: audioData.length,
            sampleRate: 44100,
            numberOfChannels: 1
        });
        audioBuffer.getChannelData(0).set(new Float32Array(audioData));
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }
}