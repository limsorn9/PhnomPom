import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2, 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAssistantSidePanel: React.FC<Props> = ({ isOpen, onToggle }) => {
  const { currentUser } = useSchool();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `សួស្តីលោកគ្រូ/អ្នកគ្រូ ${currentUser?.nameKhmer || ''}! ខ្ញុំជា AI ជំនួយការបង្រៀន (AI Teaching Assistant)។ តើខ្ញុំអាចជួយរៀបចំកិច្ចតែងការ ស្លាយ កម្មវិធីសិក្សា ឬតេស្តសម្រាប់ថ្នាក់រៀនថ្ងៃនេះយ៉ាងដូចម្តេចដែរ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '💡 ស្នើសុំសកម្មភាពបង្រៀនសិស្សរៀនយឺត',
    '📝 ជួយបង្កើតលំហាត់ត្រិះរិះគណិតវិទ្យា',
    '🎯 ណែនាំវិធីសាស្ត្រគ្រប់គ្រងវិន័យក្នុងថ្នាក់',
    '🎨 ស្នើគំនិតល្បែងសិក្សា ៥ នាទីចុងម៉ោង'
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
          })),
          systemInstruction: 'You are an experienced, pedagogical Cambodian school teaching expert. Always answer in natural, encouraging Khmer language with clear formatting and bullet points.'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
          return;
        }
      }
      throw new Error('API offline');
    } catch (err) {
      // Fallback smart response
      setTimeout(() => {
        const fallbackReply = generateFallbackKhmerAdvice(query);
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  function generateFallbackKhmerAdvice(q: string): string {
    if (q.includes('សិស្សរៀនយឺត') || q.includes('ខ្សោយ')) {
      return `📌 **អនុសាសន៍គរុកោសល្យសម្រាប់សិស្សរៀនយឺត៖**\n\n1. **ប្រើប្រាស់រូបភាព និងសម្ភារៈរូបី៖** ជំនួសឱ្យការពន្យល់ទ្រឹស្តីសុទ្ធ ចូរឱ្យសិស្សបានកាន់ ឬមើលវត្ថុជាក់ស្តែង។\n2. **បង្រៀនជាដៃគូ (Peer Tutoring)៖** ចាត់តាំងសិស្សពូកែម្នាក់ឱ្យជួយណែនាំ និងពិភាក្សាជាមួយសិស្សរៀនយឺត។\n3. **បំបែកលំហាត់ជាជំហានតូចៗ៖** កុំដាក់លំហាត់វែងភ្លាមៗ ចូរចាប់ផ្តើមពីកម្រិតងាយបំផុតដើម្បីបង្កើតទំនុកចិត្ត។\n4. **ការលើកទឹកចិត្តជាប្រចាំ៖** ផ្តល់ពាក្យសរសើរ និងផ្កាយលើកទឹកចិត្តរាល់ពេលដែលពួកគាត់ខិតខំប្រឹងប្រែង។`;
    }
    if (q.includes('វិន័យ') || q.includes('គ្រប់គ្រង')) {
      return `🛡️ **គន្លឹះគ្រប់គ្រងវិន័យ និងបរិយាកាសថ្នាក់រៀន៖**\n\n1. **បង្កើតកិច្ចសន្យាថ្នាក់រៀនរួមគ្នា៖** ឱ្យសិស្សចូលរួមបង្កើតបទបញ្ជា ៣-៤ ចំណុចនៅដើមឆ្នាំ។\n2. **ប្រើសញ្ញាស្ងាត់ (Silent Signal)៖** លើកដៃ ឬទះដៃតាមចង្វាក់ ជំនួសឱ្យការស្រែកគំហក។\n3. **ផ្តោតលើឥរិយាបថវិជ្ជមាន៖** សរសើរសិស្សដែលកំពុងអង្គុយស្ងៀមជាគំរូដល់សិស្សដទៃ។\n4. **ផ្តល់ពេលសម្រាកខួរក្បាល (Brain Breaks)៖** បញ្ចូលចលនារាងកាយ ២ នាទីនៅពាក់កណ្តាលម៉ោងសិក្សា។`;
    }
    return `✨ **ការណែនាំពី AI Teaching Assistant៖**\n\nខ្ញុំបានកត់ត្រានូវសំណើរបស់អ្នកគ្រូ/លោកគ្រូ។ ដើម្បីឱ្យការបង្រៀនកាន់តែមានប្រសិទ្ធភាព លោកគ្រូអ្នកគ្រូអាចប្រើប្រាស់មុខងារ **«បង្កើតកិច្ចតែងការ & ស្លាយ»** ឬ **«ល្បែងសិក្សាឌីជីថល»** ក្នុងផ្ទាំងខាងឆ្វេង ដើម្បីឱ្យ AI រៀបចំកញ្ចប់មេរៀនពេញលេញបានភ្លាមៗ!`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-full max-w-sm sm:max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col h-[560px] overflow-hidden animate-fadeIn">
      {/* Top Title Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-moul">AI ជំនួយការគ្រូបង្រៀន</h4>
            <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
              ● ត្រៀមខ្លួនជួយ ២៤/៧
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
              m.sender === 'ai' ? 'bg-blue-900 text-white' : 'bg-amber-600 text-white'
            }`}>
              {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-900 text-white rounded-tr-xs'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
            }`}>
              <div className="whitespace-pre-line">{m.text}</div>
              <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'} text-right`}>
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span>AI កំពុងគិត និងរៀបចំចម្លើយ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-lg whitespace-nowrap transition-all border border-slate-200 text-[10px] font-medium"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder="សួរសំណួរ ឬស្នើសុំជំនួយពី AI..."
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
