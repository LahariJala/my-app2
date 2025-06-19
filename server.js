const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

dotenv.config(); // ✅ Load .env

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // ✅ Required to read req.body

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🌱 Farming AI Server is running!");
});

// ✅ Chat endpoint
app.post("/chat", async (req, res) => {
  const { message, language } = req.body;

  // ✅ Log input
  console.log("📩 Incoming:", { message, language });

  // ✅ Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ reply: "❌ Error: Gemini API key not set in .env file." });
  }

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a farming assistant. Reply in language: ${language}.\n\nQuestion: ${message}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No reply received from Gemini.";

    console.log("✅ Gemini Response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ Gemini API Error:");
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "❌ Error: Unable to connect to Gemini API." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
