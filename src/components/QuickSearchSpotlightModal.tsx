import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Student, Teacher } from '../types';
import { searchUnified, UnifiedSearchResult } from '../utils/searchIndex';
import {
  Search,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
  Phone,
  User,
  BookOpen,
  Eye,
  CornerDownLeft,
  Command
} from 'lucide-react';

interface QuickSearchSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (student: Student) => void;
  onSelectTeacher?: (teacher: Teacher) => void;
}

export const QuickSearchSpotlightModal: React.FC<QuickSearchSpotlightModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onSelectTeacher
}) => {
  const { students, teachers, setActiveTab } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'students' | 'teachers'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      // Default recommended results (recent items)
      const topStudents: UnifiedSearchResult[] = students.slice(0, 5).map(s => ({
        type: 'student',
        id: s.id,
        code: s.code,
        nameKhmer: s.nameKhmer,
        nameLatin: s.nameLatin,
        gender: s.gender,
        subtext: `ថ្នាក់ទី ${s.grade}${s.section} • អត្តលេខ: ${s.code}`,
        avatarUrl: s.avatarUrl,
        score: 0,
        raw: s
      }));

      const topTeachers: UnifiedSearchResult[] = teachers.slice(0, 4).map(t => ({
        type: 'teacher',
        id: t.id,
        code: t.staffCode,
        nameKhmer: t.nameKhmer,
        nameLatin: t.nameLatin,
        gender: t.gender,
        subtext: `${t.role} • ${t.teachingSubject || 'ទូទៅ'} • អត្តលេខ: ${t.staffCode}`,
        avatarUrl: t.avatarUrl,
        score: 0,
        raw: t
      }));

      if (filterType === 'students') return topStudents;
      if (filterType === 'teachers') return topTeachers;
      return [...topStudents, ...topTeachers];
    }

    const results = searchUnified(students, teachers, searchTerm, 30);
    if (filterType === 'students') {
      return results.filter(r => r.type === 'student');
    }
    if (filterType === 'teachers') {
      return results.filter(r => r.type === 'teacher');
    }
    return results;
  }, [searchTerm, students, teachers, filterType]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length, filterType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (result: UnifiedSearchResult) => {
    if (result.type === 'student') {
      setActiveTab('students');
      if (onSelectStudent) {
        onSelectStudent(result.raw as Student);
      }
    } else {
      setActiveTab('teachers');
      if (onSelectTeacher) {
        onSelectTeacher(result.raw as Teacher);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] font-battambang"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3 bg-white dark:bg-slate-900">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ស្វែងរកសិស្ស ឬលោកគ្រូ/អ្នកគ្រូ (ឈ្មោះ អត្តលេខ លេខទូរស័ព្ទ...)"
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Filter Pills and Stats */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              ទាំងអស់ ({searchResults.length})
            </button>
            <button
              onClick={() => setFilterType('students')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                filterType === 'students'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>សិស្ស</span>
            </button>
            <button
              onClick={() => setFilterType('teachers')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                filterType === 'teachers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>គ្រូបង្រៀន</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Fuzzy Index Active</span>
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                រកមិនឃើញទិន្នន័យស្រដៀង «{searchTerm}» ទេ
              </p>
              <p className="text-xs text-slate-400 mt-1">
                សូមសាកល្បងវាយបញ្ចូលឈ្មោះខ្មែរ ឡាតាំង អត្តលេខ ឬលេខទូរស័ព្ទផ្សេងទៀត
              </p>
            </div>
          ) : (
            searchResults.map((res, index) => {
              const isSelected = index === selectedIndex;
              const isStudent = res.type === 'student';

              return (
                <div
                  key={`${res.type}-${res.id}`}
                  onClick={() => handleSelect(res)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {res.avatarUrl ? (
                        <img
                          src={res.avatarUrl}
                          alt={res.nameKhmer}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isStudent
                              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {res.nameKhmer.slice(0, 2)}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[9px] ${
                          isStudent
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                        title={isStudent ? 'សិស្ស' : 'គ្រូបង្រៀន'}
                      >
                        {isStudent ? (
                          <Users className="w-2.5 h-2.5" />
                        ) : (
                          <GraduationCap className="w-2.5 h-2.5" />
                        )}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {res.nameKhmer}
                        </span>
                        {res.nameLatin && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
                            ({res.nameLatin})
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isStudent
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {res.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {res.subtext}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        <span>ជ្រើសរើស</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">↓</kbd>
              <span>រំកិល</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">Enter</kbd>
              <span>ចូលមើល</span>
            </span>
          </div>

          <span className="font-sans">
            ចុច <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">Ctrl+K</kbd> ដើម្បីស្វែងរករហ័ស
          </span>
        </div>
      </div>
    </div>
  );
};
