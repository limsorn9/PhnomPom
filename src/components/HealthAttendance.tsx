import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student } from '../types';
import {
  CalendarCheck,
  HeartPulse,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  CheckCheck,
  Search,
  Filter,
  Sparkles,
  Info,
  ShieldCheck,
  Edit2,
  Printer,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { StudentHealthBookletModal } from './StudentHealthBookletModal';
import { ClassStudentStatisticsPriModal } from './ClassStudentStatisticsPriModal';

export const HealthAttendance: React.FC = () => {
  const {
    students,
    attendanceRecords,
    batchRecordAttendance,
    updateStudent,
    schoolProfile,
    teachers
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'trends' | 'health'>('attendance');
  const [showInlineTrend, setShowInlineTrend] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [session, setSession] = useState<'morning' | 'afternoon'>('morning');

  // Official Modals State
  const [healthBookletStudent, setHealthBookletStudent] = useState<Student | null>(null);
  const [showPriModal, setShowPriModal] = useState<boolean>(false);

  // Filter students for active class
  const classStudents = students.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  // Local Attendance State for today's session
  const [attendanceState, setAttendanceState] = useState<{
    [studentId: string]: {
      status: 'present' | 'permission' | 'absent';
      notes?: string;
    };
  }>({});

  // Initialize status from stored records or default to present
  React.useEffect(() => {
    const existing = attendanceRecords.filter(
      r =>
        r.date === selectedDate &&
        r.grade === selectedGrade &&
        r.section === selectedSection &&
        r.session === session
    );

    const initialMap: { [studentId: string]: { status: 'present' | 'permission' | 'absent'; notes?: string } } = {};
    classStudents.forEach(st => {
      const found = existing.find(e => e.studentId === st.id);
      if (found) {
        initialMap[st.id] = { status: found.status, notes: found.notes || '' };
      } else {
        initialMap[st.id] = { status: 'present', notes: '' };
      }
    });

    setAttendanceState(initialMap);
  }, [selectedDate, selectedGrade, selectedSection, session, classStudents.length]);

  const handleStatusChange = (studentId: string, status: 'present' | 'permission' | 'absent') => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: typeof attendanceState = {};
    classStudents.forEach(st => {
      updated[st.id] = { status: 'present', notes: '' };
    });
    setAttendanceState(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave = classStudents.map(st => {
      const state = attendanceState[st.id] || { status: 'present' };
      return {
        date: selectedDate,
        grade: selectedGrade,
        section: selectedSection,
        studentId: st.id,
        studentNameKhmer: st.nameKhmer,
        status: state.status,
        session,
        notes: state.notes
      };
    });

    batchRecordAttendance(recordsToSave);
  };

  // Health editing state
  const [editingStudentHealth, setEditingStudentHealth] = useState<Student | null>(null);
  const [healthForm, setHealthForm] = useState({
    heightCm: 125,
    weightKg: 24,
    bloodType: 'O+',
    vaccinated: true,
    notes: ''
  });

  const handleOpenHealthEdit = (student: Student) => {
    setEditingStudentHealth(student);
    setHealthForm({
      heightCm: student.health.heightCm,
      weightKg: student.health.weightKg,
      bloodType: student.health.bloodType,
      vaccinated: student.health.vaccinated,
      notes: student.health.notes || ''
    });
  };

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentHealth) return;

    const heightM = healthForm.heightCm / 100;
    const bmi = Number((healthForm.weightKg / (heightM * heightM)).toFixed(1));
    let nutritionStatus: 'normal' | 'underweight' | 'overweight' | 'wasted' = 'normal';
    if (bmi < 14.5) nutritionStatus = 'underweight';
    else if (bmi > 20) nutritionStatus = 'overweight';

    updateStudent(editingStudentHealth.id, {
      health: {
        heightCm: Number(healthForm.heightCm),
        weightKg: Number(healthForm.weightKg),
        bmi,
        nutritionStatus,
        bloodType: healthForm.bloodType,
        vaccinated: healthForm.vaccinated,
        notes: healthForm.notes,
        lastCheckedDate: selectedDate
      }
    });

    setEditingStudentHealth(null);
  };

  // Quick statistics for attendance
  const attendanceValues = Object.values(attendanceState) as Array<{ status: 'present' | 'permission' | 'absent'; notes?: string }>;
  const presentCount = attendanceValues.filter(s => s.status === 'present').length;
  const permissionCount = attendanceValues.filter(s => s.status === 'permission').length;
  const absentCount = attendanceValues.filter(s => s.status === 'absent').length;
  const attendanceRate = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-moul">វត្តមាន និងសុខភាពសិស្ស</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                តាមដានប្រចាំថ្ងៃ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              កត់ត្រាវត្តមានប្រចាំថ្ងៃ និងពិនិត្យតាមដានស្ថានភាពអាហារូបត្ថម្ភ (BMI) របស់សិស្សានុសិស្ស
            </p>
          </div>

          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1">
            <button
              id="subtab-attendance"
              onClick={() => setActiveSubTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              កត់ត្រាវត្តមាន
            </button>
            <button
              id="subtab-trends"
              onClick={() => setActiveSubTab('trends')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'trends'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>និន្នាការប្រចាំខែ (Chart)</span>
            </button>
            <button
              id="subtab-health"
              onClick={() => setActiveSubTab('health')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'health'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              សុខភាព & BMI
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'attendance' ? (
        /* Attendance Tracking Section */
        <div className="space-y-6">
          {/* Controls and Selectors */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">កាលបរិច្ឆេទ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>
                    ថ្នាក់ទី {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">បន្ទប់</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value="ក">បន្ទប់ ក</option>
                <option value="ខ">បន្ទប់ ខ</option>
                <option value="គ">បន្ទប់ គ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ពេល</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as 'morning' | 'afternoon')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value="morning">ពេលព្រឹក (Morning)</option>
                <option value="afternoon">ពេលរសៀល (Afternoon)</option>
              </select>
            </div>
          </div>

          {/* Attendance Summary Status Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="text-slate-600">
                សរុបក្នុងថ្នាក់: <strong className="text-slate-900">{classStudents.length}</strong> នាក់
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                វត្តមាន: <strong>{presentCount}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <Clock className="w-4 h-4 text-amber-500" />
                មានច្បាប់: <strong>{permissionCount}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <XCircle className="w-4 h-4 text-rose-500" />
                ឥតច្បាប់: <strong>{absentCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                អត្រាវត្តមាន: <strong>{attendanceRate}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="toggle-trend-btn"
                onClick={() => setShowInlineTrend(!showInlineTrend)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                  showInlineTrend
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title="បិទ/បើក ក្រាហ្វនិន្នាការប្រចាំខែ"
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>{showInlineTrend ? 'លាក់ក្រាហ្វ' : 'បង្ហាញក្រាហ្វនិន្នាការ'}</span>
              </button>
              <button
                id="print-attendance-btn"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                title="បោះពុម្ពបញ្ជីវត្តមាន"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                បោះពុម្ព
              </button>
              <button
                id="mark-all-present-btn"
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                វត្តមានទាំងអស់
              </button>
              <button
                id="save-attendance-btn"
                onClick={handleSaveAttendance}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                រក្សាទុកវត្តមាន
              </button>
            </div>
          </div>

          {/* Student Attendance List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Official Ministry Heading shown only on Print */}
            <div className="hidden print:block p-6 mb-4 border-b border-slate-300">
              <div className="flex justify-between items-start text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                  <p className="text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                  <p className="font-bold text-blue-950 font-moul text-sm">{schoolProfile.nameKhmer}</p>
                  <p className="text-[10px] text-slate-500 font-mono">កូដសាលា: {schoolProfile.schoolCode}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-xs text-slate-900 font-moul">ស្តង់ដារសាលាបឋមសិក្សាគំរូ</p>
                  <p className="text-xs text-slate-700">ឆ្នាំសិក្សា៖ <span className="font-bold">{schoolProfile.academicYear}</span></p>
                  <p className="text-[10px] text-slate-500">កាលបរិច្ឆេទ៖ {selectedDate}</p>
                </div>
              </div>
              <div className="text-center mt-4">
                <h2 className="font-moul text-base text-slate-950">
                  តារាងស្រង់វត្តមានសិស្សប្រចាំថ្ងៃ (ថ្នាក់ទី {selectedGrade}{selectedSection})
                </h2>
                <p className="text-xs text-slate-700 mt-1">
                  វេន៖ <strong>{session === 'morning' ? 'ព្រឹក' : 'រសៀល'}</strong> • សិស្សសរុប៖ <strong>{classStudents.length}</strong> នាក់ • វត្តមាន៖ <strong>{presentCount}</strong> • ច្បាប់៖ <strong>{permissionCount}</strong> • ឥតច្បាប់៖ <strong>{absentCount}</strong> (អត្រាវត្តមាន <strong>{attendanceRate}%</strong>)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 w-12">ល.រ</th>
                    <th className="py-3 px-4">ឈ្មោះសិស្ស</th>
                    <th className="py-3 px-4">ភេទ</th>
                    <th className="py-3 px-4">អត្តលេខ</th>
                    <th className="py-3 px-4 text-center">ស្ថានភាពវត្តមាន</th>
                    <th className="py-3 px-4">មូលហេតុ / កត់សម្គាល់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((student, idx) => {
                    const state = attendanceState[student.id] || { status: 'present', notes: '' };
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-600">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{student.nameKhmer}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              student.gender === 'F'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{student.code}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1">
                            <button
                              id={`att-present-${student.id}`}
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                state.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              វត្តមាន
                            </button>
                            <button
                              id={`att-permission-${student.id}`}
                              onClick={() => handleStatusChange(student.id, 'permission')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                state.status === 'permission'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              មានច្បាប់
                            </button>
                            <button
                              id={`att-absent-${student.id}`}
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                state.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              ឥតច្បាប់
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={state.notes || ''}
                            onChange={(e) =>
                              setAttendanceState(prev => ({
                                ...prev,
                                [student.id]: {
                                  ...prev[student.id],
                                  notes: e.target.value
                                }
                              }))
                            }
                            placeholder="ឧ. ឈឺផ្តាសាយ, ធុរៈគ្រួសារ..."
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Signatures on Print */}
            <div className="hidden print:flex justify-between items-end mt-8 text-xs text-slate-800 p-6 pt-2">
              <div className="text-center">
                <p>បានឃើញ និងយល់ព្រម</p>
                <strong className="block mt-1 font-moul text-slate-900">នាយិកាសាលា</strong>
                <div className="h-16" />
                <p className="font-bold">{schoolProfile.principalName}</p>
              </div>

              <div className="text-center">
                <p>{schoolProfile.district}, ថ្ងៃទី {selectedDate}</p>
                <strong className="block mt-1 font-moul text-slate-900">គ្រូបន្ទុកថ្នាក់</strong>
                <div className="h-16" />
                <p className="font-bold">{teachers.find(t => t.assignedGrade === selectedGrade)?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</p>
              </div>
            </div>
          </div>

          {/* Inline Attendance Trend Visualization */}
          {showInlineTrend && (
            <div className="pt-2">
              <AttendanceTrendChart
                currentGrade={selectedGrade}
                currentSection={selectedSection}
                onSelectDate={(dateStr) => {
                  setSelectedDate(dateStr);
                  // Scroll to top of table smoothly
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      ) : activeSubTab === 'trends' ? (
        /* Dedicated Monthly Attendance Trends Visualization Section */
        <div className="space-y-6">
          <AttendanceTrendChart
            currentGrade={selectedGrade}
            currentSection={selectedSection}
            onSelectDate={(dateStr) => {
              setSelectedDate(dateStr);
              setActiveSubTab('attendance');
            }}
          />
        </div>
      ) : (
        /* Health & Nutrition (BMI) Monitoring Section */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 font-kantumruy">
                  តារាងតាមដានអាហារូបត្ថម្ភ និងសុខភាពសិស្ស (Health & BMI Registry)
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowPriModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  title="បោះពុម្ពតារាងស្ថិតិសិស្សផ្លូវការ PRI"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>តារាងស្ថិតិសិស្ស PRI</span>
                </button>
                <button
                  onClick={() => setHealthBookletStudent(classStudents[0] || students[0] || null)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  title="បោះពុម្ពសៀវភៅសុខភាព ៣ ទំព័រ (គម្របមុខ, ប្រវត្តិជំងឺ, ការពិនិត្យសុខភាព)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>សៀវភៅសុខភាព ៣ទំព័រ (PDF)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">ឈ្មោះសិស្ស</th>
                    <th className="py-3 px-4">ថ្នាក់</th>
                    <th className="py-3 px-4">កម្ពស់ (cm)</th>
                    <th className="py-3 px-4">ទម្ងន់ (kg)</th>
                    <th className="py-3 px-4">សន្ទស្សន៍ BMI</th>
                    <th className="py-3 px-4">ស្ថានភាពអាហារូបត្ថម្ភ</th>
                    <th className="py-3 px-4">ក្រុមឈាម & វ៉ាក់សាំង</th>
                    <th className="py-3 px-4">ការកត់សម្គាល់</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {student.nameKhmer}
                        <span className="block text-[10px] text-slate-500">{student.code}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        ថ្នាក់ទី {student.grade}{student.section}
                      </td>
                      <td className="py-3 px-4 font-mono">{student.health.heightCm} cm</td>
                      <td className="py-3 px-4 font-mono">{student.health.weightKg} kg</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {student.health.bmi}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            student.health.nutritionStatus === 'normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.health.nutritionStatus === 'normal'
                            ? 'សមស្រប (ធម្មតា)'
                            : 'ស្គម (ត្រូវការបំប៉ន)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        ឈាម {student.health.bloodType} •{' '}
                        {student.health.vaccinated ? 'វ៉ាក់សាំងគ្រប់' : 'មិនទាន់គ្រប់'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{student.health.notes || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`edit-health-${student.id}`}
                            onClick={() => handleOpenHealthEdit(student)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            កែ
                          </button>
                          <button
                            onClick={() => setHealthBookletStudent(student)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors flex items-center gap-1"
                            title="បោះពុម្ពសៀវភៅសុខភាព ៣ ទំព័រសម្រាប់សិស្សនេះ"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                            សៀវភៅសុខភាព
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Health Modal */}
      {editingStudentHealth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold font-moul text-slate-900">
              កែទិន្នន័យសុខភាព: {editingStudentHealth.nameKhmer}
            </h3>

            <form onSubmit={handleSaveHealth} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">កម្ពស់ (cm)</label>
                  <input
                    type="number"
                    required
                    value={healthForm.heightCm}
                    onChange={(e) => setHealthForm({ ...healthForm, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ទម្ងន់ (kg)</label>
                  <input
                    type="number"
                    required
                    value={healthForm.weightKg}
                    onChange={(e) => setHealthForm({ ...healthForm, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ក្រុមឈាម</label>
                <select
                  value={healthForm.bloodType}
                  onChange={(e) => setHealthForm({ ...healthForm, bloodType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="vacc-check"
                  checked={healthForm.vaccinated}
                  onChange={(e) => setHealthForm({ ...healthForm, vaccinated: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="vacc-check" className="text-slate-800 font-semibold">
                  បានចាក់វ៉ាក់សាំងការពារជំងឺកុមារគ្រប់ដូស
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">កត់សម្គាល់សុខភាព</label>
                <input
                  type="text"
                  value={healthForm.notes}
                  onChange={(e) => setHealthForm({ ...healthForm, notes: e.target.value })}
                  placeholder="ឧ. ពាក់វ៉ែនតា, អាលែកហ្ស៊ីចំណីអាហារ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudentHealth(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT HEALTH BOOKLET (៣ ទំព័រ) MODAL */}
      {healthBookletStudent && (
        <StudentHealthBookletModal
          isOpen={Boolean(healthBookletStudent)}
          onClose={() => setHealthBookletStudent(null)}
          student={healthBookletStudent}
          schoolProfile={schoolProfile}
          academicYear="២០២៥-២០២៦"
          allStudents={classStudents.length > 0 ? classStudents : students}
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
          homeroomTeacher={teachers.find(t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection)}
          students={students}
        />
      )}
    </div>
  );
};
