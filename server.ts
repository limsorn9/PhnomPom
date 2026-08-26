import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

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

  // Telegram Bot Confirmation Code Store
  const telegramCodes = new Map<string, { code: string; expires: number }>();

  // POST /api/telegram/generate-code
  app.post('/api/telegram/generate-code', async (req, res) => {
    try {
      const { identifier, actionDescription } = req.body;
      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Identifier (username or email) is required' });
      }

      // Generate random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 5 * 60 * 1000; // valid for 5 minutes
      telegramCodes.set(identifier, { code, expires });

      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg';
      const chatId = process.env.TELEGRAM_CHAT_ID || '240224709';

      let sentViaTelegram = false;
      if (botToken && chatId) {
        try {
          const actionText = actionDescription ? `\n🎯 *សកម្មភាពរដ្ឋបាល:* ${actionDescription}` : '';
          const telegramMsg = `🔐 *សាលាបឋមសិក្សាភ្នំពុំ* - កូដសម្ងាត់ផ្ទៀងផ្ទាត់ (Verification Code):${actionText}\n\n\`${code}\`\n\nកូដនេះមានសុពលភាពរយៈពេល ៥ នាទី។ សូមកុំប្រាប់អ្នកដទៃ។`;
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: telegramMsg,
              parse_mode: 'Markdown',
            }),
          });
          const tgData = await tgRes.json();
          if (tgData.ok) {
            sentViaTelegram = true;
          }
        } catch (tgErr) {
          console.error('Telegram API send error:', tgErr);
        }
      }

      return res.json({
        success: true,
        sentViaTelegram,
        message: sentViaTelegram
          ? 'កូដបញ្ជាក់ត្រូវបានបញ្ជូនទៅកាន់ Telegram Bot ដោយជោគជ័យ!'
          : 'បានបង្កើតកូដបញ្ជាក់ (Telegram Bot មិនទាន់កំណត់ Token គឺប្រើប្រាស់កូដ Demo ខាងក្រោម)',
        // For testing/demonstration convenience if bot is not configured:
        debugCode: sentViaTelegram ? undefined : code,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to generate code' });
    }
  });

  // POST /api/telegram/send-notification
  app.post('/api/telegram/send-notification', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: 'Message text is required' });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg';
      const chatId = process.env.TELEGRAM_CHAT_ID || '240224709';

      if (!botToken || !chatId) {
        return res.json({
          success: true,
          message: 'បានរក្សាទុកដំណឹង (Telegram Token មិនទាន់ត្រូវបានកំណត់ក្នុង .env)',
          simulated: true,
        });
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });
      const tgData = await tgRes.json();
      if (tgData.ok) {
        return res.json({ success: true, message: 'បានផ្ញើទៅ Telegram រួចរាល់!', messageId: tgData.result?.message_id });
      } else {
        return res.status(500).json({ success: false, error: tgData.description || 'Telegram API Error' });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to send notification' });
    }
  });

  // POST /api/telegram/verify-code
  app.post('/api/telegram/verify-code', (req, res) => {
    try {
      const { identifier, code } = req.body;
      if (!identifier || !code) {
        return res.status(400).json({ success: false, error: 'Identifier and code are required' });
      }

      const record = telegramCodes.get(identifier);
      if (!record) {
        return res.status(400).json({ success: false, error: 'រកមិនឃើញកូដបញ្ជាក់ ឬកូដបានផុតកំណត់ហើយ។ សូមស្នើសុំកូដថ្មី។' });
      }

      if (Date.now() > record.expires) {
        telegramCodes.delete(identifier);
        return res.status(400).json({ success: false, error: 'កូដបញ្ជាក់បានផុតសុពលភាព (៥នាទី)។ សូមស្នើសុំកូដថ្មី។' });
      }

      if (record.code !== code.trim()) {
        return res.status(400).json({ success: false, error: 'កូដបញ្ជាក់មិនត្រឹមត្រូវ។ សូមព្យាយាមម្ដងទៀត។' });
      }

      // Success
      telegramCodes.delete(identifier);
      return res.json({ success: true, message: 'បញ្ជាក់កូដតាម Telegram ជោគជ័យ!' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Verification failed' });
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
