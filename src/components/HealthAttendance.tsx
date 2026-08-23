import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, HealthScreeningStatus, DailyHealthCheckRecord } from '../types';
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
  BookOpen,
  Thermometer,
  Activity,
  Flame,
  Smile,
  AlertTriangle,
  Stethoscope,
  Check,
  X
} from 'lucide-react';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { StudentHealthMetricTrendsChart } from './StudentHealthMetricTrendsChart';
import { StudentHealthBookletModal } from './StudentHealthBookletModal';
import { StudentHealthReportPdfModal } from './StudentHealthReportPdfModal';
import { ClassStudentStatisticsPriModal } from './ClassStudentStatisticsPriModal';
import { BulkDataImportExportModal } from './BulkDataImportExportModal';
import { QuickCareObservationModal } from './QuickCareObservationModal';

export const HealthAttendance: React.FC = () => {
  const {
    students,
    attendanceRecords,
    batchRecordAttendance,
    dailyHealthChecks,
    batchRecordHealthChecks,
    updateStudent,
    schoolProfile,
    teachers,
    showToast
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'daily_health' | 'trends' | 'health'>('attendance');
  const [showInlineTrend, setShowInlineTrend] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('ក');
  const [session, setSession] = useState<'morning' | 'afternoon'>('morning');

  // Official Modals State
  const [healthBookletStudent, setHealthBookletStudent] = useState<Student | null>(null);
  const [healthReportStudent, setHealthReportStudent] = useState<Student | null>(null);
  const [showPriModal, setShowPriModal] = useState<boolean>(false);
  const [showBulkHealthModal, setShowBulkHealthModal] = useState<boolean>(false);
  const [quickCareStudent, setQuickCareStudent] = useState<Student | null>(null);

  // Health Alert Filter & Search
  const [healthAlertFilter, setHealthAlertFilter] = useState<'all' | 'unvaccinated' | 'missed_nurse' | 'bmi_risk'>('all');
  const [healthSearchQuery, setHealthSearchQuery] = useState<string>('');

  // BMI status badge calculator
  const getBmiBadgeInfo = (bmi: number) => {
    if (!bmi || isNaN(bmi)) {
      return {
        label: 'មិនទាន់វាស់',
        bgColor: 'bg-slate-100 text-slate-700 border-slate-200',
        dotColor: 'bg-slate-400'
      };
    }
    if (bmi < 14.5) {
      return {
        label: 'ស្គម (Underweight)',
        bgColor: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20',
        dotColor: 'bg-amber-500'
      };
    }
    if (bmi <= 20.0) {
      return {
        label: 'សុខភាពល្អ (Healthy)',
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/20',
        dotColor: 'bg-emerald-500'
      };
    }
    if (bmi <= 23.0) {
      return {
        label: 'លើសទម្ងន់ (Overweight)',
        bgColor: 'bg-orange-50 text-orange-800 border-orange-300 ring-1 ring-orange-500/20',
        dotColor: 'bg-orange-500'
      };
    }
    return {
      label: 'ធាត់ខ្លាំង (Obese)',
      bgColor: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/20',
      dotColor: 'bg-rose-500'
    };
  };

  // Handle Quick Care Note saving
  const handleSaveQuickCareObservation = (studentId: string, updatedNotes: string, observationTag?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    updateStudent(studentId, {
      health: {
        ...student.health,
        notes: updatedNotes,
        lastCheckedDate: selectedDate
      }
    });

    showToast(
      `បានរក្សាទុកកំណត់ត្រាថែទាំសុខភាពរហ័សសម្រាប់ "${student.nameKhmer}" ${observationTag ? `[${observationTag}]` : ''} ដោយជោគជ័យ!`,
      'success'
    );
  };

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

  // Local Daily Health Check State for selected session
  const [dailyHealthState, setDailyHealthState] = useState<{
    [studentId: string]: {
      temperature: number;
      status: HealthScreeningStatus;
      symptoms: string[];
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

  // Synchronize Daily Health Check state from stored records
  React.useEffect(() => {
    const existingHealth = dailyHealthChecks.filter(
      r =>
        r.date === selectedDate &&
        r.grade === selectedGrade &&
        r.section === selectedSection &&
        r.session === session
    );

    const initialHealthMap: typeof dailyHealthState = {};
    classStudents.forEach(st => {
      const found = existingHealth.find(e => e.studentId === st.id);
      if (found) {
        initialHealthMap[st.id] = {
          temperature: found.temperature,
          status: found.status,
          symptoms: found.symptoms || [],
          notes: found.notes || ''
        };
      } else {
        initialHealthMap[st.id] = {
          temperature: 36.6,
          status: 'normal',
          symptoms: [],
          notes: ''
        };
      }
    });

    setDailyHealthState(initialHealthMap);
  }, [selectedDate, selectedGrade, selectedSection, session, classStudents.length, dailyHealthChecks.length]);

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

  // Daily Health Check Handlers
  const handleHealthFieldChange = (
    studentId: string,
    field: 'temperature' | 'status' | 'notes',
    value: any
  ) => {
    setDailyHealthState(prev => {
      const current = prev[studentId] || {
        temperature: 36.6,
        status: 'normal',
        symptoms: [],
        notes: ''
      };
      const updated = { ...current, [field]: value };
      
      // Auto-adjust status if temperature crosses fever thresholds
      if (field === 'temperature') {
        const temp = Number(value);
        if (temp >= 38.5) {
          updated.status = 'isolate';
          if (!updated.symptoms.includes('ក្តៅខ្លួន')) updated.symptoms = [...updated.symptoms, 'ក្តៅខ្លួន'];
        } else if (temp >= 37.5) {
          updated.status = 'warning';
          if (!updated.symptoms.includes('ក្តៅខ្លួន')) updated.symptoms = [...updated.symptoms, 'ក្តៅខ្លួន'];
        } else if (updated.symptoms.length > 0) {
          updated.status = 'monitor';
        } else {
          updated.status = 'normal';
          updated.symptoms = updated.symptoms.filter(s => s !== 'ក្តៅខ្លួន');
        }
      }
      return { ...prev, [studentId]: updated };
    });
  };

  const handleToggleSymptom = (studentId: string, symptom: string) => {
    setDailyHealthState(prev => {
      const current = prev[studentId] || {
        temperature: 36.6,
        status: 'normal',
        symptoms: [],
        notes: ''
      };
      const exists = current.symptoms.includes(symptom);
      const newSymptoms = exists
        ? current.symptoms.filter(s => s !== symptom)
        : [...current.symptoms, symptom];

      let newStatus = current.status;
      if (newSymptoms.length > 0 && newStatus === 'normal') {
        newStatus = 'monitor';
      } else if (newSymptoms.length === 0 && current.temperature < 37.5) {
        newStatus = 'normal';
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          symptoms: newSymptoms,
          status: newStatus
        }
      };
    });
  };

  const handleMarkAllHealthNormal = () => {
    const updated: typeof dailyHealthState = {};
    classStudents.forEach(st => {
      updated[st.id] = {
        temperature: 36.6,
        status: 'normal',
        symptoms: [],
        notes: ''
      };
    });
    setDailyHealthState(updated);
    showToast('បានកំណត់ស្ថានភាពពិនិត្យសុខភាពសិស្សទាំងអស់ជា "ធម្មតា (36.6°C)"', 'info');
  };

  const handleSaveDailyHealth = () => {
    const recordsToSave: Array<Omit<DailyHealthCheckRecord, 'id'>> = classStudents.map(st => {
      const state = dailyHealthState[st.id] || {
        temperature: 36.6,
        status: 'normal',
        symptoms: [],
        notes: ''
      };
      return {
        date: selectedDate,
        grade: selectedGrade,
        section: selectedSection,
        studentId: st.id,
        studentNameKhmer: st.nameKhmer,
        temperature: Number(state.temperature) || 36.6,
        status: state.status,
        symptoms: state.symptoms,
        session,
        checkedAt: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
        notes: state.notes
      };
    });

    batchRecordHealthChecks(recordsToSave);
    showToast(`បានរក្សាទុកកំណត់ត្រាពិនិត្យសុខភាពប្រចាំថ្ងៃសម្រាប់សិស្ស ${classStudents.length} នាក់រួចរាល់!`, 'success');
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

  // Quick statistics for Daily Health Check
  const healthCheckValues = Object.values(dailyHealthState) as Array<{
    temperature: number;
    status: HealthScreeningStatus;
    symptoms: string[];
    notes?: string;
  }>;
  const normalHealthCount = healthCheckValues.filter(s => s.status === 'normal').length;
  const monitorHealthCount = healthCheckValues.filter(s => s.status === 'monitor').length;
  const warningHealthCount = healthCheckValues.filter(s => s.status === 'warning').length;
  const isolateHealthCount = healthCheckValues.filter(s => s.status === 'isolate').length;
  const feverCount = healthCheckValues.filter(s => (s.temperature >= 37.5 || s.symptoms.includes('ក្តៅខ្លួន'))).length;
  const avgTemperature = healthCheckValues.length > 0
    ? (healthCheckValues.reduce((acc, curr) => acc + (Number(curr.temperature) || 36.6), 0) / healthCheckValues.length).toFixed(1)
    : '36.6';

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
              <span>កត់ត្រាវត្តមាន</span>
            </button>
            <button
              id="subtab-daily-health"
              onClick={() => setActiveSubTab('daily_health')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'daily_health'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span>ពិនិត្យសុខភាពប្រចាំថ្ងៃ (Daily Health)</span>
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
              <span>សុខភាព & BMI</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'attendance' ? (
        /* Attendance Tracking Section */
        <div className="space-y-6 animate-fade-in">
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
      ) : activeSubTab === 'daily_health' ? (
        /* DAILY MORNING HEALTH SCREENING SECTION */
        <div className="space-y-6 animate-in fade-in">
          {/* Filter and Date Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">កាលបរិច្ឆេទពិនិត្យ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ក">បន្ទប់ ក</option>
                <option value="ខ">បន្ទប់ ខ</option>
                <option value="គ">បន្ទប់ គ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">វេនពិនិត្យសុខភាព</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as 'morning' | 'afternoon')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="morning">ពេលព្រឹក (Morning Screening)</option>
                <option value="afternoon">ពេលរសៀល (Afternoon Screening)</option>
              </select>
            </div>
          </div>

          {/* Daily Health Summary Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">សិស្សសរុប</span>
                <strong className="text-base font-bold font-times text-slate-900">{classStudents.length} នាក់</strong>
              </div>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-700 block font-medium">ល្អធម្មតា 🟢</span>
                <strong className="text-base font-bold font-times text-emerald-900">{normalHealthCount} នាក់</strong>
              </div>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amber-700 block font-medium">ត្រូវតាមដាន 🟡</span>
                <strong className="text-base font-bold font-times text-amber-900">{monitorHealthCount} នាក់</strong>
              </div>
            </div>

            <div className="bg-orange-50/80 p-4 rounded-2xl border border-orange-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-orange-700 block font-medium">ក្តៅខ្លួនស្រាល 🟠</span>
                <strong className="text-base font-bold font-times text-orange-900">{warningHealthCount} នាក់</strong>
              </div>
            </div>

            <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-rose-700 block font-medium">ក្តៅខ្លួន/ឈឺ 🔴</span>
                <strong className="text-base font-bold font-times text-rose-900">{isolateHealthCount || feverCount} នាក់</strong>
              </div>
            </div>

            <div className="bg-cyan-50/80 p-4 rounded-2xl border border-cyan-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-cyan-700 block font-medium">សីតុណ្ហភាពមធ្យម</span>
                <strong className="text-base font-bold font-times text-cyan-900">{avgTemperature}°C</strong>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                តារាងពិនិត្យសុខភាពសិស្សពេលព្រឹក (ថ្នាក់ទី {selectedGrade}{selectedSection})
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="mark-all-health-normal-btn"
                onClick={handleMarkAllHealthNormal}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="កំណត់ស្ថានភាពសិស្សទាំងអស់ជាសុខភាពល្អធម្មតា (36.6°C)"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>សុខភាពល្អទាំងអស់ (36.6°C)</span>
              </button>

              <button
                type="button"
                id="save-daily-health-btn"
                onClick={handleSaveDailyHealth}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>រក្សាទុកកំណត់ត្រាសុខភាព</span>
              </button>
            </div>
          </div>

          {/* Color-Coded Health Screening Input Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">ល.រ</th>
                    <th className="py-3 px-4 min-w-[160px]">ព័ត៌មានសិស្ស</th>
                    <th className="py-3 px-4 min-w-[170px]">សីតុណ្ហភាព (°C)</th>
                    <th className="py-3 px-4 min-w-[210px]">ស្ថានភាពពិនិត្យសុខភាព</th>
                    <th className="py-3 px-4 min-w-[280px]">រោគសញ្ញាសង្កេតឃើញ (Symptoms)</th>
                    <th className="py-3 px-4 min-w-[160px]">ចំណាំបន្ថែម</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        មិនមានទិន្នន័យសិស្សក្នុងថ្នាក់ទី {selectedGrade}{selectedSection} នេះទេ
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student, idx) => {
                      const state = dailyHealthState[student.id] || {
                        temperature: 36.6,
                        status: 'normal' as HealthScreeningStatus,
                        symptoms: [],
                        notes: ''
                      };

                      // Color coding based on status & temperature
                      let rowBgClass = 'hover:bg-slate-50/70';
                      if (state.status === 'isolate' || state.temperature >= 38.5) {
                        rowBgClass = 'bg-rose-50/50 hover:bg-rose-50';
                      } else if (state.status === 'warning' || state.temperature >= 37.5) {
                        rowBgClass = 'bg-amber-50/40 hover:bg-amber-50';
                      } else if (state.status === 'monitor' || state.symptoms.length > 0) {
                        rowBgClass = 'bg-yellow-50/30 hover:bg-yellow-50';
                      }

                      const symptomOptions = [
                        'ក្តៅខ្លួន',
                        'ក្អក',
                        'ផ្តាសាយ/ហៀរសំបោរ',
                        'ឈឺក្បាល',
                        'ឈឺពោះ',
                        'ឈឺបំពង់ក',
                        'ភ្នែកក្រហម',
                        'កន្ទួលរមាស់'
                      ];

                      return (
                        <tr key={student.id} className={`transition-colors ${rowBgClass}`}>
                          {/* Row Number */}
                          <td className="py-3 px-4 text-center font-mono text-slate-500 font-bold">
                            {idx + 1}
                          </td>

                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.nameKhmer}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  student.gender === 'female'
                                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  {student.nameKhmer.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{student.nameKhmer}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                  <span className="font-mono">{student.code}</span>
                                  <span>•</span>
                                  <span>{student.gender === 'female' ? 'ស្រី' : 'ប្រុស'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Temperature Control */}
                          <td className="py-3 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextTemp = Math.max(35.0, Number((state.temperature - 0.1).toFixed(1)));
                                    handleHealthFieldChange(student.id, 'temperature', nextTemp);
                                  }}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  title="បន្ថយ 0.1°C"
                                >
                                  -
                                </button>
                                <div className="relative">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="34.0"
                                    max="42.0"
                                    value={state.temperature}
                                    onChange={(e) => handleHealthFieldChange(student.id, 'temperature', parseFloat(e.target.value) || 36.6)}
                                    className={`w-20 px-2 py-1 text-center font-mono font-bold rounded-lg border text-xs focus:ring-2 focus:outline-none ${
                                      state.temperature >= 38.5
                                        ? 'bg-rose-100 border-rose-400 text-rose-900 ring-rose-400'
                                        : state.temperature >= 37.5
                                        ? 'bg-amber-100 border-amber-400 text-amber-900 ring-amber-400'
                                        : 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-emerald-400'
                                    }`}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextTemp = Math.min(42.0, Number((state.temperature + 0.1).toFixed(1)));
                                    handleHealthFieldChange(student.id, 'temperature', nextTemp);
                                  }}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  title="បន្ថែម 0.1°C"
                                >
                                  +
                                </button>
                              </div>

                              {/* Preset quick buttons */}
                              <div className="flex items-center gap-1">
                                {[36.5, 37.2, 37.8, 38.5].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handleHealthFieldChange(student.id, 'temperature', preset)}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                      state.temperature === preset
                                        ? 'bg-slate-800 text-white font-bold'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {preset}°
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Screening Status Pills */}
                          <td className="py-3 px-4">
                            <div className="grid grid-cols-2 gap-1">
                              {[
                                { status: 'normal' as HealthScreeningStatus, label: 'ល្អធម្មតា', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600/30' },
                                { status: 'monitor' as HealthScreeningStatus, label: 'ត្រូវតាមដាន', color: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200', active: 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-500/30' },
                                { status: 'warning' as HealthScreeningStatus, label: 'ក្តៅខ្លួនស្រាល', color: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200', active: 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-500/30' },
                                { status: 'isolate' as HealthScreeningStatus, label: 'ឈឺ/សម្រាក', color: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200', active: 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600/30' },
                              ].map(item => {
                                const isSelected = state.status === item.status;
                                return (
                                  <button
                                    key={item.status}
                                    type="button"
                                    onClick={() => handleHealthFieldChange(student.id, 'status', item.status)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all text-center cursor-pointer ${
                                      isSelected ? item.active : item.color
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Symptoms Tag Multi-Selector */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {symptomOptions.map(symptom => {
                                const isChecked = state.symptoms.includes(symptom);
                                return (
                                  <button
                                    key={symptom}
                                    type="button"
                                    onClick={() => handleToggleSymptom(student.id, symptom)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                                      isChecked
                                        ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-2.5 h-2.5 text-rose-600" />}
                                    <span>{symptom}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={state.notes || ''}
                              onChange={(e) => handleHealthFieldChange(student.id, 'notes', e.target.value)}
                              placeholder="កំណត់សម្គាល់..."
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span>កត់ត្រាដោយលោកគ្រូ-អ្នកគ្រូ៖ </span>
                <strong className="text-slate-900">{teachers.find(t => t.assignedGrade === selectedGrade && t.assignedSection === selectedSection)?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllHealthNormal}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  កំណត់សុខភាពល្អទាំងអស់
                </button>
                <button
                  type="button"
                  onClick={handleSaveDailyHealth}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកកំណត់ត្រាសុខភាព ({classStudents.length} នាក់)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'trends' ? (
        /* Dedicated Monthly Attendance & Health Growth Trends Visualization Section */
        <div className="space-y-6 animate-fade-in">
          {/* Semester Student Health Metric Trends Line Chart (Recharts) */}
          <StudentHealthMetricTrendsChart
            currentGrade={selectedGrade}
            currentSection={selectedSection}
            onSelectStudent={(student) => setHealthReportStudent(student)}
          />

          {/* Monthly Attendance Trends Chart */}
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
        <div className="space-y-6 animate-fade-in">
          {/* Top Interactive Metric Trajectory Line Chart */}
          <StudentHealthMetricTrendsChart
            currentGrade={selectedGrade}
            currentSection={selectedSection}
            onSelectStudent={(student) => setHealthReportStudent(student)}
          />

          {/* Visual Alert System: Mandatory Vaccination & Overdue Nurse Visits Alert Cards */}
          {(() => {
            const unvaccList = students.filter(s => !s.health?.vaccinated);
            const missedNurseList = students.filter(s => !s.health?.lastCheckedDate || s.health?.notes?.includes('ខកខាន') || (s.health?.bmi && (s.health.bmi < 14 || s.health.bmi > 22)));
            const bmiRiskList = students.filter(s => s.health?.bmi < 14.5 || s.health?.bmi > 20.0);

            return (
              <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-kantumruy">
                        ប្រព័ន្ធផ្តល់ដំណឹងសុខភាព & ការយកចិត្តទុកដាក់បន្ទាន់ (Clinical Alert System)
                      </h4>
                      <p className="text-xs text-slate-600">
                        តាមដានសិស្សដែលខ្វះទិន្នន័យវ៉ាក់សាំងកាតព្វកិច្ច ខកខានជួបពេទ្យ ឬមានហានិភ័យអាហារូបត្ថម្ភ
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full w-fit">
                    ករណីត្រូវការយកចិត្តទុកដាក់សរុប: {unvaccList.length + missedNurseList.length + bmiRiskList.length} ករណី
                  </span>
                </div>

                {/* 3 Interactive Alert KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Alert 1: Missing Mandatory Vaccines */}
                  <button
                    type="button"
                    onClick={() => setHealthAlertFilter(healthAlertFilter === 'unvaccinated' ? 'all' : 'unvaccinated')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      healthAlertFilter === 'unvaccinated'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400'
                        : 'bg-white hover:bg-rose-50/80 border-rose-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${healthAlertFilter === 'unvaccinated' ? 'text-white' : 'text-rose-700'}`}>
                        💉 ខ្វះទិន្នន័យវ៉ាក់សាំងកាតព្វកិច្ច
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                          healthAlertFilter === 'unvaccinated' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {unvaccList.length} នាក់
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1.5 ${healthAlertFilter === 'unvaccinated' ? 'text-rose-100' : 'text-slate-500'}`}>
                      មិនទាន់បានចាក់វ៉ាក់សាំងការពារជំងឺកុមារគ្រប់ដូស ឬគ្មានកំណត់ត្រា
                    </p>
                  </button>

                  {/* Alert 2: Missed/Overdue Nurse Checkups */}
                  <button
                    type="button"
                    onClick={() => setHealthAlertFilter(healthAlertFilter === 'missed_nurse' ? 'all' : 'missed_nurse')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      healthAlertFilter === 'missed_nurse'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400'
                        : 'bg-white hover:bg-amber-50/80 border-amber-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${healthAlertFilter === 'missed_nurse' ? 'text-white' : 'text-amber-800'}`}>
                        🩺 ខកខានពិនិត្យ/ជួបពេទ្យសាលា
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                          healthAlertFilter === 'missed_nurse' ? 'bg-white text-amber-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {missedNurseList.length} នាក់
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1.5 ${healthAlertFilter === 'missed_nurse' ? 'text-amber-100' : 'text-slate-500'}`}>
                      មិនទាន់បានពិនិត្យសុខភាពតាមកាលកំណត់ ឬមានកំណត់ត្រាខកខាន
                    </p>
                  </button>

                  {/* Alert 3: BMI / Nutrition Risks */}
                  <button
                    type="button"
                    onClick={() => setHealthAlertFilter(healthAlertFilter === 'bmi_risk' ? 'all' : 'bmi_risk')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      healthAlertFilter === 'bmi_risk'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                        : 'bg-white hover:bg-indigo-50/80 border-indigo-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${healthAlertFilter === 'bmi_risk' ? 'text-white' : 'text-indigo-800'}`}>
                        ⚖️ ហានិភ័យអាហារូបត្ថម្ភ (BMI)
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                          healthAlertFilter === 'bmi_risk' ? 'bg-white text-indigo-800' : 'bg-indigo-100 text-indigo-900'
                        }`}
                      >
                        {bmiRiskList.length} នាក់
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1.5 ${healthAlertFilter === 'bmi_risk' ? 'text-indigo-100' : 'text-slate-500'}`}>
                      សន្ទស្សន៍ BMI ក្រោម 14.5 (ស្គម) ឬលើស 20.0 (លើសទម្ងន់)
                    </p>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Health Registry Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-kantumruy">
                    តារាងតាមដានអាហារូបត្ថម្ភ និងសុខភាពសិស្ស (Health & BMI Registry)
                  </h3>
                  <span className="text-xs text-slate-500">
                    {healthAlertFilter === 'all'
                      ? `បង្ហាញសិស្សទាំងអស់ (${students.length} នាក់)`
                      : healthAlertFilter === 'unvaccinated'
                      ? 'កំពុងចម្រាញ់: សិស្សខ្វះទិន្នន័យវ៉ាក់សាំង'
                      : healthAlertFilter === 'missed_nurse'
                      ? 'កំពុងចម្រាញ់: សិស្សខកខានពិនិត្យសុខភាព/ជួបពេទ្យ'
                      : 'កំពុងចម្រាញ់: សិស្សមានបញ្ហាអាហារូបត្ថម្ភ (BMI)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons & Fast Filter Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={healthSearchQuery}
                    onChange={(e) => setHealthSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខ..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 w-44"
                  />
                  {healthSearchQuery && (
                    <button
                      onClick={() => setHealthSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {healthAlertFilter !== 'all' && (
                  <button
                    onClick={() => setHealthAlertFilter('all')}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    បង្ហាញទាំងអស់
                  </button>
                )}

                <button
                  onClick={() => setShowBulkHealthModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="នាំចូលទិន្នន័យសុខភាពសិស្សធំពីឯកសារ CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>នាំចូលសុខភាព (CSV)</span>
                </button>
                <button
                  onClick={() => setHealthReportStudent(classStudents[0] || students[0] || null)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="ទាញយករបាយការណ៍ប្រវត្តិសុខភាពសិស្សជាទម្រង់ PDF ផ្លូវការ"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>របាយការណ៍សុខភាព (PDF)</span>
                </button>
                <button
                  onClick={() => setShowPriModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="បោះពុម្ពតារាងស្ថិតិសិស្សផ្លូវការ PRI"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>តារាងស្ថិតិ PRI</span>
                </button>
                <button
                  onClick={() => setHealthBookletStudent(classStudents[0] || students[0] || null)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="បោះពុម្ពសៀវភៅសុខភាព ៣ ទំព័រ (គម្របមុខ, ប្រវត្តិជំងឺ, ការពិនិត្យសុខភាព)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>សៀវភៅសុខភាព ៣ទំព័រ</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">ឈ្មោះសិស្ស & ការដាស់តឿន</th>
                    <th className="py-3 px-4">ថ្នាក់</th>
                    <th className="py-3 px-4">កម្ពស់ (cm)</th>
                    <th className="py-3 px-4">ទម្ងន់ (kg)</th>
                    <th className="py-3 px-4">សន្ទស្សន៍ BMI & ស្ថានភាព</th>
                    <th className="py-3 px-4">ក្រុមឈាម & វ៉ាក់សាំង</th>
                    <th className="py-3 px-4">កំណត់ត្រា / ការពិនិត្យចុងក្រោយ</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព / កត់សម្គាល់រហ័ស</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((student) => {
                      // Apply search filter
                      if (healthSearchQuery.trim()) {
                        const q = healthSearchQuery.toLowerCase();
                        const matchesName =
                          student.nameKhmer.toLowerCase().includes(q) ||
                          (student.nameLatin && student.nameLatin.toLowerCase().includes(q));
                        const matchesCode = student.code.toLowerCase().includes(q);
                        if (!matchesName && !matchesCode) return false;
                      }

                      // Apply alert category filter
                      if (healthAlertFilter === 'unvaccinated') {
                        return !student.health?.vaccinated;
                      }
                      if (healthAlertFilter === 'missed_nurse') {
                        return (
                          !student.health?.lastCheckedDate ||
                          student.health?.notes?.includes('ខកខាន') ||
                          (student.health?.bmi && (student.health.bmi < 14 || student.health.bmi > 22))
                        );
                      }
                      if (healthAlertFilter === 'bmi_risk') {
                        return student.health?.bmi < 14.5 || student.health?.bmi > 20.0;
                      }
                      return true;
                    })
                    .map((student) => {
                      const bmiInfo = getBmiBadgeInfo(student.health?.bmi);
                      const isUnvaccinated = !student.health?.vaccinated;
                      const isMissedNurse =
                        !student.health?.lastCheckedDate ||
                        student.health?.notes?.includes('ខកខាន') ||
                        (student.health?.bmi && (student.health.bmi < 14 || student.health.bmi > 22));

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Student Name and High-Visibility Warning Badges */}
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-2">
                              <div>
                                <span className="font-bold text-slate-900 text-sm font-kantumruy block">
                                  {student.nameKhmer}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {student.code} {student.nameLatin ? `• ${student.nameLatin}` : ''}
                                </span>
                                {/* Visual Alert Badges */}
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  {isUnvaccinated && (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                                      title="ខ្វះទិន្នន័យវ៉ាក់សាំងកាតព្វកិច្ច"
                                    >
                                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                                      <span>ខ្វះវ៉ាក់សាំង</span>
                                    </span>
                                  )}
                                  {isMissedNurse && (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                                      title="ខកខានពិនិត្យសុខភាព ឬមិនទាន់មានកាលបរិច្ឆេទពិនិត្យ"
                                    >
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>ខកខានជួបពេទ្យ</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-700">
                            ថ្នាក់ទី {student.grade}{student.section}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">{student.health.heightCm} cm</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">{student.health.weightKg} kg</td>
                          
                          {/* Color-Coded BMI Status Badge */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {student.health.bmi}
                              </span>
                              <div
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiInfo.bgColor}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${bmiInfo.dotColor}`} />
                                <span>{bmiInfo.label}</span>
                              </div>
                            </div>
                          </td>

                          {/* Blood Type & Vaccination Status */}
                          <td className="py-3 px-4 text-slate-700">
                            <div className="space-y-0.5">
                              <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-bold font-mono text-slate-700">
                                ឈាម {student.health.bloodType}
                              </span>
                              <p className={`text-[11px] font-semibold ${isUnvaccinated ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {isUnvaccinated ? '⚠️ មិនទាន់គ្រប់' : '✓ វ៉ាក់សាំងគ្រប់'}
                              </p>
                            </div>
                          </td>

                          {/* Health Notes & Last Checked Date */}
                          <td className="py-3 px-4 text-slate-600">
                            <div className="max-w-[200px] truncate text-[11px]" title={student.health.notes || ''}>
                              {student.health.notes || <span className="text-slate-400 italic">គ្មានកំណត់ត្រា</span>}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              ពិនិត្យ: {student.health.lastCheckedDate || 'មិនទាន់កំណត់'}
                            </span>
                          </td>

                          {/* Actions: Quick Note Button, Edit, PDF Health History, Booklet */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Quick Care Observation Button */}
                              <button
                                onClick={() => setQuickCareStudent(student)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="កត់ត្រាការពិនិត្យ អាការៈ និងការថែទាំសុខភាពបន្ទាន់ដោយមិនបាច់ចាកចេញពីផ្ទាំងនេះ"
                              >
                                <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                                <span>កត់សម្គាល់រហ័ស</span>
                              </button>

                              <button
                                id={`edit-health-${student.id}`}
                                onClick={() => handleOpenHealthEdit(student)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="កែប្រែកម្ពស់ ទម្ងន់ ក្រុមឈាម"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>កែ</span>
                              </button>

                              <button
                                onClick={() => setHealthReportStudent(student)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="បង្កើតរបាយការណ៍ប្រវត្តិសុខភាពជា PDF សម្រាប់សិស្សនេះ"
                              >
                                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                                <span>PDF</span>
                              </button>

                              <button
                                onClick={() => setHealthBookletStudent(student)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="បោះពុម្ពសៀវភៅសុខភាព ៣ ទំព័រសម្រាប់សិស្សនេះ"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                                <span>សៀវភៅ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Health Modal */}
      {editingStudentHealth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow cursor-pointer"
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

      {/* STUDENT HEALTH HISTORY PDF REPORT MODAL */}
      {healthReportStudent && (
        <StudentHealthReportPdfModal
          isOpen={Boolean(healthReportStudent)}
          onClose={() => setHealthReportStudent(null)}
          student={healthReportStudent}
          schoolProfile={schoolProfile}
          academicYear="២០២៥-២០២៦"
        />
      )}

      {/* BULK DATA IMPORT & EXPORT MODAL */}
      {showBulkHealthModal && (
        <BulkDataImportExportModal
          isOpen={showBulkHealthModal}
          onClose={() => setShowBulkHealthModal(false)}
        />
      )}

      {/* QUICK CARE OBSERVATION MODAL */}
      {quickCareStudent && (
        <QuickCareObservationModal
          isOpen={Boolean(quickCareStudent)}
          onClose={() => setQuickCareStudent(null)}
          student={quickCareStudent}
          onSaveObservation={handleSaveQuickCareObservation}
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
