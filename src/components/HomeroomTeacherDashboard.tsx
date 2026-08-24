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
import {
  Users,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Layers,
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
  MessageCircle,
  ShieldAlert,
  ArrowRight,
  Target,
  BookMarked
} from 'lucide-react';

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
    currentUser,
    setActiveTab
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

  // Current Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<'my_class' | 'attendance' | 'grades' | 'at_risk' | 'class_logs' | 'lesson_plans' | 'parent_meetings' | 'teacher_meetings' | 'notifications'>('my_class');

  // Selected Student for Detail Modal
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [showClassSummaryPrint, setShowClassSummaryPrint] = useState(false);
  const [showClassCommitteeModal, setShowClassCommitteeModal] = useState(false);
  const [showPriModal, setShowPriModal] = useState(false);
  const [showHealthBookletModal, setShowHealthBookletModal] = useState(false);

  // Derived statistics for current class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );
  const totalStudents = classStudents.length;
  const femaleStudents = classStudents.filter(s => s.gender === 'female').length;

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
  );

  // Helper: auto-record permission attendance when a leave request is approved
  const handleRecordAttendancePermission = (studentId: string, date: string) => {
    recordAttendance(studentId, 'permission', selectedGrade, selectedSection, date, 'សុំច្បាប់ដោយមាតាបិតា');
  };

  return (
    <div className="space-y-5 animate-fadeIn font-battambang">
      {/* Header Banner with Statistics & Class Selector */}
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
        pendingNotificationsCount={totalNotificationsCount}
        urgentNotificationsCount={urgentRequests.length}
        onOpenNotifications={() => setActiveSubTab('notifications')}
        onPrintClassSummary={() => setShowClassSummaryPrint(true)}
        onOpenClassCommitteePrint={() => setShowClassCommitteeModal(true)}
        onOpenPriStatistics={() => setShowPriModal(true)}
        onOpenHealthBooklet={() => setShowHealthBookletModal(true)}
        isTeacherRole={currentUser?.role === 'teacher'}
      />

      {/* URGENT NOTIFICATION TICKER / CALLOUT (Visible across all tabs if urgent items exist) */}
      {urgentRequests.length > 0 && activeSubTab !== 'notifications' && (
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-rose-700">
                  ដំណឹងបន្ទាន់!
                </span>
                <span className="text-xs font-bold font-mono">
                  ថ្នាក់ទី {selectedGrade}«{selectedSection}»
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold mt-0.5">
                មានសំណើបន្ទាន់ចំនួន {urgentRequests.length} ករណីពីមាតាបិតា ({urgentRequests[0].studentName} - {urgentRequests[0].title})
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSubTab('notifications')}
            className="px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <span>ពិនិត្យ & ឆ្លើយតបភ្លាមៗ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6-Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('my_class')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'my_class'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ថ្នាក់រៀនរបស់ខ្ញុំ (My Class)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeSubTab === 'my_class' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {totalStudents}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>ស្រង់វត្តមានប្រចាំថ្ងៃ (Attendance)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('grades')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'grades'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ពិន្ទុ & ចំណាត់ថ្នាក់ (Grades)</span>
        </button>

        {/* AT-RISK STUDENTS TAB BUTTON */}
        <button
          onClick={() => setActiveSubTab('at_risk')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'at_risk'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>សិស្សខ្សោយ/រៀនយឺត (At-Risk)</span>
          {classAtRiskCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSubTab === 'at_risk' ? 'bg-indigo-700 text-white' : 'bg-rose-100 text-rose-800 font-bold'
            }`}>
              {classAtRiskCount}
            </span>
          )}
        </button>

        {/* DAILY CLASS LOG TAB BUTTON */}
        <button
          onClick={() => setActiveSubTab('class_logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'class_logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>កំណត់ហេតុប្រចាំថ្ងៃ (Daily Log)</span>
          {classDailyLogsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeSubTab === 'class_logs' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800 font-bold'
            }`}>
              {classDailyLogsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('lesson_plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'lesson_plans'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>កិច្ចតែងការបង្រៀន (Lesson Plans)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeSubTab === 'lesson_plans' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {classPlans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('parent_meetings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'parent_meetings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>ប្រជុំមាតាបិតា (Parent Meetings)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeSubTab === 'parent_meetings' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {classMeetings.length}
          </span>
        </button>

        {/* TEACHER MEETINGS & RESOLUTIONS TAB (SYNC TO GCAL & DRIVE) */}
        <button
          onClick={() => setActiveSubTab('teacher_meetings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'teacher_meetings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>កំណត់ត្រាការប្រជុំគ្រូ (Teacher Meetings)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeSubTab === 'teacher_meetings' ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {teacherMeetings.length}
          </span>
        </button>

        {/* NEW: NOTIFICATIONS & PARENT REQUESTS TAB */}
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>ដំណឹង & សំណើមាតាបិតា (Notifications)</span>
          {totalNotificationsCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              urgentRequests.length > 0
                ? 'bg-rose-600 text-white animate-pulse'
                : activeSubTab === 'notifications'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-100 text-amber-900'
            }`}>
              {totalNotificationsCount}
            </span>
          )}
        </button>

        {/* AI TEACHER FAST SHORTCUT */}
        <button
          onClick={() => setActiveTab('ai_teacher')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-slate-950 shadow-xs hover:from-amber-400 hover:to-orange-400 transition-all whitespace-nowrap cursor-pointer ml-auto border border-amber-300"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>🤖 AI សម្រាប់គ្រូ (Lesson & Games)</span>
        </button>
      </div>

      {/* Main Tab Content Display */}
      {activeSubTab === 'my_class' && (
        <MyClassTab
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          classCouncil={currentCouncil}
          onUpdateCouncil={(updated) => updateClassCouncil(selectedGrade, selectedSection, updated)}
          onSelectStudent={(s) => setSelectedStudentDetail(s)}
        />
      )}

      {activeSubTab === 'attendance' && (
        <AttendanceTab
          students={students}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          attendanceRecords={attendanceRecords}
          onRecordAttendance={recordAttendance}
          onBatchRecordAttendance={batchRecordAttendance}
        />
      )}

      {activeSubTab === 'grades' && (
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

      {/* AT-RISK STUDENTS TAB */}
      {activeSubTab === 'at_risk' && (
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

      {/* DAILY CLASS LOG TAB */}
      {activeSubTab === 'class_logs' && (
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

      {activeSubTab === 'lesson_plans' && (
        <LessonPlansTab
          lessonPlans={lessonPlans}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          onAddPlan={addLessonPlan}
          onUpdatePlan={updateLessonPlan}
          onDeletePlan={deleteLessonPlan}
        />
      )}

      {activeSubTab === 'parent_meetings' && (
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

      {/* TEACHER MEETINGS AND RESOLUTIONS TAB WITH GOOGLE CALENDAR & DRIVE SYNC */}
      {activeSubTab === 'teacher_meetings' && (
        <TeacherMeetingNotesTab
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          isTeacherRole={currentUser?.role === 'teacher'}
        />
      )}

      {/* NEW: NOTIFICATIONS TAB CONTENT */}
      {activeSubTab === 'notifications' && (
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
          onGoToMeetingsTab={() => setActiveSubTab('parent_meetings')}
          attendanceRecords={attendanceRecords}
          scores={scores}
          onRecordAttendancePermission={handleRecordAttendancePermission}
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
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500">ភេទ / ថ្ងៃខែឆ្នាំកំណើត៖</span>
                <span className="font-bold text-slate-800">
                  {selectedStudentDetail.gender === 'female' ? 'ស្រី' : 'ប្រុស'} • {selectedStudentDetail.dob || '—'}
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
                <span className="font-bold text-emerald-700">កម្ពស់ {selectedStudentDetail.height || 135}cm • ទម្ងន់ {selectedStudentDetail.weight || 28}kg</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
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
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  បោះពុម្ព
                </button>
                <button
                  onClick={() => setShowClassSummaryPrint(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
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
                <p><strong>គ្រូបន្ទុកថ្នាក់៖</strong> {currentTeacher ? currentTeacher.nameKhmer : 'លោក ចាន់ វុទ្ធី'}</p>
                <p><strong>ឆ្នាំសិក្សា៖</strong> ២០២៤ - ២០២៥</p>
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
                <p className="font-bold text-slate-900">៣. ទំនាក់ទំនងមាតាបិតា (គ.គ.ថ.)៖</p>
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
                  <p className="font-bold font-moul">លោក ចាន់ វុទ្ធី</p>
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
          selectedAcademicYear="២០២៥-២០២៦"
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
          academicYear="២០២៥-២០២៦"
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
          academicYear="២០២៥-២០២៦"
          allStudents={classStudents.length > 0 ? classStudents : students}
        />
      )}
    </div>
  );
};
