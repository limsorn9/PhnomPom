import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { sendTelegramDirectMessage } from '../../services/telegramService';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Tag,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Zap,
  Check,
  ShieldCheck,
  Lock,
  ChevronRight,
  HelpCircle,
  Filter,
  UserCheck,
  Users,
  GraduationCap,
  Copy,
  Layers
} from 'lucide-react';

export interface AutoResponderRule {
  id: string;
  name: string;
  category: 'leave_request' | 'exam_scores' | 'school_schedule' | 'uniform_fees' | 'parent_meeting' | 'emergency' | 'general';
  targetAudience: 'all' | 'parent' | 'student' | 'teacher';
  triggerKeywords: string[];
  intentKhmer: string;
  replyTemplate: string;
  enabled: boolean;
  priority: number;
  autoSendInLiveWebhook: boolean;
  matchCount: number;
  lastMatchedAt?: string;
}

export const DEFAULT_AUTO_RESPONDER_RULES: AutoResponderRule[] = [
  {
    id: 'rule-leave-sick',
    name: '📝 សុំច្បាប់ឈឺ ឬធុរៈផ្ទាល់ខ្លួន (Leave / Sick Notice)',
    category: 'leave_request',
    targetAudience: 'parent',
    triggerKeywords: ['សុំច្បាប់', 'ឈឺ', 'ឈប់រៀន', 'ឈឺពោះ', 'គ្រុនក្តៅ', 'ធុរៈ', 'ទៅពេទ្យ', 'ច្បាប់', 'អវត្តមាន'],
    intentKhmer: 'ស្នើសុំច្បាប់ឈប់សម្រាកព្យាបាលជំងឺ ឬធុរៈគ្រួសារ',
    replyTemplate: `🙏 ជម្រាបសួរអាណាព្យាបាលសិស្សជាទីគោរព!
🏫 សាលារៀន {{school_name}} បានទទួលដំណឹងសុំច្បាប់ឈប់សម្រាករបស់សិស្សរួចរាល់ហើយ។

✅ ស្ថានភាព៖ បានកត់ត្រាចូលប្រព័ន្ធវត្តមានប្រចាំថ្ងៃ
👨‍🏫 នាយកដ្ឋានរដ្ឋបាលបានជម្រាបជូនលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់រួចរាល់។
💊 សូមជូនពរឱ្យប្អូនឆាប់ជាសះស្បើយ និងត្រឡប់មកសិក្សាវិញក្នុងពេលឆាប់ៗ!

☎️ ទំនាក់ទំនងបន្ថែម៖ {{principal_phone}} ({{principal_name}})`,
    enabled: true,
    priority: 10,
    autoSendInLiveWebhook: false,
    matchCount: 142,
    lastMatchedAt: '2026-08-26 08:30 AM'
  },
  {
    id: 'rule-scores-rank',
    name: '📊 សាកសួរពិន្ទុ និងចំណាត់ថ្នាក់ (Scores & Ranking)',
    category: 'exam_scores',
    targetAudience: 'all',
    triggerKeywords: ['ពិន្ទុ', 'ចំណាត់ថ្នាក់', 'លទ្ធផល', 'សៀវភៅតាមដាន', 'ឆមាស', 'លំដាប់ថ្នាក់', 'និទ្ទេស', 'ជាប់'],
    intentKhmer: 'សាកសួរលទ្ធផលប្រឡងប្រចាំខែ ឬឆមាស និងចំណាត់ថ្នាក់',
    replyTemplate: `📊 សួស្ដី! ព័ត៌មានស្ដីពីពិន្ទុ និងចំណាត់ថ្នាក់សិស្ស៖

1️⃣ លទ្ធផលប្រឡងប្រចាំខែ/ឆមាស ត្រូវបានបញ្ចូលលើប្រព័ន្ធឌីជីថលសាលារួចរាល់។
2️⃣ លោកអ្នកអាចពិនិត្យតាមរយៈសៀវភៅតាមដាន ឬចូលគណនីសិស្សលើវិបផតថលសាលា។
3️⃣ ប័ណ្ណសរសើរ និងចំណាត់ថ្នាក់ផ្លូវការនឹងប្រគល់ជូននៅថ្ងៃចុងខែ។

👨‍🏫 សម្រាប់បញ្ជាក់ពិន្ទុលម្អិត សូមទាក់ទងលោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់ដោយផ្ទាល់។ អរគុណ!`,
    enabled: true,
    priority: 8,
    autoSendInLiveWebhook: false,
    matchCount: 98,
    lastMatchedAt: '2026-08-25 04:15 PM'
  },
  {
    id: 'rule-schedule-routine',
    name: '⏰ ម៉ោងសិក្សា និងកាលវិភាគ (School Hours & Schedule)',
    category: 'school_schedule',
    targetAudience: 'all',
    triggerKeywords: ['ម៉ោង', 'ចូលរៀន', 'ចេញរៀន', 'កាលវិភាគ', 'ពេលរសៀល', 'ពេលព្រឹក', 'ថ្ងៃចន្ទ', 'ទង់ជាតិ'],
    intentKhmer: 'សាកសួរម៉ោងចូល-ចេញរៀន និងកាលវិភាគប្រចាំសប្ដាហ៍',
    replyTemplate: `⏰ *កាលវិភាគ និងម៉ោងសិក្សាផ្លូវការនៃ {{school_name}}* 🏫

🌅 វេនព្រឹក៖
• ម៉ោង ០៦:៤៥ នាទី៖ គោរពទង់ជាតិ និងជួបជុំ
• ម៉ោង ០៧:០០ ដល់ ១១:០០ នាទី៖ ម៉ោងសិក្សា

🌇 វេនរសៀល៖
• ម៉ោង ១២:៤៥ នាទី៖ ជួបជុំសិស្ស
• ម៉ោង ១៣:០០ ដល់ ១៧:០០ នាទី៖ ម៉ោងសិក្សា

📍 សូមមាតាបិតាមកទទួលបុត្រធីតាឱ្យបានទាន់ពេលវេលា។ សូមអរគុណ!`,
    enabled: true,
    priority: 7,
    autoSendInLiveWebhook: false,
    matchCount: 86,
    lastMatchedAt: '2026-08-26 07:10 AM'
  },
  {
    id: 'rule-uniform-books',
    name: '👔 ឯកសណ្ឋាន និងសម្ភារសិក្សា (Uniform & Books)',
    category: 'uniform_fees',
    targetAudience: 'parent',
    triggerKeywords: ['ឯកសណ្ឋាន', 'ខោអាវ', 'សម្លៀកបំពាក់', 'សៀវភៅ', 'បណ្ណសិស្ស', 'កាត', 'សម្ភារ', 'តម្លៃ'],
    intentKhmer: 'សាកសួរព័ត៌មានឯកសណ្ឋានសិស្ស សៀវភៅពុម្ព និងប័ណ្ណសម្គាល់',
    replyTemplate: `👔 ព័ត៌មានឯកសណ្ឋាន និងសម្ភារសិក្សា {{school_name}}៖

👕 *ឯកសណ្ឋានសិស្ស:*
• សិស្សប្រុស៖ អាវសដៃខ្លី/វែង + ខោខៀវជើងវែង + ផ្លាកឈ្មោះសាលា
• សិស្សស្រី៖ អាវស + សំពត់ខៀវក្រោមជង្គង់ + ផ្លាកឈ្មោះសាលា
📚 *សៀវភៅពុម្ពសិក្សាគោល:* សាលារៀនចែកជូនសិស្សដោយឥតគិតថ្លៃតាមកម្រិតថ្នាក់។

🏢 អាចទាក់ទងការិយាល័យរដ្ឋបាលសាលាសម្រាប់ព័ត៌មានលម្អិតបន្ថែម។`,
    enabled: true,
    priority: 6,
    autoSendInLiveWebhook: false,
    matchCount: 45,
    lastMatchedAt: '2026-08-24 10:20 AM'
  },
  {
    id: 'rule-meeting-appointment',
    name: '👨‍👩‍👧 កិច្ចប្រជុំមាតាបិតា & សុំជួបគ្រូ (Parent Inquiries)',
    category: 'parent_meeting',
    targetAudience: 'parent',
    triggerKeywords: ['ជួបគ្រូ', 'ប្រជុំ', 'អាណាព្យាបាល', 'មាតាបិតា', 'ពិគ្រោះ', 'សន្ទនា', 'នាយក'],
    intentKhmer: 'ស្នើសុំជួបពិភាក្សាការសិក្សា ឬសាកសួរកិច្ចប្រជុំមាតាបិតា',
    replyTemplate: `👨‍👩‍👧 ជម្រាបសួរអាណាព្យាបាលសិស្សជាទីគោរព!

🏫 សាលារៀន {{school_name}} ស្វាគមន៍ជានិច្ចចំពោះការចូលរួមសហការ និងតាមដានការសិក្សារបស់កូនៗ។
🕒 ម៉ោងទទួលជួបពិគ្រោះយោបល់៖ ថ្ងៃចន្ទ ដល់ សុក្រ (ម៉ោង ១១:០០ - ១២:០០ ឬ ១៧:០០ - ១៧:៣០)។

📞 សូមទាក់ទងកំណត់ពេលជាមុនតាមរយៈលេខ៖ {{principal_phone}} ({{principal_name}})។ សូមអរគុណ!`,
    enabled: true,
    priority: 6,
    autoSendInLiveWebhook: false,
    matchCount: 37,
    lastMatchedAt: '2026-08-23 02:40 PM'
  },
  {
    id: 'rule-emergency',
    name: '🆘 ករណីបន្ទាន់ និងសុវត្ថិភាពសិស្ស (Emergency Alert)',
    category: 'emergency',
    targetAudience: 'all',
    triggerKeywords: ['បន្ទាន់', 'គ្រោះថ្នាក់', 'បាត់កូន', 'សង្គ្រោះ', 'ដួល', 'របួស', 'គ្រោះ'],
    intentKhmer: 'ជូនដំណឹងបន្ទាន់ ឬស្នើសុំជំនួយសង្គ្រោះបន្ទាន់',
    replyTemplate: `🚨 *សេចក្តីឆ្លើយតបបន្ទាន់ (URGENT RESPONSE)* 🚨

សាលារៀន {{school_name}} បានទទួលដំណឹងបន្ទាន់នេះហើយ!
☎️ សូមទូរស័ព្ទផ្ទាល់ទៅកាន់លេខទូរស័ព្ទទាន់ហេតុការណ៍សាលា៖
• នាយកសាលា៖ {{principal_phone}} ({{principal_name}})
• បន្ទប់សុខភាពសាលា៖ 012 999 888

ក្រុមការងារសាលាកំពុងផ្ទៀងផ្ទាត់ និងចាត់វិធានការភ្លាមៗ!`,
    enabled: true,
    priority: 100,
    autoSendInLiveWebhook: true,
    matchCount: 12,
    lastMatchedAt: '2026-08-20 11:05 AM'
  }
];

export const TelegramSmartAutoResponder: React.FC = () => {
  const { currentUser, schoolProfile, showToast } = useSchool();
  const isPrincipal = currentUser?.role === 'director' || currentUser?.role === 'super_admin';

  const [rules, setRules] = useState<AutoResponderRule[]>(DEFAULT_AUTO_RESPONDER_RULES);
  const [selectedRule, setSelectedRule] = useState<AutoResponderRule | null>(null);
  const [isEditingRule, setIsEditingRule] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Interactive Simulator State
  const [testInputMessage, setTestInputMessage] = useState('ជម្រាបសួរលោកគ្រូនាយក កូនខ្ញុំឈ្មោះ សុខ ពិសិដ្ឋ ថ្នាក់ទី៤ក ថ្ងៃនេះឈឺពោះសុំច្បាប់សម្រាក១ថ្ងៃ');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<{
    detectedSender: 'parent' | 'student' | 'teacher' | 'general';
    detectedIntent: string;
    matchedKeywords: string[];
    confidence: number;
    matchedRules: AutoResponderRule[];
    suggestedReply: string;
  } | null>(null);

  // New Rule Form State
  const [formRule, setFormRule] = useState<Partial<AutoResponderRule>>({
    name: '',
    category: 'general',
    targetAudience: 'all',
    triggerKeywords: [],
    intentKhmer: '',
    replyTemplate: '',
    enabled: true,
    priority: 5,
    autoSendInLiveWebhook: false
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Replace Template Variables with real data
  const renderTemplateText = (template: string) => {
    return template
      .replace(/{{school_name}}/g, schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ')
      .replace(/{{academic_year}}/g, schoolProfile.academicYear || '២០២៥-២០២៦')
      .replace(/{{principal_name}}/g, schoolProfile.principalName || 'លឹម សន')
      .replace(/{{principal_phone}}/g, schoolProfile.principalPhone || '012 345 678');
  };

  // Run Smart AI Keyword & Intent Analysis
  const handleAnalyzeMessage = () => {
    if (!testInputMessage.trim()) {
      showToast('សូមបញ្ចូលខ្លឹមសារសារសាកល្បង!', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const text = testInputMessage.toLowerCase();
      
      // Determine Sender Persona based on Khmer lexical patterns
      let detectedSender: 'parent' | 'student' | 'teacher' | 'general' = 'general';
      if (text.includes('កូន') || text.includes('អាណាព្យាបាល') || text.includes('មាតាបិតា') || text.includes('ម៉ាក់') || text.includes('ប៉ា')) {
        detectedSender = 'parent';
      } else if (text.includes('ខ្ញុំបាទ') || text.includes('ខ្ញុំម្ចាស់') || text.includes('សិស្ស') || text.includes('មិត្តភក្តិ') || text.includes('រៀនមិនយល់')) {
        detectedSender = 'student';
      } else if (text.includes('លោកគ្រូ') || text.includes('អ្នកគ្រូ') || text.includes('នាយក') || text.includes('កិច្ចតែងការ')) {
        detectedSender = 'teacher';
      }

      // Match against rules
      const matchedWithScores: { rule: AutoResponderRule; matchedKeywords: string[]; score: number }[] = [];

      rules.forEach(rule => {
        if (!rule.enabled) return;
        const matched = rule.triggerKeywords.filter(kw => text.includes(kw.toLowerCase()));
        if (matched.length > 0) {
          const score = (matched.length * 25) + rule.priority;
          matchedWithScores.push({ rule, matchedKeywords: matched, score });
        }
      });

      matchedWithScores.sort((a, b) => b.score - a.score);

      if (matchedWithScores.length > 0) {
        const topMatch = matchedWithScores[0];
        const allKeywords = Array.from(new Set(matchedWithScores.flatMap(m => m.matchedKeywords)));
        const confidence = Math.min(98, Math.max(65, topMatch.matchedKeywords.length * 32 + (detectedSender !== 'general' ? 15 : 0)));

        setAnalyzedResult({
          detectedSender,
          detectedIntent: topMatch.rule.intentKhmer,
          matchedKeywords: allKeywords,
          confidence,
          matchedRules: matchedWithScores.map(m => m.rule),
          suggestedReply: renderTemplateText(topMatch.rule.replyTemplate)
        });
      } else {
        // Generic smart fallback
        setAnalyzedResult({
          detectedSender,
          detectedIntent: 'ការសាកសួរ ឬសំណូមពរទូទៅ (General Inquiry)',
          matchedKeywords: ['ទូទៅ', 'សាកសួរ'],
          confidence: 50,
          matchedRules: [],
          suggestedReply: `🙏 សួស្ដី! សាលារៀន ${schoolProfile.nameKhmer} បានទទួលសាររបស់អ្នកហើយ។\n\nក្រុមការងាររដ្ឋបាលនឹងពិនិត្យ និងឆ្លើយតបជូនលោកអ្នកឆាប់ៗ។ សម្រាប់បញ្ហាបន្ទាន់ សូមទាក់ទងទូរស័ព្ទ៖ ${schoolProfile.principalPhone} (${schoolProfile.principalName})។`
        });
      }

      setIsAnalyzing(false);
      showToast('បានវិភាគសារដោយជោគជ័យ!', 'success');
    }, 400);
  };

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesCat = filterCategory === 'all' || rule.category === filterCategory;
      const matchesSearch = searchQuery === '' || 
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.intentKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.triggerKeywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [rules, filterCategory, searchQuery]);

  // Handle Save / Add Rule (Principal Only)
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrincipal) {
      showToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចកែប្រែ ឬបន្ថែមច្បាប់ Auto-Responder!', 'error');
      return;
    }

    if (!formRule.name || !formRule.replyTemplate) {
      showToast('សូមបំពេញឈ្មោះច្បាប់ និងខ្លឹមសារពុម្ពសារឆ្លើយតប!', 'warning');
      return;
    }

    if (isEditingRule && selectedRule) {
      setRules(prev => prev.map(r => r.id === selectedRule.id ? {
        ...r,
        ...formRule,
        triggerKeywords: formRule.triggerKeywords || []
      } as AutoResponderRule : r));
      showToast('បានកែប្រែច្បាប់ឆ្លើយតបស្វ័យប្រវត្តិជោគជ័យ!', 'success');
    } else {
      const newRule: AutoResponderRule = {
        id: `rule-${Date.now()}`,
        name: formRule.name!,
        category: (formRule.category as any) || 'general',
        targetAudience: (formRule.targetAudience as any) || 'all',
        triggerKeywords: formRule.triggerKeywords || ['ព័ត៌មាន'],
        intentKhmer: formRule.intentKhmer || 'ឆ្លើយតបស្វ័យប្រវត្តិ',
        replyTemplate: formRule.replyTemplate!,
        enabled: formRule.enabled ?? true,
        priority: formRule.priority || 5,
        autoSendInLiveWebhook: formRule.autoSendInLiveWebhook ?? false,
        matchCount: 0
      };
      setRules(prev => [newRule, ...prev]);
      showToast('បានបង្កើតច្បាប់ Auto-Responder ថ្មីជោគជ័យ!', 'success');
    }

    setIsEditingRule(false);
    setSelectedRule(null);
    setFormRule({
      name: '',
      category: 'general',
      targetAudience: 'all',
      triggerKeywords: [],
      intentKhmer: '',
      replyTemplate: '',
      enabled: true,
      priority: 5,
      autoSendInLiveWebhook: false
    });
  };

  // Toggle Rule Status (Principal Only)
  const handleToggleRule = (ruleId: string) => {
    if (!isPrincipal) {
      showToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចបើក/បិទច្បាប់ឆ្លើយតប!', 'error');
      return;
    }
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.enabled;
        showToast(`ច្បាប់ "${r.name}" ត្រូវបាន ${nextState ? 'បើកដំណើរការ' : 'បិទ'}`, nextState ? 'success' : 'info');
        return { ...r, enabled: nextState };
      }
      return r;
    }));
  };

  // Delete Rule (Principal Only)
  const handleDeleteRule = (ruleId: string) => {
    if (!isPrincipal) {
      showToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចលុបច្បាប់បាន!', 'error');
      return;
    }
    if (confirm('តើអ្នកពិតជាចង់លុបច្បាប់ឆ្លើយតបស្វ័យប្រវត្តិនេះមែនទេ?')) {
      setRules(prev => prev.filter(r => r.id !== ruleId));
      showToast('បានលុបច្បាប់រួចរាល់', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info & Role Protection Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
                AI Smart Auto-Responder v2.5
              </span>
              {isPrincipal ? (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> សិទ្ធិនាយកសាលា (Full Access)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> មើលទិន្នន័យ (Read-Only)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5 font-battambang">
              <Bot className="w-7 h-7 text-indigo-300" />
              អ្នកឆ្លើយតបឆ្លាតវៃ (Smart Auto-Responder)
            </h2>
            <p className="text-indigo-100/80 text-xs md:text-sm max-w-2xl font-battambang leading-relaxed">
              ប្រព័ន្ធ AI ស្វែងយល់ពីបំណង (Intent) និងពាក្យគន្លឹះ (Keywords) ពីសាររបស់សិស្ស ឬមាតាបិតា ដើម្បីស្នើពុម្ពសារឆ្លើយតបត្រឹមត្រូវ និងទាន់ពេលវេលា។
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-right">
              <div className="text-xs text-indigo-200">ច្បាប់សរុបក្នុងប្រព័ន្ធ</div>
              <div className="text-lg font-black">{rules.length} ច្បាប់</div>
            </div>
            <div className="w-px h-8 bg-white/20 mx-1" />
            <div className="text-right">
              <div className="text-xs text-indigo-200">ឆ្លើយតបរួច</div>
              <div className="text-lg font-black text-emerald-300">
                {rules.reduce((acc, r) => acc + r.matchCount, 0)} ដង
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Access Restriction Warning for Non-Principal */}
      {!isPrincipal && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">🔒 សិទ្ធិគ្រប់គ្រងត្រូវបានកម្រិត៖</p>
            <p className="leading-relaxed text-amber-800">
              យោងតាមគោលការណ៍សុវត្ថិភាពសាលារៀន <b>ក្រៅពីនាយកសាលា ឬ Super Admin មិនអាចកែប្រែច្បាប់ Bot API ឬបន្ថែមច្បាប់ឆ្លើយតបថ្មីបានឡើយ</b>។ អ្នកអាចធ្វើតេស្តសាកល្បង AI Simulator ឬប្រើពុម្ពសារឆ្លើយតបដែលមានស្រាប់។
            </p>
          </div>
        </div>
      )}

      {/* Grid: Left Column = AI Message Analyzer & Live Simulator, Right Column = Auto-Responder Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live AI Analyzer Playground */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">AI Message Analyzer (Simulator)</h3>
                  <p className="text-[11px] text-slate-400">ធ្វើតេស្តវិភាគសារ និងមើលពុម្ពចម្លើយស្នើឡើង</p>
                </div>
              </div>
            </div>

            {/* Preset Test Scenarios */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                ជ្រើសរើសសារសាកល្បងគំរូ (Quick Test Scenarios)៖
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    label: '🤒 មាតាបិតាសុំច្បាប់កូនឈឺ',
                    text: 'ជម្រាបសួរលោកគ្រូនាយក កូនខ្ញុំឈ្មោះ សុខ ពិសិដ្ឋ ថ្នាក់ទី៤ក ថ្ងៃនេះឈឺពោះសុំច្បាប់សម្រាក១ថ្ងៃ'
                  },
                  {
                    label: '📊 សិស្សសាកសួរពិន្ទុឆមាស',
                    text: 'សួស្ដីបត! តើពេលណាទើបចេញលទ្ធផលប្រឡងឆមាសទី១ និងចំណាត់ថ្នាក់?'
                  },
                  {
                    label: '⏰ មាតាបិតាសាកសួរម៉ោងចេញរៀន',
                    text: 'សួស្ដីសាលារៀន តើថ្ងៃនេះវេនរសៀលចេញរៀនម៉ោងប៉ុន្មានដែរ?'
                  },
                  {
                    label: '👔 សាកសួរឯកសណ្ឋាន និងសៀវភៅ',
                    text: 'សុំសួរពីឯកសណ្ឋានសិស្សថ្នាក់ទី១ និងសៀវភៅពុម្ពសិក្សាគោលមានចែកអត់?'
                  }
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTestInputMessage(sample.text);
                      setAnalyzedResult(null);
                    }}
                    className="text-left text-xs p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium truncate">{sample.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Test Input Form */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                សារចូលពី Telegram (Incoming Message) *
              </label>
              <textarea
                rows={3}
                value={testInputMessage}
                onChange={e => setTestInputMessage(e.target.value)}
                placeholder="វាយបញ្ចូលសារពីសិស្ស ឬមាតាបិតា..."
                className="w-full p-3 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 font-battambang leading-relaxed"
              />

              <button
                type="button"
                onClick={handleAnalyzeMessage}
                disabled={isAnalyzing || !testInputMessage.trim()}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI កំពុងស្កេនពាក្យគន្លឹះ...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    ដំណើរការវិភាគដោយ AI (Analyze Intent)
                  </>
                )}
              </button>
            </div>

            {/* Analyzed Output Card */}
            {analyzedResult && (
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 space-y-4 text-xs animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-950">លទ្ធផលវិភាគ (AI Insights):</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px]">
                    ភាពត្រឹមត្រូវ {analyzedResult.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-xl border border-indigo-50">
                    <span className="text-slate-500 block">អ្នកផ្ញើសារ (Persona)៖</span>
                    <span className="font-bold text-slate-800 capitalize flex items-center gap-1 mt-0.5">
                      {analyzedResult.detectedSender === 'parent' && <Users className="w-3.5 h-3.5 text-blue-600" />}
                      {analyzedResult.detectedSender === 'student' && <GraduationCap className="w-3.5 h-3.5 text-purple-600" />}
                      {analyzedResult.detectedSender === 'teacher' && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      {analyzedResult.detectedSender === 'parent' ? '👨‍👩‍👧 មាតាបិតា/អាណាព្យាបាល' : 
                       analyzedResult.detectedSender === 'student' ? '🎓 សិស្សានុសិស្ស' : 
                       analyzedResult.detectedSender === 'teacher' ? '👨‍🏫 លោកគ្រូ-អ្នកគ្រូ' : '👤 ទូទៅ'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2 rounded-xl border border-indigo-50">
                    <span className="text-slate-500 block">បំណង (Detected Intent)៖</span>
                    <span className="font-bold text-indigo-900 truncate block mt-0.5">
                      {analyzedResult.detectedIntent}
                    </span>
                  </div>
                </div>

                {/* Keywords Extracted */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    ពាក្យគន្លឹះដែលរកឃើញ (Extracted Keywords):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analyzedResult.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Reply Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      ពុម្ពសារឆ្លើយតបដែល AI ស្នើឡើង (Suggested Reply):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(analyzedResult.suggestedReply);
                        showToast('បានចម្លងពុម្ពសារឆ្លើយតប!', 'success');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> ចម្លង
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-indigo-200 text-slate-700 font-battambang whitespace-pre-wrap leading-relaxed shadow-xs">
                    {analyzedResult.suggestedReply}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Manage Auto-Responder Rules */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  បញ្ជីច្បាប់ឆ្លើយតបស្វ័យប្រវត្តិ (Rules Registry)
                </h3>
                <p className="text-[11px] text-slate-400">កំណត់ពាក្យគន្លឹះ និងចម្លើយឆ្លើយតបតាមប្រភេទទិន្នន័យ</p>
              </div>

              {isPrincipal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingRule(false);
                    setSelectedRule(null);
                    setFormRule({
                      name: '',
                      category: 'general',
                      targetAudience: 'all',
                      triggerKeywords: [],
                      intentKhmer: '',
                      replyTemplate: '',
                      enabled: true,
                      priority: 5,
                      autoSendInLiveWebhook: false
                    });
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  បង្កើតច្បាប់ថ្មី
                </button>
              )}
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះច្បាប់ ឬពាក្យគន្លឹះ..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-battambang"
                />
              </div>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 font-battambang"
              >
                <option value="all">គ្រប់ប្រភេទ (All Categories)</option>
                <option value="leave_request">📝 សុំច្បាប់ & ឈឺ</option>
                <option value="exam_scores">📊 ពិន្ទុ & ចំណាត់ថ្នាក់</option>
                <option value="school_schedule">⏰ ម៉ោង & កាលវិភាគ</option>
                <option value="uniform_fees">👔 ឯកសណ្ឋាន & សៀវភៅ</option>
                <option value="parent_meeting">👨‍👩‍👧 កិច្ចប្រជុំមាតាបិតា</option>
                <option value="emergency">🆘 ករណីបន្ទាន់</option>
              </select>
            </div>

            {/* Rules List Cards */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    rule.enabled 
                      ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm' 
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs font-battambang">
                          {rule.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rule.category === 'emergency' ? 'bg-rose-100 text-rose-700' :
                          rule.category === 'leave_request' ? 'bg-blue-100 text-blue-700' :
                          rule.category === 'exam_scores' ? 'bg-purple-100 text-purple-700' :
                          rule.category === 'school_schedule' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rule.category}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          👥 {rule.targetAudience === 'parent' ? 'មាតាបិតា' : rule.targetAudience === 'student' ? 'សិស្ស' : 'ទាំងអស់'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-battambang">
                        🎯 បំណង៖ {rule.intentKhmer}
                      </p>

                      {/* Keywords Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {rule.triggerKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPrincipal && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                              rule.enabled
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={rule.enabled ? 'ចុចដើម្បីបិទ' : 'ចុចដើម្បីបើក'}
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRule(rule);
                              setIsEditingRule(true);
                              setFormRule({
                                name: rule.name,
                                category: rule.category,
                                targetAudience: rule.targetAudience,
                                triggerKeywords: [...rule.triggerKeywords],
                                intentKhmer: rule.intentKhmer,
                                replyTemplate: rule.replyTemplate,
                                enabled: rule.enabled,
                                priority: rule.priority,
                                autoSendInLiveWebhook: rule.autoSendInLiveWebhook
                              });
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition-colors"
                            title="កែប្រែច្បាប់"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors"
                            title="លុបច្បាប់"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Template Preview Snippet */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-battambang whitespace-pre-line line-clamp-2">
                    {renderTemplateText(rule.replyTemplate)}
                  </div>
                </div>
              ))}

              {filteredRules.length === 0 && (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <Bot className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs">រកមិនឃើញច្បាប់ឆ្លើយតបណាមួយឡើយ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Form for Creating / Editing Rule (Principal Only) */}
      {(isEditingRule || (isPrincipal && formRule.name !== '')) && selectedRule !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {isEditingRule ? 'កែប្រែច្បាប់ Auto-Responder' : 'បង្កើតច្បាប់ Auto-Responder ថ្មី'}
                  </h3>
                  <p className="text-xs text-slate-400">កំណត់ពាក្យគន្លឹះ និងពុម្ពសារឆ្លើយតប</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingRule(false);
                  setSelectedRule(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ឈ្មោះច្បាប់ (Rule Title) *</label>
                  <input
                    type="text"
                    value={formRule.name || ''}
                    onChange={e => setFormRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ឧ. 📝 សុំច្បាប់ឈឺ ឬធុរៈ"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-battambang"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ប្រភេទ (Category)</label>
                  <select
                    value={formRule.category || 'general'}
                    onChange={e => setFormRule(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-battambang"
                  >
                    <option value="leave_request">📝 សុំច្បាប់ & ឈឺ</option>
                    <option value="exam_scores">📊 ពិន្ទុ & ចំណាត់ថ្នាក់</option>
                    <option value="school_schedule">⏰ ម៉ោង & កាលវិភាគ</option>
                    <option value="uniform_fees">👔 ឯកសណ្ឋាន & សៀវភៅ</option>
                    <option value="parent_meeting">👨‍👩‍👧 កិច្ចប្រជុំមាតាបិតា</option>
                    <option value="emergency">🆘 ករណីបន្ទាន់</option>
                    <option value="general">ទូទៅ (General)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  បំណងសកម្មភាព (Intent Description)
                </label>
                <input
                  type="text"
                  value={formRule.intentKhmer || ''}
                  onChange={e => setFormRule(prev => ({ ...prev, intentKhmer: e.target.value }))}
                  placeholder="ឧ. ស្នើសុំច្បាប់ឈប់សម្រាកព្យាបាលជំងឺ ឬធុរៈគ្រួសារ"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-battambang"
                />
              </div>

              {/* Keywords Tagging Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ពាក្យគន្លឹះកេះដំណើរការ (Trigger Keywords - ចុច Enter ដើម្បីបន្ថែម) *
                </label>
                <div className="p-2 border border-slate-300 rounded-xl bg-slate-50 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(formRule.triggerKeywords || []).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg font-semibold flex items-center gap-1"
                      >
                        #{kw}
                        <button
                          type="button"
                          onClick={() => {
                            setFormRule(prev => ({
                              ...prev,
                              triggerKeywords: prev.triggerKeywords?.filter((_, idx) => idx !== i)
                            }));
                          }}
                          className="hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (keywordInput.trim()) {
                            setFormRule(prev => ({
                              ...prev,
                              triggerKeywords: Array.from(new Set([...(prev.triggerKeywords || []), keywordInput.trim()]))
                            }));
                            setKeywordInput('');
                          }
                        }
                      }}
                      placeholder="វាយពាក្យគន្លឹះ រួចចុច Enter (ឧ. សុំច្បាប់, ឈឺ, គ្រុន...)"
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-battambang"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (keywordInput.trim()) {
                          setFormRule(prev => ({
                            ...prev,
                            triggerKeywords: Array.from(new Set([...(prev.triggerKeywords || []), keywordInput.trim()]))
                          }));
                          setKeywordInput('');
                        }
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold"
                    >
                      បន្ថែម
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    ខ្លឹមសារពុម្ពសារឆ្លើយតប (Markdown & Variables Supported) *
                  </label>
                  <div className="flex gap-1">
                    {['{{school_name}}', '{{principal_name}}', '{{principal_phone}}'].map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormRule(prev => ({ ...prev, replyTemplate: (prev.replyTemplate || '') + ' ' + tag }))}
                        className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={5}
                  value={formRule.replyTemplate || ''}
                  onChange={e => setFormRule(prev => ({ ...prev, replyTemplate: e.target.value }))}
                  placeholder="សរសេរខ្លឹមសារឆ្លើយតប..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-battambang leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingRule(false);
                    setSelectedRule(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  រក្សាទុកច្បាប់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
