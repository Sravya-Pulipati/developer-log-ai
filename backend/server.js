import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly target backend/.env absolutely
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());

// Fallback lookup validation
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.post('/api/summarize', async (req, res) => {
  const { rawLog } = req.body;
  console.log('Summarize request received', { rawLogLength: rawLog?.length });

  if (!rawLog) {
    return res.status(400).json({ error: 'Raw text log is required.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  try {
    const systemInstructionText = `
      You are an expert technical writer. Take this developer's messy notes and format them into a clean Markdown developer log with headers for Daily Summary, Tasks Completed, Challenges, and Next Steps.
    `;

    // 1. Core SDK Structure Fix
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is my raw log:\n\n${rawLog}`,
      config: {
        systemInstruction: systemInstructionText,
      }
    });

    res.json({ markdown: response.text });
  } catch (error) {
    // 2. Explicit Debug Logs
    console.log("\n❌ ===== GEMINI API ERROR LOG START =====");
    console.error("Message:", error.message);
    if (error.status) console.error("HTTP Status Code:", error.status);
    if (error.errorDetails) console.error("Error Details Array:", error.errorDetails);
    console.log("===== GEMINI API ERROR LOG END =====\n");

    const message = error?.message || 'Failed to process log with AI.';
    res.status(500).json({ error: message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});