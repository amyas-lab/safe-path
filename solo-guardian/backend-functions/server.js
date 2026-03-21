require('dotenv').config();
const express = require('express');
const cors = require('cors');
const backend = require('./index');

const app = express();
app.use(cors());
app.use(express.json());

// Mock Firebase Functions routing
app.post('/solo-guardian/us-central1/sendEmergencyAlert', (req, res) => {
  backend.sendEmergencyAlert(req, res);
});

app.post('/solo-guardian/us-central1/analyzeAudioContext', (req, res) => {
  backend.analyzeAudioContext(req, res);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`SOS Backend Server is running mock Firebase on http://localhost:${PORT}`);
});
