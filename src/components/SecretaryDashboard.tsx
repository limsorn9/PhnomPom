import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, Gender } from '../types';
import { AddStudentModal } from './secretary/AddStudentModal';
import { ConfirmDeleteDialog } from './common/ConfirmDeleteDialog';
import { StudentProfilePdfModal } from './StudentProfilePdfModal';
import { MultiStudentProfileSummaryPdfModal } from './MultiStudentProfileSummaryPdfModal';
import {
  Users,
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  HeartPulse,
  ShieldCheck,
  Award,
  AlertCircle,
  FileSpreadsheet,
  Grid,
  List,
  ArrowUpDown,
  CheckCircle2,
  X,
  Hash,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const SecretaryDashboard: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    schoolProfile,
    showToast,
    currentUser
  } = useSchool();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [vulnerabilityFilter, setVulnerabilityFilter] = useState<'all' | 'idpoor' | 'scholarship' | 'orphan' | 'disability'>('all');
  const [recencyFilter, setRecencyFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'grade' | 'code'>('recent');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [isPrintRosterModalOpen, setIsPrintRosterModalOpen] = useState(false);

  // Helper for Khmer numerals
  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (digit) => khmerDigits[parseInt(digit, 10)]);
  };

  // Calculate age
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  // Helper to check recency of student record
  const isWithinDays = (dateString?: string, days = 1): boolean => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - itemDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };

  // Computed Quick Stats
  const totalStudents = students.length;
  const femaleStudents = students.filter(s => s.gender === 'F').length;
  const maleStudents = students.filter(s => s.gender === 'M').length;
  const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;

  // Recent entries calculation
  const entriesToday = students.filter(s => isWithinDays(s.admissionDate || s.dob, 1)).length;
  const entriesThisWeek = students.filter(s => isWithinDays(s.admissionDate || s.dob, 7)).length;
  const entriesThisMonth = students.filter(s => isWithinDays(s.admissionDate || s.dob, 30)).length;

  // Vulnerability counts
  const idPoorCount = students.filter(s => s.livingCondition && s.livingCondition !== 'ទូទៅ').length;
  const scholarshipCount = students.filter(s => s.scholarship && s.scholarship !== 'មិនមាន').length;
  const orphanCount = students.filter(s => s.orphanStatus && s.orphanStatus !== 'មិនកំព្រា').length;
  const disabilityCount = students.filter(s => s.disability && s.disability !== 'មិនពិការ').length;

  // Grade breakdown
  const gradeDistributionData = [1, 2, 3, 4, 5, 6].map(g => {
    const gradeStudents = students.filter(s => s.grade === g);
    const girls = gradeStudents.filter(s => s.gender === 'F').length;
    const boys = gradeStudents.filter(s => s.gender === 'M').length;
    return {
      grade: g,
      name: `ថ្នាក់ទី ${toKhmerNum(g)}`,
      total: gradeStudents.length,
      girls,
      boys
    };
  });

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchNameKh = student.nameKhmer?.toLowerCase().includes(query);
        const matchNameLatin = student.nameLatin?.toLowerCase().includes(query);
        const matchCode = (student.code || student.id)?.toLowerCase().includes(query);
        const matchPhone = (student.phone || student.guardianPhone)?.includes(query);
        const matchGuardian = (student.guardianName || student.fatherName || student.motherName)?.toLowerCase().includes(query);
        const matchVillage = (student.currentVillage || student.pobVillage)?.toLowerCase().includes(query);
        if (!matchNameKh && !matchNameLatin && !matchCode && !matchPhone && !matchGuardian && !matchVillage) {
          return false;
        }
      }

      // Grade filter
      if (gradeFilter !== 'all' && student.grade !== gradeFilter) {
        return false;
      }

      // Gender filter
      if (genderFilter !== 'all' && student.gender !== genderFilter) {
        return false;
      }

      // Vulnerability filter
      if (vulnerabilityFilter === 'idpoor' && (!student.livingCondition || student.livingCondition === 'ទូទៅ')) {
        return false;
      }
      if (vulnerabilityFilter === 'scholarship' && (!student.scholarship || student.scholarship === 'មិនមាន')) {
        return false;
      }
      if (vulnerabilityFilter === 'orphan' && (!student.orphanStatus || student.orphanStatus === 'មិនកំព្រា')) {
        return false;
      }
      if (vulnerabilityFilter === 'disability' && (!student.disability || student.disability === 'មិនពិការ')) {
        return false;
      }

      // Recency filter
      if (recencyFilter === 'today' && !isWithinDays(student.admissionDate || student.dob, 1)) {
        return false;
      }
      if (recencyFilter === 'week' && !isWithinDays(student.admissionDate || student.dob, 7)) {
        return false;
      }
      if (recencyFilter === 'month' && !isWithinDays(student.admissionDate || student.dob, 30)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return (a.nameKhmer || '').localeCompare(b.nameKhmer || '', 'km');
      }
      if (sortBy === 'grade') {
        return a.grade - b.grade;
      }
      if (sortBy === 'code') {
        return (a.code || a.id).localeCompare(b.code || b.id);
      }
      // recent
      const dateA = new Date(a.admissionDate || a.dob || 0).getTime();
      const dateB = new Date(b.admissionDate || b.dob || 0).getTime();
      return dateB - dateA;
    });
  }, [students, searchTerm, gradeFilter, genderFilter, vulnerabilityFilter, recencyFilter, sortBy]);

  // Handlers for Add/Edit/Delete
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsAddModalOpen(true);
  };

  const handleDeletePrompt = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      showToast(`បានលុបទិន្នន័យសិស្ស «${studentToDelete.nameKhmer}» រួចរាល់`, 'info');
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleSaveStudent = (studentData: any) => {
    if (editingStudent) {
      updateStudent(studentData);
      showToast(`បានកែប្រែព័ត៌មានសិស្ស «${studentData.nameKhmer}» ជោគជ័យ!`, 'success');
    } else {
      addStudent(studentData);
      showToast(`បានបញ្ចូលសិស្សថ្មី «${studentData.nameKhmer}» ជោគជ័យ!`, 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-xs">
              <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
              <span>ការិយាល័យលេខាធិការដ្ឋាន & បញ្ជីសិស្ស • Secretary Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-moul tracking-wide text-white">
              ផ្ទាំងគ្រប់គ្រងលេខាធិការដ្ឋាន
            </h1>
            <p className="text-sm text-blue-100/80 max-w-2xl">
              គ្រប់គ្រងការចុះឈ្មោះសិស្សថ្មីដោយដៃ បច្ចុប្បន្នភាពស្ថិតិសិស្សប្រចាំថ្ងៃ និងតាមដានកំណត់ត្រាការសិក្សាឱ្យបានសុក្រឹត្យ។
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="secretary-add-student-btn"
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5"
            >
              <UserPlus className="w-5 h-5" />
              <span>បញ្ចូលសិស្សថ្មីដោយដៃ</span>
            </button>
            <button
              id="secretary-print-roster-btn"
              onClick={() => setIsPrintRosterModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពបញ្ជីសិស្ស</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              សិស្សសរុបទូទាំងសាលា
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {toKhmerNum(totalStudents)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">នាក់</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="text-pink-600 dark:text-pink-400 font-semibold">
                ស្រី {toKhmerNum(femaleStudents)} នាក់ ({toKhmerNum(femalePercent)}%)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                ប្រុស {toKhmerNum(maleStudents)} នាក់
              </span>
            </div>
          </div>
        </div>

        {/* Recent Entries Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ទិន្នន័យបញ្ចូលថ្មីៗ
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                +{toKhmerNum(entriesThisWeek)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">នាក់ក្នុងសប្តាហ៍នេះ</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <span>ថ្ងៃនេះ៖ <strong className="text-emerald-700 dark:text-emerald-300">+{toKhmerNum(entriesToday)}</strong> នាក់</span>
              <span className="text-slate-300">•</span>
              <span>ខែនេះ៖ <strong className="text-slate-800 dark:text-slate-200">{toKhmerNum(entriesThisMonth)}</strong> នាក់</span>
            </div>
          </div>
        </div>

        {/* Vulnerable / IDPoor Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              សិស្សមានប័ណ្ណសមធម៌ (IDPoor)
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {toKhmerNum(idPoorCount)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">នាក់</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <span>អាហារូបករណ៍៖ <strong className="text-amber-700 dark:text-amber-300">{toKhmerNum(scholarshipCount)}</strong> នាក់</span>
              <span className="text-slate-300">•</span>
              <span>កំព្រា៖ <strong className="text-slate-800 dark:text-slate-200">{toKhmerNum(orphanCount)}</strong></span>
            </div>
          </div>
        </div>

        {/* Grade Levels Overview Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              បំណែងចែកថ្នាក់ទី១ - ទី៦
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 pt-1">
            {gradeDistributionData.map(item => (
              <div key={item.grade} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-1.5 text-center border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">ថ្នាក់ {toKhmerNum(item.grade)}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{toKhmerNum(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Level Breakdown Visual Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>ស្ថិតិចំនួនសិស្សតាមកម្រិតថ្នាក់ (Grade Roster Distribution)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ទិន្នន័យបែងចែកតាមភេទប្រុស-ស្រី សម្រាប់គ្រប់កម្រិតថ្នាក់ពីថ្នាក់ទី១ ដល់ ទី៦
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> សិស្សប្រុស
            </span>
            <span className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-pink-500" /> សិស្សស្រី
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(value: any, name: string) => [
                  `${toKhmerNum(value)} នាក់`,
                  name === 'boys' ? 'សិស្សប្រុស' : 'សិស្សស្រី'
                ]}
              />
              <Bar dataKey="boys" name="boys" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="girls" name="girls" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Searchable Student List View */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden flex flex-col">
        {/* Section Header & Filters Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700/60 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>បញ្ជីសិស្សដែលបានបញ្ចូលដោយដៃ (Student Roster)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono font-bold">
                  {toKhmerNum(filteredStudents.length)} / {toKhmerNum(totalStudents)}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ស្វែងរក កែសម្រួលព័ត៌មាន ឬលុបទិន្នន័យសិស្សដោយសុវត្ថិភាព
              </p>
            </div>

            {/* Layout Toggle & Actions */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  id="view-layout-table-btn"
                  onClick={() => setViewLayout('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewLayout === 'table'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  title="ទិដ្ឋភាពតារាង"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="view-layout-cards-btn"
                  onClick={() => setViewLayout('cards')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewLayout === 'cards'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  title="ទិដ្ឋភាពប័ណ្ណ"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>បញ្ចូលសិស្ស</span>
              </button>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {/* Live Search Input */}
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="secretary-search-student-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, ទូរស័ព្ទ, អាណាព្យាបាល..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grade Filter */}
            <div>
              <select
                id="secretary-grade-filter"
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">គ្រប់កម្រិតថ្នាក់ (All Grades)</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>ថ្នាក់ទី {toKhmerNum(g)}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <select
                id="secretary-gender-filter"
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value as Gender | 'all')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">គ្រប់ភេទ (All Genders)</option>
                <option value="F">សិស្សស្រី (Female)</option>
                <option value="M">សិស្សប្រុស (Male)</option>
              </select>
            </div>

            {/* Recency / Vulnerability Filter */}
            <div>
              <select
                id="secretary-recency-filter"
                value={recencyFilter}
                onChange={e => setRecencyFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">កាលបរិច្ឆេទទាំងអស់</option>
                <option value="today">បញ្ចូលថ្ងៃនេះ (Today)</option>
                <option value="week">បញ្ចូលសប្តាហ៍នេះ (This Week)</option>
                <option value="month">បញ្ចូលខែនេះ (This Month)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Records List / Table */}
        {filteredStudents.length > 0 ? (
          viewLayout === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">ល.រ</th>
                    <th className="py-3.5 px-4">អត្តលេខ</th>
                    <th className="py-3.5 px-4">ឈ្មោះសិស្ស (ខ្មែរ/ឡាតាំង)</th>
                    <th className="py-3.5 px-4">ភេទ</th>
                    <th className="py-3.5 px-4">ថ្ងៃកំណើត / អាយុ</th>
                    <th className="py-3.5 px-4">ថ្នាក់</th>
                    <th className="py-3.5 px-4">អាណាព្យាបាល / ទូរស័ព្ទ</th>
                    <th className="py-3.5 px-4">ស្ថានភាព</th>
                    <th className="py-3.5 px-4 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {toKhmerNum(index + 1)}
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {student.code || student.id}
                        </span>
                      </td>

                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.nameKhmer}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center border border-blue-200/50 shadow-2xs">
                              {student.nameKhmer.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 transition-colors">
                              {student.nameKhmer}
                            </p>
                            {student.nameLatin && (
                              <p className="text-[11px] font-times text-slate-500 dark:text-slate-400">
                                {student.nameLatin}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          student.gender === 'F'
                            ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>

                      {/* DOB & Age */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div className="font-mono text-xs">{student.dob}</div>
                        <div className="text-[10px] text-slate-400">
                          អាយុ {toKhmerNum(calculateAge(student.dob))} ឆ្នាំ
                        </div>
                      </td>

                      {/* Grade & Section */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          ថ្នាក់ {toKhmerNum(student.grade)}{student.section}
                        </span>
                      </td>

                      {/* Guardian & Phone */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                          {student.guardianName || student.fatherName || student.motherName || 'N/A'}
                        </p>
                        {(student.guardianPhone || student.phone) && (
                          <p className="text-[10px] font-mono text-slate-500">
                            {student.guardianPhone || student.phone}
                          </p>
                        )}
                      </td>

                      {/* Status / IDPoor */}
                      <td className="py-3 px-4">
                        {student.livingCondition && student.livingCondition !== 'ទូទៅ' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            {student.livingCondition}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            ធម្មតា
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Profile */}
                          <button
                            id={`secretary-view-student-${student.id}`}
                            onClick={() => setSelectedStudentForView(student)}
                            title="មើលប្រវត្តិរូប"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Student */}
                          <button
                            id={`secretary-edit-student-${student.id}`}
                            onClick={() => handleEditStudent(student)}
                            title="កែប្រែព័ត៌មាន"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete with Confirm Dialog */}
                          <button
                            id={`secretary-delete-student-${student.id}`}
                            onClick={() => handleDeletePrompt(student)}
                            title="លុបទិន្នន័យ (មានការបញ្ជាក់សុវត្ថិភាព)"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards Grid Layout */
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.nameKhmer}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center border border-blue-200">
                            {student.nameKhmer.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {student.nameKhmer}
                          </h4>
                          <p className="text-[11px] font-times text-slate-500 dark:text-slate-400">
                            {student.nameLatin || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.gender === 'F'
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block">អត្តលេខ</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {student.code || student.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">កម្រិតថ្នាក់</span>
                        <span className="font-bold">ថ្នាក់ទី {toKhmerNum(student.grade)}{student.section}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">ថ្ងៃកំណើត</span>
                        <span className="font-mono text-[11px]">{student.dob}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">អាណាព្យាបាល</span>
                        <span className="truncate block font-medium">{student.guardianName || student.fatherName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      អាយុ {toKhmerNum(calculateAge(student.dob))} ឆ្នាំ
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedStudentForView(student)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="មើលប្រវត្តិរូប"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="កែប្រែ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(student)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="លុប"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-16 px-4 text-center max-w-md mx-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {students.length === 0 ? 'មិនទាន់មានទិន្នន័យសិស្សក្នុងប្រព័ន្ធនៅឡើយទេ' : 'រកមិនឃើញទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរក'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              {students.length === 0
                ? 'ចាប់ផ្តើមបញ្ចូលទិន្នន័យសិស្សដំបូងរបស់អ្នកដោយដៃ តាមរយៈទម្រង់ចុះឈ្មោះងាយស្រួលខាងក្រោម។'
                : 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យគន្លឹះ ឬជ្រើសរើសកម្រងចម្រោះឡើងវិញ។'}
            </p>
            {students.length === 0 ? (
              <button
                type="button"
                id="secretary-empty-add-student-btn"
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>បញ្ចូលសិស្សទីមួយឥឡូវនេះ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setGradeFilter('all');
                  setGenderFilter('all');
                  setRecencyFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                សម្អាតការស្វែងរកទាំងអស់
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
        onSaveStudent={handleSaveStudent}
        editingStudent={editingStudent}
        existingStudentsCount={students.length}
        academicYear={schoolProfile.academicYear}
        showToast={showToast}
      />

      {/* Confirmation Dialog for Safe Deletion */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="បញ្ជាក់ការលុបទិន្នន័យសិស្ស"
        student={studentToDelete}
        warningMessage="តើលោកអ្នកពិតជាចង់លុបទិន្នន័យសិស្សរូបនេះចេញពីប្រព័ន្ធមែនឬទេ? ការលុបនេះនឹងលុបចេញជាអចិន្ត្រៃយ៍ ដើម្បីការពារការបាត់បង់ទិន្នន័យដោយអចេតនា។"
      />

      {/* View Student Profile Modal */}
      {selectedStudentForView && (
        <StudentProfilePdfModal
          isOpen={Boolean(selectedStudentForView)}
          onClose={() => setSelectedStudentForView(null)}
          student={selectedStudentForView}
          schoolProfile={schoolProfile}
        />
      )}

      {/* Multi Student Roster Print Modal */}
      {isPrintRosterModalOpen && (
        <MultiStudentProfileSummaryPdfModal
          isOpen={isPrintRosterModalOpen}
          onClose={() => setIsPrintRosterModalOpen(false)}
          students={filteredStudents}
          schoolProfile={schoolProfile}
        />
      )}
    </div>
  );
};
