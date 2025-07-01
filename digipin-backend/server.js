const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const { OpenAI } = require('openai'); // ✅ Updated import for v4

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// ✅ Initialize OpenAI client using new v4 API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ POST /chat — AI assistant route
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful farming assistant.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('❌ ChatGPT error:', error);
    res.status(500).json({ error: 'Failed to get response from ChatGPT' });
  }
});


// ✅ GET /api/digipin/encode
app.get('/api/digipin/encode', (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const digipin = encodeCoordToDigipin(latitude, longitude);
  res.json({ digipin });
});

// ✅ GET /api/digipin/decode
app.get('/api/digipin/decode', (req, res) => {
  const { digipin } = req.query;

  if (!digipin) {
    return res.status(400).json({ error: 'DIGIPIN is required' });
  }

  const coords = decodeDigipinToCoord(digipin);

  if (!coords) {
    return res.status(404).json({ error: 'Invalid DIGIPIN' });
  }

  res.json(coords);
});

// 🔐 Sample Encode Logic (Mock)
function encodeCoordToDigipin(lat, lon) {
  const latCode = Math.abs(parseFloat(lat)).toFixed(4).replace('.', '').slice(0, 4);
  const lonCode = Math.abs(parseFloat(lon)).toFixed(4).replace('.', '').slice(0, 4);
  return `${latCode.substring(0, 2)}P${latCode.substring(2)}-JK${lonCode.substring(0, 2)}-${lonCode.substring(2)}C9`;
}

// 🔐 Sample Decode Logic (Mock)
function decodeDigipinToCoord(digipin) {
  return {
    latitude: '12.971601',
    longitude: '77.594584'
  };
}

// 🚀 Start Express server
app.listen(PORT, () => {
  console.log(`✅ DIGIPIN + ChatGPT backend running at http://localhost:${PORT}`);
});
