import React from 'react';
import { Classroom, Teacher } from '../../types';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  Sparkles,
  Printer,
  ChevronDown,
  Award,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  HeartPulse,
  HardDrive,
  FolderSync
} from 'lucide-react';

interface HomeroomHeaderProps {
  selectedGrade: number;
  setSelectedGrade: (grade: number) => void;
  selectedSection: string;
  setSelectedSection: (sec: string) => void;
  classrooms: Classroom[];
  teachers: Teacher[];
  currentTeacher?: Teacher;
  totalStudents: number;
  femaleStudents: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  classAvgScore: number;
  totalLessonPlans: number;
  totalParentMeetings: number;
  totalTeacherMeetings?: number;
  pendingNotificationsCount?: number;
  urgentNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenTeacherMeetings?: () => void;
  onOpenDriveSync?: () => void;
  onPrintClassSummary: () => void;
  onOpenClassCommitteePrint?: () => void;
  onOpenPriStatistics?: () => void;
  onOpenHealthBooklet?: () => void;
  isTeacherRole: boolean;
}

export const HomeroomHeader: React.FC<HomeroomHeaderProps> = ({
  selectedGrade,
  setSelectedGrade,
  selectedSection,
  setSelectedSection,
  classrooms,
  teachers,
  currentTeacher,
  totalStudents,
  femaleStudents,
  todayPresentCount,
  todayAbsentCount,
  classAvgScore,
  totalLessonPlans,
  totalParentMeetings,
  totalTeacherMeetings = 0,
  pendingNotificationsCount = 0,
  urgentNotificationsCount = 0,
  onOpenNotifications,
  onOpenTeacherMeetings,
  onOpenDriveSync,
  onPrintClassSummary,
  onOpenClassCommitteePrint,
  onOpenPriStatistics,
  onOpenHealthBooklet,
  isTeacherRole
}) => {
  const attendancePercentage = totalStudents > 0
    ? Math.round((todayPresentCount / totalStudents) * 100)
    : 100;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 font-battambang">
      {/* Top row: Title, Teacher in charge info, Class selector & Notification Bell */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 font-moul tracking-wide">
                ផ្ទាំងការងារគ្រូបន្ទុកថ្នាក់
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                ថ្នាក់ទី {selectedGrade} «{selectedSection}»
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>គ្រូបន្ទុកថ្នាក់៖ <strong className="text-slate-700">{currentTeacher ? currentTeacher.nameKhmer : 'លោកគ្រូ ចាន់ វុទ្ធី'}</strong></span>
              {currentTeacher?.phone && (
                <>
                  <span>•</span>
                  <span>ទូរស័ព្ទ៖ <span className="font-times">{currentTeacher.phone}</span></span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Class Selection & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Notification Quick Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                urgentNotificationsCount > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 shadow-xs'
                  : pendingNotificationsCount > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="ការជូនដំណឹង និងសំណើមាតាបិតា"
            >
              <div className="relative">
                <Calendar className="hidden" /> {/* just fallback */}
                <span className="text-base leading-none">🔔</span>
                {pendingNotificationsCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse shadow-xs">
                    {pendingNotificationsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {urgentNotificationsCount > 0
                  ? `${urgentNotificationsCount} បន្ទាន់!`
                  : pendingNotificationsCount > 0
                  ? `${pendingNotificationsCount} ដំណឹង`
                  : 'ដំណឹងថ្នាក់'}
              </span>
            </button>
          )}

          {isTeacherRole ? (
            <div className="flex items-center gap-1.5 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 text-blue-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold">ថ្នាក់បន្ទុក៖ ថ្នាក់ទី {selectedGrade} «{selectedSection}»</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 pl-2">ជ្រើសរើសថ្នាក់៖</span>
              {/* Grade select */}
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    ថ្នាក់ទី {g}
                  </option>
                ))}
              </select>

              {/* Section select */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {['ក', 'ខ', 'គ'].map((sec) => (
                  <option key={sec} value={sec}>
                    បន្ទប់ «{sec}»
                  </option>
                ))}
              </select>
            </div>
          )}

          {onOpenDriveSync && (
            <button
              onClick={onOpenDriveSync}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
              title="ធ្វើសមកាលកម្មឯកសារប្រជុំ & ហិរញ្ញវត្ថុទៅ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)"
            >
              <HardDrive className="w-4 h-4 text-emerald-200" />
              <span>Drive Sync</span>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-800/60 font-mono text-emerald-100">
                1GCMdT...
              </span>
            </button>
          )}

          {onOpenTeacherMeetings && (
            <button
              onClick={onOpenTeacherMeetings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white transition-all shadow-xs cursor-pointer"
              title="កំណត់ត្រាការប្រជុំគ្រូ សេចក្ដីសម្រេចចិត្ត & Sync Google Calendar / Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)"
            >
              <Users className="w-4 h-4 text-indigo-200" />
              <span>ប្រជុំគ្រូ</span>
            </button>
          )}

          {onOpenClassCommitteePrint && (
            <button
              onClick={onOpenClassCommitteePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer"
              title="បោះពុម្ពឯកសារ គ.ក.ថ. (តារាងសមាសភាព & រចនាសម្ព័ន្ធរូបថត)"
            >
              <Award className="w-4 h-4 text-blue-200" />
              <span>គ.ក.ថ.</span>
            </button>
          )}

          {onOpenPriStatistics && (
            <button
              onClick={onOpenPriStatistics}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs cursor-pointer"
              title="បោះពុម្ពតារាងស្ថិតិសិស្សផ្លូវការ PRI (អាយុ, ពិការភាព, ជនជាតិ)"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-200" />
              <span>ស្ថិតិ PRI</span>
            </button>
          )}

          {onOpenHealthBooklet && (
            <button
              onClick={onOpenHealthBooklet}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer"
              title="បោះពុម្ពសៀវភៅសុខភាពសិស្ស ៣ ទំព័រ (PDF)"
            >
              <HeartPulse className="w-4 h-4 text-rose-200" />
              <span>សៀវភៅសុខភាព</span>
            </button>
          )}

          <button
            onClick={onPrintClassSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>បោះពុម្ពសង្ខេប</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
        {/* Total Students */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">សិស្សសរុប (ស្រី)</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {totalStudents} នាក់ <span className="text-xs font-normal text-rose-600">({femaleStudents} ស្រី)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">វត្តមានថ្ងៃនេះ</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">
              {attendancePercentage}% <span className="text-xs font-normal text-slate-500">({todayPresentCount}/{totalStudents})</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Class Average Score */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">មធ្យមភាគពិន្ទុថ្នាក់</p>
            <p className="text-lg font-bold text-indigo-700 mt-0.5">
              {classAvgScore.toFixed(1)}/10 <span className="text-xs font-normal text-indigo-500">(ល្អបង្គួរ)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Lesson Plans */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">កិច្ចតែងការបង្រៀន</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {totalLessonPlans} កិច្ច <span className="text-xs font-normal text-emerald-600">(អនុម័តរួច)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Parent Meetings */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">ប្រជុំមាតាបិតា (គ.គ.ថ.)</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">
              {totalParentMeetings} លើក <span className="text-xs font-normal text-blue-600">(បានរៀបចំ)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
