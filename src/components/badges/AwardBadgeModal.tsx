import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BadgeDefinition, BadgeTier, Student, StudentBadgeCategory } from '../../types';
import { BadgeIcon, getTierStyle } from './BadgeIcon';
import {
  X,
  Award,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface AwardBadgeModalProps {
  initialStudent?: Student | null;
  onClose: () => void;
}

export const AwardBadgeModal: React.FC<AwardBadgeModalProps> = ({
  initialStudent,
  onClose
}) => {
  const {
    students,
    studentBadgeDefinitions,
    studentBadgeAssignments,
    assignBadgeToStudent,
    bulkAssignBadge,
    autoSuggestBadgesForStudent,
    currentUser,
    selectedAcademicYear,
    academicYears,
    showToast
  } = useSchool();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudent?.id || '');
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([]);
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<StudentBadgeCategory | 'all'>('all');
  const [badgeTierFilter, setBadgeTierFilter] = useState<BadgeTier | 'all'>('all');
  const [badgeSearch, setBadgeSearch] = useState<string>('');

  const [awardedDate, setAwardedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [academicYear, setAcademicYear] = useState<string>(selectedAcademicYear || '2024-2025');
  const [term, setTerm] = useState<string>('ឆមាសទី១');
  const [awardedBy, setAwardedBy] = useState<string>(currentUser?.name || 'លោកគ្រូ-អ្នកគ្រូ');
  const [reasonOrEvidence, setReasonOrEvidence] = useState<string>('');

  // Selected Student Object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || initialStudent || null;
  }, [students, selectedStudentId, initialStudent]);

  // Existing badges for selected student
  const studentExistingBadgeIds = useMemo(() => {
    if (!currentStudent) return new Set<string>();
    return new Set(
      studentBadgeAssignments
        .filter(a => a.studentId === currentStudent.id)
        .map(a => a.badgeId)
    );
  }, [studentBadgeAssignments, currentStudent]);

  // Smart suggestions for selected student
  const suggestions = useMemo(() => {
    if (!currentStudent) return [];
    return autoSuggestBadgesForStudent(currentStudent.id);
  }, [currentStudent, autoSuggestBadgesForStudent]);

  // Filtered Badge list
  const filteredBadges = useMemo(() => {
    return studentBadgeDefinitions.filter(b => {
      if (badgeCategoryFilter !== 'all' && b.category !== badgeCategoryFilter) return false;
      if (badgeTierFilter !== 'all' && b.tier !== badgeTierFilter) return false;
      if (badgeSearch.trim()) {
        const query = badgeSearch.toLowerCase();
        const matchTitleKhmer = b.titleKhmer.toLowerCase().includes(query);
        const matchTitleEng = b.titleEnglish.toLowerCase().includes(query);
        const matchDesc = b.description.toLowerCase().includes(query);
        const matchCode = b.code.toLowerCase().includes(query);
        if (!matchTitleKhmer && !matchTitleEng && !matchDesc && !matchCode) return false;
      }
      return true;
    });
  }, [studentBadgeDefinitions, badgeCategoryFilter, badgeTierFilter, badgeSearch]);

  // Filtered Students for Selection or Bulk
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterGrade !== 'all' && s.grade !== filterGrade) return false;
      if (filterSection !== 'all' && s.section !== filterSection) return false;
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        return (
          s.nameKhmer.toLowerCase().includes(q) ||
          s.nameLatin.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, filterGrade, filterSection, studentSearch]);

  // Apply a smart suggestion
  const handleApplySuggestion = (sug: { badgeId: string; badge: BadgeDefinition; reason: string }) => {
    setSelectedBadgeId(sug.badgeId);
    setReasonOrEvidence(sug.reason);
  };

  const handleSelectBadge = (badge: BadgeDefinition) => {
    setSelectedBadgeId(badge.id);
    if (!reasonOrEvidence || reasonOrEvidence === '') {
      setReasonOrEvidence(badge.description);
    }
  };

  const handleToggleBulkStudent = (sId: string) => {
    setBulkSelectedStudentIds(prev =>
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  const handleSelectAllBulk = () => {
    if (bulkSelectedStudentIds.length === filteredStudents.length) {
      setBulkSelectedStudentIds([]);
    } else {
      setBulkSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBadgeId) {
      showToast('សូមជ្រើសរើសផ្លាកសញ្ញា/មេដាយដែលត្រូវប្រគល់ជាមុនសិន!', 'error');
      return;
    }

    if (isBulkMode) {
      if (bulkSelectedStudentIds.length === 0) {
        showToast('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីប្រគល់ផ្លាកសញ្ញា!', 'error');
        return;
      }

      bulkAssignBadge(bulkSelectedStudentIds, selectedBadgeId, {
        awardedDate,
        reasonOrEvidence,
        awardedBy,
        academicYear,
        term
      });
      onClose();
    } else {
      if (!currentStudent) {
        showToast('សូមជ្រើសរើសសិស្សដែលត្រូវទទួលផ្លាកសញ្ញា!', 'error');
        return;
      }

      assignBadgeToStudent({
        studentId: currentStudent.id,
        studentName: currentStudent.nameKhmer,
        studentGender: currentStudent.gender,
        studentCode: currentStudent.code,
        grade: currentStudent.grade,
        section: currentStudent.section,
        badgeId: selectedBadgeId,
        awardedDate,
        academicYear,
        term,
        awardedBy,
        reasonOrEvidence
      });
      onClose();
    }
  };

  const selectedBadgeObj = studentBadgeDefinitions.find(b => b.id === selectedBadgeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-battambang">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-moul">
                {isBulkMode ? 'ប្រគល់ផ្លាកសញ្ញាជាក្រុម (Bulk Award Badges)' : 'ប្រគល់ផ្លាកសញ្ញា និងមេដាយឌីជីថល'}
              </h2>
              <p className="text-xs text-blue-200">
                ទទួលស្គាល់ និងលើកទឹកចិត្តសមិទ្ធផលសិក្សា វិន័យ សីលធម៌ និងទេពកោសល្យ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Recipient Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">របៀបប្រគល់៖</span>
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    !isBulkMode
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  សិស្សម្នាក់ៗ
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    isBulkMode
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ប្រគល់ជាក្រុម (Bulk)
                </button>
              </div>
            </div>

            {/* If Single mode and student is preselected */}
            {!isBulkMode && currentStudent && (
              <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-900 px-3 py-1 rounded-lg border border-blue-200">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>
                  សិស្ស៖ <strong>{currentStudent.nameKhmer}</strong> ({currentStudent.code}) - ថ្នាក់ទី {currentStudent.grade}{currentStudent.section}
                </span>
              </div>
            )}
          </div>

          {/* Student Selector Section */}
          {!isBulkMode ? (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ជ្រើសរើសសិស្សទទួលផ្លាកសញ្ញា <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <select
                    value={filterGrade}
                    onChange={e => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={filterSection}
                    onChange={e => setFilterSection(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">គ្រប់បន្ទប់ (Section)</option>
                    {['A', 'B', 'C', 'D'].map(sec => (
                      <option key={sec} value={sec}>បន្ទប់ {sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-900"
                  >
                    <option value="">-- សូមជ្រើសរើសឈ្មោះសិស្ស --</option>
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.code}) - ថ្នាក់ទី {s.grade}{s.section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  ជ្រើសរើសសិស្សក្នុងបញ្ជី (បានជ្រើស៖ {bulkSelectedStudentIds.length} នាក់)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllBulk}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
                  >
                    {bulkSelectedStudentIds.length === filteredStudents.length
                      ? 'ដកការជ្រើសទាំងអស់'
                      : 'ជ្រើសរើសទាំងអស់'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select
                  value={filterGrade}
                  onChange={e => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">គ្រប់កម្រិតថ្នាក់</option>
                  {[1, 2, 3, 4, 5, 6].map(g => (
                    <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                  ))}
                </select>
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">គ្រប់បន្ទប់</option>
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>បន្ទប់ {sec}</option>
                  ))}
                </select>
                <div className="col-span-2 relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="ស្វែងរកឈ្មោះសិស្ស..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pt-1">
                {filteredStudents.map(s => {
                  const isChecked = bulkSelectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleBulkStudent(s.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{s.nameKhmer} ({s.grade}{s.section})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Smart Suggestions Chips (If Single Mode & Has Suggestions) */}
          {!isBulkMode && suggestions.length > 0 && (
            <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>ការផ្ដល់អនុសាសន៍ឆ្លាតវៃដោយផ្អែកលើវឌ្ឍនភាពសិក្សា (Smart Suggestions)៖</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(sug => (
                  <button
                    key={sug.badgeId}
                    type="button"
                    onClick={() => handleApplySuggestion(sug)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg text-xs transition-all shadow-xs group cursor-pointer text-left"
                  >
                    <BadgeIcon iconName={sug.badge.iconName} tier={sug.badge.tier} size="xs" />
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-amber-900">
                        {sug.badge.titleKhmer}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {sug.reason} ({sug.metricValue})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badge Selection Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800">
                ជ្រើសរើសផ្លាកសញ្ញា ឬមេដាយ <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={badgeCategoryFilter}
                  onChange={e => setBadgeCategoryFilter(e.target.value as any)}
                  className="text-xs px-2.5 py-1 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">គ្រប់ប្រភេទទង្វើ</option>
                  <option value="academic">ការសិក្សា (Academic)</option>
                  <option value="attendance">វត្តមាន (Attendance)</option>
                  <option value="behavior">វិន័យ-សីលធម៌ (Behavior)</option>
                  <option value="leadership">ភាពជាអ្នកដឹកនាំ (Leadership)</option>
                  <option value="arts_sports">សិល្បៈ-កីឡា (Arts & Sports)</option>
                  <option value="reading">ការអានសៀវភៅ (Reading)</option>
                  <option value="environment">បរិស្ថាន-អនាម័យ (Environment)</option>
                  <option value="remedial_progress">វឌ្ឍនភាពបំប៉ន (Progress)</option>
                </select>

                {/* Tier Filter */}
                <select
                  value={badgeTierFilter}
                  onChange={e => setBadgeTierFilter(e.target.value as any)}
                  className="text-xs px-2.5 py-1 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">គ្រប់កម្រិតមេដាយ</option>
                  <option value="bronze">សំរឹទ្ធ (Bronze)</option>
                  <option value="silver">ប្រាក់ (Silver)</option>
                  <option value="gold">មាស (Gold)</option>
                  <option value="platinum">ផ្លាទីន (Platinum)</option>
                  <option value="diamond">ពេជ្រ (Diamond)</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={badgeSearch}
                    onChange={e => setBadgeSearch(e.target.value)}
                    placeholder="ស្វែងរកផ្លាកសញ្ញា..."
                    className="text-xs pl-7 pr-2.5 py-1 border border-slate-300 rounded-lg bg-white w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {filteredBadges.map(badge => {
                const isSelected = selectedBadgeId === badge.id;
                const isAlreadyEarned = studentExistingBadgeIds.has(badge.id);
                const tierInfo = getTierStyle(badge.tier);

                return (
                  <div
                    key={badge.id}
                    onClick={() => handleSelectBadge(badge)}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/50 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <BadgeIcon
                        iconName={badge.iconName}
                        tier={badge.tier}
                        size="sm"
                        showTierGlow={isSelected}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {badge.titleKhmer}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${tierInfo.pillBg}`}>
                          +{badge.points}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {badge.description}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                        <span className="font-times">{badge.tier.toUpperCase()}</span>
                        {isAlreadyEarned && !isBulkMode && (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> ធ្លាប់បានទទួល
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Badge Preview & Details */}
          {selectedBadgeObj && (
            <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border border-blue-200 rounded-xl flex items-center gap-4">
              <BadgeIcon
                iconName={selectedBadgeObj.iconName}
                tier={selectedBadgeObj.tier}
                size="md"
                showTierGlow
              />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-blue-950 font-moul">
                    {selectedBadgeObj.titleKhmer}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 font-times">
                    ({selectedBadgeObj.titleEnglish})
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    +{selectedBadgeObj.points} ពិន្ទុសន្សំ
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {selectedBadgeObj.criteria}
                </p>
              </div>
            </div>
          )}

          {/* Award Form Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                កាលបរិច្ឆេទប្រគល់ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={awardedDate}
                onChange={e => setAwardedDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឆ្នាំសិក្សា <span className="text-red-500">*</span>
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {academicYears.map(yr => (
                  <option key={yr.id} value={yr.name}>{yr.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ឆមាស / ត្រីមាស
              </label>
              <select
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ឆមាសទី១">ឆមាសទី១</option>
                <option value="ឆមាសទី២">ឆមាសទី២</option>
                <option value="ប្រចាំឆ្នាំ">ប្រចាំឆ្នាំសិក្សា</option>
                <option value="ទិវាពិសេស">ទិវាពិសេស / ប្រកួតប្រជែង</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              អ្នកប្រគល់ (គ្រូបន្ទុកថ្នាក់ ឬគណៈគ្រប់គ្រង) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={awardedBy}
              onChange={e => setAwardedBy(e.target.value)}
              placeholder="ឈ្មោះគ្រូបន្ទុកថ្នាក់ ឬគណៈគ្រប់គ្រងសាលា"
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              មូលហេតុ និងភស្តុតាងសមិទ្ធផល (Reason / Citation) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reasonOrEvidence}
              onChange={e => setReasonOrEvidence(e.target.value)}
              placeholder="ឧទាហរណ៍៖ សិស្សបានប្រឡងជាប់ចំណាត់ថ្នាក់លេខ១ ប្រចាំខែវិច្ឆិកា និងមានវត្តមានពេញលេញ ១០០%"
              required
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>
                {isBulkMode
                  ? `ប្រគល់ផ្លាកសញ្ញា (${bulkSelectedStudentIds.length} នាក់)`
                  : 'ប្រគល់ផ្លាកសញ្ញាភ្លាមៗ'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
