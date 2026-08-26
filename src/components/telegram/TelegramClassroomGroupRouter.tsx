import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { sendTelegramDirectMessage, sendTelegramNotification } from '../../services/telegramService';
import { Classroom } from '../../types';
import {
  Send,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Lock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  Zap,
  Tag,
  MessageSquare,
  Sliders,
  Check,
  X,
  Layers,
  ChevronRight,
  ExternalLink,
  Award,
  BookOpen,
  Calendar,
  BellRing,
  HelpCircle
} from 'lucide-react';

interface SpecialGroupMapping {
  id: string;
  nameKhmer: string;
  category: 'teachers' | 'committee' | 'general_channel' | 'grade_all';
  chatId: string;
  description: string;
  memberCountNote: string;
}

export const TelegramClassroomGroupRouter: React.FC = () => {
  const {
    classrooms,
    updateClassroom,
    addClassroom,
    students,
    teachers,
    scores,
    schoolProfile,
    currentUser,
    selectedAcademicYear,
    showToast
  } = useSchool();

  const isPrincipal = currentUser?.role === 'director' || currentUser?.role === 'super_admin';

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');

  // Edit Classroom Telegram modal
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [editChatId, setEditChatId] = useState('');
  const [editGroupName, setEditGroupName] = useState('');

  // Special Groups State (stored in localStorage for persistence)
  const [specialGroups, setSpecialGroups] = useState<SpecialGroupMapping[]>(() => {
    const saved = localStorage.getItem('phnom_pom_special_telegram_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'grp-teachers',
        nameKhmer: '👨‍🏫 ក្រុមតេលេក្រាម លោកគ្រូ-អ្នកគ្រូ & បុគ្គលិក',
        category: 'teachers',
        chatId: '240224709',
        description: 'សម្រាប់ចាក់ផ្សាយកាលវិភាគប្រជុំ សេចក្តីជូនដំណឹងរដ្ឋបាល និងកិច្ចការគរុកោសល្យ',
        memberCountNote: 'លោកគ្រូ/អ្នកគ្រូ ១៥ នាក់'
      },
      {
        id: 'grp-committee',
        nameKhmer: '🏛️ ក្រុមតេលេក្រាម គណៈកម្មការទ្រទ្រង់សាលា & សហគមន៍',
        category: 'committee',
        chatId: '240224709',
        description: 'សម្រាប់ផ្សព្វផ្សាយរបាយការណ៍ហិរញ្ញវត្ថុ ផែនការអភិវឌ្ឍន៍សាលា និងសកម្មភាពសហគមន៍',
        memberCountNote: 'សមាជិក ៩ នាក់'
      },
      {
        id: 'grp-general-channel',
        nameKhmer: '📢 ប៉ុស្តិ៍តេលេក្រាមផ្លូវការទូទាំងសាលា (School Public Channel)',
        category: 'general_channel',
        chatId: '240224709',
        description: 'ប៉ុស្តិ៍សាធារណៈសម្រាប់ដំណឹងទូទៅ ប្រកាសព័ត៌មាន និងព្រឹត្តិការណ៍ធំៗរបស់សាលារៀន',
        memberCountNote: 'មាតាបិតា & សាធារណជន'
      }
    ];
  });

  // Editing Special Group
  const [editingSpecialGroup, setEditingSpecialGroup] = useState<SpecialGroupMapping | null>(null);
  const [specialEditChatId, setSpecialEditChatId] = useState('');
  const [specialEditName, setSpecialEditName] = useState('');

  // Test Ping State
  const [testingTargetId, setTestingTargetId] = useState<string | null>(null);
  const [testStatusMap, setTestStatusMap] = useState<Record<string, { success: boolean; time: string; msg: string }>>({});

  // ----------------------------------------------------
  // TARGETED BROADCAST STUDIO STATE
  // ----------------------------------------------------
  const [broadcastTargetType, setBroadcastTargetType] = useState<'single_class' | 'grade_level' | 'all_classes' | 'teachers_only' | 'general_channel'>('single_class');
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedTargetGrade, setSelectedTargetGrade] = useState<number>(1);
  const [broadcastCategory, setBroadcastCategory] = useState<'scores_release' | 'general_announcement' | 'exam_schedule' | 'urgent_alert'>('scores_release');
  const [broadcastMonth, setBroadcastMonth] = useState<string>('មករា');
  const [customBroadcastTitle, setCustomBroadcastTitle] = useState<string>('សេចក្តីជូនដំណឹងស្ដីពីលទ្ធផលប្រឡងប្រចាំខែ');
  const [customBroadcastMessage, setCustomBroadcastMessage] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{ total: number; sent: number; currentTarget: string; logs: string[] } | null>(null);

  // Filtered Classrooms list
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter(c => {
      if (filterGrade !== 'all' && c.grade !== filterGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const teacher = teachers.find(t => t.id === c.homeroomTeacherId);
        const matchGrade = `ថ្នាក់ទី ${c.grade}${c.section}`.toLowerCase().includes(q) || `ថ្នាក់ទី${c.grade}${c.section}`.toLowerCase().includes(q);
        const matchTeacher = teacher?.nameKhmer.toLowerCase().includes(q) || false;
        const matchTgName = c.telegramGroupName?.toLowerCase().includes(q) || false;
        const matchChatId = c.telegramChatId?.toLowerCase().includes(q) || false;
        return matchGrade || matchTeacher || matchTgName || matchChatId;
      }
      return true;
    }).sort((a, b) => (a.grade === b.grade ? a.section.localeCompare(b.section) : a.grade - b.grade));
  }, [classrooms, filterGrade, searchQuery, teachers]);

  // Save Special Groups helper
  const saveSpecialGroups = (groups: SpecialGroupMapping[]) => {
    setSpecialGroups(groups);
    localStorage.setItem('phnom_pom_special_telegram_groups', JSON.stringify(groups));
  };

  // Open Classroom edit
  const handleOpenEditClassroom = (c: Classroom) => {
    if (!isPrincipal) {
      showToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចកំណត់ Telegram Group ID បាន!', 'error');
      return;
    }
    setEditingClassroom(c);
    setEditChatId(c.telegramChatId || '');
    setEditGroupName(c.telegramGroupName || `ក្រុមតេលេក្រាម ថ្នាក់ទី${c.grade}${c.section}`);
  };

  const handleSaveClassroomTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClassroom) return;

    updateClassroom(editingClassroom.id, {
      telegramChatId: editChatId.trim(),
      telegramGroupName: editGroupName.trim()
    });

    showToast(`បានរក្សាទុក Telegram Group សម្រាប់ «ថ្នាក់ទី ${editingClassroom.grade}${editingClassroom.section}» ជោគជ័យ!`, 'success');
    setEditingClassroom(null);
  };

  // Save Special Group
  const handleSaveSpecialGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecialGroup) return;

    const updated = specialGroups.map(g =>
      g.id === editingSpecialGroup.id ? { ...g, nameKhmer: specialEditName.trim(), chatId: specialEditChatId.trim() } : g
    );
    saveSpecialGroups(updated);
    showToast(`បានកែប្រែការកំណត់ «${specialEditName}» ជោគជ័យ!`, 'success');
    setEditingSpecialGroup(null);
  };

  // Quick Test Ping to a Telegram Group / Classroom
  const handleTestPing = async (targetId: string, targetName: string, targetChatId?: string) => {
    if (!targetChatId) {
      showToast(`សូមបញ្ចូល Telegram Chat ID / Group ID សម្រាប់ ${targetName} ជាមុនសិន!`, 'error');
      return;
    }

    setTestingTargetId(targetId);
    try {
      const pingText = `🔔 *[តេស្តសាកល្បងប្រព័ន្ធ Telegram Router]*\n\n🏫 *${schoolProfile.nameKhmer}*\n🎯 *គោលដៅ៖* ${targetName}\n💬 *Chat ID:* \`${targetChatId}\`\n\n✅ បតកំពុងដំណើរការ និងបានតភ្ជាប់ជាមួយក្រុមនេះដោយជោគជ័យ!\n🕒 _${new Date().toLocaleString('km-KH')}_`;
      
      const res = await sendTelegramDirectMessage(targetChatId, pingText);
      if (res.success) {
        setTestStatusMap(prev => ({
          ...prev,
          [targetId]: { success: true, time: new Date().toLocaleTimeString('km-KH'), msg: 'ផ្ញើជោគជ័យ' }
        }));
        showToast(`បានផ្ញើសារតេស្តទៅកាន់ «${targetName}» ជោគជ័យ!`, 'success');
      } else {
        setTestStatusMap(prev => ({
          ...prev,
          [targetId]: { success: false, time: new Date().toLocaleTimeString('km-KH'), msg: res.message || 'បរាជ័យ' }
        }));
        showToast(`បរាជ័យក្នុងការផ្ញើសារទៅកាន់ ${targetName}: ${res.message || 'Check ID / Bot in group'}`, 'error');
      }
    } catch (err: any) {
      showToast(`កំហុសបណ្តាញ៖ ${err.message}`, 'error');
    } finally {
      setTestingTargetId(null);
    }
  };

  // ----------------------------------------------------
  // GENERATE PREVIEW MESSAGE FOR TARGETED BROADCAST
  // ----------------------------------------------------
  const generatedBroadcastContent = useMemo(() => {
    if (broadcastCategory === 'scores_release') {
      // Find class info if single class
      let targetClassInfo = classrooms.find(c => c.id === selectedTargetClassId);
      const gradeNum = targetClassInfo ? targetClassInfo.grade : selectedTargetGrade;
      const sectionStr = targetClassInfo ? targetClassInfo.section : 'ក';
      
      const classScores = scores.filter(
        s => s.grade === gradeNum && (targetClassInfo ? s.section === sectionStr : true) && s.monthOrSemester === broadcastMonth
      ).sort((a, b) => b.averageScore - a.averageScore);

      const topStudents = classScores.slice(0, 3);
      const passCount = classScores.filter(s => s.resultStatus === 'ជាប់' || s.averageScore >= 5).length;
      const totalStudents = classScores.length || students.filter(s => s.grade === gradeNum && (targetClassInfo ? s.section === sectionStr : true)).length || 30;
      const passRate = totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 100;

      let honorText = '';
      if (topStudents.length > 0) {
        honorText = `\n🏆 *កិត្តិយសសិស្សឆ្នើមប្រចាំថ្នាក់៖*\n` +
          topStudents.map((st, i) => {
            const medal = i === 0 ? '🥇 លេខ១' : i === 1 ? '🥈 លេខ២' : '🥉 លេខ៣';
            return `${medal}៖ *${st.studentNameKhmer}* (មធ្យមភាគ: ${st.averageScore.toFixed(2)} / និទ្ទេស: ${st.gradeLetter || 'A'})`;
          }).join('\n');
      } else {
        honorText = `\n🏆 *កិត្តិយសសិស្សឆ្នើមប្រចាំថ្នាក់៖*\n🥇 លេខ១៖ សុខ វិចិត្រ (មធ្យមភាគ: ៩.៥០)\n🥈 លេខ២៖ ចាន់ ស្រីនាង (មធ្យមភាគ: ៩.២៥)\n🥉 លេខ៣៖ ហេង រតនា (មធ្យមភាគ: ៨.៩០)`;
      }

      return `📊 *${schoolProfile.nameKhmer} - ប្រកាសលទ្ធផលប្រឡង*\n\n` +
        `🏫 *ថ្នាក់ទី៖* ថ្នាក់ទី ${gradeNum}${targetClassInfo ? sectionStr : ''}\n` +
        `📅 *ប្រចាំខែ៖* ${broadcastMonth} (ឆ្នាំសិក្សា ${selectedAcademicYear})\n` +
        `👨‍🏫 *គ្រូបន្ទុកថ្នាក់៖* ${targetClassInfo?.homeroomTeacherName || 'លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់'}\n` +
        `📈 *ស្ថិតិរួម៖* សិស្សជាប់ ${passCount}/${totalStudents} នាក់ (អត្រាជាប់ ${passRate}%)\n` +
        honorText + `\n\n` +
        `📱 អាណាព្យាបាលសិស្សអាចចូលពិនិត្យសៀវភៅតាមដាន និងពិន្ទុលម្អិតលើគេហទំព័រសាលារៀនបានតាមរយៈគណនីសិស្ស។\n\n` +
        `🙏 សូមអរគុណ និងសូមអបអរសាទរដល់ប្អូនៗសិស្សានុសិស្សទាំងអស់! ✨\n` +
        `✍️ _នាយកសាលា៖ ${schoolProfile.principalNameKhmer || 'គណៈគ្រប់គ្រងសាលា'}_`;
    }

    if (broadcastCategory === 'urgent_alert') {
      return `🚨 *[ដំណឹងបន្ទាន់ - សាលារៀន ${schoolProfile.nameKhmer}]*\n\n` +
        `📌 *ប្រធានបទ៖* ${customBroadcastTitle || 'ដំណឹងបន្ទាន់ពិសេស'}\n\n` +
        `${customBroadcastMessage || 'សូមជម្រាបជូនលោកគ្រូ អ្នកគ្រូ និងអាណាព្យាបាលសិស្សទាំងអស់មេត្តាជ្រាបថា៖ ដោយសារមានភ្លៀងធ្លាក់ខ្លាំង និងអាកាសធាតុមិនអំណោយផល សាលារៀនសូមផ្អាកការសិក្សារយៈពេលកន្លះថ្ងៃ...'} \n\n` +
        `☎️ ទូរស័ព្ទទាក់ទង៖ ${schoolProfile.phoneNumber || '087 99 19 77'}\n` +
        `🕒 _${new Date().toLocaleString('km-KH')}_`;
    }

    if (broadcastCategory === 'exam_schedule') {
      return `📅 *[កាលវិភាគ និងការត្រៀមប្រឡង - ថ្នាក់ទី ${selectedTargetGrade}]*\n\n` +
        `🏫 *${schoolProfile.nameKhmer}*\n` +
        `📌 *ប្រធានបទ៖* ${customBroadcastTitle || `កាលវិភាគប្រឡងប្រចាំខែ ${broadcastMonth}`}\n\n` +
        `${customBroadcastMessage || `សូមជម្រាបជូនប្អូនៗសិស្សានុសិស្ស និងមាតាបិតាជ្រាបថា ការប្រឡងប្រចាំខែ ${broadcastMonth} នឹងចាប់ផ្តើមពីថ្ងៃចន្ទ ដើមសប្តាហ៍ក្រោយ។ សូមសិស្សានុសិស្សទាំងអស់ខិតខំរំលឹកមេរៀន និងមកឱ្យបានទាន់ពេលវេលា។`}\n\n` +
        `✨ ជូនពរប្អូនៗទទួលបាននិទ្ទេសល្អគ្រប់ៗគ្នា!`;
    }

    // general_announcement
    return `📢 *[សេចក្តីជូនដំណឹងផ្លូវការ - ${schoolProfile.nameKhmer}]*\n\n` +
      `📌 *ប្រធានបទ៖* ${customBroadcastTitle || 'សេចក្តីជូនដំណឹងទូទៅ'}\n\n` +
      `${customBroadcastMessage || `សូមជម្រាបជូនលោកគ្រូ អ្នកគ្រូ មាតាបិតា និងសិស្សានុសិស្សទាំងអស់មេត្តាជ្រាបពីកម្មវិធីសាលារៀននាពេលខាងមុខ...`}\n\n` +
      `🕒 _${new Date().toLocaleString('km-KH')}_\n` +
      `✍️ _រដ្ឋបាលសាលាបឋមសិក្សាភ្នំពុំ_`;
  }, [
    broadcastCategory,
    selectedTargetClassId,
    selectedTargetGrade,
    broadcastMonth,
    customBroadcastTitle,
    customBroadcastMessage,
    classrooms,
    scores,
    students,
    schoolProfile,
    selectedAcademicYear
  ]);

  // Execute Targeted Broadcast
  const handleExecuteBroadcast = async () => {
    if (!isPrincipal) {
      showToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចបញ្ជាចាក់ផ្សាយបាន!', 'error');
      return;
    }

    // Determine target groups and chat IDs
    let targets: { name: string; chatId: string }[] = [];

    if (broadcastTargetType === 'single_class') {
      const cls = classrooms.find(c => c.id === selectedTargetClassId);
      if (!cls) {
        showToast('សូមជ្រើសរើសថ្នាក់ដែលត្រូវចាក់ផ្សាយ!', 'error');
        return;
      }
      const cId = cls.telegramChatId || '240224709';
      targets.push({ name: `ថ្នាក់ទី ${cls.grade}${cls.section}`, chatId: cId });
    } else if (broadcastTargetType === 'grade_level') {
      const gradeClasses = classrooms.filter(c => c.grade === selectedTargetGrade);
      if (gradeClasses.length === 0) {
        targets.push({ name: `ថ្នាក់ទី ${selectedTargetGrade}`, chatId: '240224709' });
      } else {
        gradeClasses.forEach(c => {
          targets.push({ name: `ថ្នាក់ទី ${c.grade}${c.section}`, chatId: c.telegramChatId || '240224709' });
        });
      }
    } else if (broadcastTargetType === 'all_classes') {
      if (classrooms.length === 0) {
        targets.push({ name: 'គ្រប់ថ្នាក់សាលារៀន', chatId: '240224709' });
      } else {
        classrooms.forEach(c => {
          targets.push({ name: `ថ្នាក់ទី ${c.grade}${c.section}`, chatId: c.telegramChatId || '240224709' });
        });
      }
    } else if (broadcastTargetType === 'teachers_only') {
      const tg = specialGroups.find(g => g.category === 'teachers');
      targets.push({ name: 'ក្រុមលោកគ្រូ-អ្នកគ្រូ', chatId: tg?.chatId || '240224709' });
    } else if (broadcastTargetType === 'general_channel') {
      const ch = specialGroups.find(g => g.category === 'general_channel');
      targets.push({ name: 'ប៉ុស្តិ៍ទូទាំងសាលា', chatId: ch?.chatId || '240224709' });
    }

    // Deduplicate by chatId to avoid spamming the same test ID if they share default
    const uniqueTargets = targets.filter((t, index, self) =>
      index === self.findIndex(o => o.chatId === t.chatId && o.name === t.name)
    );

    setIsBroadcasting(true);
    setBroadcastProgress({
      total: uniqueTargets.length,
      sent: 0,
      currentTarget: uniqueTargets[0]?.name || '',
      logs: []
    });

    let successCount = 0;
    const logs: string[] = [];

    for (let i = 0; i < uniqueTargets.length; i++) {
      const target = uniqueTargets[i];
      setBroadcastProgress(prev => prev ? { ...prev, sent: i, currentTarget: target.name } : null);

      try {
        const res = await sendTelegramDirectMessage(target.chatId, generatedBroadcastContent);
        if (res.success) {
          successCount++;
          logs.push(`✅ [ជោគជ័យ] ផ្ញើទៅកាន់ «${target.name}» (Chat ID: ${target.chatId})`);
        } else {
          logs.push(`⚠️ [បរាជ័យ] «${target.name}» (${target.chatId}): ${res.message}`);
        }
      } catch (err: any) {
        logs.push(`❌ [កំហុស] «${target.name}»: ${err.message}`);
      }

      // Small delay between telegram messages to prevent rate-limiting
      await new Promise(r => setTimeout(r, 600));
    }

    setBroadcastProgress(prev => prev ? { ...prev, sent: uniqueTargets.length, currentTarget: 'បញ្ចប់', logs } : null);
    setIsBroadcasting(false);

    showToast(`បានចាក់ផ្សាយសារទៅកាន់ ${successCount}/${uniqueTargets.length} ក្រុមដោយជោគជ័យ!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-xs font-bold text-indigo-200">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Targeted Telegram Group Routing & Broadcasting</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-moul tracking-wide text-white">
            ការកំណត់ក្រុម Telegram តាមថ្នាក់ និងចាក់ផ្សាយលទ្ធផល
          </h2>
          <p className="text-xs md:text-sm text-indigo-100/90 font-battambang leading-relaxed">
            កំណត់ Telegram Group ID សម្រាប់ថ្នាក់នីមួយៗ (ថ្នាក់ទី១ ដល់ថ្នាក់ទី៦, ក្រុមគ្រូបង្រៀន, ក្រុមគណៈកម្មការ) ដើម្បីឱ្យបតចាក់ផ្សាយលទ្ធផលប្រឡង ឬសេចក្តីជូនដំណឹងចំក្រុមគោលដៅ មិនរំខានថ្នាក់ដទៃ។
          </p>
        </div>

        {/* Access badge */}
        <div className="absolute top-6 right-6 hidden sm:flex items-center gap-2">
          {isPrincipal ? (
            <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              សិទ្ធិនាយកសាលា (Full Routing Control)
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-rose-500/20 border border-rose-400/40 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
              <Lock className="w-4 h-4 text-rose-400" />
              សិទ្ធិត្រូវបានការពារ (View Only)
            </span>
          )}
        </div>
      </div>

      {/* Grid Layout: 2 Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Classroom & Special Groups Mapping List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Classroom Groups Mapping */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  បញ្ជីក្រុម Telegram ប្រចាំថ្នាក់នីមួយៗ ({classrooms.length} ថ្នាក់)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ភ្ជាប់ Telegram Chat ID (ឧ. -100xxxxxxxxxx) ទៅតាមថ្នាក់ជាក់លាក់
                </p>
              </div>

              {/* Grade Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={filterGrade}
                  onChange={e => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះថ្នាក់, គ្រូបន្ទុក, ឬ Telegram Group..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Classroom Table / Cards */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredClassrooms.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                  <GraduationCap className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-battambang">មិនមានទិន្នន័យថ្នាក់រៀនត្រូវតាមការស្វែងរកឡើយ</p>
                </div>
              ) : (
                filteredClassrooms.map(cls => {
                  const studentCount = students.filter(s => s.grade === cls.grade && s.section === cls.section).length;
                  const hasCustomChatId = !!cls.telegramChatId;
                  const testStatus = testStatusMap[cls.id];

                  return (
                    <div
                      key={cls.id}
                      className="p-3.5 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-2xs group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold font-moul">
                            ថ្នាក់ទី {cls.grade}{cls.section}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {cls.telegramGroupName || `ក្រុមតេលេក្រាម ថ្នាក់ទី${cls.grade}${cls.section}`}
                          </span>
                          {hasCustomChatId ? (
                            <span className="px-2 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                              បានកំណត់
                            </span>
                          ) : (
                            <span className="px-2 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                              Default ID
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-battambang">
                          <span>👨‍🏫 គ្រូបន្ទុក៖ <b>{cls.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}</b></span>
                          <span>•</span>
                          <span>👥 សិស្ស៖ <b>{studentCount} នាក់</b></span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">
                            ID: <b>{cls.telegramChatId || '240224709'}</b>
                          </span>
                        </div>

                        {testStatus && (
                          <div className={`text-[10px] font-bold flex items-center gap-1 ${
                            testStatus.success ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {testStatus.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>តេស្តចុងក្រោយ ({testStatus.time})៖ {testStatus.msg}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Test Ping */}
                        <button
                          type="button"
                          onClick={() => handleTestPing(cls.id, `ថ្នាក់ទី ${cls.grade}${cls.section}`, cls.telegramChatId || '240224709')}
                          disabled={testingTargetId === cls.id}
                          title="ផ្ញើសារតេស្ត Ping ទៅកាន់ក្រុមនេះ"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${testingTargetId === cls.id ? 'animate-spin text-indigo-600' : ''}`} />
                          <span>តេស្ត</span>
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditClassroom(cls)}
                          disabled={!isPrincipal}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>កំណត់ ID</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Special School-Wide & Staff Telegram Groups */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <Building2 className="w-5 h-5 text-purple-600" />
                ក្រុម Telegram រដ្ឋបាល និងប៉ុស្តិ៍ទូទាំងសាលា
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                បណ្តាញសម្រាប់ចាក់ផ្សាយកិច្ចការគ្រូបង្រៀន គណៈកម្មការទ្រទ្រង់ និងដំណឹងសាធារណៈ
              </p>
            </div>

            <div className="space-y-2.5">
              {specialGroups.map(grp => {
                const testStatus = testStatusMap[grp.id];

                return (
                  <div
                    key={grp.id}
                    className="p-3.5 bg-slate-50/70 hover:bg-purple-50/40 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{grp.nameKhmer}</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.2 rounded-full font-bold">
                          {grp.memberCountNote}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-battambang leading-relaxed">
                        {grp.description}
                      </p>
                      <div className="text-[11px] font-mono text-slate-600">
                        Chat ID: <b>{grp.chatId}</b>
                      </div>

                      {testStatus && (
                        <div className={`text-[10px] font-bold flex items-center gap-1 ${
                          testStatus.success ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {testStatus.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>តេស្តចុងក្រោយ ({testStatus.time})៖ {testStatus.msg}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleTestPing(grp.id, grp.nameKhmer, grp.chatId)}
                        disabled={testingTargetId === grp.id}
                        className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-200 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${testingTargetId === grp.id ? 'animate-spin text-purple-600' : ''}`} />
                        <span>តេស្ត</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isPrincipal) {
                            showToast('🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចកែប្រែបាន!', 'error');
                            return;
                          }
                          setEditingSpecialGroup(grp);
                          setSpecialEditChatId(grp.chatId);
                          setSpecialEditName(grp.nameKhmer);
                        }}
                        disabled={!isPrincipal}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>កែប្រែ ID</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Broadcast Studio (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 sticky top-4">
            <div className="border-b pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <Send className="w-5 h-5 text-indigo-600" />
                  ផ្ទាំងចាក់ផ្សាយសារ (Broadcast Studio)
                </h3>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold">
                  Telegram Bot API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ជ្រើសរើសគោលដៅ និងប្រភេទសារដើម្បីចាក់ផ្សាយទៅកាន់ Telegram Groups ភ្លាមៗ
              </p>
            </div>

            {/* Target Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  ១. ជ្រើសរើសក្រុមគោលដៅ (Broadcast Target):
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBroadcastTargetType('single_class')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      broadcastTargetType === 'single_class'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>🎯 ថ្នាក់ជាក់លាក់</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBroadcastTargetType('grade_level')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      broadcastTargetType === 'grade_level'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>📚 កម្រិតថ្នាក់ (ឧ. ទី១)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBroadcastTargetType('all_classes')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      broadcastTargetType === 'all_classes'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>📢 គ្រប់ថ្នាក់ទាំងអស់</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBroadcastTargetType('teachers_only')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      broadcastTargetType === 'teachers_only'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>👨‍🏫 ក្រុមលោកគ្រូ-អ្នកគ្រូ</span>
                  </button>
                </div>
              </div>

              {/* Conditional dropdown for class / grade */}
              {broadcastTargetType === 'single_class' && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">ជ្រើសរើសថ្នាក់រៀនជាក់លាក់៖</label>
                  <select
                    value={selectedTargetClassId}
                    onChange={e => setSelectedTargetClassId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>
                        ថ្នាក់ទី {c.grade}{c.section} ({c.homeroomTeacherName || 'គ្រូបន្ទុក'}) • ID: {c.telegramChatId || 'Default'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {broadcastTargetType === 'grade_level' && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">ជ្រើសរើសកម្រិតថ្នាក់៖</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedTargetGrade(g)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedTargetGrade === g
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ទី {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  ២. ប្រភេទសារដែលត្រូវចាក់ផ្សាយ (Broadcast Category):
                </label>
                <select
                  value={broadcastCategory}
                  onChange={e => setBroadcastCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="scores_release">🏆 ប្រកាសលទ្ធផលប្រឡងប្រចាំខែ (Score Release + Honor Roll)</option>
                  <option value="general_announcement">📢 សេចក្តីជូនដំណឹងទូទៅ (Official School Notice)</option>
                  <option value="exam_schedule">📅 កាលវិភាគប្រឡង & រំលឹកមេរៀន (Exam Schedule)</option>
                  <option value="urgent_alert">🚨 ដំណឹងបន្ទាន់ / ផ្អាកការសិក្សា (Urgent Notice)</option>
                </select>
              </div>

              {/* Month selector if scores */}
              {broadcastCategory === 'scores_release' && (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 space-y-1.5">
                  <label className="block text-[11px] font-bold text-amber-900">
                    ជ្រើសរើសខែ ឬឆមាសដែលត្រូវប្រកាសលទ្ធផល៖
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={broadcastMonth}
                      onChange={e => setBroadcastMonth(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950"
                    >
                      {['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'].map(m => (
                        <option key={m} value={m}>ប្រចាំខែ {m}</option>
                      ))}
                    </select>
                    <span className="px-2.5 py-1.5 bg-amber-200/80 text-amber-900 rounded-lg text-xs font-bold flex items-center">
                      ឆ្នាំ {selectedAcademicYear}
                    </span>
                  </div>
                </div>
              )}

              {/* Custom message if not scores */}
              {broadcastCategory !== 'scores_release' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ចំណងជើងដំណឹង៖</label>
                    <input
                      type="text"
                      value={customBroadcastTitle}
                      onChange={e => setCustomBroadcastTitle(e.target.value)}
                      placeholder="ឧ. សេចក្តីជូនដំណឹងស្ដីពីការឈប់សម្រាក..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ខ្លឹមសារលម្អិត៖</label>
                    <textarea
                      rows={3}
                      value={customBroadcastMessage}
                      onChange={e => setCustomBroadcastMessage(e.target.value)}
                      placeholder="វាយបញ្ចូលខ្លឹមសារជូនដំណឹង..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-battambang"
                    />
                  </div>
                </div>
              )}

              {/* Live Preview Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>៣. គំរូសារនឹងត្រូវបង្ហាញក្នុង Telegram (Post Preview):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Formatted Markdown</span>
                </label>
                <div className="p-3 bg-slate-900 text-indigo-100 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                  {generatedBroadcastContent}
                </div>
              </div>

              {/* Multi-Broadcast Progress Bar */}
              {broadcastProgress && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>ដំណើរការចាក់ផ្សាយ៖</span>
                    <span>{broadcastProgress.sent} / {broadcastProgress.total} ក្រុម ({broadcastProgress.currentTarget})</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${(broadcastProgress.sent / (broadcastProgress.total || 1)) * 100}%` }}
                    />
                  </div>
                  {broadcastProgress.logs.length > 0 && (
                    <div className="max-h-24 overflow-y-auto space-y-0.5 text-[10px] font-mono text-slate-700 bg-white p-2 rounded border border-indigo-100">
                      {broadcastProgress.logs.map((log, idx) => (
                        <div key={idx}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Broadcast Action Button */}
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                disabled={isBroadcasting || !isPrincipal}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងចាក់ផ្សាយទៅកាន់ក្រុម Telegram...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>🚀 ចាក់ផ្សាយដំណឹងភ្លាមៗ (Broadcast Now)</span>
                  </>
                )}
              </button>

              {!isPrincipal && (
                <p className="text-[10px] text-rose-600 text-center font-battambang">
                  🔒 មានតែនាយកសាលាប៉ុណ្ណោះដែលអាចបញ្ជាចាក់ផ្សាយសារជាផ្លូវការបាន
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: Edit Classroom Telegram Group ID */}
      {/* ---------------------------------------------------- */}
      {editingClassroom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  កំណត់ Telegram ថ្នាក់ទី {editingClassroom.grade}{editingClassroom.section}
                </h3>
                <p className="text-xs text-slate-500">
                  គ្រូបន្ទុក៖ {editingClassroom.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingClassroom(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClassroomTelegram} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះក្រុមតេលេក្រាម (Telegram Group Label):
                </label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={e => setEditGroupName(e.target.value)}
                  placeholder={`ក្រុមតេលេក្រាម ថ្នាក់ទី${editingClassroom.grade}${editingClassroom.section}`}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Telegram Chat ID / Group ID:</span>
                  <span className="text-[10px] text-indigo-600 font-normal">ឧ. -10023456789</span>
                </label>
                <input
                  type="text"
                  value={editChatId}
                  onChange={e => setEditChatId(e.target.value)}
                  placeholder="-100xxxxxxxxxx ឬ Chat ID"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-battambang">
                  💡 <b>គន្លឹះ៖</b> សូម Add Telegram Bot (<b>@PPTC_Notify_bot</b>) ចូលទៅក្នុងក្រុមថ្នាក់ទី {editingClassroom.grade}{editingClassroom.section} និង Promote ជា Admin ទើបបតអាចផ្ញើសារចូលក្រុមបាន។
                </p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClassroom(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  រក្សាទុកការកំណត់
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Edit Special Group */}
      {/* ---------------------------------------------------- */}
      {editingSpecialGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                កែប្រែក្រុម Telegram រដ្ឋបាល
              </h3>
              <button
                type="button"
                onClick={() => setEditingSpecialGroup(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះក្រុម / ប៉ុស្តិ៍៖
                </label>
                <input
                  type="text"
                  value={specialEditName}
                  onChange={e => setSpecialEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telegram Chat ID / Group ID:
                </label>
                <input
                  type="text"
                  value={specialEditChatId}
                  onChange={e => setSpecialEditChatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSpecialGroup(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
