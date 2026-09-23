import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ActivityLogItem, Student, Teacher, ActiveTab } from '../../types';
import {
  formatKhmerFullDateTime,
  formatKhmerRelativeTime
} from '../../utils/activityTracker';
import {
  Users,
  GraduationCap,
  CircleDollarSign,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  Eye,
  ShieldCheck,
  Phone,
  BookOpen,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
  Tag,
  Clock,
  Heart,
  BadgeAlert,
  Sparkles,
  X
} from 'lucide-react';

interface ActivityQuickActionModalProps {
  logItem: ActivityLogItem;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAnalytics?: (studentId: string) => void;
}

export const ActivityQuickActionModal: React.FC<ActivityQuickActionModalProps> = ({
  logItem,
  onClose,
  onNavigateTab,
  onOpenAnalytics
}) => {
  const {
    students,
    teachers,
    budgetTransactions,
    scores,
    attendanceRecords,
    officialDocuments,
    studentTransfers,
    showToast,
    setSearchQuery,
    getStudentBadges,
    getStudentTotalPoints,
    canAccessStudentDashboard
  } = useSchool();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 1. Resolve matching Student record if applicable
  const matchedStudent: Student | undefined = React.useMemo(() => {
    if (!students || students.length === 0) return undefined;
    if (logItem.domain === 'student' || logItem.domain === 'academic') {
      return students.find(
        s =>
          s.id === logItem.entityId ||
          (logItem.entityCode && s.code.toLowerCase() === logItem.entityCode.toLowerCase()) ||
          (logItem.entityName && s.nameKhmer.trim() === logItem.entityName.trim()) ||
          (logItem.title && logItem.title.includes(s.nameKhmer)) ||
          (logItem.description && logItem.description.includes(s.nameKhmer))
      );
    }
    return undefined;
  }, [students, logItem]);

  // 2. Resolve matching Teacher record if applicable
  const matchedTeacher: Teacher | undefined = React.useMemo(() => {
    if (!teachers || teachers.length === 0) return undefined;
    if (logItem.domain === 'teacher') {
      return teachers.find(
        t =>
          t.id === logItem.entityId ||
          (logItem.entityCode && t.staffCode.toLowerCase() === logItem.entityCode.toLowerCase()) ||
          (logItem.entityName && t.nameKhmer.trim() === logItem.entityName.trim()) ||
          (logItem.title && logItem.title.includes(t.nameKhmer))
      );
    }
    return undefined;
  }, [teachers, logItem]);

  // 3. Resolve matching Finance Transaction if applicable
  const matchedTransaction = React.useMemo(() => {
    if (!budgetTransactions || budgetTransactions.length === 0) return undefined;
    if (logItem.domain === 'finance') {
      return budgetTransactions.find(
        b =>
          b.id === logItem.entityId ||
          (logItem.entityCode && b.receiptNumber?.toLowerCase() === logItem.entityCode.toLowerCase())
      );
    }
    return undefined;
  }, [budgetTransactions, logItem]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`បានចម្លង ${label} ជោគជ័យ`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Direct Navigation Jump with Target Search Query
  const handleJumpToStudent = (student: Student) => {
    setSearchQuery(student.nameKhmer);
    onNavigateTab('students');
    onClose();
  };

  const handleJumpToTeacher = (teacher: Teacher) => {
    setSearchQuery(teacher.nameKhmer);
    onNavigateTab('teachers');
    onClose();
  };

  const handleJumpToFinance = () => {
    onNavigateTab('finance');
    onClose();
  };

  const handleJumpToAcademic = () => {
    onNavigateTab('scores');
    onClose();
  };

  const handleJumpToAttendance = () => {
    onNavigateTab('attendance_health');
    onClose();
  };

  const handleJumpToDocuments = () => {
    onNavigateTab('official_documents');
    onClose();
  };

  const handleJumpToTransfers = () => {
    onNavigateTab('transfers');
    onClose();
  };

  const studentBadges = matchedStudent ? getStudentBadges(matchedStudent.id) : [];
  const studentPoints = matchedStudent ? getStudentTotalPoints(matchedStudent.id) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ⚡ Quick Actions
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  #{logItem.id.slice(0, 10)}
                </span>
              </div>
              <h3 className="text-base font-bold font-moul text-white mt-0.5">
                សកម្មភាពរហ័ស & ភ្ជាប់ទិន្នន័យដើម
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Main Log Summary Banner */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{logItem.title}</span>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatKhmerRelativeTime(logItem.timestamp)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {logItem.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
              <span className="text-slate-500">អ្នកកែប្រែ៖</span>
              <strong className="text-slate-800 font-semibold">{logItem.actorName}</strong>
              <span className="text-slate-400">({logItem.actorRole})</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-mono">{formatKhmerFullDateTime(logItem.timestamp)}</span>
            </div>
          </div>

          {/* 1. MATCHED STUDENT CARD & JUMP ACTIONS */}
          {matchedStudent && (
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl p-4 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>ព័ត៌មានសិស្សពាក់ព័ន្ធ (Associated Student Profile)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                  ថ្នាក់ទី {matchedStudent.grade} «{matchedStudent.section}»
                </span>
              </div>

              {/* Mini Profile Header */}
              <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
                {matchedStudent.avatarUrl ? (
                  <img
                    src={matchedStudent.avatarUrl}
                    alt={matchedStudent.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-xl object-cover border border-blue-200 shadow-xs"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
                    {matchedStudent.nameKhmer.slice(0, 2)}
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {matchedStudent.nameKhmer}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono font-semibold">
                      {matchedStudent.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                    <span>ភេទ៖ <strong>{matchedStudent.gender === 'M' ? 'ប្រុស' : 'ស្រី'}</strong></span>
                    <span>•</span>
                    <span>ថ្ងៃខែឆ្នាំកំណើត៖ {matchedStudent.dob}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>អាណាព្យាបាល៖ {matchedStudent.guardianName || 'ពុំមាន'} ({matchedStudent.guardianPhone || '-'})</span>
                  </div>
                </div>
              </div>

              {/* Student Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleJumpToStudent(matchedStudent)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>បើកមើលក្នុងបញ្ជីសិស្ស</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
                </button>

                {onOpenAnalytics && canAccessStudentDashboard(matchedStudent).allowed && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAnalytics(matchedStudent.id);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>បើកផ្ទាំងវិភាគសមិទ្ធផល</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. MATCHED TEACHER CARD & JUMP ACTIONS */}
          {matchedTeacher && (
            <div className="bg-gradient-to-br from-purple-50/70 to-fuchsia-50/50 rounded-2xl p-4 border border-purple-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-purple-900 text-xs">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>ព័ត៌មានគ្រូបង្រៀនពាក់ព័ន្ធ (Associated Teacher Record)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-[10px]">
                  {matchedTeacher.role}
                </span>
              </div>

              <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-purple-100 shadow-xs">
                {matchedTeacher.avatarUrl ? (
                  <img
                    src={matchedTeacher.avatarUrl}
                    alt={matchedTeacher.nameKhmer}
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-xl object-cover border border-purple-200 shadow-xs"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-xs">
                    {matchedTeacher.nameKhmer.slice(0, 2)}
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {matchedTeacher.nameKhmer}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono font-semibold">
                      {matchedTeacher.staffCode}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
                    <span>បន្ទុកថ្នាក់៖ <strong>ថ្នាក់ទី {matchedTeacher.assignedGrade || '-'} «{matchedTeacher.assignedSection || '-'}»</strong></span>
                    <span>•</span>
                    <span>ទូរស័ព្ទ៖ {matchedTeacher.phone || '-'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">
                    <span>ក្របខ័ណ្ឌ៖ {matchedTeacher.civilServiceFramework || matchedTeacher.framework || 'គ្រូបង្រៀនបឋម'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleJumpToTeacher(matchedTeacher)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>បើកមើលកំណត់ត្រាគ្រូបង្រៀនពេញលេញ</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          )}

          {/* 3. MATCHED FINANCE CARD */}
          {matchedTransaction && (
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                  <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                  <span>ព័ត៌មានប្រតិបត្តិការថវិកា (Financial Record)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                  {matchedTransaction.receiptNumber || 'បង្កាន់ដៃ'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">ចំណងជើង៖</span>
                  <strong className="text-slate-900 font-bold">{matchedTransaction.title}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">ទំហំទឹកប្រាក់៖</span>
                  <strong className="text-emerald-700 font-mono font-bold text-sm">
                    {matchedTransaction.amountRiel.toLocaleString()} ៛ (~${matchedTransaction.amountUsd})
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">ប្រភេទចំណូល/ចំណាយ៖</span>
                  <span className="text-slate-700 font-semibold">{matchedTransaction.category}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleJumpToFinance}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <CircleDollarSign className="w-3.5 h-3.5" />
                <span>ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងហិរញ្ញវត្ថុ</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          )}

          {/* 4. OTHER DIRECT SHORTCUTS JUMP GRID */}
          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>ផ្លូវកាត់រហ័សទៅកាន់ផ្នែកពាក់ព័ន្ធ (Direct Section Navigation)</span>
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { onNavigateTab('students'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">គ្រប់គ្រងសិស្ស</span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigateTab('teachers'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-700 hover:text-purple-800 font-semibold text-[11px] flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="truncate">បុគ្គលិក & គ្រូ</span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigateTab('finance'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-semibold text-[11px] flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">ហិរញ្ញវត្ថុសាលា</span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigateTab('scores'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 font-semibold text-[11px] flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">ពិន្ទុ & ចំណាត់ថ្នាក់</span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigateTab('attendance_health'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-800 font-semibold text-[11px] flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span className="truncate">វត្តមាន & សុខភាព</span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigateTab('official_documents'); onClose(); }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-2 transition-all text-left cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="truncate">លិខិត & ឯកសារ</span>
              </button>
            </div>
          </div>

          {/* Quick Copy Identifiers */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <span>លេខកូដសម្គាល់ ID:</span>
              <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900 font-mono font-bold text-[11px]">
                {logItem.entityCode || logItem.entityId}
              </code>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(logItem.entityCode || logItem.entityId, 'លេខកូដសម្គាល់')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              {copiedField === 'លេខកូដសម្គាល់' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">បានចម្លង</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>ចម្លងកូដ ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            បិទផ្ទាំង
          </button>

          {logItem.targetTab && (
            <button
              type="button"
              onClick={() => {
                onNavigateTab(logItem.targetTab!);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <span>ចូលមើលផ្ទាំង {logItem.targetTab} ផ្ទាល់</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
