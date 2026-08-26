import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
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
  Code
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  commandType?: string;
}

export const TelegramBotStudio: React.FC = () => {
  const { currentUser, schoolProfile, students, teachers, showToast } = useSchool();
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

    // Simulate bot response
    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase().trim();

      if (lower === '/start' || lower === 'សួស្ដី' || lower === 'hello') {
        replyText = `🙏 សួស្ដី ${currentUser?.nameKhmer || 'លោកគ្រូ អ្នកគ្រូ'}!\n\nអ្នកកំពុងប្រើប្រាស់ **MoEYS Smart Bot** ក្នុងប្រព័ន្ធផ្ទាល់។\nស្ថាប័ន៖ ${schoolProfile.nameKhmer}\nឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}\n\nតើខ្ញុំអាចជួយអ្វីដល់អ្នកថ្ងៃនេះ?`;
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
        replyText = `🤖 **MoEYS Bot Response:**\nខ្ញុំបានទទួលសាររបស់អ្នកថា: "${text}"។\nប្រព័ន្ធបានចងក្រងទិន្នន័យនេះសម្រាប់ស្ថាប័ន ${schoolProfile.nameKhmer} เรียบร้อยហើយ។ លោកអ្នកអាចប្រើប្រាស់ពាក្យបញ្ជា \`/help\` ដើម្បីមើលជំនួយបន្ថែម។`;
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

  return (
    <div className="space-y-6 pb-12 font-battambang max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-700 to-blue-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
            <Bot className="w-9 h-9 text-sky-200 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500/30 text-sky-200 px-3 py-1 rounded-full text-xs font-semibold mb-1 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              In-App Telegram Bot Simulator (@PPTC_Notify_bot)
            </div>
            <h1 className="text-2xl font-bold font-moul">តេលេក្រាមឆាតបតផ្ទាល់ក្នុងកម្មវិធី</h1>
            <p className="text-sky-100 text-sm">
              គ្រប់គ្រង និងជជែកជាមួយ Bot ផ្ទាល់ក្នុងប្រព័ន្ធ (Telegram ID: <span className="font-mono text-amber-300">240224709</span> / @limsorn)។
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold text-emerald-300">Bot Online & Connected</span>
        </div>
      </div>

      {/* Main Chat Interface */}
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
    </div>
  );
};
