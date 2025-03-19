const express = require('express');
const multer  = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Endpoint to receive the recorded video
app.post('/upload', upload.single('video'), (req, res) => {
  const filePath = req.file.path;
  const targetPath = path.join(__dirname, 'input.webm');

  // Move the uploaded file to input.webm
  fs.rename(filePath, targetPath, (err) => {
    if (err) return res.status(500).send(err);

    console.log('Received complete recording, starting FFMPEG conversion...');

    // Run FFMPEG to convert input.webm to output.mp4
    const ffmpeg = spawn('ffmpeg', ['-i', targetPath, '-c:v', 'libx264', 'output.mp4']);

    ffmpeg.stdout.on('data', data => {
      console.log(`FFMPEG stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', data => {
      console.error(`FFMPEG stderr: ${data}`);
    });

    ffmpeg.on('close', code => {
      console.log(`FFMPEG process exited with code ${code}`);
      res.send('Video processed and converted to output.mp4');
    });
  });
});

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});