const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = 3000;
const wsPort = 3001;

// Serve static files from the "public" folder
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});

// Set up the WebSocket server on a separate port
const wss = new WebSocket.Server({ port: wsPort }, () => {
  console.log(`WebSocket server running on ws://localhost:${wsPort}`);
});

let fileStream = fs.createWriteStream('input.webm');
let recording = true;

wss.on('connection', ws => {
  console.log('Client connected to WebSocket');

  ws.on('message', message => {
    // If a text message "stop" is received, end recording and process with FFMPEG
    if (typeof message === 'string') {
      if (message === 'stop') {
        console.log('Recording stopped');
        recording = false;
        fileStream.end(() => {
          // Run FFMPEG to convert input.webm to output.mp4
          console.log('Starting FFMPEG conversion...');
          const ffmpeg = spawn('ffmpeg', ['-i', 'input.webm', '-c:v', 'libx264', 'output.mp4']);

          ffmpeg.stdout.on('data', data => {
            console.log(`FFMPEG stdout: ${data}`);
          });

          ffmpeg.stderr.on('data', data => {
            console.error(`FFMPEG stderr: ${data}`);
          });

          ffmpeg.on('close', code => {
            console.log(`FFMPEG process exited with code ${code}`);
          });
        });
      }
    } else {
      // Assume binary data is a media chunk; write it to file if still recording
      if (recording) {
        fileStream.write(message);
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});