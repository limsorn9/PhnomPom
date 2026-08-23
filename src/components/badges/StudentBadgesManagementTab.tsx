import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BadgeDefinition,
  BadgeTier,
  StudentBadgeCategory,
  StudentBadgeAssignment,
  Student
} from '../../types';
import { BadgeIcon, getTierStyle } from './BadgeIcon';
import { AwardBadgeModal } from './AwardBadgeModal';
import { StudentBadgeShowcaseModal } from './StudentBadgeShowcaseModal';
import { CertificateModal } from './CertificateModal';
import {
  Award,
  Trophy,
  Sparkles,
  Search,
  Filter,
  Plus,
  Printer,
  Trash2,
  Users,
  GraduationCap,
  Star,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Flame,
  Medal,
  SlidersHorizontal,
  Download,
  Info
} from 'lucide-react';

interface StudentBadgesManagementTabProps {
  onBackToStudents?: () => void;
}

export const StudentBadgesManagementTab: React.FC<StudentBadgesManagementTabProps> = ({
  onBackToStudents
}) => {
  const {
    students,
    studentBadgeDefinitions,
    studentBadgeAssignments,
    createBadgeDefinition,
    deleteBadgeDefinition,
    removeBadgeAssignment,
    schoolProfile,
    showToast
  } = useSchool();

  // Sub-tabs: 'students' | 'recent_feed' | 'catalog' | 'leaderboard'
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'recent_feed' | 'catalog' | 'leaderboard'>('students');

  // Filters for students list
  const [searchStudentText, setSearchStudentText] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<string>('all');

  // Filters for feed
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<StudentBadgeCategory | 'all'>('all');
  const [feedTierFilter, setFeedTierFilter] = useState<BadgeTier | 'all'>('all');

  // Modals state
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedStudentForAward, setSelectedStudentForAward] = useState<Student | null>(null);
  const [selectedStudentForShowcase, setSelectedStudentForShowcase] = useState<Student | null>(null);
  const [selectedCertificateAssignment, setSelectedCertificateAssignment] = useState<StudentBadgeAssignment | null>(null);
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);

  // New Custom Badge Form state
  const [newBadgeCode, setNewBadgeCode] = useState('');
  const [newBadgeTitleKhmer, setNewBadgeTitleKhmer] = useState('');
  const [newBadgeTitleEng, setNewBadgeTitleEng] = useState('');
  const [newBadgeDesc, setNewBadgeDesc] = useState('');
  const [newBadgeCriteria, setNewBadgeCriteria] = useState('');
  const [newBadgeCategory, setNewBadgeCategory] = useState<StudentBadgeCategory>('behavior');
  const [newBadgeTier, setNewBadgeTier] = useState<BadgeTier>('gold');
  const [newBadgeIcon, setNewBadgeIcon] = useState('Award');
  const [newBadgePoints, setNewBadgePoints] = useState<number>(20);

  // Computed metrics
  const totalBadgesAwarded = studentBadgeAssignments.length;
  const totalPointsDistributed = useMemo(() => {
    return studentBadgeAssignments.reduce((acc, curr) => acc + (curr.badge?.points || 0), 0);
  }, [studentBadgeAssignments]);

  const studentsWithBadgesCount = useMemo(() => {
    const studentIdSet = new Set(studentBadgeAssignments.map(a => a.studentId));
    return studentIdSet.size;
  }, [studentBadgeAssignments]);

  // Aggregate badge statistics per student
  const studentStatsMap = useMemo(() => {
    const map: Record<string, { count: number; points: number; badges: StudentBadgeAssignment[] }> = {};
    studentBadgeAssignments.forEach(asgn => {
      if (!map[asgn.studentId]) {
        map[asgn.studentId] = { count: 0, points: 0, badges: [] };
      }
      map[asgn.studentId].count += 1;
      map[asgn.studentId].points += (asgn.badge?.points || 0);
      map[asgn.studentId].badges.push(asgn);
    });
    return map;
  }, [studentBadgeAssignments]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedGrade !== 'all' && s.grade !== selectedGrade) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;
      
      const stats = studentStatsMap[s.id] || { count: 0, points: 0, badges: [] };

      if (selectedBadgeFilter === 'has_badges' && stats.count === 0) return false;
      if (selectedBadgeFilter === 'no_badges' && stats.count > 0) return false;

      if (searchStudentText.trim()) {
        const q = searchStudentText.toLowerCase();
        const matchNameKh = s.nameKhmer ? s.nameKhmer.toLowerCase().includes(q) : false;
        const matchNameLat = s.nameLatin ? s.nameLatin.toLowerCase().includes(q) : false;
        const matchCode = s.code ? s.code.toLowerCase().includes(q) : false;
        if (!matchNameKh && !matchNameLat && !matchCode) return false;
      }

      return true;
    });
  }, [students, selectedGrade, selectedSection, selectedBadgeFilter, searchStudentText, studentStatsMap]);

  // Filtered recent awards feed
  const filteredFeed = useMemo(() => {
    return studentBadgeAssignments.filter(asgn => {
      if (feedCategoryFilter !== 'all' && asgn.badge?.category !== feedCategoryFilter) return false;
      if (feedTierFilter !== 'all' && asgn.badge?.tier !== feedTierFilter) return false;
      return true;
    });
  }, [studentBadgeAssignments, feedCategoryFilter, feedTierFilter]);

  // Top leaderboard ranking
  const leaderboard = useMemo(() => {
    const list = students.map(s => {
      const stats = studentStatsMap[s.id] || { count: 0, points: 0, badges: [] };
      return {
        student: s,
        count: stats.count,
        points: stats.points,
        badges: stats.badges
      };
    });

    return list
      .filter(item => item.count > 0)
      .sort((a, b) => b.points - a.points || b.count - a.count)
      .slice(0, 20);
  }, [students, studentStatsMap]);

  const handleOpenAwardForStudent = (student: Student) => {
    setSelectedStudentForAward(student);
    setShowAwardModal(true);
  };

  const handleOpenShowcase = (student: Student) => {
    setSelectedStudentForShowcase(student);
  };

  const handleCreateCustomBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeTitleKhmer.trim() || !newBadgeCriteria.trim()) {
      showToast('សូមបំពេញឈ្មោះផ្លាកសញ្ញា និងលក្ខខណ្ឌវិនិច្ឆ័យ!', 'error');
      return;
    }

    createBadgeDefinition({
      code: newBadgeCode.trim() || `BDG-CUS-${Date.now().toString().slice(-4)}`,
      titleKhmer: newBadgeTitleKhmer.trim(),
      titleEnglish: newBadgeTitleEng.trim() || newBadgeTitleKhmer.trim(),
      description: newBadgeDesc.trim() || newBadgeCriteria.trim(),
      category: newBadgeCategory,
      tier: newBadgeTier,
      iconName: newBadgeIcon,
      points: Number(newBadgePoints) || 10,
      criteria: newBadgeCriteria.trim()
    });

    setShowCreateBadgeModal(false);
    // Reset
    setNewBadgeTitleKhmer('');
    setNewBadgeTitleEng('');
    setNewBadgeDesc('');
    setNewBadgeCriteria('');
  };

  const handleDeleteAssignment = (id: string, name: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបការប្រគល់ផ្លាកសញ្ញា «${name}» នេះមែនទេ?`)) {
      removeBadgeAssignment(id);
    }
  };

  return (
    <div className="space-y-6 font-battambang animate-in fade-in duration-200">
      {/* Top Banner & KPI Stat Strip */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-950 rounded-2xl text-white p-6 shadow-xl relative overflow-hidden">
        {/* Glow ambient decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
                <Trophy className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-moul text-amber-300">
                  ប្រព័ន្ធផ្លាកសញ្ញា និងមេដាយឌីជីថល
                </h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-times">
                  Digital Badges & Honors
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl">
                ទទួលស្គាល់ លើកទឹកចិត្ត និងកត់ត្រាសមិទ្ធផលឆ្នើមរបស់សិស្សលើការសិក្សា វត្តមាន វិន័យ សីលធម៌ ការអាន និងភាពជាអ្នកដឹកនាំ ស្របតាមស្តង់ដាសាលារៀនគំរូ។
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedStudentForAward(null);
                setShowAwardModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>ប្រគល់ផ្លាកសញ្ញាថ្មី (Award Badge)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateBadgeModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>បង្កើតទម្រង់ផ្លាកសញ្ញា</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>មេដាយបានប្រគល់សរុប</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-times text-white">
              {totalBadgesAwarded} <span className="text-xs font-normal font-battambang text-slate-300">មេដាយ</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>ពិន្ទុសន្សមកិត្តិយសសរុប</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl font-bold font-times text-amber-300">
              +{totalPointsDistributed} <span className="text-xs font-normal font-battambang text-slate-300">ពិន្ទុ</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>សិស្សទទួលបានមេដាយ</span>
              <Users className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-2xl font-bold font-times text-cyan-200">
              {studentsWithBadgesCount} / {students.length} <span className="text-xs font-normal font-battambang text-slate-300">នាក់ ({Math.round((studentsWithBadgesCount / (students.length || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>ប្រភេទផ្លាកសញ្ញាសកម្ម</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-times text-emerald-300">
              {studentBadgeDefinitions.length} <span className="text-xs font-normal font-battambang text-slate-300">ប្រភេទ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'students'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>សមិទ្ធផលសិស្ស (Student Directory)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('recent_feed')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'recent_feed'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>កំណត់ត្រាប្រគល់ថ្មីៗ ({studentBadgeAssignments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>តារាងកិត្តិយស (Leaderboard)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>កាតាឡុកផ្លាកសញ្ញា ({studentBadgeDefinitions.length})</span>
          </button>
        </div>

        {onBackToStudents && (
          <button
            type="button"
            onClick={onBackToStudents}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
          >
            ← ត្រឡប់ទៅការគ្រប់គ្រងសិស្ស
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Student Directory with Badge Showcase */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchStudentText}
                  onChange={e => setSearchStudentText(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Grade */}
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                ))}
              </select>

              {/* Section */}
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់បន្ទប់</option>
                {['A', 'B', 'C', 'D'].map(sec => (
                  <option key={sec} value={sec}>បន្ទប់ {sec}</option>
                ))}
              </select>

              {/* Badge status filter */}
              <select
                value={selectedBadgeFilter}
                onChange={e => setSelectedBadgeFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="all">ស្ថានភាពផ្លាកសញ្ញាទាំងអស់</option>
                <option value="has_badges">បានទទួលផ្លាកសញ្ញា (≥1)</option>
                <option value="no_badges">មិនទាន់មានផ្លាកសញ្ញា (0)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              បង្ហាញសិស្សសរុប <strong>{filteredStudents.length}</strong> នាក់
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3.5 px-4 w-12 text-center">ល.រ</th>
                    <th className="py-3.5 px-4">ឈ្មោះសិស្ស & អត្តលេខ</th>
                    <th className="py-3.5 px-3 text-center">ថ្នាក់</th>
                    <th className="py-3.5 px-3 text-center">ភេទ</th>
                    <th className="py-3.5 px-4">ផ្លាកសញ្ញា និងមេដាយដែលទទួលបាន</th>
                    <th className="py-3.5 px-4 text-center">ពិន្ទុសន្សំ</th>
                    <th className="py-3.5 px-4 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const stats = studentStatsMap[student.id] || { count: 0, points: 0, badges: [] };
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-blue-50/40 transition-colors group"
                        >
                          <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{student.nameKhmer}</span>
                              {stats.count >= 3 && (
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-times">
                              {student.nameLatin} ({student.code})
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                            {student.grade}{student.section}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                student.gender === 'F'
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {stats.badges.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">
                                មិនទាន់មានមេដាយ
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {stats.badges.slice(0, 4).map(asgn => (
                                  <div
                                    key={asgn.id}
                                    title={`${asgn.badge.titleKhmer} (+${asgn.badge.points} ពិន្ទុ)`}
                                    className="cursor-pointer transition-transform hover:scale-110"
                                    onClick={() => handleOpenShowcase(student)}
                                  >
                                    <BadgeIcon
                                      iconName={asgn.badge.iconName}
                                      tier={asgn.badge.tier}
                                      size="xs"
                                    />
                                  </div>
                                ))}
                                {stats.badges.length > 4 && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenShowcase(student)}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                  >
                                    +{stats.badges.length - 4} ទៀត
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold font-times text-xs">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              +{stats.points}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenShowcase(student)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                              >
                                មើលសមិទ្ធផល ({stats.count})
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAwardForStudent(student)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                + ប្រគល់ផ្លាកសញ្ញា
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Recent Badges Awarded Feed */}
      {activeSubTab === 'recent_feed' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={feedCategoryFilter}
                onChange={e => setFeedCategoryFilter(e.target.value as any)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="all">គ្រប់ប្រភេទទង្វើ (All Categories)</option>
                <option value="academic">ការសិក្សា (Academic)</option>
                <option value="attendance">វត្តមាន (Attendance)</option>
                <option value="behavior">វិន័យ-សីលធម៌ (Behavior)</option>
                <option value="leadership">ភាពជាអ្នកដឹកនាំ (Leadership)</option>
                <option value="arts_sports">សិល្បៈ-កីឡា (Arts & Sports)</option>
                <option value="reading">ការអានសៀវភៅ (Reading)</option>
                <option value="environment">បរិស្ថាន-អនាម័យ (Environment)</option>
                <option value="remedial_progress">វឌ្ឍនភាពបំប៉ន (Progress)</option>
              </select>

              <select
                value={feedTierFilter}
                onChange={e => setFeedTierFilter(e.target.value as any)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="all">គ្រប់កម្រិតមេដាយ (All Tiers)</option>
                <option value="bronze">សំរឹទ្ធ (Bronze)</option>
                <option value="silver">ប្រាក់ (Silver)</option>
                <option value="gold">មាស (Gold)</option>
                <option value="platinum">ផ្លាទីន (Platinum)</option>
                <option value="diamond">ពេជ្រ (Diamond)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              សរុប <strong>{filteredFeed.length}</strong> កំណត់ត្រា
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeed.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                មិនមានកំណត់ត្រាផ្លាកសញ្ញាត្រូវនឹងលក្ខខណ្ឌឡើយ
              </div>
            ) : (
              filteredFeed.map(asgn => {
                const tierStyle = getTierStyle(asgn.badge.tier);
                return (
                  <div
                    key={asgn.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <BadgeIcon
                          iconName={asgn.badge.iconName}
                          tier={asgn.badge.tier}
                          size="md"
                          showTierGlow
                        />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyle.pillBg}`}>
                          +{asgn.badge.points} ពិន្ទុ
                        </span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 font-moul">
                          {asgn.badge.titleKhmer}
                        </h4>
                        <div className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                          <span>{asgn.studentName} ({asgn.grade}{asgn.section})</span>
                        </div>
                        <p className="text-xs text-slate-600 italic line-clamp-2 pt-1">
                          « {asgn.reasonOrEvidence || asgn.badge.description} »
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{asgn.awardedDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCertificateAssignment(asgn)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          <Printer className="w-3 h-3 text-amber-700" />
                          <span>លិខិតសរសើរ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(asgn.id, asgn.badge.titleKhmer)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="លុបផ្លាកសញ្ញា"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-moul text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>តារាងកិត្តិយសសិស្សឆ្នើមទូទាំងសាលា (School Achievement Leaderboard)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ចំណាត់ថ្នាក់ផ្អែកលើពិន្ទុសន្សមកិត្តិយស និងចំនួនមេដាយដែលទទួលបានក្នុងឆ្នាំសិក្សា
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Podium: 2nd Place */}
              {leaderboard[1] && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200 flex flex-col items-center text-center space-y-2 relative order-2 md:order-1">
                  <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-800 font-bold flex items-center justify-center text-base shadow-sm font-times">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 font-moul">
                    {leaderboard[1].student.nameKhmer}
                  </h4>
                  <span className="text-xs text-slate-600">
                    ថ្នាក់ទី {leaderboard[1].student.grade}{leaderboard[1].student.section}
                  </span>
                  <div className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    +{leaderboard[1].points} ពិន្ទុ ({leaderboard[1].count} មេដាយ)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenShowcase(leaderboard[1].student)}
                    className="mt-2 text-xs text-blue-600 hover:underline font-bold"
                  >
                    មើលកម្រងសមិទ្ធផល →
                  </button>
                </div>
              )}

              {/* Podium: 1st Place (Champion) */}
              {leaderboard[0] && (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 via-amber-100/40 to-amber-50 border-2 border-amber-400 flex flex-col items-center text-center space-y-2 relative shadow-md order-1 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md font-times ring-4 ring-amber-300/50">
                    👑 1
                  </div>
                  <h4 className="text-base font-bold text-amber-950 font-moul">
                    {leaderboard[0].student.nameKhmer}
                  </h4>
                  <span className="text-xs text-slate-600 font-semibold">
                    ថ្នាក់ទី {leaderboard[0].student.grade}{leaderboard[0].student.section}
                  </span>
                  <div className="text-base font-bold text-amber-900 bg-amber-200/80 px-4 py-1 rounded-full border border-amber-300 shadow-xs">
                    +{leaderboard[0].points} ពិន្ទុ ({leaderboard[0].count} មេដាយ)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenShowcase(leaderboard[0].student)}
                    className="mt-2 text-xs text-amber-900 hover:underline font-bold"
                  >
                    មើលកម្រងសមិទ្ធផល →
                  </button>
                </div>
              )}

              {/* Podium: 3rd Place */}
              {leaderboard[2] && (
                <div className="p-5 rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100/50 border border-orange-200 flex flex-col items-center text-center space-y-2 relative order-3">
                  <div className="w-10 h-10 rounded-full bg-orange-300 text-orange-950 font-bold flex items-center justify-center text-base shadow-sm font-times">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 font-moul">
                    {leaderboard[2].student.nameKhmer}
                  </h4>
                  <span className="text-xs text-slate-600">
                    ថ្នាក់ទី {leaderboard[2].student.grade}{leaderboard[2].student.section}
                  </span>
                  <div className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    +{leaderboard[2].points} ពិន្ទុ ({leaderboard[2].count} មេដាយ)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenShowcase(leaderboard[2].student)}
                    className="mt-2 text-xs text-blue-600 hover:underline font-bold"
                  >
                    មើលកម្រងសមិទ្ធផល →
                  </button>
                </div>
              )}
            </div>

            {/* Remaining Ranking Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4 w-14 text-center">ចំណាត់ថ្នាក់</th>
                    <th className="py-3 px-4">ឈ្មោះសិស្ស</th>
                    <th className="py-3 px-4 text-center">ថ្នាក់</th>
                    <th className="py-3 px-4">ផ្លាកសញ្ញាឆ្នើម</th>
                    <th className="py-3 px-4 text-center">ចំនួនមេដាយ</th>
                    <th className="py-3 px-4 text-center">ពិន្ទុសរុប</th>
                    <th className="py-3 px-4 text-right">ព័ត៌មានលម្អិត</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center font-bold font-times text-sm text-slate-700">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{item.student.nameKhmer}</strong>
                        <span className="text-[11px] text-slate-500 font-times">{item.student.code}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {item.student.grade}{item.student.section}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {item.badges.slice(0, 3).map(asgn => (
                            <BadgeIcon
                              key={asgn.id}
                              iconName={asgn.badge.iconName}
                              tier={asgn.badge.tier}
                              size="xs"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {item.count}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-amber-800 font-bold font-times bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          +{item.points}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenShowcase(item.student)}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                        >
                          មើល →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Badge Catalog */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold font-moul text-slate-900">
                កាតាឡុកផ្លាកសញ្ញា និងលក្ខខណ្ឌវិនិច្ឆ័យ (Badge Catalog)
              </h3>
              <p className="text-xs text-slate-500">
                បញ្ជីទម្រង់ផ្លាកសញ្ញា និងមេដាយទាំងអស់ដែលត្រូវបានកំណត់សម្រាប់សាលារៀន
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateBadgeModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>បង្កើតផ្លាកសញ្ញាថ្មី</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentBadgeDefinitions.map(badge => {
              const tierStyle = getTierStyle(badge.tier);
              return (
                <div
                  key={badge.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <BadgeIcon
                        iconName={badge.iconName}
                        tier={badge.tier}
                        size="md"
                        showTierGlow
                      />
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyle.pillBg}`}>
                          {tierStyle.tierNameKhmer}
                        </span>
                        <span className="text-xs font-bold text-amber-700 font-times">
                          +{badge.points} ពិន្ទុ
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-moul">
                        {badge.titleKhmer}
                      </h4>
                      <p className="text-xs font-times text-slate-500">
                        {badge.titleEnglish} ({badge.code})
                      </p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block text-[11px]">លក្ខខណ្ឌវិនិច្ឆ័យ (Criteria)៖</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {badge.criteria}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      Category: {badge.category}
                    </span>
                    {badge.id.startsWith('bdg-custom') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`តើអ្នកពិតជាចង់លុបទម្រង់ផ្លាកសញ្ញា «${badge.titleKhmer}» នេះមែនទេ?`)) {
                            deleteBadgeDefinition(badge.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        លុបចេញ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Award Badge Modal */}
      {showAwardModal && (
        <AwardBadgeModal
          initialStudent={selectedStudentForAward}
          onClose={() => {
            setShowAwardModal(false);
            setSelectedStudentForAward(null);
          }}
        />
      )}

      {/* MODAL 2: Student Badge Showcase Modal */}
      {selectedStudentForShowcase && (
        <StudentBadgeShowcaseModal
          student={selectedStudentForShowcase}
          onClose={() => setSelectedStudentForShowcase(null)}
        />
      )}

      {/* MODAL 3: Certificate Printable Modal */}
      {selectedCertificateAssignment && (
        <CertificateModal
          assignment={selectedCertificateAssignment}
          schoolProfile={schoolProfile}
          onClose={() => setSelectedCertificateAssignment(null)}
        />
      )}

      {/* MODAL 4: Create Custom Badge Definition Modal */}
      {showCreateBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-battambang">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold font-moul text-sm sm:text-base">បង្កើតទម្រង់ផ្លាកសញ្ញាថ្មី (Custom Badge)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateBadgeModal(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomBadge} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ឈ្មោះផ្លាកសញ្ញាជាភាសាខ្មែរ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBadgeTitleKhmer}
                  onChange={e => setNewBadgeTitleKhmer(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ជើងឯកគូរគំនូរ, វីរជនបរិស្ថាន..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ឈ្មោះជាភាសាអង់គ្លេស (Title English)
                </label>
                <input
                  type="text"
                  value={newBadgeTitleEng}
                  onChange={e => setNewBadgeTitleEng(e.target.value)}
                  placeholder="e.g., Drawing Champion, Eco Guardian..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ប្រភេទទង្វើ (Category)
                  </label>
                  <select
                    value={newBadgeCategory}
                    onChange={e => setNewBadgeCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="academic">ការសិក្សា (Academic)</option>
                    <option value="attendance">វត្តមាន (Attendance)</option>
                    <option value="behavior">វិន័យ-សីលធម៌ (Behavior)</option>
                    <option value="leadership">ភាពជាអ្នកដឹកនាំ (Leadership)</option>
                    <option value="arts_sports">សិល្បៈ-កីឡា (Arts & Sports)</option>
                    <option value="reading">ការអានសៀវភៅ (Reading)</option>
                    <option value="environment">បរិស្ថាន-អនាម័យ (Environment)</option>
                    <option value="remedial_progress">វឌ្ឍនភាពបំប៉ន (Progress)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    កម្រិតមេដាយ (Tier)
                  </label>
                  <select
                    value={newBadgeTier}
                    onChange={e => setNewBadgeTier(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="bronze">សំរឹទ្ធ (Bronze)</option>
                    <option value="silver">ប្រាក់ (Silver)</option>
                    <option value="gold">មាស (Gold)</option>
                    <option value="platinum">ផ្លាទីន (Platinum)</option>
                    <option value="diamond">ពេជ្រ (Diamond)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    រូបតំណាង (Icon)
                  </label>
                  <select
                    value={newBadgeIcon}
                    onChange={e => setNewBadgeIcon(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Award">មេដាយ (Award)</option>
                    <option value="Trophy">ពានរង្វាន់ (Trophy)</option>
                    <option value="Sparkles">ផ្កាយភ្លឺ (Sparkles)</option>
                    <option value="ShieldCheck">ខែលសុវត្ថិភាព (ShieldCheck)</option>
                    <option value="Zap">ផ្លេកបន្ទោរ (Zap)</option>
                    <option value="BookOpen">សៀវភៅ (BookOpen)</option>
                    <option value="Heart">បេះដូង (Heart)</option>
                    <option value="TreePine">បរិស្ថាន (TreePine)</option>
                    <option value="Flame">ភ្លើងឆេះ (Flame)</option>
                    <option value="Medal">មេដាយកិត្តិយស (Medal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ពិន្ទុសន្សមកិត្តិយស (Points)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={newBadgePoints}
                    onChange={e => setNewBadgePoints(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ការពិពណ៌នាសង្ខេប (Description)
                </label>
                <input
                  type="text"
                  value={newBadgeDesc}
                  onChange={e => setNewBadgeDesc(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ លើកទឹកចិត្តសិស្សដែលមានទេពកោសល្យខ្ពស់ផ្នែកសិល្បៈ"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  លក្ខខណ្ឌវិនិច្ឆ័យ (Criteria) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={newBadgeCriteria}
                  onChange={e => setNewBadgeCriteria(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ សិស្សដែលចូលរួមគូរគំនូរតាំងពិព័រណ៌សាលា ឬឈ្នះជ័យលាភីថ្នាក់ជាតិ"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBadgeModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  រក្សាទុកផ្លាកសញ្ញា
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
