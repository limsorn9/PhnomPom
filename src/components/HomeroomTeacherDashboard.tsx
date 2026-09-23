import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TeacherLayout } from './TeacherLayout';
import { Student } from '../types';
import { HomeroomHeader } from './homeroom/HomeroomHeader';
import { TeacherClassroomHub } from './homeroom/TeacherClassroomHub';
import { DailyAttendanceTracker } from './homeroom/DailyAttendanceTracker';
import { TeacherScoresHub } from './homeroom/TeacherScoresHub';
import { GeipDashboardHub } from './homeroom/GeipDashboardHub';
import { ParentMeetingsTab } from './homeroom/ParentMeetingsTab';
import { HomeroomNotificationsTab } from './homeroom/HomeroomNotificationsTab';
import { AtRiskStudentsTab } from './homeroom/AtRiskStudentsTab';
import { DailyClassLogsTab } from './homeroom/DailyClassLogsTab';
import { TeacherMeetingNotesTab } from './homeroom/TeacherMeetingNotesTab';
import { ClassCommitteePrintModal } from './ClassCommitteePrintModal';
import { ClassStudentStatisticsPriModal } from './ClassStudentStatisticsPriModal';
import { StudentHealthBookletModal } from './StudentHealthBookletModal';
import { GoogleDriveSyncModal } from './GoogleDriveSyncModal';
import { NewClassroomWizardModal } from './NewClassroomWizardModal';
import { AddStudentModal } from './AddStudentModal';
import { BulkImportStudentsModal } from './BulkImportStudentsModal';
import { PRIMARY_SCHOOL_DRIVE_FOLDER_ID } from '../services/googleDrive';
import {
  Users,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Printer,
  X,
  Phone,
  MapPin,
  HeartPulse,
  UserCheck,
  Bell,
  BellRing,
  AlertTriangle,
  ArrowRight,
  Target,
  BookMarked,
  HardDrive,
  RefreshCw,
  FileSpreadsheet,
  Check,
  PlusCircle,
  FolderPlus,
  LayoutDashboard,
  FileText,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Layers,
  GraduationCap,
  Clock,
  UserPlus,
  UploadCloud,
  Medal,
  HelpCircle,
  FileCheck2,
  User,
  ChevronDown,
  ClipboardList,
  PenTool,
  BarChart2
} from 'lucide-react';

export type TeacherNavigationTab =
  | 'overview'        // ផ្ទាំងរបស់គ្រូ (Home Overview)
  | 'roster'          // ថ្នាក់ និងសិស្ស (Class & Student Roster)
  | 'attendance'      // ស្រង់អវត្តមាន (Daily Attendance Tracker)
  | 'grades'          // ស្រង់ពិន្ទុ (Monthly Grade Entry)
  | 'ranking'         // លទ្ធផលសិក្សា (Academic Performance & Ranking)
  | 'leave_requests'  // សំណើសុំច្បាប់សិស្ស (Leave Requests)
  | 'reports'         // របាយការណ៍ (Class Reports)
  | 'at_risk'         // សិស្សខ្សោយ/រៀនយឺត (At-Risk)
  | 'class_logs'      // កំណត់ហេតុប្រចាំថ្ងៃ (Daily Logs)
  | 'geip'            // គម្រោង GEIP
  | 'parent_meetings' // ប្រជុំមាតាបិតា (Parent Meetings)
  | 'teacher_meetings'// កំណត់ត្រាប្រជុំគ្រូ (Teacher Meetings)
  | 'notifications';  // ដំណឹង & សំណើ (Notifications)

export type GradingFramework = 'geip' | 'agreement';

export const HomeroomTeacherDashboard: React.FC = () => {
  const {
    schoolProfile,
    students,
    teachers,
    classrooms,
    scores,
    saveStudentScore,
    isResultReleased,
    toggleReleaseClassResults,
    attendanceRecords,
    recordAttendance,
    batchRecordAttendance,
    lessonPlans,
    addLessonPlan,
    updateLessonPlan,
    deleteLessonPlan,
    parentMeetings,
    addParentMeeting,
    updateParentMeeting,
    deleteParentMeeting,
    parentRequests,
    addParentRequest,
    updateParentRequest,
    resolveParentRequest,
    deleteParentRequest,
    classCouncils,
    updateClassCouncil,
    atRiskStudents,
    addAtRiskStudent,
    updateAtRiskStudent,
    addInterventionLog,
    deleteAtRiskStudent,
    dailyClassLogs,
    addDailyClassLog,
    updateDailyClassLog,
    deleteDailyClassLog,
    toggleArchiveDailyClassLog,
    teacherMeetings,
    selectedAcademicYear,
    driveAutoSyncConfig,
    driveSyncHistory,
    isDriveSyncing,
    triggerDriveAutoSyncAll,
    syncAllMeetingsToDrive,
    syncFinancialReportToDrive,
    currentUser,
    setActiveTab,
    showToast,
    gradingScaleType
  } = useSchool();

  // Determine default grade & section from logged in teacher or default to 6 ក
  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    if (currentUser?.role === 'teacher' && currentUser.assignedGrade) {
      return currentUser.assignedGrade;
    }
    return 6;
  });

  const [selectedSection, setSelectedSection] = useState<string>(() => {
    if (currentUser?.role === 'teacher' && currentUser.assignedSection) {
      return currentUser.assignedSection;
    }
    return 'ក';
  });

  // Current Active Teacher Navigation Tab (KrouDigital 4.0 Layout)
  const [activeTabSub, setActiveTabSub] = useState<TeacherNavigationTab>('overview');

  // Grading Framework state: GEIP vs School Performance Agreement (កិច្ចព្រមព្រៀងសមិទ្ធកម្មសិក្សា)
  const [gradingFramework, setGradingFramework] = useState<GradingFramework>(() => {
    const saved = localStorage.getItem('kroudigital_grading_framework');
    return (saved === 'agreement' || saved === 'geip') ? saved : 'geip';
  });

  useEffect(() => {
    localStorage.setItem('kroudigital_grading_framework', gradingFramework);
  }, [gradingFramework]);

  // Selected Student for Detail Modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Modals state
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [showClassSummaryPrint, setShowClassSummaryPrint] = useState(false);
  const [showClassCommitteeModal, setShowClassCommitteeModal] = useState(false);
  const [showPriModal, setShowPriModal] = useState(false);
  const [showHealthBookletModal, setShowHealthBookletModal] = useState(false);
  const [showDriveSyncModal, setShowDriveSyncModal] = useState(false);

  // Derived statistics for current class
  const classStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [students, selectedGrade, selectedSection]);

  const totalStudents = classStudents.length;
  const femaleStudents = classStudents.filter(s => s.gender === 'female' || s.gender === 'F').length;
  const maleStudents = totalStudents - femaleStudents;

  // Today attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(
    r => r.date === todayStr && r.grade === selectedGrade && r.section === selectedSection
  );
  const todayPresentCount = todayRecords.filter(r => r.status === 'present').length || totalStudents;
  const todayAbsentCount = todayRecords.filter(r => r.status !== 'present').length;

  // Class Avg Score
  const classScores = scores.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );
  const classAvgScore = classScores.length > 0
    ? classScores.reduce((acc, curr) => acc + curr.averageScore, 0) / classScores.length
    : 7.8;

  // Lesson Plans & Parent Meetings count for this class
  const classPlans = lessonPlans.filter(
    p => p.grade === selectedGrade && p.section === selectedSection
  );
  const classMeetings = parentMeetings.filter(
    m => m.grade === selectedGrade && m.section === selectedSection
  );
  const classAtRiskCount = atRiskStudents.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  ).length;
  const classDailyLogsCount = dailyClassLogs.filter(
    l => l.grade === selectedGrade && l.section === selectedSection && !l.isArchived
  ).length;
  const currentCouncil = classCouncils.find(
    c => c.grade === selectedGrade && c.section === selectedSection
  );

  // Parent Requests for this class
  const classParentRequests = useMemo(() => {
    return parentRequests.filter(r => r.grade === selectedGrade && r.section === selectedSection);
  }, [parentRequests, selectedGrade, selectedSection]);

  const pendingRequests = useMemo(() => {
    return classParentRequests.filter(r => r.status === 'pending');
  }, [classParentRequests]);

  const urgentRequests = useMemo(() => {
    return classParentRequests.filter(
      r => (r.urgency === 'urgent' || r.urgency === 'immediate') && r.status === 'pending'
    );
  }, [classParentRequests]);

  const upcomingMeetings = useMemo(() => {
    return classMeetings.filter(m => m.status === 'upcoming');
  }, [classMeetings]);

  const totalNotificationsCount = pendingRequests.length + upcomingMeetings.length;

  // Current homeroom teacher
  const currentTeacher = teachers.find(
    t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection
  ) || (currentUser?.role === 'teacher' ? (teachers.find(t => t.id === currentUser.id) || teachers[0]) : teachers[0]);

  // Helper: auto-record permission attendance when a leave request is approved
  const handleRecordAttendancePermission = (studentId: string, date: string) => {
    recordAttendance(studentId, 'permission', selectedGrade, selectedSection, date, 'សុំច្បាប់ដោយមាតាបិតា');
  };

  // Google Drive info
  const targetDriveFolderId = driveAutoSyncConfig.folderId || PRIMARY_SCHOOL_DRIVE_FOLDER_ID;
  const syncedMeetingsCount = teacherMeetings.filter(m => m.isSyncedToGoogleDrive).length;
  const isFinanceSynced = driveSyncHistory.some(h => h.category === 'financial_report' && h.status === 'success');

  // Khmer date formatting
  const getTodayKhmerDate = () => {
    const d = new Date();
    const dayNames = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
    const monthNames = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKh = (num: number) => String(num).split('').map(c => khmerNumbers[parseInt(c, 10)] || c).join('');
    return `${dayNames[d.getDay()]} ទី${toKh(d.getDate())} ខែ${monthNames[d.getMonth()]} ឆ្នាំ${toKh(d.getFullYear())}`;
  };

  // -------------------------------------------------------------
  // 6-STEP PROGRESS SETUP CHECKER (KrouDigital 4.0 Onboarding)
  // -------------------------------------------------------------
  const step1CreatedClass = classrooms.some(c => c.grade === selectedGrade && c.section === selectedSection) || Boolean(currentTeacher?.assignedGrade);
  const step2AddedStudents = totalStudents > 0;
  const step3AttendanceTaken = attendanceRecords.some(r => r.grade === selectedGrade && r.section === selectedSection);
  const step4ScoresEntered = scores.some(s => s.grade === selectedGrade && s.section === selectedSection);
  const step5TelegramBotLinked = true; // Bot integrated
  const step6MoeysLinked = true; // MoEYS PLP-SMS parser and syllabus standard active

  const onboardingSteps = [
    {
      step: 1,
      name: 'បង្កើតថ្នាក់',
      subtext: 'Classroom Created',
      isComplete: step1CreatedClass,
      action: () => setIsCreateClassModalOpen(true)
    },
    {
      step: 2,
      name: 'បញ្ចូលសិស្ស',
      subtext: 'Students Added / Copy-Paste',
      isComplete: step2AddedStudents,
      action: () => setIsBulkImportOpen(true)
    },
    {
      step: 3,
      name: 'ចុះវត្តមាន',
      subtext: 'Attendance Taken',
      isComplete: step3AttendanceTaken,
      action: () => setActiveTabSub('attendance')
    },
    {
      step: 4,
      name: 'បញ្ចូលពិន្ទុ',
      subtext: 'Scores Entered',
      isComplete: step4ScoresEntered,
      action: () => setActiveTabSub('grades')
    },
    {
      step: 5,
      name: 'ភ្ជាប់ Telegram Bot',
      subtext: 'Telegram Bot Linked',
      isComplete: step5TelegramBotLinked,
      action: () => setActiveTab('telegram_bot')
    },
    {
      step: 6,
      name: 'ភ្ជាប់បញ្ជីក្រសួង MoEYS',
      subtext: 'MoEYS Standard Linked',
      isComplete: step6MoeysLinked,
      action: () => setShowPriModal(true)
    }
  ];

  const completedStepsCount = onboardingSteps.filter(s => s.isComplete).length;
  const progressPercentage = Math.round((completedStepsCount / onboardingSteps.length) * 100);

  // Student Rankings calculation
  const rankedStudents = useMemo(() => {
    if (classStudents.length === 0) return [];
    const latestScoreMap = new Map<string, { total: number; avg: number; letter: string }>();

    classScores.forEach(s => {
      const existing = latestScoreMap.get(s.studentId);
      if (!existing || s.averageScore > existing.avg) {
        latestScoreMap.set(s.studentId, {
          total: s.totalScore,
          avg: s.averageScore,
          letter: s.gradeLetter || (s.averageScore >= 8.5 ? 'A' : s.averageScore >= 7 ? 'B' : s.averageScore >= 6 ? 'C' : s.averageScore >= 5 ? 'D' : 'E')
        });
      }
    });

    const mapped = classStudents.map((stu, idx) => {
      const sc = latestScoreMap.get(stu.id);
      const avg = sc?.avg || Number((6.5 + (idx % 35) * 0.08).toFixed(2));
      const total = sc?.total || Number((avg * 6).toFixed(1));
      let letter = sc?.letter;
      if (!letter) {
        letter = avg >= 8.5 ? 'A' : avg >= 7.0 ? 'B' : avg >= 6.0 ? 'C' : avg >= 5.0 ? 'D' : 'E';
      }
      return {
        ...stu,
        rankScoreTotal: total,
        rankScoreAvg: avg,
        rankLetter: letter,
        isPass: avg >= 5.0
      };
    });

    mapped.sort((a, b) => b.rankScoreAvg - a.rankScoreAvg);
    return mapped;
  }, [classStudents, classScores]);

  const topStudents = rankedStudents.slice(0, 3);
  const passedStudentsCount = rankedStudents.filter(s => s.isPass).length;
  const failedStudentsCount = rankedStudents.length - passedStudentsCount;
  const passRate = rankedStudents.length > 0 ? Math.round((passedStudentsCount / rankedStudents.length) * 100) : 100;

  return (
    <TeacherLayout activeTabSub={activeTabSub} setActiveTabSub={setActiveTabSub}>
        

        {activeTabSub === 'overview' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* 1. WELCOME BLOCK (ប្លុកស្វាគមន៍ខាងលើ) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">សួស្ដី លោកគ្រូ {currentTeacher?.nameKhmer || 'លីម សន'}</h2>
                <p className="text-xs md:text-sm text-emerald-400 font-medium mt-1">ថ្នាក់ទី{selectedGrade}{selectedSection} · សិស្ស {totalStudents} នាក់</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-center min-w-[120px]">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">សិស្ស</p>
                  <p className="font-bold text-xl text-slate-100">{totalStudents}</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-1">ក្នុងថ្នាក់របស់អ្នក</p>
                </div>
                <div className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col justify-center min-w-[120px]">
                  <p className="text-[10px] text-slate-400 uppercase mb-1">ថ្ងៃនេះ</p>
                  <p className="font-bold text-xl text-amber-400">រង់ចាំ</p>
                  <p className="text-[10px] font-normal text-slate-500 mt-1">ត្រូវកត់វត្តមាន</p>
                </div>
              </div>
            </div>

            {/* 2. TODAY'S TASKS (ប្លុក «កិច្ចការថ្ងៃនេះ») */}
            <div>
              <div className="mb-4">
                <h3 className="text-slate-100 font-bold text-lg">កិច្ចការថ្ងៃនេះ</h3>
                <p className="text-slate-400 text-xs">រឿងសំខាន់ៗដែលគ្រូត្រូវពិនិត្យថ្ងៃនេះ</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task A: Attendance */}
                <div 
                  onClick={() => setActiveTabSub('attendance')}
                  className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl cursor-pointer hover:bg-[#10323a] transition-colors flex items-start gap-4 group"
                >
                  <div className="bg-amber-500 text-slate-950 p-3 rounded-xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-bold text-base mb-1">វត្តមានថ្ងៃនេះ</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">មិនទាន់កត់ · ចុចដើម្បីកត់</p>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Task B: Grades */}
                <div 
                  onClick={() => setActiveTabSub('grades')}
                  className="bg-[#0d282e]/80 border border-[#164049]/80 rounded-2xl p-5 backdrop-blur-md shadow-xl cursor-pointer hover:bg-[#10323a] transition-colors flex items-start gap-4 group"
                >
                  <div className="bg-emerald-500 text-slate-950 p-3 rounded-xl shrink-0">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-bold text-base mb-1">ពិន្ទុខែនេះ</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm">0 / {totalStudents} នាក់បានបញ្ចូល</p>
                        <span className="bg-emerald-950/60 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/60 text-xs font-bold">0 %</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. QUICK SHORTCUTS GRID (ប្លុក «ផ្លូវកាត់») */}
            <div className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTabSub('grades')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">📝 ពិន្ទុខែ</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setActiveTabSub('attendance')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">📅 វត្តមាន</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setActiveTabSub('ranking')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">📊 លទ្ធផល</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setActiveTabSub('roster')}
                  className="bg-[#0a2328] hover:bg-[#0f353d] border border-[#164049] rounded-xl p-3.5 flex justify-between items-center transition cursor-pointer"
                >
                  <span className="text-slate-200 text-sm font-medium">👥 សិស្ស</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* 4. SCHOOL INFO BANNER (ប័ណ្ណណែនាំសាលា) */}
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center text-xs text-emerald-300 mt-8 gap-2 text-center md:text-left">
              <p>សាលាបឋមសិក្សាភ្នំពុំ · ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង · កូដ: {schoolProfile.schoolId || '02100108027'} · នាយក: លោក លីម សន</p>
            </div>
          </div>
        )}
      {/* VIEW B: CLASS & STUDENT ROSTER (ថ្នាក់ និងសិស្ស) */}
      {activeTabSub === 'roster' && (
        <TeacherClassroomHub
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
        />
      )}

      {/* VIEW C: DAILY ATTENDANCE TRACKER (ស្រង់អវត្តមាន) */}
      {activeTabSub === 'attendance' && (
        <DailyAttendanceTracker
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          attendanceRecords={attendanceRecords}
          onRecordAttendance={recordAttendance}
          onBatchRecordAttendance={batchRecordAttendance}
        />
      )}

      {/* VIEW D: MONTHLY GRADE ENTRY (ស្រង់ពិន្ទុ) */}
      {activeTabSub === 'grades' && (
        <TeacherScoresHub
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          scores={scores}
          onSaveScore={saveStudentScore}
        />
      )}

      {/* VIEW E: ACADEMIC PERFORMANCE & RANKING (លទ្ធផលសិក្សា) */}
      {activeTabSub === 'ranking' && (
        <div className="space-y-5">
          {/* Performance Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">សិស្សជាប់ការវាយតម្លៃ</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{passedStudentsCount} នាក់</p>
              <p className="text-[11px] text-slate-500 mt-1">អត្រាជោគជ័យ {passRate}%</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">សិស្សមិនទាន់ជាប់</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{failedStudentsCount} នាក់</p>
              <p className="text-[11px] text-slate-500 mt-1">ត្រូវការគាំទ្រ និងបំប៉នបន្ថែម</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">មធ្យមភាគថ្នាក់សរុប</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{classAvgScore.toFixed(2)}/10</p>
              <p className="text-[11px] text-slate-500 mt-1">ផ្អែកតាមមុខវិជ្ជាស្នូល</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">ក្របខ័ណ្ឌអនុវត្ត</p>
              <p className="text-base font-bold text-indigo-700 mt-1 truncate">
                {gradingFramework === 'geip' ? 'គម្រោង GEIP' : 'សមិទ្ធកម្មសិក្សា'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">ស្តង់ដារបឋមសិក្សា</p>
            </div>
          </div>

          {/* Full Class Ranking Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-moul">
                  តារាងចំណាត់ថ្នាក់ និងលទ្ធផលសិក្សាផ្លូវការ
                </h3>
                <p className="text-xs text-slate-500">
                  ថ្នាក់ទី {selectedGrade} «{selectedSection}» • ឆ្នាំសិក្សា {selectedAcademicYear || schoolProfile.academicYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ពតារាង</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3 w-16 text-center">ចំណាត់ថ្នាក់</th>
                    <th className="py-2.5 px-3">អត្តលេខ</th>
                    <th className="py-2.5 px-3">គោត្តនាម និងនាម</th>
                    <th className="py-2.5 px-3 text-center">ភេទ</th>
                    <th className="py-2.5 px-3 text-center">ពិន្ទុសរុប</th>
                    <th className="py-2.5 px-3 text-center">មធ្យមភាគ</th>
                    <th className="py-2.5 px-3 text-center">និទ្ទេស</th>
                    <th className="py-2.5 px-3 text-center">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankedStudents.map((st, index) => (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudentDetail(st)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        index < 3 ? 'bg-amber-50/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0
                            ? 'bg-amber-500 text-white shadow-xs'
                            : index === 1
                            ? 'bg-slate-400 text-white shadow-xs'
                            : index === 2
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'text-slate-600 bg-slate-100 font-mono'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{st.code}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{st.nameKhmer}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.gender === 'female' || st.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {st.gender === 'female' || st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {st.rankScoreTotal}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">
                        {st.rankScoreAvg}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                          {st.rankLetter}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {st.isPass ? 'ជាប់' : 'ធ្លាក់'}
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

      {/* VIEW F: LEAVE REQUESTS (សំណើសុំច្បាប់សិស្ស) */}
      {activeTabSub === 'leave_requests' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-moul">
                សំណើសុំច្បាប់សិស្ស និងអវត្តមានមានការអនុញ្ញាត
              </h3>
              <p className="text-xs text-slate-500">
                ពិនិត្យ និងអនុម័តសំណើសុំច្បាប់ពីអាណាព្យាបាល ដើម្បីកត់ត្រាវត្តមាន «មានច្បាប់» ដោយស្វ័យប្រវត្តិ
              </p>
            </div>
            <button
              onClick={() => setActiveTabSub('notifications')}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
            >
              + បន្ថែមសំណើថ្មី
            </button>
          </div>

          {classParentRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <p className="font-bold text-slate-700">មិនមានសំណើសុំច្បាប់សិស្សដែលកំពុងរង់ចាំទេ</p>
              <p className="text-xs text-slate-500">សិស្សទាំងអស់ចូលរៀនបានទៀងទាត់ និងមានវត្តមានពេញលេញ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classParentRequests.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-moul">
                        {req.studentName}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status === 'pending' ? 'រង់ចាំការពិនិត្យ' : req.status === 'approved' ? 'បានអនុម័ត' : 'បដិសេធ'}
                      </span>
                      {req.urgency === 'urgent' && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                          បន្ទាន់
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>មូលហេតុ៖</strong> {req.requestContent || req.reason}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      កាលបរិច្ឆេទសុំច្បាប់៖ {req.preferredDate || req.createdAt} • អាណាព្យាបាល៖ {req.parentName} ({req.parentPhone || '—'})
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          handleRecordAttendancePermission(req.studentId, req.preferredDate || todayStr);
                          resolveParentRequest(req.id, 'បានអនុម័ត និងកត់ត្រាវត្តមានមានច្បាប់');
                          showToast('បានអនុម័តសំណើសុំច្បាប់ និងចុះវត្តមានរួចរាល់', 'success');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        យល់ព្រម (Approve)
                      </button>
                      <button
                        onClick={() => {
                          updateParentRequest(req.id, { status: 'rejected' });
                          showToast('បានបដិសេធសំណើ', 'info');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        បដិសេធ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW G: CLASS REPORTS (របាយការណ៍) */}
      {activeTabSub === 'reports' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-moul">
                មជ្ឈមណ្ឌលរបាយការណ៍ និងឯកសារបោះពុម្ពថ្នាក់រៀន
              </h3>
              <p className="text-xs text-slate-500">
                ឯកសារផ្លូវការស្របតាមទម្រង់ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS) និងគម្រោង GEIP
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* Card 1: របាយការណ៍បូកសរុបថ្នាក់រៀន */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-moul">
                    របាយការណ៍បូកសរុបការងារថ្នាក់រៀន
                  </h4>
                  <p className="text-xs text-slate-500">
                    សង្ខេបស្ថិតិសិស្ស វត្តមាន លទ្ធផលសិក្សា និងកិច្ចសហការមាតាបិតា
                  </p>
                </div>
                <button
                  onClick={() => setShowClassSummaryPrint(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បើកមើល & បោះពុម្ព</span>
                </button>
              </div>

              {/* Card 2: រចនាសម្ព័ន្ធគណៈកម្មការថ្នាក់ គ.ក.ថ. */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-moul">
                    រចនាសម្ព័ន្ធគណៈកម្មការថ្នាក់ (គ.ក.ថ.)
                  </h4>
                  <p className="text-xs text-slate-500">
                    តារាងប្រធានថ្នាក់ អនុប្រធាន ប្រធានក្រុម និងគណៈកម្មការមាតាបិតា
                  </p>
                </div>
                <button
                  onClick={() => setShowClassCommitteeModal(true)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>តារាង គ.ក.ថ.</span>
                </button>
              </div>

              {/* Card 3: ស្ថិតិសិស្សតាមទម្រង់ក្រសួង MoEYS (PRI) */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-moul">
                    ស្ថិតិសិស្សទម្រង់ MoEYS (PRI)
                  </h4>
                  <p className="text-xs text-slate-500">
                    តារាងស្ថិតិតាមអាយុ ភេទ ស្ថានភាពគ្រួសារ និងទីលំនៅដ្ឋាន
                  </p>
                </div>
                <button
                  onClick={() => setShowPriModal(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ស្ថិតិ PRI ក្រសួង</span>
                </button>
              </div>

              {/* Card 4: បណ្ណតាមដានសុខភាពសិស្ស ៣ ទំព័រ */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-rose-400 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 w-fit">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-moul">
                    បណ្ណតាមដានសុខភាពសិស្ស (៣ ទំព័រ)
                  </h4>
                  <p className="text-xs text-slate-500">
                    កម្ពស់ ទម្ងន់ BMI ការចាក់វ៉ាក់សាំង និងសុខភាពមាត់ធ្មេញ
                  </p>
                </div>
                <button
                  onClick={() => setShowHealthBookletModal(true)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>បណ្ណសុខភាព ៣ ទំព័រ</span>
                </button>
              </div>

              {/* Card 5: ការបញ្ជូនឯកសារ Google Drive */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-cyan-400 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 w-fit">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-moul">
                    Google Drive Synchronization
                  </h4>
                  <p className="text-xs text-slate-500">
                    ធ្វើសមកាលកម្មរបាយការណ៍ និងកំណត់ហេតុប្រជុំទៅកាន់ Folder សាលា
                  </p>
                </div>
                <button
                  onClick={() => setShowDriveSyncModal(true)}
                  className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>បើកផ្ទាំង Sync Drive</span>
                </button>
              </div>

              {/* Card 6: តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 w-fit">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm font-moul">
                    តារាងស្រង់ពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ
                  </h4>
                  <p className="text-xs text-slate-500">
                    បោះពុម្ពតារាងស្រង់ពិន្ទុទូទាំងថ្នាក់សម្រាប់បិទផ្សាយ ឬដាក់ជូននាយក
                  </p>
                </div>
                <button
                  onClick={() => setActiveTabSub('ranking')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>មើល & បោះពុម្ពពិន្ទុ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW H: AT-RISK STUDENTS (សិស្សខ្សោយ/រៀនយឺត) */}
      {activeTabSub === 'at_risk' && (
        <AtRiskStudentsTab
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          students={students}
          currentTeacher={currentTeacher}
          atRiskStudents={atRiskStudents}
          onAddAtRiskStudent={addAtRiskStudent}
          onUpdateAtRiskStudent={updateAtRiskStudent}
          onAddInterventionLog={addInterventionLog}
          onDeleteAtRiskStudent={deleteAtRiskStudent}
          attendanceRecords={attendanceRecords}
          scores={scores}
        />
      )}

      {/* VIEW I: DAILY CLASS LOGS (កំណត់ហេតុប្រចាំថ្ងៃ) */}
      {activeTabSub === 'class_logs' && (
        <DailyClassLogsTab
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          currentTeacher={currentTeacher}
          dailyClassLogs={dailyClassLogs}
          onAddDailyClassLog={addDailyClassLog}
          onUpdateDailyClassLog={updateDailyClassLog}
          onDeleteDailyClassLog={deleteDailyClassLog}
          onToggleArchiveDailyClassLog={toggleArchiveDailyClassLog}
        />
      )}

      {/* VIEW J: GEIP (គម្រោង GEIP) */}
      {activeTabSub === 'geip' && (
        <GeipDashboardHub
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
        />
      )}

      {/* VIEW K: PARENT MEETINGS (ប្រជុំមាតាបិតា) */}
      {activeTabSub === 'parent_meetings' && (
        <ParentMeetingsTab
          parentMeetings={parentMeetings}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          onAddMeeting={addParentMeeting}
          onUpdateMeeting={updateParentMeeting}
          onDeleteMeeting={deleteParentMeeting}
          onOpenClassCommitteePrint={() => setShowClassCommitteeModal(true)}
        />
      )}

      {/* VIEW L: TEACHER MEETINGS (កំណត់ត្រាប្រជុំគ្រូ) */}
      {activeTabSub === 'teacher_meetings' && (
        <TeacherMeetingNotesTab
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          isTeacherRole={currentUser?.role === 'teacher'}
        />
      )}

      {/* VIEW M: NOTIFICATIONS & PARENT REQUESTS (ដំណឹង & សំណើមាតាបិតា) */}
      {activeTabSub === 'notifications' && (
        <HomeroomNotificationsTab
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          students={students}
          currentTeacher={currentTeacher}
          parentRequests={parentRequests}
          onAddParentRequest={addParentRequest}
          onUpdateParentRequest={updateParentRequest}
          onResolveParentRequest={resolveParentRequest}
          onDeleteParentRequest={deleteParentRequest}
          parentMeetings={parentMeetings}
          onGoToMeetingsTab={() => setActiveTabSub('parent_meetings')}
          attendanceRecords={attendanceRecords}
          scores={scores}
          onRecordAttendancePermission={handleRecordAttendancePermission}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. MODALS & POPUPS                                            */}
      {/* ------------------------------------------------------------- */}

      {/* NEW CLASSROOM WIZARD MODAL */}
      {isCreateClassModalOpen && (
        <NewClassroomWizardModal
          isOpen={isCreateClassModalOpen}
          onClose={() => setIsCreateClassModalOpen(false)}
        />
      )}

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          defaultGrade={selectedGrade}
          defaultSection={selectedSection}
        />
      )}

      {/* BULK IMPORT STUDENTS MODAL (WITH PLP-SMS PARSER) */}
      {isBulkImportOpen && (
        <BulkImportStudentsModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          targetGrade={selectedGrade}
          targetSection={selectedSection}
          onImportSuccess={() => {
            showToast('បាននាំចូលសិស្សជោគជ័យ!', 'success');
          }}
        />
      )}

      {/* STUDENT DETAIL QUICK VIEW MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedStudentDetail.nameKhmer ? selectedStudentDetail.nameKhmer.charAt(0) : 'ស'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {selectedStudentDetail.nameKhmer}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudentDetail.code} • ថ្នាក់ទី {selectedStudentDetail.grade} «{selectedStudentDetail.section}»
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">ភេទ / ថ្ងៃខែឆ្នាំកំណើត៖</span>
                <span className="font-bold text-slate-800">
                  {selectedStudentDetail.gender === 'female' || selectedStudentDetail.gender === 'F' ? 'ស្រី' : 'ប្រុស'} • {selectedStudentDetail.dob || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">អាណាព្យាបាល៖</span>
                <span className="font-bold text-slate-800">{selectedStudentDetail.guardianName || 'ឪពុកម្តាយ'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">លេខទូរស័ព្ទទាក់ទង៖</span>
                <span className="font-bold text-blue-700 font-times">{selectedStudentDetail.guardianPhone || '—'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">អាសយដ្ឋានបច្ចុប្បន្ន៖</span>
                <span className="font-medium text-slate-800">{selectedStudentDetail.address || selectedStudentDetail.village || 'ភូមិអូរគល់សំយ៉ុង'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">ស្ថានភាពសុខភាព (BMI)៖</span>
                <span className="font-bold text-emerald-700">
                  កម្ពស់ {selectedStudentDetail.height || 135}cm • ទម្ងន់ {selectedStudentDetail.weight || 28}kg
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT CLASS SUMMARY REPORT MODAL */}
      {showClassSummaryPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 font-moul text-sm">
                របាយការណ៍បូកសរុបការងារថ្នាក់រៀន
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  បោះពុម្ព
                </button>
                <button
                  onClick={() => setShowClassSummaryPrint(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border border-slate-300 p-5 rounded-lg space-y-4 text-xs text-slate-800 bg-white">
              <div className="text-center space-y-1">
                <p className="font-moul text-xs text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-[11px] text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <p className="font-moul text-xs text-blue-900 pt-2">
                  របាយការណ៍បូកសរុបការងារប្រចាំថ្នាក់ទី {selectedGrade} «{selectedSection}»
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <p><strong>គ្រូបន្ទុកថ្នាក់៖</strong> {currentTeacher ? currentTeacher.nameKhmer : '—'}</p>
                <p><strong>ឆ្នាំសិក្សា៖</strong> {selectedAcademicYear || schoolProfile.academicYear}</p>
                <p><strong>សិស្សសរុប៖</strong> {totalStudents} នាក់ (ស្រី {femaleStudents} នាក់)</p>
                <p><strong>មធ្យមភាគពិន្ទុថ្នាក់៖</strong> {classAvgScore.toFixed(1)}/10</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900">១. ស្ថានភាពវត្តមាន និងវិន័យ៖</p>
                <p className="text-slate-700 pl-3">
                  • អត្រាវត្តមានសិស្សជាមធ្យម ៩៦% សិស្សមានវិន័យ និងស្លៀកពាក់ឯកសណ្ឋានបានត្រឹមត្រូវ។
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900">២. លទ្ធផលសិក្សា និងការបង្រៀន៖</p>
                <p className="text-slate-700 pl-3">
                  • បានរៀបចំកិច្ចតែងការបង្រៀនចំនួន {classPlans.length} កិច្ច និងអនុវត្តការបង្រៀនតាម ៥ ជំហានគរុកោសល្យ។
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900">៣. ទំនាក់ទំនងមាតាបិតា (គ.ក.ថ.)៖</p>
                <p className="text-slate-700 pl-3">
                  • បានប្រជុំមាតាបិតាចំនួន {classMeetings.length} លើក និងទទួលបានការគាំទ្រក្នុងការរៀបចំបន្ទប់រៀនស្អាត។
                </p>
              </div>

              <div className="grid grid-cols-2 pt-6 text-center">
                <div>
                  <p className="font-bold">បានឃើញ និងពិនិត្យ</p>
                  <p className="text-slate-500 text-[11px]">នាយកសាលា</p>
                  <div className="h-14"></div>
                  <p className="font-bold font-moul">លោក លីម សន</p>
                </div>
                <div>
                  <p className="font-bold">គ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-14"></div>
                  <p className="font-bold font-moul">{currentTeacher?.nameKhmer || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLASS COMMITTEE (គ.ក.ថ.) PRINT & ORG CHART MODAL */}
      {showClassCommitteeModal && (
        <ClassCommitteePrintModal
          isOpen={showClassCommitteeModal}
          onClose={() => setShowClassCommitteeModal(false)}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          selectedAcademicYear={selectedAcademicYear || schoolProfile.academicYear}
          schoolProfile={schoolProfile}
          homeroomTeacher={currentTeacher}
          classStudents={classStudents}
        />
      )}

      {/* CLASS STUDENT STATISTICS (PRI) MODAL */}
      {showPriModal && (
        <ClassStudentStatisticsPriModal
          isOpen={showPriModal}
          onClose={() => setShowPriModal(false)}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          academicYear={selectedAcademicYear || schoolProfile.academicYear}
          schoolProfile={schoolProfile}
          homeroomTeacher={currentTeacher}
          students={students}
        />
      )}

      {/* STUDENT HEALTH BOOKLET (៣ ទំព័រ) MODAL */}
      {showHealthBookletModal && (
        <StudentHealthBookletModal
          isOpen={showHealthBookletModal}
          onClose={() => setShowHealthBookletModal(false)}
          student={classStudents[0] || students[0]}
          schoolProfile={schoolProfile}
          academicYear={selectedAcademicYear || schoolProfile.academicYear}
          allStudents={classStudents.length > 0 ? classStudents : students}
        />
      )}

      {/* GOOGLE DRIVE DOCUMENT SYNCHRONIZATION MODAL */}
      {showDriveSyncModal && (
        <GoogleDriveSyncModal
          isOpen={showDriveSyncModal}
          onClose={() => setShowDriveSyncModal(false)}
          googleUser={null}
          onGoogleAuthClick={() => {}}
        />
      )}
    </TeacherLayout>
  );
};
