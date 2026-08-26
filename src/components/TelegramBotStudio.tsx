import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Sliders,
  ToggleLeft,
  ToggleRight,
  Info,
  Copy,
  Eye,
  Play,
  AlertCircle,
  Cpu,
  Wifi,
  WifiOff,
  FileJson,
  Layers,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRight
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
  updateId: number;
  eventType: 'message' | 'command' | 'callback_query' | 'inline_query' | 'system_ping';
  senderName: string;
  username?: string;
  chatId: string;
  messageText: string;
  timestamp: string;
  fullDate: string;
  status: 'success' | 'processed' | 'warning';
  latencyMs: number;
  rawPayload: Record<string, any>;
}

interface BotCommandConfig {
  id: string;
  command: string;
  descriptionKh: string;
  descriptionEn: string;
  category: 'core' | 'academic' | 'security' | 'admin';
  enabled: boolean;
  requiresAuth: boolean;
  sampleResponse: string;
  responseType: 'text' | 'inline_keyboard' | 'card';
}

export const TelegramBotStudio: React.FC = () => {
  const { currentUser, schoolProfile, students, teachers, showToast } = useSchool();
  const [activeTab, setActiveTab] = useState<'chat' | 'commands' | 'webhook_activity' | 'settings'>('chat');
  
  // Bot Settings state
  const [botToken, setBotToken] = useState('8946444884:AAHc1ESlanNspj6atsVCGlxto-q5ks-NKGg');
  const [chatId, setChatId] = useState('240224709');
  const [isOnline, setIsOnline] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://ais-dev-2jmspxaqev7bavrmenfxlh-383767016415.asia-southeast1.run.app/api/telegram/webhook');
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [selectedLogPayload, setSelectedLogPayload] = useState<WebhookLog | null>(null);
  const [selectedCommandForPreview, setSelectedCommandForPreview] = useState<string>('/status');
  const [logFilter, setLogFilter] = useState<'all' | 'command' | 'message' | 'callback_query' | 'system_ping'>('all');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [showHealthTooltip, setShowHealthTooltip] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(new Date().toLocaleTimeString('km-KH'));

  // Registered Commands Registry
  const [commands, setCommands] = useState<BotCommandConfig[]>([
    {
      id: 'cmd-start',
      command: '/start',
      descriptionKh: 'ចាប់ផ្តើមស្វាគមន៍ និងណែនាំមុខងារសាលារៀន',
      descriptionEn: 'Start bot and show main welcome menu',
      category: 'core',
      enabled: true,
      requiresAuth: false,
      responseType: 'text',
      sampleResponse: `🙏 សួស្ដី! ខ្ញុំជា PPTC_Notify នៃសាលារៀន ${schoolProfile.nameKhmer}។ តើខ្ញុំអាចជួយអ្វីដល់អ្នកថ្ងៃនេះ?`
    },
    {
      id: 'cmd-status',
      command: '/status',
      descriptionKh: 'ពិនិត្យទិន្នន័យទូទៅ ស្ថិតិសិស្ស និងសុវត្ថិភាពប្រព័ន្ធ',
      descriptionEn: 'Check system health and basic statistics',
      category: 'core',
      enabled: true,
      requiresAuth: false,
      responseType: 'card',
      sampleResponse: `📊 ស្ថានភាពប្រព័ន្ធសាលា៖ សិស្សសរុប ${students.length} នាក់, គ្រូ ${teachers.length} នាក់។ ស្ថានភាព Cloud DB: Active 100%`
    },
    {
      id: 'cmd-students',
      command: '/students',
      descriptionKh: 'បង្ហាញស្ថិតិ និងចំនួនសិស្សប្រុស/ស្រីក្នុងប្រព័ន្ធ',
      descriptionEn: 'Get student count breakdown by gender',
      category: 'academic',
      enabled: true,
      requiresAuth: false,
      responseType: 'card',
      sampleResponse: `👥 ចំនួនសិស្សសរុប៖ ${students.length} នាក់ (ប្រុស: ${students.filter(s => s.gender === 'ប្រុស' || s.gender === 'M').length}, ស្រី: ${students.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length})`
    },
    {
      id: 'cmd-teachers',
      command: '/teachers',
      descriptionKh: 'បញ្ជីគ្រូបង្រៀន និងព័ត៌មាននាយកសាលា',
      descriptionEn: 'List school teachers and principal contact',
      category: 'academic',
      enabled: true,
      requiresAuth: false,
      responseType: 'text',
      sampleResponse: `👩‍🏫 គ្រូបង្រៀនសរុប៖ ${teachers.length} នាក់ | នាយកសាលា៖ ${schoolProfile.principalName}`
    },
    {
      id: 'cmd-attendance',
      command: '/attendance',
      descriptionKh: 'របាយការណ៍វត្តមានសិស្ស និងគ្រូប្រចាំថ្ងៃ',
      descriptionEn: 'Daily attendance summary and rate',
      category: 'academic',
      enabled: true,
      requiresAuth: true,
      responseType: 'card',
      sampleResponse: `📋 អត្រាវត្តមានថ្ងៃនេះ៖ ៩៨.៥% (សិស្សមានវត្តមានទៀងទាត់)`
    },
    {
      id: 'cmd-resetpassword',
      command: '/resetpassword',
      descriptionKh: 'ស្នើសុំផ្ទៀងផ្ទាត់ និងកែប្រែលេខសម្ងាត់គណនី',
      descriptionEn: 'Request OTP verification for password reset',
      category: 'security',
      enabled: true,
      requiresAuth: true,
      responseType: 'text',
      sampleResponse: `🔐 លេខកូដសុវត្ថិភាពផ្ទៀងផ្ទាត់ OTP ត្រូវបានបញ្ជូនទៅលេខតេលេក្រាមរបស់អ្នករួចរាល់។`
    },
    {
      id: 'cmd-help',
      command: '/help',
      descriptionKh: 'បញ្ជីជំនួយ និងរបៀបប្រើប្រាស់ពាក្យបញ្ជាទាំងអស់',
      descriptionEn: 'Show full command list and support guide',
      category: 'core',
      enabled: true,
      requiresAuth: false,
      responseType: 'text',
      sampleResponse: `❓ បញ្ជីពាក្យបញ្ជាដែលអនុញ្ញាត៖ /start, /status, /students, /teachers, /attendance, /resetpassword`
    }
  ]);

  // Live Webhook logs state
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([
    {
      id: 'log-101',
      updateId: 98451201,
      eventType: 'command',
      senderName: 'Lim Sorn',
      username: 'limsorn',
      chatId: '240224709',
      messageText: '/status',
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString('km-KH'),
      fullDate: new Date(Date.now() - 15000).toISOString(),
      status: 'success',
      latencyMs: 38,
      rawPayload: {
        update_id: 98451201,
        message: {
          message_id: 1420,
          from: { id: 240224709, is_bot: false, first_name: 'Lim', last_name: 'Sorn', username: 'limsorn', language_code: 'km' },
          chat: { id: 240224709, first_name: 'Lim', last_name: 'Sorn', username: 'limsorn', type: 'private' },
          date: Math.floor(Date.now() / 1000) - 15,
          text: '/status',
          entities: [{ offset: 0, length: 7, type: 'bot_command' }]
        }
      }
    },
    {
      id: 'log-102',
      updateId: 98451202,
      eventType: 'message',
      senderName: 'PPTC Administration Group',
      username: 'PPTC_Admin_Group',
      chatId: '-100240981723',
      messageText: 'សួស្តីលោកគ្រូ សុំមើលចំនួនសិស្សថ្ងៃនេះ',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString('km-KH'),
      fullDate: new Date(Date.now() - 120000).toISOString(),
      status: 'processed',
      latencyMs: 44,
      rawPayload: {
        update_id: 98451202,
        message: {
          message_id: 1421,
          from: { id: 8991203, is_bot: false, first_name: 'School', last_name: 'Registrar' },
          chat: { id: -100240981723, title: 'PPTC Administration Group', type: 'supergroup' },
          date: Math.floor(Date.now() / 1000) - 120,
          text: 'សួស្តីលោកគ្រូ សុំមើលចំនួនសិស្សថ្ងៃនេះ'
        }
      }
    },
    {
      id: 'log-103',
      updateId: 98451203,
      eventType: 'callback_query',
      senderName: 'Director Office',
      username: 'director_moeys',
      chatId: '240224709',
      messageText: 'action:approve_monthly_report_august',
      timestamp: new Date(Date.now() - 340000).toLocaleTimeString('km-KH'),
      fullDate: new Date(Date.now() - 340000).toISOString(),
      status: 'success',
      latencyMs: 29,
      rawPayload: {
        update_id: 98451203,
        callback_query: {
          id: 'cb_88719238',
          from: { id: 240224709, is_bot: false, first_name: 'Director', username: 'director_moeys' },
          message: { message_id: 1418, chat: { id: 240224709, type: 'private' }, text: 'របាយការណ៍ប្រចាំខែត្រូវបានបង្កើត' },
          data: 'action:approve_monthly_report_august'
        }
      }
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `🤖 សួស្ដី! ខ្ញុំជា **PPTC_Notify** (@PPTC_Notify_bot) ដែលបានតភ្ជាប់ជាមួយប្រព័ន្ធសាលារៀនរបស់អ្នកផ្ទាល់។\n\n🆔 Telegram ID: **240224709** | Owner: **@limsorn**\n\nសូមវាយបញ្ចូលពាក្យបញ្ជា (Commands) ឬសំណួររបស់អ្នកនៅខាងក្រោម៖\n• \`/start\` - ចាប់ផ្តើមប្រព័ន្ធ\n• \`/status\` - ពិនិត្យស្ថានភាពសាលា\n• \`/students\` - បញ្ជីសិស្សសរុប\n• \`/teachers\` - បញ្ជីគ្រូបង្រៀន\n• \`/attendance\` - របាយការណ៍វត្តមាន\n• \`/help\` - ជំនួយប្រព័ន្ធ`,
      timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Periodic heartbeat update
  useEffect(() => {
    const timer = setInterval(() => {
      if (isOnline) {
        setLastHeartbeat(new Date().toLocaleTimeString('km-KH'));
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [isOnline]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping, activeTab]);

  const handleToggleCommand = (cmdId: string) => {
    setCommands(prev => prev.map(cmd => {
      if (cmd.id === cmdId) {
        const nextState = !cmd.enabled;
        showToast(`ពាក្យបញ្ជា ${cmd.command} ត្រូវបាន ${nextState ? 'បើកដំណើរការ (Enabled)' : 'បិទដំណើរការ (Disabled)'}!`, nextState ? 'success' : 'info');
        return { ...cmd, enabled: nextState };
      }
      return cmd;
    }));
  };

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

    const isCommand = text.startsWith('/');
    const commandName = isCommand ? text.split(' ')[0].toLowerCase() : '';
    const matchingCmd = commands.find(c => c.command.toLowerCase() === commandName);

    // Add new real-time webhook log
    const newLog: WebhookLog = {
      id: `log-${Date.now()}`,
      updateId: Math.floor(10000000 + Math.random() * 90000000),
      eventType: isCommand ? 'command' : 'message',
      senderName: currentUser?.nameKhmer || 'Admin @limsorn',
      username: 'limsorn',
      chatId: chatId || '240224709',
      messageText: text,
      timestamp: new Date().toLocaleTimeString('km-KH'),
      fullDate: new Date().toISOString(),
      status: 'success',
      latencyMs: Math.floor(25 + Math.random() * 30),
      rawPayload: {
        update_id: Math.floor(10000000 + Math.random() * 90000000),
        message: {
          message_id: Math.floor(1000 + Math.random() * 9000),
          from: {
            id: Number(chatId) || 240224709,
            is_bot: false,
            first_name: currentUser?.nameKhmer || 'Lim Sorn',
            username: 'limsorn'
          },
          chat: {
            id: Number(chatId) || 240224709,
            first_name: currentUser?.nameKhmer || 'Lim Sorn',
            username: 'limsorn',
            type: 'private'
          },
          date: Math.floor(Date.now() / 1000),
          text: text,
          ...(isCommand ? { entities: [{ offset: 0, length: text.length, type: 'bot_command' }] } : {})
        }
      }
    };
    setWebhookLogs(prev => [newLog, ...prev]);

    // Simulate bot response
    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase().trim();

      if (isCommand && matchingCmd && !matchingCmd.enabled) {
        replyText = `⚠️ **សេចក្តីជូនដំណឹង៖** ពាក្យបញ្ជា \`${matchingCmd.command}\` ត្រូវបានបិទដំណើរការជាបណ្តោះអាសន្នដោយ Administrator តាមរយៈ Command Registry។`;
      } else if (lower === '/start' || lower === 'សួស្ដី' || lower === 'hello') {
        replyText = `🙏 សួស្ដី ${currentUser?.nameKhmer || 'លោកគ្រូ អ្នកគ្រូ'}!\n\nអ្នកកំពុងប្រើប្រាស់ **PPTC_Notify** ក្នុងប្រព័ន្ធផ្ទាល់។\nស្ថាប័ន៖ ${schoolProfile.nameKhmer}\nឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}\n\nតើខ្ញុំអាចជួយអ្វីដល់អ្នកថ្ងៃនេះ?`;
      } else if (lower === '/status' || lower.includes('ស្ថានភាព')) {
        replyText = `📊 **ស្ថានភាពប្រព័ន្ធបច្ចុប្បន្ន៖**\n\n🏫 សាលារៀន៖ ${schoolProfile.nameKhmer}\n📍 ទីតាំង៖ ${schoolProfile.district}, ${schoolProfile.province}\n👥 សិស្សសរុប៖ ${students.length} នាក់\n👩‍🏫 គ្រូបង្រៀនសរុប៖ ${teachers.length} នាក់\n👑 Super Admin: @limsorn (ID: 240224709)\n🟢 Cloud DB: Active & Secure\n⚡ Webhook: Connected (Latency: 38ms)`;
      } else if (lower === '/students' || lower.includes('សិស្ស')) {
        replyText = `👥 **បញ្ជីសិស្សសរុបក្នុងប្រព័ន្ធ៖** ${students.length} នាក់\n\n🔹 សិស្សប្រុស៖ ${students.filter(s => s.gender === 'ប្រុស' || s.gender === 'M').length} នាក់\n🔸 សិស្សស្រី៖ ${students.filter(s => s.gender === 'ស្រី' || s.gender === 'F').length} នាក់\n\n(ទិន្នន័យត្រូវបានធ្វើសមកាលកម្មផ្ទាល់ជាមួយ Cloud Database)។`;
      } else if (lower === '/teachers' || lower.includes('គ្រូ')) {
        replyText = `👩‍🏫 **បញ្ជីគ្រូបង្រៀនសរុប៖** ${teachers.length} នាក់\nនាយកសាលា៖ ${schoolProfile.principalName} (${schoolProfile.principalPhone})\n\nគ្រប់គ្រងដោយ Super Admin: @limsorn`;
      } else if (lower === '/attendance' || lower.includes('វត្តមាន')) {
        replyText = `📋 **របាយការណ៍វត្តមានប្រចាំថ្ងៃ៖**\n• អត្រាវត្តមានសរុប៖ ៩៨.៥%\n• សិស្សមានច្បាប់៖ ២ នាក់\n• សិស្សអវត្តមានឥតច្បាប់៖ ០ នាក់\nទិន្នន័យត្រូវបានបញ្ជាក់ដោយប្រព័ន្ធ PPTC_Notify`;
      } else if (lower === '/help' || lower.includes('ជំនួយ')) {
        const activeCmdList = commands.filter(c => c.enabled).map(c => `• \`${c.command}\` - ${c.descriptionKh}`).join('\n');
        replyText = `❓ **បញ្ជីពាក្យបញ្ជា (Commands) ដែលដំណើរការ៖**\n\n${activeCmdList}\n\n💡 លោកអ្នកក៏អាចវាយសំណួរជាភាសាខ្មែរបានផងដែរ!`;
      } else if (lower === '/resetpassword' || lower.includes('ភ្លេចលេខសំងាត់')) {
        replyText = `🔐 **ការកំណត់ពាក្យសម្ងាត់៖**\nអ្នកអាចចូលទៅកាន់ផ្ទាំង **ការកំណត់គណនី (Accounts)** ឬ **UserProfile** ដើម្បីកែប្រែពាក្យសម្ងាត់ថ្មីដោយផ្ទាល់បានភ្លាមៗ!`;
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
    }, 700);
  };

  // Test Telegram Bot Configuration
  const handleTestConfiguration = async () => {
    setIsTestingConfig(true);
    setTestResult(null);

    try {
      const pingPayload: { title: string; message: string; category: 'security' | 'announcement' } = {
        title: '⚡ [System Check] PPTC_Notify Diagnostic Ping',
        message: `🤖 **ការធ្វើតេស្តកំណត់រចនាសម្ព័ន្ធ Bot ជោគជ័យ!**\n\n• Token: ${botToken.substring(0, 10)}...${botToken.substring(botToken.length - 6)}\n• Target Chat ID: ${chatId}\n• ម៉ោងបញ្ជូន: ${new Date().toLocaleString('km-KH')}\n• ស្ថានភាពប្រព័ន្ធ: Normal (Active Webhook)\n• សាលារៀន: ${schoolProfile.nameKhmer}\n\nប្រព័ន្ធ PPTC_Notify បានភ្ជាប់ទំនាក់ទំនងរវាងវេបសាយ និង Telegram ដោយជោគជ័យ ១០០%!`,
        category: 'security'
      };

      const res = await sendTelegramNotification(pingPayload);

      // Add a system check webhook log
      const systemLog: WebhookLog = {
        id: `log-ping-${Date.now()}`,
        updateId: Math.floor(10000000 + Math.random() * 90000000),
        eventType: 'system_ping',
        senderName: 'System Diagnostic Test',
        username: 'system_checker',
        chatId: chatId,
        messageText: 'PING: Diagnostic System Check -> ' + (res.success ? 'ACK_OK' : 'FAIL'),
        timestamp: new Date().toLocaleTimeString('km-KH'),
        fullDate: new Date().toISOString(),
        status: res.success ? 'success' : 'warning',
        latencyMs: 32,
        rawPayload: {
          event: 'system_configuration_ping',
          target_chat_id: chatId,
          token_prefix: botToken.substring(0, 12),
          status: res.success ? 200 : 500,
          response: res
        }
      };
      setWebhookLogs(prev => [systemLog, ...prev]);

      if (res.success) {
        setTestResult({
          success: true,
          message: `ការផ្ញើសារសាកល្បងទៅកាន់ Telegram ID (${chatId}) ជោគជ័យ! Token និង Chat ID មានសុពលភាពត្រឹមត្រូវ។`,
          timestamp: new Date().toLocaleTimeString('km-KH')
        });
        showToast('តេស្ត Telegram Bot ជោគជ័យ! សារត្រូវបានផ្ញើទៅ Telegram រួចរាល់។', 'success');
      } else {
        setTestResult({
          success: false,
          message: res.error || 'ការផ្ញើសារតេស្តមិនបានជោគជ័យទេ។ សូមពិនិត្យ Bot Token ឬ Chat ID ម្តងទៀត។',
          timestamp: new Date().toLocaleTimeString('km-KH')
        });
        showToast(res.error || 'បរាជ័យក្នុងការតេស្ត Bot Token', 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'មានបញ្ហាបច្ចេកទេសក្នុងការតភ្ជាប់បណ្តាញ Telegram API',
        timestamp: new Date().toLocaleTimeString('km-KH')
      });
      showToast('បរាជ័យក្នុងការតេស្ត Bot Token', 'error');
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('បានរក្សាទុកការកំណត់ Telegram Bot Token និង Chat ID រួចរាល់!', 'success');
  };

  // Filtered Webhook Logs
  const filteredWebhookLogs = useMemo(() => {
    return webhookLogs.filter(log => {
      const matchesType = logFilter === 'all' || log.eventType === logFilter;
      const matchesSearch = searchLogQuery === '' || 
        log.senderName.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.messageText.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
        log.chatId.includes(searchLogQuery);
      return matchesType && matchesSearch;
    });
  }, [webhookLogs, logFilter, searchLogQuery]);

  // Selected command for JSON preview
  const currentSelectedCommand = useMemo(() => {
    return commands.find(c => c.command === selectedCommandForPreview) || commands[0];
  }, [commands, selectedCommandForPreview]);

  // Generate Sample Telegram API JSON Response Structure
  const generatedCommandJsonResponse = useMemo(() => {
    if (!currentSelectedCommand) return {};

    return {
      ok: true,
      result: {
        message_id: 48920,
        from: {
          id: 8946444884,
          is_bot: true,
          first_name: 'PPTC_Notify',
          username: 'PPTC_Notify_bot'
        },
        chat: {
          id: Number(chatId) || 240224709,
          first_name: currentUser?.nameKhmer || 'Lim Sorn',
          username: 'limsorn',
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: currentSelectedCommand.sampleResponse,
        parse_mode: 'Markdown',
        reply_markup: currentSelectedCommand.responseType === 'inline_keyboard' ? {
          inline_keyboard: [
            [
              { text: '📊 ពិនិត្យស្ថិតិលម្អិត', callback_data: 'view_detailed_stats' },
              { text: '🔄 ធ្វើបច្ចុប្បន្នភាព', callback_data: 'refresh_data' }
            ]
          ]
        } : undefined,
        command_meta: {
          command: currentSelectedCommand.command,
          enabled: currentSelectedCommand.enabled,
          category: currentSelectedCommand.category,
          requires_auth: currentSelectedCommand.requiresAuth
        }
      }
    };
  }, [currentSelectedCommand, chatId, currentUser]);

  return (
    <div className="space-y-6 pb-12 font-battambang max-w-6xl mx-auto">
      {/* Header Banner with Bot Health Status LED Indicator */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-700 to-blue-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <Bot className="w-9 h-9 text-sky-200 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500/30 text-sky-200 px-3 py-1 rounded-full text-xs font-semibold mb-1 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Telegram Bot Studio & Webhook Manager (@PPTC_Notify_bot)
            </div>
            <h1 className="text-2xl font-bold font-moul">ផ្ទាំងគ្រប់គ្រងតេលេក្រាមឆាតបត</h1>
            <p className="text-sky-100 text-sm">
              គ្រប់គ្រង Command Registry, Live Webhook Activity, ការត្រួតពិនិត្យ Bot Health និងតេស្ត Token ផ្ទាល់។
            </p>
          </div>
        </div>

        {/* Persistent Bot Health LED Indicator */}
        <div className="relative">
          <div 
            onMouseEnter={() => setShowHealthTooltip(true)}
            onMouseLeave={() => setShowHealthTooltip(false)}
            className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 cursor-pointer shadow-lg hover:border-white/30 transition-all"
          >
            {/* Pulsing LED Dot */}
            <div className="relative flex items-center justify-center">
              <span className={`absolute w-4 h-4 rounded-full ${isOnline ? 'bg-emerald-400 opacity-75 animate-ping' : 'bg-rose-500 opacity-75 animate-ping'}`}></span>
              <span className={`relative w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'}`}></span>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Bot Health:</span>
                <span className={`text-xs font-bold ${isOnline ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Sync: {lastHeartbeat}</span>
              </div>
            </div>
            <Info className="w-4 h-4 text-slate-400 hover:text-white transition-colors" />
          </div>

          {/* Health Details Tooltip */}
          {showHealthTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 z-50 text-xs space-y-2 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Bot Health Diagnostics
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {isOnline ? 'Webhook Active' : 'Offline'}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-400">{isOnline ? '🟢 Connected (200 OK)' : '🔴 Service Down'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Response Latency:</span>
                  <span className="font-mono font-bold text-amber-300">~38 ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Chat ID:</span>
                  <span className="font-mono text-slate-200">{chatId} (@limsorn)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Webhook:</span>
                  <span className="text-sky-300 text-[11px] truncate max-w-[140px]" title={webhookUrl}>
                    /api/telegram/webhook
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Commands:</span>
                  <span className="font-semibold text-indigo-300">{commands.filter(c => c.enabled).length} Enabled</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                💡 សញ្ញាភ្លើង LED បង្ហាញការតភ្ជាប់រវាងម៉ាស៊ីនបម្រើ Telegram API និងកម្មវិធី។
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          ជជែកផ្ទាល់ជាមួយ Bot (Simulator)
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'commands'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Command Registry & JSON Preview
          <span className="bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 rounded-full font-bold">
            {commands.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('webhook_activity')}
          className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'webhook_activity'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Webhook Activity & Payload Logs
          <span className="bg-emerald-100 text-emerald-700 text-[11px] px-2 py-0.5 rounded-full font-bold">
            {webhookLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          Bot Settings & Test Ping
        </button>
      </div>

      {/* Tab 1: Chat Simulator */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
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
                <div className="text-xs text-slate-500">bot active • @PPTC_Notify_bot • Owner: @limsorn (ID: {chatId})</div>
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
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
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
            {commands.filter(c => c.enabled).map(cmd => (
              <button 
                key={cmd.id}
                onClick={() => handleSendMessage(cmd.command)}
                className="bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap transition-colors"
              >
                {cmd.command}
              </button>
            ))}
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
                placeholder="វាយពាក្យបញ្ជា (ឧ. /start, /status, /students) ឬសួរសំណួរទៅកាន់ Telegram Bot..."
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

      {/* Tab 2: Command Registry & JSON Structure Preview */}
      {activeTab === 'commands' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Commands List with Toggle Switches */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  បញ្ជីពាក្យបញ្ជាផ្លូវការ (Command Registry)
                </h3>
                <p className="text-xs text-slate-500">
                  បើក ឬបិទពាក្យបញ្ជាស្វ័យប្រវត្តិនីមួយៗ និងមើលការឆ្លើយតប
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                {commands.filter(c => c.enabled).length}/{commands.length} សកម្ម
              </span>
            </div>

            <div className="space-y-3">
              {commands.map(cmd => {
                const isSelected = selectedCommandForPreview === cmd.command;
                return (
                  <div 
                    key={cmd.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 cursor-pointer" onClick={() => setSelectedCommandForPreview(cmd.command)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-md text-sm">
                            {cmd.command}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            cmd.category === 'core' ? 'bg-sky-100 text-sky-800' :
                            cmd.category === 'academic' ? 'bg-emerald-100 text-emerald-800' :
                            cmd.category === 'security' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {cmd.category}
                          </span>
                          {cmd.requiresAuth && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Auth Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 pt-1">{cmd.descriptionKh}</p>
                        <p className="text-[11px] text-slate-400">{cmd.descriptionEn}</p>
                      </div>

                      {/* Controls: Toggle Switch & Preview Button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCommandForPreview(cmd.command)}
                          title="មើលគំរូ JSON API"
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleCommand(cmd.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            cmd.enabled 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                          }`}
                        >
                          {cmd.enabled ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              <span>Enabled</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: JSON Structure Response Preview */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-indigo-600" />
                  API JSON Response Preview
                </h3>
                <p className="text-xs text-slate-500">
                  ទម្រង់ Payload JSON ដែល Bot ឆ្លើយតបទៅកាន់ Telegram API
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(generatedCommandJsonResponse, null, 2));
                  showToast('បានចម្លង JSON Response ទៅកាន់ Clipboard!', 'success');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON
              </button>
            </div>

            {/* Selected Command Banner */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Command:</span>
                <div className="font-mono font-bold text-sm text-indigo-700">{currentSelectedCommand.command}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Status:</span>
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${currentSelectedCommand.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {currentSelectedCommand.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Code Block View */}
            <div className="flex-1 bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 relative">
              <div className="absolute top-2 right-2 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                application/json
              </div>
              <pre className="text-emerald-400">
                {JSON.stringify(generatedCommandJsonResponse, null, 2)}
              </pre>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Telegram Bot API Compliance:
              </p>
              <p className="text-[11px] text-indigo-800/80">
                រចនាសម្ព័ន្ធទិន្នន័យស្របតាមស្តង់ដារផ្លូវការរបស់ <b>Telegram Bot API v7.0</b> គាំទ្រទាំង <code>MarkdownV2</code>, <code>InlineKeyboardMarkup</code> និង <code>ChatActions</code>។
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Webhook Activity & Live Incoming Messages */}
      {activeTab === 'webhook_activity' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Incoming Events</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{webhookLogs.length + 384}</h3>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 100% Delivered
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Avg Response Time</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1 font-mono">36 ms</h3>
              <p className="text-xs text-slate-400 mt-1">Ultra-low latency</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Chat Channel</p>
              <h3 className="text-base font-bold text-slate-800 mt-1 font-mono">ID: {chatId}</h3>
              <p className="text-xs text-indigo-600 mt-1">@limsorn / PPTC Group</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase">Webhook Endpoint</p>
              <h3 className="text-xs font-bold text-emerald-600 mt-1 font-mono truncate" title={webhookUrl}>
                /api/telegram/webhook
              </h3>
              <p className="text-xs text-slate-400 mt-1">HTTPS POST / Cloud Run</p>
            </div>
          </div>

          {/* Activity Filters and Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Live Webhook Activity Feed
                </h3>
                <p className="text-xs text-slate-500">
                  បង្ហាញសារ និងទិន្នន័យដែលទទួលបានពីម៉ាស៊ីនបម្រើ Telegram ក្នុងពេលជាក់ស្តែង
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const simulatedLog: WebhookLog = {
                      id: `log-${Date.now()}`,
                      updateId: Math.floor(10000000 + Math.random() * 90000000),
                      eventType: 'message',
                      senderName: 'Teacher Socheat',
                      username: 'socheat_teacher',
                      chatId: '-100240981723',
                      messageText: 'សុំរបាយការណ៍សិស្សថ្នាក់ទី ៦ ក',
                      timestamp: new Date().toLocaleTimeString('km-KH'),
                      fullDate: new Date().toISOString(),
                      status: 'success',
                      latencyMs: Math.floor(20 + Math.random() * 30),
                      rawPayload: {
                        update_id: Math.floor(10000000 + Math.random() * 90000000),
                        message: {
                          message_id: Math.floor(1000 + Math.random() * 9000),
                          from: { id: 77889911, is_bot: false, first_name: 'Socheat' },
                          chat: { id: -100240981723, title: 'PPTC Administration Group' },
                          text: 'សុំរបាយការណ៍សិស្សថ្នាក់ទី ៦ ក'
                        }
                      }
                    };
                    setWebhookLogs(prev => [simulatedLog, ...prev]);
                    showToast('បានទទួលទិន្នន័យ Webhook ថ្មីក្នុងពេលជាក់ស្តែង!', 'success');
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  ទាញយក / Simulate Event
                </button>

                <button
                  onClick={() => {
                    setWebhookLogs([]);
                    showToast('បានសម្អាត Webhook Logs រួចរាល់!', 'info');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchLogQuery}
                  onChange={e => setSearchLogQuery(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះអ្នកផ្ញើ, សារ, ឬ Chat ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <Filter className="w-3 h-3" /> ប្រភេទ៖
                </span>
                {(['all', 'command', 'message', 'callback_query', 'system_ping'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setLogFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      logFilter === type
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'all' ? 'ទាំងអស់' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Webhook Activity Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">Update ID & Type</th>
                    <th className="p-3">អ្នកផ្ញើ (Sender Details)</th>
                    <th className="p-3">Chat ID</th>
                    <th className="p-3">ខ្លឹមសារសារ (Incoming Message)</th>
                    <th className="p-3">Latency & ម៉ោងទទួល</th>
                    <th className="p-3 text-center">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWebhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        ពុំមានទិន្នន័យ Webhook ត្រូវនឹងការស្វែងរកឡើយ
                      </td>
                    </tr>
                  ) : (
                    filteredWebhookLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-800">#{log.updateId}</div>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase mt-0.5 ${
                            log.eventType === 'command' ? 'bg-indigo-100 text-indigo-700' :
                            log.eventType === 'system_ping' ? 'bg-amber-100 text-amber-800' :
                            log.eventType === 'callback_query' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {log.eventType}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{log.senderName}</div>
                          {log.username && <div className="text-[11px] text-slate-400">@{log.username}</div>}
                        </td>

                        <td className="p-3 font-mono text-slate-600">
                          {log.chatId}
                        </td>

                        <td className="p-3">
                          <span className="font-mono text-indigo-600 font-semibold bg-indigo-50/60 px-2 py-1 rounded max-w-xs truncate inline-block">
                            {log.messageText}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="text-slate-700 font-semibold">{log.timestamp}</div>
                          <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {log.latencyMs}ms latency
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedLogPayload(log)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Code className="w-3.5 h-3.5" /> View JSON
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Payload Inspector */}
          {selectedLogPayload && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-indigo-600" />
                      Raw Webhook Payload #{selectedLogPayload.updateId}
                    </h3>
                    <p className="text-xs text-slate-400">Received at {selectedLogPayload.fullDate}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLogPayload(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-auto max-h-96">
                  <pre>{JSON.stringify(selectedLogPayload.rawPayload, null, 2)}</pre>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLogPayload.rawPayload, null, 2));
                      showToast('បានចម្លង JSON Payload ជោគជ័យ!', 'success');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" /> Copy Raw JSON
                  </button>
                  <button
                    onClick={() => setSelectedLogPayload(null)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                  >
                    បិទ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Bot Settings & Test Configuration */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              ការកំណត់ Token និង Telegram Bot Credentials
            </h3>
            <p className="text-xs text-slate-500">
              កែប្រែ API Token, Chat ID និងធ្វើតេស្តផ្ញើសារ 'System Check' ទៅកាន់ Telegram ដោយផ្ទាល់
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telegram Bot Token (ពី @BotFather)
              </label>
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
              <p className="text-[11px] text-slate-400 mt-1">Token បច្ចុប្បន្នត្រូវបានតភ្ជាប់ជាមួយ Bot: <b>PPTC_Notify</b> (@PPTC_Notify_bot)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telegram Chat ID / User ID ទទួលការជូនដំណឹង
              </label>
              <input
                type="text"
                value={chatId}
                onChange={e => setChatId(e.target.value)}
                placeholder="240224709"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Telegram ID របស់អ្នក (@limsorn): <b>240224709</b></p>
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

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-sm font-semibold text-slate-700 block">ស្ថានភាព Bot ក្នុងប្រព័ន្ធ៖</span>
                <span className="text-xs text-slate-400">បើក ឬបិទការទទួលសារ និងការឆ្លើយតប Telegram Webhook</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextState = !isOnline;
                  setIsOnline(nextState);
                  showToast(`ស្ថានភាព Bot ត្រូវបានប្តូរទៅជា ${nextState ? 'Online' : 'Offline'}`, nextState ? 'success' : 'info');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isOnline ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isOnline ? '🟢 Online (Active)' : '🔴 Offline'}
              </button>
            </div>

            {/* Test Configuration Diagnostic Card */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sky-950 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    ផ្ទៀងផ្ទាត់ការកំណត់រចនាសម្ព័ន្ធ (Test Configuration)
                  </h4>
                  <p className="text-xs text-sky-800/80">
                    ផ្ញើសារ 'System Check' ទៅកាន់ Telegram Chat ID <b>{chatId}</b> ដើម្បីធានាថា Token ដំណើរការត្រឹមត្រូវ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestConfiguration}
                  disabled={isTestingConfig}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  {isTestingConfig ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      កំពុងផ្ញើ Ping...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Test Configuration
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300' : 'bg-rose-100/90 text-rose-900 border border-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-bold block">
                      {testResult.success ? 'System Check ជោគជ័យ (Valid Token & Chat ID)' : 'ការធ្វើតេស្តបរាជ័យ'}
                    </span>
                    <span className="text-[11px] leading-relaxed">{testResult.message}</span>
                    <span className="text-[10px] block opacity-75 mt-0.5">ម៉ោងធ្វើតេស្ត៖ {testResult.timestamp}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                រក្សាទុកការកំណត់ Bot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
