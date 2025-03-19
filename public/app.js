const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let mediaRecorder;
let recordedChunks = [];

async function startRecording() {
  // Access the user's webcam and microphone
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  video.srcObject = stream;

  recordedChunks = []; // reset the chunks array

  // Create a MediaRecorder without specifying a time slice
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
  
  mediaRecorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    // Combine chunks into a single Blob
    const blob = new Blob(recordedChunks, { type: 'video/webm' });

    // Create a FormData to send the Blob to the server
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    fetch('/upload', { method: 'POST', body: formData })
      .then(response => response.text())
      .then(data => {
        console.log(data);
      })
      .catch(err => console.error(err));
  };

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopRecording() {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);