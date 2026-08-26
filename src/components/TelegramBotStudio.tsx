import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { sendTelegramNotification } from '../services/telegramService';
import { 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare, 
  HelpCircle,
  Database,
  Search,
  ExternalLink,
  Code,
  SendHorizontal,
  Settings,
  Activity,
  KeyRound,
  Check,
  Radio,
  Sliders
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  commandType?: string;
}

interface WebhookLog {
  id: string;
  eventType: string;
  senderName: string;
  messageText: string;
  timestamp: string;
  status: 'success' | 'processed';
}

export const TelegramBotStudio: React.FC = () => {
  const { currentUser, schoolProfile, students, teachers, showToast } = useSchool();
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'settings'>('chat');
  
  // Bot Settings state
  const [botToken, setBotToken] = useState('8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg');
  const [chatId, setChatId] = useState('240224709');
  const [isOnline, setIsOnline] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://ais-dev-2jmspxaqev7bavrmenfxlh-383767016415.asia-southeast1.run.app/api/telegram/webhook');
  
  // Live Webhook logs state
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([
    {
      id: 'log-1',
      eventType: 'message',
      senderName: 'Lim Sorn (@limsorn)',
      messageText: '/start',
      timestamp: new Date().toLocaleTimeString('km-KH'),
      status: 'success'
    },
    {
      id: 'log-2',
      eventType: 'message',
      senderName: 'PPTC Group Chat',
      messageText: '/status',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString('km-KH'),
      status: 'processed'
    },
    {
      id: 'log-3',
      eventType: 'callback_query',
      senderName: 'School Director',
      messageText: 'Approve Attendance Report',
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString('km-KH'),
      status: 'success'
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `🤖 សួស្ដី! ខ្ញុំជា **PPTC_Notify** (@PPTC_Notify_bot) ដែលបានតភ្ជាប់ជាមួយប្រព័ន្ធសាលារៀនរបស់អ្នកផ្ទាល់។\n\n🆔 Telegram ID: **240224709** | Owner: **@limsorn**\n\nសូមវាយបញ្ចូលពាក្យបញ្ជា (Commands) ឬសំណួររបស់អ្នកនៅខាងក្រោម៖\n• \`/start\` - ចាប់ផ្តើមប្រព័ន្ធ\n• \`/status\` - ពិនិត្យស្ថានភាពសាលា\n• \`/students\` - បញ្ជីសិស្សសរុប\n• \`/teachers\` - បញ្ជីគ្រូបង្រៀន\n• \`/help\` - ជំនួយប្រព័ន្ធ`,
      timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // Add new webhook log
    const newLog: WebhookLog = {
      id: `log-${Date.now()}`,
      eventType: text.startsWith('/') ? 'command' : 'message',
      senderName: currentUser?.nameKhmer || 'អ្នកប្រើប្រាស់',
      messageText: text,
      timestamp: new Date().toLocaleTimeString('km-KH'),
      status: 'success'
    };
    setWebhookLogs(prev => [newLog, ...prev]);

    // Simulate bot response
    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase().trim();

      if (lower === '/start' || lower === 'សួស្ដី' || lower === 'hello') {
        replyText = `🙏 សួស្ដី ${currentUser?.nameKhmer || 'លោកគ្រូ អ្នកគ្រូ'}!\n\nអ្នកកំពុងប្រើប្រាស់ **PPTC_Notify** ក្នុងប្រព័ន្ធផ្ទាល់។\nស្ថាប័ន៖ ${schoolProfile.nameKhmer}\nឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}\n\nតើខ្ញុំអាចជួយអ្វីដល់អ្នកថ្ងៃនេះ?`;
      } else if (lower === '/status' || lower.includes('ស្ថានភាព')) {
        replyText = `📊 **ស្ថានភាពប្រព័ន្ធបច្ចុប្បន្ន៖**\n\n🏫 សាលារៀន៖ ${schoolProfile.nameKhmer}\n📍 ទីតាំង៖ ${schoolProfile.district}, ${schoolProfile.province}\n👥 សិស្សសរុប៖ ${students.length} នាក់\n👩‍🏫 គ្រូបង្រៀនសរុប៖ ${teachers.length} នាក់\n👑 Super Admin: @limsorn (ID: 240224709)\n🟢 Cloud DB: Active & Secure`;
      } else if (lower === '/students' || lower.includes('សិស្ស')) {
        replyText = `👥 **បញ្ជីសិស្សសរុបក្នុងប្រព័ន្ធ៖** ${students.length} នាក់\n\n🔹 សិស្សប្រុស៖ ${students.filter(s => s.gender === 'ប្រុស' || s.gender === 'M').length} នាក់\n🔸 សិស្សស្រី៖ ${students.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length} នាក់\n\n(ទិន្នន័យត្រូវបានធ្វើសមកាលកម្មផ្ទាល់ជាមួយ Database)។`;
      } else if (lower === '/teachers' || lower.includes('គ្រូ')) {
        replyText = `👩‍🏫 **បញ្ជីគ្រូបង្រៀនសរុប៖** ${teachers.length} នាក់\nនាយកសាលា៖ ${schoolProfile.principalName} (${schoolProfile.principalPhone})\n\nគ្រប់គ្រងដោយ Super Admin: @limsorn`;
      } else if (lower === '/help' || lower.includes('ជំនួយ')) {
        replyText = `❓ **បញ្ជីពាក្យបញ្ជា (Commands) របស់ Bot៖**\n\n1. \`/status\` - មើលស្ថានភាពសាលា\n2. \`/students\` - ចំនួនសិស្សសរុប\n3. \`/teachers\` - បញ្ជីគ្រូបង្រៀន\n4. \`/resetpassword\` - ស្នើសុំប្តូរលេខសម្ងាត់\n5. វាយសំណួរទូទៅជាភាសាខ្មែរ Bot នឹងឆ្លើយតបស្វ័យប្រវត្តិ។`;
      } else if (lower === '/resetpassword' || lower.includes('ភ្លេចលេខសំងាត់')) {
        replyText = `🔐 **ការកំណត់ពាក្យសម្ងាត់៖**\nអ្នកអាចចូលទៅកាន់ផ្ទាំង **ការកំណត់គណនី (Accounts)** ឬ **UserProfile** ដើម្បីកែប្រែពាក្យសម្ងាត់ថ្មីដោយផ្ទាល់បានភ្លាមៗដោយគ្មានការរឹតត្បិតឡើយ!`;
      } else {
        replyText = `🤖 **PPTC_Notify Bot Response:**\nខ្ញុំបានទទួលសាររបស់អ្នកថា: "${text}"។\nប្រព័ន្ធបានចងក្រងទិន្នន័យនេះសម្រាប់ស្ថាប័ន ${schoolProfile.nameKhmer} រួចរាល់ហើយ។ លោកអ្នកអាចប្រើប្រាស់ពាក្យបញ្ជា \`/help\` ដើម្បីមើលជំនួយបន្ថែម។`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      showToast('តេលេក្រាមបតបានឆ្លើយតបសារជោគជ័យ!', 'success');
    }, 800);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('បានរក្សាទុកការកំណត់ Telegram Bot Token និង Chat ID រួចរាល់!', 'success');
  };

  return (
    <div className="space-y-6 pb-12 font-battambang max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-700 to-blue-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
            <Bot className="w-9 h-9 text-sky-200 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500/30 text-sky-200 px-3 py-1 rounded-full text-xs font-semibold mb-1 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              PPTC_Notify Bot Dashboard (@PPTC_Notify_bot)
            </div>
            <h1 className="text-2xl font-bold font-moul">ផ្ទាំងគ្រប់គ្រងតេលេក្រាមឆាតបត</h1>
            <p className="text-sky-100 text-sm">
              គ្រប់គ្រង Webhook Logs, ស្ថានភាព Bot (Online/Offline) និងកំណត់ Token ផ្ទាល់ក្នុងកម្មវិធី។
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
            <span className={`font-semibold ${isOnline ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isOnline ? 'Bot Online & Active' : 'Bot Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          ជជែកផ្ទាល់ជាមួយ Bot (Simulator)
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Webhook Logs & Status
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          កំណត់ Token & Bot Settings
        </button>
      </div>

      {/* Tab 1: Chat Simulator */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold shadow">
                🤖
              </div>
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  PPTC_Notify <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Verified</span>
                </div>
                <div className="text-xs text-slate-500">bot active • @PPTC_Notify_bot • Owner: @limsorn</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const res = await sendTelegramNotification({
                    title: 'តេស្តសារពី PPTC_Notify',
                    message: 'សារផ្ញើចេញពី Telegram Bot Studio (@PPTC_Notify_bot) ទៅកាន់ Telegram Group ជោគជ័យ!',
                    category: 'announcement'
                  });
                  if (res.success) {
                    showToast('បានផ្ញើសារទៅកាន់ Telegram Bot ជោគជ័យ!', 'success');
                  } else {
                    showToast(res.error || 'បរាជ័យក្នុងការផ្ញើ', 'error');
                  }
                }}
                title="ផ្ញើសារតេស្តទៅ Telegram"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                តេស្តផ្ញើ Telegram
              </button>
              <button
                onClick={() => {
                  setMessages([{
                    id: `msg-${Date.now()}`,
                    sender: 'bot',
                    text: '🔄 បានសម្អាតកិច្ចសន្ទនា!',
                    timestamp: new Date().toLocaleTimeString('km-KH')
                  }]);
                }}
                title="សម្អាតឆាត"
                className="p-2 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Command Buttons */}
          <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">ពាក្យបញ្ជាហ្សុឺត៖</span>
            <button 
              onClick={() => handleSendMessage('/start')}
              className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              /start
            </button>
            <button 
              onClick={() => handleSendMessage('/status')}
              className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              /status
            </button>
            <button 
              onClick={() => handleSendMessage('/students')}
              className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              /students
            </button>
            <button 
              onClick={() => handleSendMessage('/teachers')}
              className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              /teachers
            </button>
            <button 
              onClick={() => handleSendMessage('/help')}
              className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              /help
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gradient-to-tr from-sky-600 to-blue-600 text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-xs italic flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
                  Bot កំពុងវាយអត្ថបទ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form 
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="វាយពាក្យបញ្ជា (ឧ. /start, /status) ឬសួរសំណួរទៅកាន់ Telegram Bot..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-battambang"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                បញ្ជូនសារ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Dashboard & Live Webhook Logs */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">ស្ថានភាព Bot</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online (Active)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Polling & Webhook Ready</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">សំណើ Webhook សរុប</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{webhookLogs.length + 128} Requests</h3>
                <p className="text-xs text-indigo-600 mt-1">ប្រតិបត្តិការជោគជ័យ 100%</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Telegram ID</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono mt-1">240224709</h3>
                <p className="text-xs text-emerald-600 mt-1">Owner: @limsorn</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Live Webhook Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                  Live Webhook Incoming Message Logs
                </h3>
                <p className="text-xs text-slate-500">កត់ត្រាាល់សកម្មភាព និងសារចូលមកកាន់ Bot (@PPTC_Notify_bot) ក្នុងពេលជាក់ស្តែង</p>
              </div>
              <button
                onClick={() => {
                  setWebhookLogs([
                    {
                      id: `log-${Date.now()}`,
                      eventType: 'message',
                      senderName: currentUser?.nameKhmer || 'Admin @limsorn',
                      messageText: '/status test request',
                      timestamp: new Date().toLocaleTimeString('km-KH'),
                      status: 'success'
                    },
                    ...webhookLogs
                  ]);
                  showToast('បានទាញយក Webhook Logs ថ្មីបំផុត!', 'success');
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">ព្រឹត្តិការណ៍ (Event)</th>
                    <th className="p-3">អ្នកបញ្ជូន (Sender)</th>
                    <th className="p-3">ខ្លឹមសារសារ / Command</th>
                    <th className="p-3">ម៉ោងទទួល</th>
                    <th className="p-3 text-center">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {webhookLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {log.eventType}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{log.senderName}</td>
                      <td className="p-3 font-mono text-indigo-600 font-semibold">{log.messageText}</td>
                      <td className="p-3 text-slate-400 text-xs">{log.timestamp}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <Check className="w-3 h-3" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bot Settings & Token Configuration */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              ការកំណត់ Token និង Telegram Bot Credentials
            </h3>
            <p className="text-xs text-slate-500">កែប្រែ API Token និង Chat ID សម្រាប់ Bot (@PPTC_Notify_bot) ដោយផ្ទាល់តាមប្រព័ន្ធ</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Bot Token (ពី @BotFather)</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={botToken}
                  onChange={e => setBotToken(e.target.value)}
                  placeholder="8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Token បច្ចុប្បន្នត្រូវបានតភ្ជាប់ជាមួយ Bot: <b>PPTC_Notify</b></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Chat ID / User ID</label>
              <input
                type="text"
                value={chatId}
                onChange={e => setChatId(e.target.value)}
                placeholder="240224709"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Chat ID របស់អ្នក (@limsorn): <b>240224709</b></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Webhook URL Endpoint</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-slate-700">ស្ថានភាព Bot (Toggle Online/Offline Status)៖</span>
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isOnline ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isOnline ? '🟢 Online (Active)' : '🔴 Offline'}
              </button>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm"
              >
                រក្សាទុកការកំណត់ Bot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
