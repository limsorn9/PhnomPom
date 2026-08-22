import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client (lazy / server-side safe)
  let aiClient: GoogleGenAI | null = null;
  function getAIClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Content Generator Endpoint
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction, temperature = 0.7, jsonMode = true } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Falling back to local smart generation engine.',
          fallback: true,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction:
            systemInstruction ||
            'You are an expert Cambodian primary and secondary education specialist, instructional designer, and curriculum master (MoEYS curriculum). Produce high quality, practical, pedagogical educational content in natural standard Khmer language.',
          temperature,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      });

      const text = response.text || '';
      let parsedData = null;
      if (jsonMode) {
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = { rawText: text };
        }
      }

      return res.json({
        success: true,
        text,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Gemini generate error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate content with AI',
        fallback: true,
      });
    }
  });

  // AI Teaching Assistant Chat Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured',
          fallback: true,
        });
      }

      const lastMessage = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : '';

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: lastMessage || 'សួស្តី! តើខ្ញុំអាចជួយអ្វីបានខ្លះ?',
        config: {
          systemInstruction:
            systemInstruction ||
            'You are a friendly, encouraging Khmer AI Teaching Assistant for Cambodian school teachers. Provide clear, well-formatted, practical guidance in Khmer language.',
        },
      });

      return res.json({
        success: true,
        reply: response.text || 'សុំទោស ខ្ញុំមិនអាចឆ្លើយតបបានទេនៅពេលនេះ។',
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      return res.status(500).json({
        error: err?.message || 'Chat assistant error',
        fallback: true,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI School Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
