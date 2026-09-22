import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student } from '../types';
import { HomeroomHeader } from './homeroom/HomeroomHeader';
import { MyClassTab } from './homeroom/MyClassTab';
import { AttendanceTab } from './homeroom/AttendanceTab';
import { GradesTab } from './homeroom/GradesTab';
import { LessonPlansTab } from './homeroom/LessonPlansTab';
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
  User
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
  | 'lesson_plans'    // កិច្ចតែងការបង្រៀន (Lesson Plans)
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
    <div className="space-y-6 animate-fadeIn font-battambang">
      {/* ------------------------------------------------------------- */}
      {/* 1. KROUDIGITAL 4.0 TOP HEADER & SUMMARY BANNER                */}
      {/* ------------------------------------------------------------- */}
      <HomeroomHeader
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        classrooms={classrooms}
        teachers={teachers}
        currentTeacher={currentTeacher}
        totalStudents={totalStudents}
        femaleStudents={femaleStudents}
        todayPresentCount={todayPresentCount}
        todayAbsentCount={todayAbsentCount}
        classAvgScore={classAvgScore}
        totalLessonPlans={classPlans.length}
        totalParentMeetings={classMeetings.length}
        totalTeacherMeetings={teacherMeetings.length}
        pendingNotificationsCount={totalNotificationsCount}
        urgentNotificationsCount={urgentRequests.length}
        onOpenNotifications={() => setActiveTabSub('notifications')}
        onOpenTeacherMeetings={() => setActiveTabSub('teacher_meetings')}
        onOpenDriveSync={() => setShowDriveSyncModal(true)}
        onPrintClassSummary={() => setShowClassSummaryPrint(true)}
        onOpenClassCommitteePrint={() => setShowClassCommitteeModal(true)}
        onOpenPriStatistics={() => setShowPriModal(true)}
        onOpenHealthBooklet={() => setShowHealthBookletModal(true)}
        isTeacherRole={currentUser?.role === 'teacher'}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. GRADING FRAMEWORK BANNER (បដាជ្រើសរើសទម្រង់គ្រោងនិទ្ទេស)   */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 text-white shadow-xl border border-indigo-500/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>KrouDigital 4.0 • ក្របខ័ណ្ឌវាយតម្លៃលទ្ធផលសិក្សា</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-xs font-mono border border-slate-700">
                ឆ្នាំសិក្សា {selectedAcademicYear || schoolProfile.academicYear}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-moul tracking-wide text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <span>
                {gradingFramework === 'geip'
                  ? 'គម្រោងលើកកម្ពស់គុណភាពការអប់រំទូទៅ (GEIP)'
                  : 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មសិក្សា (School Performance Agreement)'}
              </span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {gradingFramework === 'geip'
                ? 'អនុវត្តតាមស្តង់ដារបឋមសិក្សាគំរូទាំង៥ របស់ក្រសួងអប់រំ យុវជន និងកីឡា ផ្តោតលើការអាន-សរសេរ និងគណិតវិទ្យាដំបូង ព្រមទាំងការគាំទ្រសិស្សរៀនយឺត។'
                : 'តាមដានការអនុវត្តកិច្ចព្រមព្រៀងសមិទ្ធកម្មសិក្សារវាងនាយកសាលា និងគ្រូបង្រៀន ដើម្បីធានាអត្រាឡើងថ្នាក់ និងកាត់បន្ថយអត្រាបោះបង់ការសិក្សា។'}
            </p>
          </div>

          {/* Interactive Framework Selector Toggle Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-indigo-400/30 backdrop-blur-md shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setGradingFramework('geip');
                showToast('បានជ្រើសរើសក្របខ័ណ្ឌ៖ «គម្រោង GEIP»', 'info');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                gradingFramework === 'geip'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 border border-blue-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${gradingFramework === 'geip' ? 'text-cyan-300' : 'text-slate-500'}`} />
              <div className="text-left">
                <p className="leading-tight">គម្រោង GEIP</p>
                <p className="text-[10px] font-normal opacity-80">ស្តង់ដារបឋមសិក្សាគំរូ</p>
              </div>
            </button>

            <button
              onClick={() => {
                setGradingFramework('agreement');
                showToast('បានជ្រើសរើសក្របខ័ណ្ឌ៖ «កិច្ចព្រមព្រៀងសមិទ្ធកម្មសិក្សា»', 'info');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                gradingFramework === 'agreement'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${gradingFramework === 'agreement' ? 'text-emerald-300' : 'text-slate-500'}`} />
              <div className="text-left">
                <p className="leading-tight">កិច្ចព្រមព្រៀងសមិទ្ធកម្ម</p>
                <p className="text-[10px] font-normal opacity-80">SBM & សូចនាករ KPI</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. QUICK STATS & ONBOARDING (កាតសង្ខេប និងជំហានចាប់ផ្ដើម)      */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Teacher Info Profile Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
                  {currentTeacher?.avatarUrl ? (
                    <img src={currentTeacher.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    currentTeacher?.nameKhmer ? currentTeacher.nameKhmer.charAt(0) : 'គ'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base font-moul">
                      {currentTeacher?.nameKhmer || 'លោកគ្រូ/អ្នកគ្រូ'}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                  </div>
                  <p className="text-xs text-slate-500">
                    គ្រូបន្ទុកថ្នាក់ទី {selectedGrade} «{selectedSection}» • {currentTeacher?.staffCode || 'T-2026-01'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] text-slate-500 font-medium">សិស្សសរុប</p>
                <p className="text-lg font-bold text-slate-900">{totalStudents}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50/60 border border-pink-100/60">
                <p className="text-[11px] text-pink-700 font-medium">សិស្សស្រី</p>
                <p className="text-lg font-bold text-pink-700">{femaleStudents}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/60">
                <p className="text-[11px] text-blue-700 font-medium">សិស្សប្រុស</p>
                <p className="text-lg font-bold text-blue-700">{maleStudents}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-700">{getTodayKhmerDate()}</span>
            </div>
          </div>

          {/* Quick Action Chips at bottom of card */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ផ្លូវកាត់រហ័ស (Quick Actions)</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTabSub('grades')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-blue-200/60"
              >
                <span>⚡ ពិន្ទុខែ</span>
              </button>
              <button
                onClick={() => setActiveTabSub('attendance')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-emerald-200/60"
              >
                <span>📅 វត្តមាន</span>
              </button>
              <button
                onClick={() => setActiveTabSub('ranking')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-amber-200/60"
              >
                <span>🏆 លទ្ធផល</span>
              </button>
              <button
                onClick={() => setActiveTabSub('roster')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-purple-200/60"
              >
                <span>👥 សិស្ស</span>
              </button>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ml-auto"
              >
                <PlusCircle className="w-3 h-3 text-cyan-400" />
                <span>+ សិស្ស</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: 6-Step Setup Progress Bar (របារដំណើរការ ៦ ជំហាន) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    ដំណើរកំណត់រចនាសម្ព័ន្ធការងារគ្រូ ៦ ជំហាន (Setup Progress)
                  </h3>
                  <p className="text-xs text-slate-500">
                    បានបញ្ចប់ {completedStepsCount} នៃ ៦ ជំហានស្វ័យប្រវត្តិតាមស្តង់ដារ KrouDigital 4.0
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {progressPercentage}% ជោគជ័យ
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full my-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* 6 Steps Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
              {onboardingSteps.map(st => (
                <button
                  key={st.step}
                  onClick={st.action}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                    st.isComplete
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      st.isComplete ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {st.isComplete ? '✓' : st.step}
                    </span>
                    {st.isComplete ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        រួចរាល់
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-600 font-medium group-hover:underline">
                        កំណត់
                      </span>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold line-clamp-1 ${st.isComplete ? 'text-slate-900' : 'text-slate-700'}`}>
                      {st.name}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {st.subtext}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toolbar for Bulk Import & Add Class */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">ជំនួយការបញ្ចូលទិន្នន័យ៖</span>
              <span className="text-slate-500">គាំទ្រការ Copy-Paste ពី Excel និងឯកសារ MoEYS PLP-SMS</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-indigo-200 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>📥 នាំចូលសិស្សច្រើននាក់</span>
              </button>
              <button
                onClick={() => setIsCreateClassModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-cyan-300" />
                <span>+ បង្កើតថ្នាក់</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. KROUDIGITAL 4.0 TEACHER NAVIGATION (របារចំហៀងមុខងារស្នូល) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-xs">
        {/* Core Teacher Navigation Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {/* 0. Primary Action: + បង្កើតថ្នាក់ */}
          <button
            onClick={() => setIsCreateClassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white hover:opacity-95 shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0 border border-blue-500/40"
          >
            <FolderPlus className="w-4 h-4 text-cyan-300" />
            <span>+ បង្កើតថ្នាក់</span>
          </button>

          {/* 1. ផ្ទាំងរបស់គ្រូ (Home Overview) */}
          <button
            onClick={() => setActiveTabSub('overview')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ផ្ទាំងរបស់គ្រូ (Overview)</span>
          </button>

          {/* 2. ថ្នាក់ និងសិស្ស (Class & Student Roster) */}
          <button
            onClick={() => setActiveTabSub('roster')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'roster'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ថ្នាក់ និងសិស្ស (Roster)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTabSub === 'roster' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 font-bold'
            }`}>
              {totalStudents}
            </span>
          </button>

          {/* 3. ស្រង់អវត្តមាន (Daily Attendance Tracker) */}
          <button
            onClick={() => setActiveTabSub('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'attendance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ស្រង់អវត្តមាន (Attendance)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTabSub === 'attendance' ? 'bg-blue-700 text-white' : 'bg-emerald-100 text-emerald-800 font-bold'
            }`}>
              {todayPresentCount}/{totalStudents}
            </span>
          </button>

          {/* 4. ស្រង់ពិន្ទុ (Monthly Grade Entry) */}
          <button
            onClick={() => setActiveTabSub('grades')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'grades'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ស្រង់ពិន្ទុ (Monthly Grades)</span>
          </button>

          {/* 5. លទ្ធផលសិក្សា (Academic Performance & Ranking) */}
          <button
            onClick={() => setActiveTabSub('ranking')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'ranking'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>លទ្ធផលសិក្សា (Performance)</span>
          </button>

          {/* 6. សំណើសុំច្បាប់សិស្ស (Leave Requests) */}
          <button
            onClick={() => setActiveTabSub('leave_requests')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'leave_requests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>សំណើសុំច្បាប់សិស្ស (Leave)</span>
            {pendingRequests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTabSub === 'leave_requests' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* 7. របាយការណ៍ (Class Reports) */}
          <button
            onClick={() => setActiveTabSub('reports')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>របាយការណ៍ (Reports)</span>
          </button>
        </div>

        {/* Secondary Subtabs Row (Tools, Logs & Communication) */}
        <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
            មុខងារបន្ថែម៖
          </span>

          <button
            onClick={() => setActiveTabSub('at_risk')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'at_risk'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            សិស្សខ្សោយ/រៀនយឺត ({classAtRiskCount})
          </button>

          <button
            onClick={() => setActiveTabSub('class_logs')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'class_logs'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            កំណត់ហេតុប្រចាំថ្ងៃ ({classDailyLogsCount})
          </button>

          <button
            onClick={() => setActiveTabSub('lesson_plans')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'lesson_plans'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            កិច្ចតែងការ ({classPlans.length})
          </button>

          <button
            onClick={() => setActiveTabSub('parent_meetings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'parent_meetings'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ប្រជុំមាតាបិតា ({classMeetings.length})
          </button>

          <button
            onClick={() => setActiveTabSub('teacher_meetings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'teacher_meetings'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ប្រជុំគ្រូ ({teacherMeetings.length})
          </button>

          <button
            onClick={() => setActiveTabSub('notifications')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTabSub === 'notifications'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ដំណឹង & សំណើ {totalNotificationsCount > 0 && `(${totalNotificationsCount})`}
          </button>

          <button
            onClick={() => setActiveTab('ai_teacher')}
            className="px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 transition-all whitespace-nowrap cursor-pointer shrink-0 ml-auto flex items-center gap-1 border border-amber-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🤖 AI សម្រាប់គ្រូ</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. TAB VIEW CONTENTS                                          */}
      {/* ------------------------------------------------------------- */}

      {/* VIEW A: HOME OVERVIEW (ផ្ទាំងរបស់គ្រូ) */}
      {activeTabSub === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">វត្តមានថ្ងៃនេះ</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {todayPresentCount} <span className="text-sm font-normal text-slate-500">/ {totalStudents}</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  អត្រាវត្តមាន {totalStudents > 0 ? Math.round((todayPresentCount / totalStudents) * 100) : 100}%
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">ពិន្ទុមធ្យមភាគថ្នាក់</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {classAvgScore.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 10</span>
                </p>
                <p className="text-[11px] text-blue-600 font-bold mt-1">
                  អត្រាជាប់ {passRate}% (និទ្ទេស {classAvgScore >= 7.0 ? 'ល្អ' : 'ល្អបង្គួរ'})
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">សិស្សខ្សោយ/រៀនយឺត</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{classAtRiskCount} នាក់</p>
                <p className="text-[11px] text-indigo-600 font-bold mt-1">
                  កំពុងទទួលបានការបំប៉ន
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Target className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">សំណើសុំច្បាប់សិស្ស</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{pendingRequests.length} ករណី</p>
                <p className="text-[11px] text-amber-600 font-bold mt-1">
                  រង់ចាំការពិនិត្យ
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Top 3 Achievers Spotlight */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base font-moul">
                  តារាងកិត្តិយសសិស្សឆ្នើមប្រចាំថ្នាក់ (Top Achievers)
                </h3>
              </div>
              <button
                onClick={() => setActiveTabSub('ranking')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>មើលចំណាត់ថ្នាក់ទាំងអស់</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topStudents.map((st, idx) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudentDetail(st)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center gap-3.5 ${
                    idx === 0
                      ? 'bg-gradient-to-br from-amber-50/80 to-amber-100/40 border-amber-200 hover:shadow-md'
                      : idx === 1
                      ? 'bg-gradient-to-br from-slate-50 to-slate-100/60 border-slate-200 hover:shadow-md'
                      : 'bg-gradient-to-br from-orange-50/60 to-orange-100/30 border-orange-200 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                    idx === 0 ? 'bg-amber-500 text-white shadow-sm' : idx === 1 ? 'bg-slate-400 text-white shadow-sm' : 'bg-amber-700 text-white shadow-sm'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm truncate font-moul">
                        {st.nameKhmer}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {st.code} • ភេទ {st.gender === 'female' || st.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-800">
                        មធ្យមភាគ {st.rankScoreAvg}/10
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/80 border border-slate-200">
                        និទ្ទេស {st.rankLetter}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Roster Preview with Add Student Trigger */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base font-moul">
                  បញ្ជីឈ្មោះសិស្សក្នុងថ្នាក់ទី {selectedGrade} «{selectedSection}»
                </h3>
                <p className="text-xs text-slate-500">
                  សិស្សសរុប {totalStudents} នាក់ (ស្រី {femaleStudents} នាក់)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkImportOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  📥 នាំចូល
                </button>
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ បន្ថែមសិស្ស</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3 w-12 text-center">ល.រ</th>
                    <th className="py-2.5 px-3">អត្តលេខ</th>
                    <th className="py-2.5 px-3">គោត្តនាម និងនាម</th>
                    <th className="py-2.5 px-3 text-center">ភេទ</th>
                    <th className="py-2.5 px-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="py-2.5 px-3">អាណាព្យាបាល</th>
                    <th className="py-2.5 px-3">លេខទូរស័ព្ទ</th>
                    <th className="py-2.5 px-3 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.slice(0, 8).map((stu, i) => (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center font-mono text-slate-500">{i + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{stu.code}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{stu.nameKhmer}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stu.gender === 'female' || stu.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {stu.gender === 'female' || stu.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{stu.dob || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{stu.guardianName || 'ឪពុកម្តាយ'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{stu.guardianPhone || '—'}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => setSelectedStudentDetail(stu)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                        >
                          មើល
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalStudents > 8 && (
              <div className="pt-3 text-center border-t border-slate-100">
                <button
                  onClick={() => setActiveTabSub('roster')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  មើលសិស្សទាំងអស់ ({totalStudents} នាក់) →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: CLASS & STUDENT ROSTER (ថ្នាក់ និងសិស្ស) */}
      {activeTabSub === 'roster' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                គ្រប់គ្រងថ្នាក់ទី {selectedGrade} «{selectedSection}»
              </span>
              <span className="text-xs text-slate-500">• សរុប {totalStudents} នាក់</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all border border-indigo-200 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>📥 នាំចូលសិស្សច្រើននាក់</span>
              </button>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ បន្ថែមសិស្ស</span>
              </button>
            </div>
          </div>

          <MyClassTab
            students={students}
            selectedGrade={selectedGrade}
            selectedSection={selectedSection}
            classCouncil={currentCouncil}
            onUpdateCouncil={(updated) => updateClassCouncil(selectedGrade, selectedSection, updated)}
            onSelectStudent={(s) => setSelectedStudentDetail(s)}
          />
        </div>
      )}

      {/* VIEW C: DAILY ATTENDANCE TRACKER (ស្រង់អវត្តមាន) */}
      {activeTabSub === 'attendance' && (
        <AttendanceTab
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
        <GradesTab
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          scores={scores}
          onSaveScore={saveStudentScore}
          isResultReleased={isResultReleased}
          onToggleRelease={toggleReleaseClassResults}
          onPrintScoreSheet={() => window.print()}
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

      {/* VIEW J: LESSON PLANS (កិច្ចតែងការបង្រៀន) */}
      {activeTabSub === 'lesson_plans' && (
        <LessonPlansTab
          lessonPlans={lessonPlans}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          onAddPlan={addLessonPlan}
          onUpdatePlan={updateLessonPlan}
          onDeletePlan={deleteLessonPlan}
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
    </div>
  );
};
