import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { sendTelegramNotification } from '../../services/telegramService';
import {
  FileText,
  Plus,
  Send,
  Copy,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle,
  Clock,
  Layers,
  Search,
  Check,
  Tag,
  AlertCircle,
  MessageSquare,
  Share2,
  RefreshCw,
  Bookmark,
  Calendar,
  Users,
  Megaphone
} from 'lucide-react';

export interface TelegramTemplate {
  id: string;
  title: string;
  category: 'announcement' | 'academic' | 'attendance' | 'meeting' | 'urgent' | 'general';
  icon: string;
  description: string;
  content: string;
  isPreset?: boolean;
  createdAt: string;
}

const INITIAL_PRESET_TEMPLATES: TelegramTemplate[] = [
  {
    id: 'tmpl-exam-schedule',
    title: '📢 សេចក្តីប្រកាសកាលវិភាគប្រឡងឆមាស',
    category: 'academic',
    icon: '📝',
    description: 'សម្រាប់ជូនដំណឹងពីកាលបរិច្ឆេទប្រឡងឆមាស និងការត្រៀមខ្លួនរបស់សិស្សានុសិស្ស',
    content: `📢 *សេចក្តីប្រកាសកាលវិភាគប្រឡងឆមាស* 📝
🏫 *ស្ថាប័ន:* {{school_name}}
📅 *ឆ្នាំសិក្សា:* {{academic_year}}

សូមជម្រាបជូនដំណឹងដល់លោកគ្រូ អ្នកគ្រូ សិស្សានុសិស្ស និងមាតាបិតាទាំងអស់ឱ្យបានជ្រាបថា សាលារៀននឹងរៀបចំការប្រឡងឆមាសចាប់ពីថ្ងៃទី *{{date}}* វេលាម៉ោង *{{time}}* នៅ *{{location}}*។

🔹 *ការត្រៀមខ្លួន:*
• សូមមកដល់សាលារៀនមុនម៉ោងប្រឡង ១៥ នាទី
• ពាក់ឯកសណ្ឋានសិស្សឱ្យបានត្រឹមត្រូវ
• ហាមយកទូរស័ព្ទដៃ ឬឯកសារចូលបន្ទប់ប្រឡង

☎️ *ទំនាក់ទំនងសាកសួរ:* {{principal_phone}} ({{principal_name}})
សូមអរគុណ! 🙏`,
    isPreset: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'tmpl-daily-attendance',
    title: '📊 របាយការណ៍សង្ខេបវត្តមានសិស្សប្រចាំថ្ងៃ',
    category: 'attendance',
    icon: '📊',
    description: 'ផ្ញើសង្ខេបស្ថិតិវត្តមាន អវត្តមានសិស្សប្រចាំថ្ងៃជូនគណៈគ្រប់គ្រង',
    content: `📊 *របាយការណ៍វត្តមានសិស្សប្រចាំថ្ងៃ* 📋
🏫 *សាលារៀន:* {{school_name}}
📅 *កាលបរិច្ឆេទ:* {{date}} (វេលាម៉ោង {{time}})

👥 *ស្ថិតិសិស្សសរុប:* {{student_count}} នាក់
✅ *វត្តមានជាក់ស្តែង:* ៩៨.៥%
⚠️ *សិស្សសុំច្បាប់:* ២ នាក់
❌ *សិស្សអវត្តមានឥតច្បាប់:* ០ នាក់

👩‍🏫 *លោកគ្រូ-អ្នកគ្រូប្រចាំការ:* {{teacher_count}} នាក់
រាយការណ៍ដោយប្រព័ន្ធ *Telegram_Notify_bot* ស្វ័យប្រវត្តិ។`,
    isPreset: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'tmpl-staff-meeting',
    title: '👨‍🏫 សេចក្តីកោះប្រជុំគណៈគ្រប់គ្រង & លោកគ្រូ-អ្នកគ្រូ',
    category: 'meeting',
    icon: '👥',
    description: 'កោះប្រជុំប្រចាំសប្តាហ៍ ឬប្រចាំខែដើម្បីពិភាក្សាការងារអប់រំ',
    content: `🔔 *សេចក្តីជូនដំណឹងស្តីពីកិច្ចប្រជុំបុគ្គលិកអប់រំ* 👥
🏫 *សាលារៀន:* {{school_name}}

សូមគោរពអញ្ជើញលោកគ្រូ-អ្នកគ្រូ និងបុគ្គលិករដ្ឋបាលទាំងអស់ ចូលរួមកិច្ចប្រជុំប្រចាំសប្តាហ៍៖
📅 *កាលបរិច្ឆេទ:* {{date}}
⏰ *វេលាម៉ោង:* {{time}}
📍 *ទីកន្លែង:* បន្ទប់ប្រជុំធំសាលារៀន

📋 *របៀបវារៈសំខាន់ៗ:*
១. វាយតម្លៃវឌ្ឍនភាពការបង្រៀន និងវត្តមានសិស្ស
២. ត្រៀមរៀបចំការប្រឡងឆមាស និងសកម្មភាពកីឡា
៣. បញ្ហាផ្សេងៗ និងមតិបូកសរុប

សូមលោកគ្រូ-អ្នកគ្រូមកឱ្យបានទាន់ពេលវេលា។
✍️ *នាយកសាលា:* {{principal_name}}`,
    isPreset: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'tmpl-urgent-holiday',
    title: '🚨 សេចក្តីជូនដំណឹងបន្ទាន់ / ឈប់សម្រាកបុណ្យជាតិ',
    category: 'urgent',
    icon: '🚨',
    description: 'ជូនដំណឹងអំពីការឈប់សម្រាកផ្លូវការ ឬឧប្បត្តិហេតុអាកាសធាតុ',
    content: `🚨 *សេចក្តីជូនដំណឹងបន្ទាន់ស្តីពីការឈប់សម្រាក* 🏖️
🏫 *សាលារៀន:* {{school_name}}

សូមជម្រាបជូនមាតាបិតា អាណាព្យាបាល និងសិស្សានុសិស្សទាំងអស់ឱ្យបានជ្រាបថា សាលារៀននឹងត្រូវផ្អាកការសិក្សាជាបណ្តោះអាសន្ន៖
📅 *ចាប់ពីថ្ងៃទី:* {{date}}
🔄 *ចូលរៀនឡើងវិញនៅថ្ងៃ:* តាមការជូនដំណឹងបន្ទាប់

សូមមាតាបិតាជួយណែនាំកូនៗឱ្យបន្តស្វ័យសិក្សា និងថែរក្សាសុខភាពឱ្យបានល្អ។
☎️ *ទំនាក់ទំនងសាលា:* {{principal_phone}}
សូមអរគុណ!`,
    isPreset: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'tmpl-honor-students',
    title: '🏆 ការអបអរសាទរសិស្សឆ្នើមប្រចាំខែ',
    category: 'academic',
    icon: '🏆',
    description: 'ប្រកាសកោតសរសើរ និងលើកទឹកចិត្តសិស្សដែលទទួលបានចំណាត់ថ្នាក់ល្អ',
    content: `🏆 *អបអរសាទរសិស្សឆ្នើមប្រចាំខែ* 🌟
🏫 *សាលារៀន:* {{school_name}}
📅 *ឆ្នាំសិក្សា:* {{academic_year}}

គណៈគ្រប់គ្រង និងលោកគ្រូ-អ្នកគ្រូ សូមសម្តែងនូវការកោតសរសើរ និងអបអរសាទរយ៉ាងកក់ក្តៅចំពោះសិស្សានុសិស្សឆ្នើមទាំងអស់ ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ និងទទួលបានលទ្ធផលគំរូ!

🎉 *សូមបន្តរក្សា និងពង្រឹងស្មារតីឧស្សាហ៍ព្យាយាម ដើម្បីអនាគតដ៏ភ្លឺស្វាង!* 📚✨
✍️ *គណៈគ្រប់គ្រងសាលា:* {{principal_name}}`,
    isPreset: true,
    createdAt: '2026-08-20'
  }
];

const LOCAL_STORAGE_KEY = 'telegram_bot_templates_store';

export const TelegramTemplateManager: React.FC = () => {
  const { schoolProfile, students, teachers, showToast } = useSchool();
  
  const [templates, setTemplates] = useState<TelegramTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRESET_TEMPLATES;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(INITIAL_PRESET_TEMPLATES[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom Variables for dynamic placeholder replacement
  const [customDate, setCustomDate] = useState<string>(new Date().toLocaleDateString('km-KH'));
  const [customTime, setCustomTime] = useState<string>('07:30 ព្រឹក');
  const [customLocation, setCustomLocation] = useState<string>('សាលប្រជុំ / បន្ទប់រៀនសាលាបឋមសិក្សាភ្នំពុំ');
  
  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TelegramTemplate | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'announcement' | 'academic' | 'attendance' | 'meeting' | 'urgent' | 'general'>('announcement');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIcon, setFormIcon] = useState('📢');

  // Direct sending state
  const [isSending, setIsSending] = useState(false);
  const [targetChatId, setTargetChatId] = useState('240224709');

  // Save templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error(e);
    }
  }, [templates]);

  // Find currently selected template
  const currentTemplate = useMemo(() => {
    const safeTemplates = Array.isArray(templates) ? templates.filter(Boolean) : [];
    return safeTemplates.find(t => t && t.id === selectedTemplateId) || safeTemplates[0] || null;
  }, [templates, selectedTemplateId]);

  // Dynamic Variable Replacer
  const resolvedContent = useMemo(() => {
    if (!currentTemplate) return '';
    let text = currentTemplate.content;
    text = text.replace(/\{\{school_name\}\}/g, schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ');
    text = text.replace(/\{\{academic_year\}\}/g, schoolProfile.academicYear || '២០២៥-២០២៦');
    text = text.replace(/\{\{principal_name\}\}/g, schoolProfile.principalName || 'លឹម សន');
    text = text.replace(/\{\{principal_phone\}\}/g, schoolProfile.principalPhone || '012 345 678');
    text = text.replace(/\{\{student_count\}\}/g, students.length.toString() || '៤២៥');
    text = text.replace(/\{\{teacher_count\}\}/g, teachers.length.toString() || '១៨');
    text = text.replace(/\{\{date\}\}/g, customDate);
    text = text.replace(/\{\{time\}\}/g, customTime);
    text = text.replace(/\{\{location\}\}/g, customLocation);
    return text;
  }, [currentTemplate, schoolProfile, students, teachers, customDate, customTime, customLocation]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(tmpl => {
      const matchesCat = activeCategory === 'all' || tmpl.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  // Insert tag into form content
  const handleInsertTag = (tag: string) => {
    setFormContent(prev => prev + ' ' + tag);
  };

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormCategory('announcement');
    setFormDescription('');
    setFormContent(`📢 *សេចក្តីជូនដំណឹងថ្មី* 🏫\n*ស្ថាប័ន:* {{school_name}}\n*កាលបរិច្ឆេទ:* {{date}}\n\nសូមជម្រាបជូនដំណឹងដល់លោកគ្រូ-អ្នកគ្រូ និងសិស្សានុសិស្សថា៖\n...\n\nសូមអរគុណ!`);
    setFormIcon('📢');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: TelegramTemplate) => {
    setEditingTemplate(tmpl);
    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormDescription(tmpl.description);
    setFormContent(tmpl.content);
    setFormIcon(tmpl.icon || '📢');
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('សូមបំពេញចំណងជើង និងខ្លឹមសារពុម្ពសារ!', 'error');
      return;
    }

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? {
        ...t,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        content: formContent,
        icon: formIcon
      } : t));
      showToast('បានកែប្រែពុម្ពសារជោគជ័យ!', 'success');
    } else {
      const newTmpl: TelegramTemplate = {
        id: `tmpl-custom-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        description: formDescription,
        content: formContent,
        icon: formIcon,
        isPreset: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTemplates(prev => [newTmpl, ...prev]);
      setSelectedTemplateId(newTmpl.id);
      showToast('បានបង្កើតពុម្ពសារថ្មីជោគជ័យ!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបពុម្ពសារនេះមែនទេ?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplateId === id && templates.length > 1) {
        setSelectedTemplateId(templates.find(t => t.id !== id)?.id || '');
      }
      showToast('បានលុបពុម្ពសាររួចរាល់!', 'info');
    }
  };

  const handleDuplicateTemplate = (tmpl: TelegramTemplate) => {
    const copyTmpl: TelegramTemplate = {
      ...tmpl,
      id: `tmpl-copy-${Date.now()}`,
      title: `${tmpl.title} (ចម្លង)`,
      isPreset: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [copyTmpl, ...prev]);
    setSelectedTemplateId(copyTmpl.id);
    showToast('បានចម្លងពុម្ពសារជោគជ័យ!', 'success');
  };

  const handleCopyFormattedText = () => {
    navigator.clipboard.writeText(resolvedContent);
    showToast('បានចម្លងអត្ថបទពុម្ពសារទៅកាន់ Clipboard!', 'success');
  };

  const handleSendToTelegram = async () => {
    if (!resolvedContent.trim()) return;
    setIsSending(true);
    try {
      const res = await sendTelegramNotification({
        title: currentTemplate.title,
        message: resolvedContent,
        category: currentTemplate.category === 'academic' ? 'event' : 
                  currentTemplate.category === 'attendance' ? 'attendance' : 
                  currentTemplate.category === 'urgent' ? 'security' : 'announcement',
        chatId: targetChatId
      });

      if (res.success) {
        showToast(`បានផ្ញើសារតាមរយៈពុម្ព "${currentTemplate.title}" ទៅ Telegram រួចរាល់!`, 'success');
      } else {
        showToast(res.error || 'បរាជ័យក្នុងការផ្ញើសារ', 'error');
      }
    } catch (err: any) {
      showToast('បញ្ហាក្នុងការផ្ញើសារ: ' + err?.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <Bookmark className="w-7 h-7 text-indigo-200" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 px-3 py-0.5 rounded-full text-xs font-semibold mb-1 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Telegram Message Template Manager (ពុម្ពសារស្វ័យប្រវត្តិ)
            </div>
            <h2 className="text-xl font-bold font-moul">គ្រប់គ្រងពុម្ពសារតេលេក្រាម</h2>
            <p className="text-indigo-100 text-xs">
              បង្កើត រក្សាទុក និងកែច្នៃពុម្ពសារផ្លូវការសម្រាប់ប្រកាសជូនដំណឹង ការប្រឡង វត្តមាន និងកិច្ចប្រជុំជាមួយ Dynamic Variables
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          បង្កើតពុម្ពសារថ្មី
        </button>
      </div>

      {/* Main Grid: Left Template Selector & Right Editor/Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកពុម្ពសារ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ទាំងអស់ ({templates.length})
              </button>
              <button
                onClick={() => setActiveCategory('academic')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'academic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📝 ប្រឡង & សិក្សា
              </button>
              <button
                onClick={() => setActiveCategory('attendance')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📊 វត្តមាន
              </button>
              <button
                onClick={() => setActiveCategory('meeting')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'meeting' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👥 កិច្ចប្រជុំ
              </button>
              <button
                onClick={() => setActiveCategory('urgent')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'urgent' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🚨 បន្ទាន់
              </button>
            </div>
          </div>

          {/* Template List */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredTemplates.map(tmpl => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-lg shrink-0">
                        {tmpl.icon || '📢'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{tmpl.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tmpl.description}</p>
                      </div>
                    </div>

                    {tmpl.isPreset && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md shrink-0">
                        Preset
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tmpl.createdAt}
                    </span>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDuplicateTemplate(tmpl)}
                        title="ចម្លងពុម្ពសារ"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(tmpl)}
                        title="កែសម្រួលពុម្ពសារ"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!tmpl.isPreset && (
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          title="លុបពុម្ពសារ"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                រកមិនឃើញពុម្ពសារដែលត្រូវនឹងពាក្យស្វែងរកទេ
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Variable Customizer & Formatted Markdown Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5">
          {currentTemplate ? (
            <>
              {/* Header Info */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentTemplate.icon || '📢'}</span>
                    <h3 className="font-bold text-slate-900 text-base">{currentTemplate.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{currentTemplate.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFormattedText}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    ចម្លងអត្ថបទ
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(currentTemplate)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    កែពុម្ពសារ
                  </button>
                </div>
              </div>

              {/* Dynamic Variables Filler Controls */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    បញ្ចូលទិន្នន័យជាក់ស្តែង (Dynamic Placeholders):
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">ទិន្នន័យសាលា និងសិស្សត្រូវបានភ្ជាប់ស្វ័យប្រវត្តិ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">កាលបរិច្ឆេទ {'{{date}}'}:</label>
                    <input
                      type="text"
                      value={customDate}
                      onChange={e => setCustomDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">ម៉ោង {'{{time}}'}:</label>
                    <input
                      type="text"
                      value={customTime}
                      onChange={e => setCustomTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">ទីកន្លែង {'{{location}}'}:</label>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={e => setCustomLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Message Live Preview Card */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    ផ្ទាំងមើលសារជាក់ស្តែង (Telegram Preview):
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Markdown Format
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-b from-sky-50/70 to-indigo-50/40 border border-sky-200 shadow-inner font-battambang text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {resolvedContent}
                </div>
              </div>

              {/* Action Bar: Target Chat ID & Send Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Target Chat ID:</span>
                  <input
                    type="text"
                    value={targetChatId}
                    onChange={e => setTargetChatId(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sky-500 font-mono w-32"
                    placeholder="240224709"
                  />
                </div>

                <button
                  onClick={handleSendToTelegram}
                  disabled={isSending}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      កំពុងផ្ញើទៅ Telegram...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      ផ្ញើទៅ Telegram ភ្លាមៗ
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              សូមជ្រើសរើសពុម្ពសារដើម្បីមើល
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create or Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {editingTemplate ? 'កែសម្រួលពុម្ពសារ' : 'បង្កើតពុម្ពសារថ្មី'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">រូបតំណាង:</label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={e => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 text-center text-lg bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="📢"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ចំណងជើងពុម្ពសារ:</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ឧ. សេចក្តីប្រកាសកាលវិភាគប្រឡង..."
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទ (Category):</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-battambang"
                  >
                    <option value="announcement">📢 ប្រកាសទូទៅ</option>
                    <option value="academic">📝 ប្រឡង & សិក្សា</option>
                    <option value="attendance">📊 វត្តមាន</option>
                    <option value="meeting">👥 កិច្ចប្រជុំ</option>
                    <option value="urgent">🚨 បន្ទាន់</option>
                    <option value="general">🏫 ទូទៅ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ការពិពណ៌នាសង្ខេប:</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ឧ. សម្រាប់ជូនដំណឹងពីកាលបរិច្ឆេទប្រឡង..."
                />
              </div>

              {/* Dynamic Tag Injectors */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600">ចុចដើម្បីបញ្ចូល Dynamic Variables៖</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'ឈ្មោះសាលា', tag: '{{school_name}}' },
                    { label: 'ឆ្នាំសិក្សា', tag: '{{academic_year}}' },
                    { label: 'នាយកសាលា', tag: '{{principal_name}}' },
                    { label: 'លេខទូរស័ព្ទនាយក', tag: '{{principal_phone}}' },
                    { label: 'ចំនួនសិស្ស', tag: '{{student_count}}' },
                    { label: 'ចំនួនគ្រូ', tag: '{{teacher_count}}' },
                    { label: 'កាលបរិច្ឆេទ', tag: '{{date}}' },
                    { label: 'ម៉ោង', tag: '{{time}}' },
                    { label: 'ទីកន្លែង', tag: '{{location}}' }
                  ].map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag)}
                      className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-md text-[11px] font-mono font-semibold transition-colors"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ខ្លឹមសារសារ (Markdown Supported):</label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-battambang leading-relaxed"
                  placeholder="វាយអត្ថបទពុម្ពសារនៅទីនេះ..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  រក្សាទុកពុម្ពសារ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
