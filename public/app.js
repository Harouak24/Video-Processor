const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let mediaRecorder;
let ws;

async function startRecording() {
  // Get access to the user's webcam and microphone
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  video.srcObject = stream;

  // Connect to the WebSocket server running on ws://localhost:3001
  ws = new WebSocket('ws://localhost:3001');

  ws.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  // Create a MediaRecorder instance to record the stream in WebM format
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
  
  // When data is available, send the chunk to the server via WebSocket
  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
      ws.send(event.data);
    }
  };

  // Start recording and send data every 1 second (1000ms)
  mediaRecorder.start(1000);

  startBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopRecording() {
  // Stop the MediaRecorder and notify the server to finish recording
  mediaRecorder.stop();
  ws.send('stop');
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);