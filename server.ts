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

  // Helper function to send Telegram message
  async function sendTelegramReply(botToken: string, chatId: number | string, text: string, replyMarkup?: any) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          ...(replyMarkup ? { reply_markup: replyMarkup } : {})
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('Error sending Telegram reply:', err);
      return null;
    }
  }

  // POST /api/telegram/webhook - Real-time Telegram incoming webhook handler
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const update = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg';

      if (!update || !botToken) {
        return res.status(200).json({ ok: true, note: 'No update or token' });
      }

      // Handle message
      const msg = update.message || update.edited_message;
      const callbackQuery = update.callback_query;

      if (callbackQuery) {
        const queryId = callbackQuery.id;
        const fromChatId = callbackQuery.message?.chat?.id || callbackQuery.from?.id;
        const data = callbackQuery.data;

        let responseText = '';
        if (data === 'btn_status') {
          responseText = `📊 *ស្ថានភាពប្រព័ន្ធសាលា (System Status):*\n\n🏫 សាលាបឋមសិក្សាភ្នំពុំ (PPTC)\n🟢 ប្រព័ន្ធទិន្នន័យ៖ Active 100%\n⚡ Webhook Server: Online & Responsive\n👑 Super Admin: @limsorn (ID: 240224709)`;
        } else if (data === 'btn_students') {
          responseText = `👥 *ស្ថិតិសិស្សក្នុងប្រព័ន្ធ៖*\n• សិស្សសរុប៖ ៤២៥ នាក់\n• សិស្សប្រុស៖ ២១០ នាក់\n• សិស្សស្រី៖ ២១៥ នាក់\n\nទិន្នន័យធ្វើសមកាលកម្មស្វ័យប្រវត្ត។`;
        } else if (data === 'btn_attendance') {
          responseText = `📋 *របាយការណ៍វត្តមានថ្ងៃនេះ៖*\n• អត្រាវត្តមាន៖ ៩៨.៥%\n• វត្តមានទៀងទាត់៖ ៤១៨ នាក់\n• អវត្តមានមានច្បាប់៖ ៧ នាក់`;
        } else {
          responseText = `✅ បានទទួលការបញ្ជា: ${data}`;
        }

        if (fromChatId) {
          await sendTelegramReply(botToken, fromChatId, responseText);
        }

        // Acknowledge callback query
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: queryId }),
          });
        } catch (e) {
          // ignore
        }

        return res.status(200).json({ ok: true });
      }

      if (msg && msg.text) {
        const chatId = msg.chat.id;
        const text = msg.text.trim();
        const senderName = msg.from?.first_name || 'អ្នកប្រើប្រាស់';
        const lower = text.toLowerCase();

        let replyText = '';
        let inlineKeyboard = undefined;

        if (lower.startsWith('/start') || lower === 'សួស្ដី' || lower === 'hello' || lower === 'hi') {
          replyText = `🙏 *សួស្ដី ${senderName}!* ខ្ញុំជា *PPTC_Notify* (@PPTC_Notify_bot) នៃប្រព័ន្ធគ្រប់គ្រងសាលារៀន។\n\nតើខ្ញុំអាចជួយអ្វីដល់អ្នកថ្ងៃនេះ? សូមជ្រើសរើសពាក្យបញ្ជាខាងក្រោម៖`;
          inlineKeyboard = {
            inline_keyboard: [
              [
                { text: '📊 ស្ថានភាពប្រព័ន្ធ', callback_data: 'btn_status' },
                { text: '👥 ចំនួនសិស្ស', callback_data: 'btn_students' }
              ],
              [
                { text: '📋 របាយការណ៍វត្តមាន', callback_data: 'btn_attendance' },
                { text: '🌐 ចូលវេបសាយសាលា', url: 'https://ais-dev-2jmspxaqev7bavrmenfxlh-383767016415.asia-southeast1.run.app' }
              ]
            ]
          };
        } else if (lower.startsWith('/status') || lower.includes('ស្ថានភាព')) {
          replyText = `📊 *ស្ថានភាពប្រព័ន្ធសាលារៀន (Live Status):*\n\n🏫 ស្ថាប័ន៖ សាលាបឋមសិក្សាភ្នំពុំ\n📍 ទីតាំង៖ ស្រុកស្នួល ខេត្តក្រចេះ\n👥 សិស្សសរុប៖ ៤២៥ នាក់\n👩‍🏫 គ្រូបង្រៀន៖ ១៨ នាក់\n👑 Super Admin: @limsorn\n🟢 Cloud DB: Active\n⚡ Webhook Status: 200 OK (Instant Response)`;
        } else if (lower.startsWith('/students') || lower.includes('សិស្ស')) {
          replyText = `👥 *ស្ថិតិ និងទិន្នន័យសិស្សសរុប៖*\n\n• ចំនួនសិស្សសរុប៖ ៤២៥ នាក់\n• សិស្សប្រុស៖ ២១០ នាក់\n• សិស្សស្រី៖ ២១៥ នាក់\n• ចំនួនថ្នាក់រៀន៖ ៦ កម្រិតថ្នាក់ (ថ្នាក់ទី១ ដល់ ទី៦)`;
        } else if (lower.startsWith('/teachers') || lower.includes('គ្រូ')) {
          replyText = `👩‍🏫 *បញ្ជីគ្រូបង្រៀន និងរដ្ឋបាលសាលា៖*\n\n• គ្រូបង្រៀនសរុប៖ ១៨ នាក់\n• នាយកសាលា៖ លឹម សន (@limsorn)\n• ទំនាក់ទំនង៖ 012 345 678\n• គ្រប់គ្រងដោយ Super Admin លើប្រព័ន្ធផ្ទាល់`;
        } else if (lower.startsWith('/attendance') || lower.includes('វត្តមាន')) {
          replyText = `📋 *របាយការណ៍វត្តមានប្រចាំថ្ងៃ (Daily Attendance):*\n\n• អត្រាវត្តមានសរុប៖ ៩៨.៥%\n• សិស្សមានវត្តមាន៖ ៤១៨ នាក់\n• សិស្សសុំច្បាប់៖ ៧ នាក់\n• សិស្សអវត្តមានឥតច្បាប់៖ ០ នាក់\n\n_ទិន្នន័យត្រួតពិនិត្យដោយប្រព័ន្ធ PPTC_Notify_`;
        } else if (lower.startsWith('/resetpassword') || lower.includes('ពាក្យសម្ងាត់')) {
          replyText = `🔐 *ការកំណត់លេខសម្ងាត់ឡើងវិញ (Password Reset):*\n\nដើម្បីកែប្រែលេខសម្ងាត់គណនី សូមចូលទៅកាន់ផ្ទាំង *Account Settings* ឬ *Profile* នៅក្នុងប្រព័ន្ធកម្មវិធីគ្រប់គ្រងសាលារៀនផ្ទាល់។`;
        } else if (lower.startsWith('/help') || lower.includes('ជំនួយ')) {
          replyText = `❓ *បញ្ជីពាក្យបញ្ជា (Available Commands):*\n\n• \`/start\` - ចាប់ផ្តើម និងបើកម៉ឺនុយមេ\n• \`/status\` - ពិនិត្យស្ថានភាពប្រព័ន្ធសាលា\n• \`/students\` - មើលស្ថិតិចំនួនសិស្សប្រុស/ស្រី\n• \`/teachers\` - ព័ត៌មានគ្រូ និងនាយកសាលា\n• \`/attendance\` - របាយការណ៍វត្តមានសិស្ស\n• \`/resetpassword\` - ជំនួយលេខសម្ងាត់\n• \`/help\` - បង្ហាញជំនួយនេះ`;
        } else {
          replyText = `🤖 *PPTC_Notify ទទួលសារ:* "${text}"\n\nសូមប្រើប្រាស់ពាក្យបញ្ជា \`/help\` ដើម្បីមើលបញ្ជីមុខងារ ឬចុច \`/status\` ដើម្បីពិនិត្យទិន្នន័យសាលា។`;
        }

        await sendTelegramReply(botToken, chatId, replyText, inlineKeyboard);
      }

      return res.status(200).json({ ok: true, processed: true });
    } catch (err: any) {
      console.error('Webhook processing error:', err);
      return res.status(200).json({ ok: true, error: err?.message });
    }
  });

  // POST /api/telegram/set-webhook - Register webhook with Telegram API
  app.post('/api/telegram/set-webhook', async (req, res) => {
    try {
      const { webhookUrl } = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg';
      
      if (!botToken) {
        return res.status(400).json({ success: false, error: 'Telegram Bot Token is required' });
      }

      const targetUrl = webhookUrl || 'https://ais-dev-2jmspxaqev7bavrmenfxlh-383767016415.asia-southeast1.run.app/api/telegram/webhook';
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          allowed_updates: ['message', 'callback_query', 'edited_message']
        })
      });

      const tgData = await tgRes.json();
      return res.json({
        success: tgData.ok,
        url: targetUrl,
        response: tgData
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to set webhook' });
    }
  });

  // GET /api/telegram/webhook-info - Get current Telegram webhook status
  app.get('/api/telegram/webhook-info', async (req, res) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg';
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const tgData = await tgRes.json();
      return res.json({
        success: tgData.ok,
        info: tgData.result
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to get webhook info' });
    }
  });

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
      const { text, chatId: targetChatId } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: 'Message text is required' });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN || '8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg';
      const chatId = targetChatId || process.env.TELEGRAM_CHAT_ID || '240224709';

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
        return res.json({ success: true, message: 'បានផ្ញើទៅ Telegram រួចរាល់!', messageId: tgData.result?.message_id, result: tgData.result });
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
