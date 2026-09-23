import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  SchoolGroup, 
  SchoolGroupMember, 
  SchoolGroupCategory, 
  GroupMemberRole 
} from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  BookOpen, 
  Cpu, 
  Trophy, 
  Palette, 
  Building, 
  GraduationCap, 
  CheckCircle2, 
  X, 
  Filter, 
  Printer, 
  Download, 
  UserCheck, 
  Tag, 
  Eye, 
  ChevronRight,
  Layers,
  Award,
  Share2
} from 'lucide-react';

interface GroupManagementProps {
  embedded?: boolean;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({ embedded = false }) => {
  const {
    schoolGroups,
    addSchoolGroup,
    updateSchoolGroup,
    deleteSchoolGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    updateGroupMemberRole,
    bulkAddMembersToGroup,
    teachers,
    students,
    classrooms,
    schoolProfile,
    selectedAcademicYear
  } = useSchool();

  // State for search and category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SchoolGroupCategory | 'all'>('all');
  const [selectedGroup, setSelectedGroup] = useState<SchoolGroup | null>(() => (schoolGroups && schoolGroups.length > 0 ? schoolGroups[0] : null));

  // Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SchoolGroup | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Group Form State
  const [groupForm, setGroupForm] = useState<Omit<SchoolGroup, 'id' | 'createdAt'>>({
    name: '',
    nameEnglish: '',
    code: '',
    category: 'extracurricular_club',
    description: '',
    academicYear: selectedAcademicYear || '២០២៤ - ២០២៥',
    meetingSchedule: '',
    locationRoom: '',
    colorTheme: 'sky',
    iconName: 'Cpu',
    status: 'active',
    members: [],
    createdBy: schoolProfile?.principalName || 'គណៈគ្រប់គ្រង'
  });

  // Member Search State within Group detail
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState<'all' | 'teacher' | 'student'>('all');

  // New Member Add Form
  const [newMemberCandidate, setNewMemberCandidate] = useState<{
    memberType: 'teacher' | 'student';
    memberId: string;
    role: GroupMemberRole;
  }>({
    memberType: 'student',
    memberId: '',
    role: 'member'
  });

  // Candidate Search Input in Modal
  const [candidateSearch, setCandidateSearch] = useState('');

  // Bulk add state
  const [bulkGradeFilter, setBulkGradeFilter] = useState<number | 'all'>('all');
  const [bulkSectionFilter, setBulkSectionFilter] = useState<string>('all');
  const [selectedBulkStudentIds, setSelectedBulkStudentIds] = useState<string[]>([]);

  // Safe schoolGroups list
  const safeSchoolGroups = useMemo(() => {
    return Array.isArray(schoolGroups) ? schoolGroups.filter(Boolean) : [];
  }, [schoolGroups]);

  // Keep selectedGroup state synchronized with schoolGroups updates
  const activeGroup = useMemo(() => {
    if (!safeSchoolGroups || safeSchoolGroups.length === 0) return null;
    if (!selectedGroup || !selectedGroup.id) return safeSchoolGroups[0] || null;
    return safeSchoolGroups.find(g => g && g.id === selectedGroup.id) || safeSchoolGroups[0] || null;
  }, [safeSchoolGroups, selectedGroup]);

  // Categories helper list
  const categories: { id: SchoolGroupCategory | 'all'; label: string; icon: any; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'ក្រុមទាំងអស់', icon: Layers, count: safeSchoolGroups.length },
      { id: 'extracurricular_club', label: 'ក្លឹបក្រៅម៉ោងសិក្សា & STEM', icon: Cpu, count: safeSchoolGroups.filter(g => g?.category === 'extracurricular_club').length },
      { id: 'internal_department', label: 'ដេប៉ាតឺម៉ង់ & រដ្ឋបាលផ្ទៃក្នុង', icon: Building, count: safeSchoolGroups.filter(g => g?.category === 'internal_department').length },
      { id: 'study_tutoring', label: 'ក្រុមរៀនបំប៉ន & ស្រាវជ្រាវ', icon: BookOpen, count: safeSchoolGroups.filter(g => g?.category === 'study_tutoring').length },
      { id: 'academic_year', label: 'ក្រុមជំនាន់ឆ្នាំសិក្សា', icon: GraduationCap, count: safeSchoolGroups.filter(g => g?.category === 'academic_year').length },
      { id: 'other', label: 'ក្រុមផ្សេងៗ', icon: Tag, count: safeSchoolGroups.filter(g => g?.category === 'other').length }
    ];
  }, [safeSchoolGroups]);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return safeSchoolGroups.filter(g => {
      if (!g) return false;
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (g.name && g.name.toLowerCase().includes(q)) || 
        (g.nameEnglish && g.nameEnglish.toLowerCase().includes(q)) ||
        (g.code && g.code.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q)) ||
        (g.locationRoom && g.locationRoom.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [safeSchoolGroups, selectedCategory, searchQuery]);

  // Filtered members in active group
  const filteredMembers = useMemo(() => {
    if (!activeGroup || !Array.isArray(activeGroup.members)) return [];
    return activeGroup.members.filter(m => {
      if (!m) return false;
      const matchType = memberTypeFilter === 'all' || m.memberType === memberTypeFilter;
      const q = memberSearchQuery.toLowerCase().trim();
      const matchQ = !q || 
        (m.nameKhmer && m.nameKhmer.toLowerCase().includes(q)) ||
        (m.codeOrStaffId && m.codeOrStaffId.toLowerCase().includes(q)) ||
        (m.gradeOrPosition && m.gradeOrPosition.toLowerCase().includes(q));
      return matchType && matchQ;
    });
  }, [activeGroup, memberTypeFilter, memberSearchQuery]);

  // Candidates available to add to the current group
  const candidateList = useMemo(() => {
    if (!activeGroup) return [];
    const membersList = Array.isArray(activeGroup.members) ? activeGroup.members : [];
    const currentMemberIds = new Set(membersList.map(m => m?.memberId).filter(Boolean));
    const q = candidateSearch.toLowerCase().trim();

    if (newMemberCandidate.memberType === 'teacher') {
      return (teachers || [])
        .filter(t => t && !currentMemberIds.has(t.id) && !currentMemberIds.has(t.staffCode))
        .filter(t => !q || (t.nameKhmer && t.nameKhmer.toLowerCase().includes(q)) || (t.staffCode && t.staffCode.toLowerCase().includes(q)) || (t.role && t.role.toLowerCase().includes(q)))
        .map(t => ({
          id: t.id,
          name: t.nameKhmer,
          code: t.staffCode || 'N/A',
          subtext: `${t.role || 'គ្រូបង្រៀន'} • ${t.phone || ''}`,
          type: 'teacher' as const,
          gender: (t.gender === 'M' || t.gender === 'male' ? 'male' : 'female') as 'male' | 'female'
        }));
    } else {
      return (students || [])
        .filter(s => s && !currentMemberIds.has(s.id) && !currentMemberIds.has(s.studentId))
        .filter(s => !q || (s.nameKhmer && s.nameKhmer.toLowerCase().includes(q)) || (s.studentId && s.studentId.toLowerCase().includes(q)) || `${s.grade}${s.section}`.toLowerCase().includes(q))
        .map(s => ({
          id: s.id,
          name: s.nameKhmer,
          code: s.studentId || 'N/A',
          subtext: `ថ្នាក់ទី ${s.grade} ${s.section} • លេខកូដ: ${s.studentId || s.code}`,
          type: 'student' as const,
          gender: (s.gender === 'M' || s.gender === 'male' || s.gender === 'ប្រុស' ? 'male' : 'female') as 'male' | 'female',
          grade: s.grade,
          section: s.section
        }));
    }
  }, [activeGroup, teachers, students, newMemberCandidate.memberType, candidateSearch]);

  // Students for bulk add
  const bulkAvailableStudents = useMemo(() => {
    if (!activeGroup) return [];
    const membersList = Array.isArray(activeGroup.members) ? activeGroup.members : [];
    const currentMemberIds = new Set(membersList.map(m => m?.memberId).filter(Boolean));
    return (students || []).filter(s => {
      if (!s) return false;
      if (currentMemberIds.has(s.id) || currentMemberIds.has(s.studentId)) return false;
      if (bulkGradeFilter !== 'all' && s.grade !== bulkGradeFilter) return false;
      if (bulkSectionFilter !== 'all' && s.section !== bulkSectionFilter) return false;
      return true;
    });
  }, [activeGroup, students, bulkGradeFilter, bulkSectionFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      nameEnglish: '',
      code: `GRP-${Math.floor(100 + Math.random() * 900)}`,
      category: selectedCategory === 'all' ? 'extracurricular_club' : selectedCategory,
      description: '',
      academicYear: selectedAcademicYear || '២០២៤ - ២០២៥',
      meetingSchedule: 'រៀងរាល់រសៀលថ្ងៃពុធ ម៉ោង 2:00 - 3:30',
      locationRoom: 'បន្ទប់ប្រជុំ / បណ្ណាល័យ',
      colorTheme: 'sky',
      iconName: 'Cpu',
      status: 'active',
      members: [],
      createdBy: schoolProfile.principalName || 'គណៈគ្រប់គ្រង'
    });
    setIsGroupModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (group: SchoolGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      nameEnglish: group.nameEnglish || '',
      code: group.code || '',
      category: group.category,
      description: group.description || '',
      academicYear: group.academicYear,
      meetingSchedule: group.meetingSchedule || '',
      locationRoom: group.locationRoom || '',
      colorTheme: group.colorTheme || 'sky',
      iconName: group.iconName || 'Cpu',
      status: group.status,
      members: group.members,
      createdBy: group.createdBy || 'គណៈគ្រប់គ្រង'
    });
    setIsGroupModalOpen(true);
  };

  // Save Group (Create or Update)
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    if (editingGroup) {
      updateSchoolGroup(editingGroup.id, groupForm);
    } else {
      const res = addSchoolGroup(groupForm);
      if (res.group) {
        setSelectedGroup(res.group);
      }
    }
    setIsGroupModalOpen(false);
  };

  // Delete Group with confirmation
  const handleDeleteGroup = (group: SchoolGroup) => {
    if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបក្រុម «${group.name}» មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។`)) {
      deleteSchoolGroup(group.id);
      if (activeGroup?.id === group.id) {
        setSelectedGroup(null);
      }
    }
  };

  // Add Member
  const handleAddMember = () => {
    if (!activeGroup || !newMemberCandidate.memberId) return;

    const candidate = candidateList.find(c => c.id === newMemberCandidate.memberId);
    if (!candidate) return;

    addMemberToGroup(activeGroup.id, {
      memberType: newMemberCandidate.memberType,
      memberId: candidate.id,
      nameKhmer: candidate.name,
      codeOrStaffId: candidate.code,
      gradeOrPosition: candidate.subtext,
      gender: candidate.gender,
      role: newMemberCandidate.role
    });

    setIsMemberModalOpen(false);
    setNewMemberCandidate(prev => ({ ...prev, memberId: '' }));
    setCandidateSearch('');
  };

  // Bulk Add Members
  const handleBulkAdd = () => {
    if (!activeGroup || selectedBulkStudentIds.length === 0) return;

    const studentsToAdd = students
      .filter(s => selectedBulkStudentIds.includes(s.id))
      .map(s => ({
        memberType: 'student' as const,
        memberId: s.id,
        nameKhmer: s.nameKhmer,
        codeOrStaffId: s.studentId || 'STU',
        gradeOrPosition: `ថ្នាក់ទី ${s.grade} ${s.section}`,
        gender: (s.gender === 'M' || s.gender === 'male' || s.gender === 'ប្រុស' ? 'male' : 'female') as 'male' | 'female',
        role: 'member' as const
      }));

    bulkAddMembersToGroup(activeGroup.id, studentsToAdd);
    setIsBulkAddModalOpen(false);
    setSelectedBulkStudentIds([]);
  };

  // Helper for Theme Color styling
  const getColorBadge = (color?: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'teal': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'sky':
      default: return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const getRoleLabel = (role: GroupMemberRole) => {
    switch (role) {
      case 'leader': return { text: 'ប្រធានក្រុម', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'deputy_leader': return { text: 'អនុប្រធាន', badge: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'secretary': return { text: 'លេខាធិការ', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'treasurer': return { text: 'ហិរញ្ញិក', badge: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'advisor': return { text: 'ទីប្រឹក្សា / គ្រូដឹកនាំ', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'member':
      default: return { text: 'សមាជិក', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getCategoryLabel = (category: SchoolGroupCategory) => {
    switch (category) {
      case 'extracurricular_club': return 'ក្លឹបក្រៅម៉ោងសិក្សា & STEM';
      case 'internal_department': return 'ដេប៉ាតឺម៉ង់ & រដ្ឋបាលផ្ទៃក្នុង';
      case 'study_tutoring': return 'ក្រុមរៀនបំប៉ន & ស្រាវជ្រាវ';
      case 'academic_year': return 'ក្រុមជំនាន់ឆ្នាំសិក្សា';
      case 'school_committee': return 'គណៈកម្មការ & ក្រុមការងារពិសេស';
      case 'other':
      default: return 'ក្រុមផ្សេងៗ';
    }
  };

  return (
    <div id="school-group-management-root" className="space-y-6">
      {/* Header Banner */}
      <div id="group-mgmt-header-banner" className="bg-gradient-to-r from-sky-800 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-sky-700/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Users className="w-8 h-8 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  គ្រប់គ្រងក្រុម និងក្លឹបសិក្សាសាលារៀន (School Groups & Clubs)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-sky-500/30 text-sky-200 rounded-full border border-sky-400/30">
                  {schoolGroups.length} ក្រុម
                </span>
              </div>
              <p className="text-sm text-sky-100/90 mt-1 max-w-2xl">
                រៀបចំ ចាត់ចែង និងគ្រប់គ្រងសមាជិកក្រុមសិក្សា ក្លឹបបច្ចេកវិទ្យា STEM បណ្ណាល័យ កីឡា ដេប៉ាតឺម៉ង់ និងក្រុមសិស្សបំប៉ន យ៉ាងងាយស្រួល ជាមួយការតភ្ជាប់ទិន្នន័យលើ Cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-create-new-group"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>បង្កើតក្រុមថ្មី</span>
            </button>

            {activeGroup && (
              <button
                id="btn-print-group-roster"
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-medium rounded-xl border border-white/20 backdrop-blur-md transition-all"
              >
                <Printer className="w-4 h-4 text-sky-300" />
                <span>បោះពុម្ពបញ្ជីសមាជិក</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div id="group-category-pill-filter" className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-white/10 pb-1 scrollbar-none">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-filter-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                    : 'bg-white/10 text-white/90 hover:bg-white/15'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-white/70'}`} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-white/20 text-white'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Left Column Groups List & Right Column Group Details & Member Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Groups List */}
        <div id="group-list-column" className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            {/* Search within groups */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="group-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកក្រុម ឬកូដ..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredGroups.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">មិនមានក្រុមត្រូវនឹងការស្វែងរក</p>
                </div>
              ) : (
                filteredGroups.map(group => {
                  const isSelected = activeGroup?.id === group.id;
                  const members = Array.isArray(group.members) ? group.members : [];
                  const teacherCount = members.filter(m => m?.memberType === 'teacher').length;
                  const studentCount = members.filter(m => m?.memberType === 'student').length;

                  return (
                    <div
                      key={group.id}
                      id={`group-card-item-${group.id}`}
                      onClick={() => setSelectedGroup(group)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-300/40 shadow-sm'
                          : 'bg-white hover:bg-slate-50/90 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg border shrink-0 ${getColorBadge(group.colorTheme)}`}>
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                                {group.name}
                              </h4>
                            </div>
                            {group.code && (
                              <span className="text-[11px] font-mono text-slate-500 font-medium">
                                #{group.code}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status tag */}
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          group.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {group.status === 'active' ? 'ដំណើរការ' : 'បណ្ណសារ'}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-600 truncate max-w-[140px]">
                          {getCategoryLabel(group.category)}
                        </span>
                        <div className="flex items-center gap-2">
                          {teacherCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium text-[10px]">
                              {teacherCount} គ្រូ
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-medium text-[10px]">
                            {studentCount} សិស្ស
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Group Detail & Member Assignment Interface */}
        <div id="group-detail-column" className="lg:col-span-8 space-y-4">
          {activeGroup ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              
              {/* Group Detail Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl border ${getColorBadge(activeGroup.colorTheme)} shrink-0`}>
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">
                        {activeGroup.name}
                      </h3>
                      {activeGroup.code && (
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                          {activeGroup.code}
                        </span>
                      )}
                    </div>
                    {activeGroup.nameEnglish && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        {activeGroup.nameEnglish}
                      </p>
                    )}
                    {activeGroup.description && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-xl">
                        {activeGroup.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 flex-wrap mt-3 text-xs text-slate-500">
                      {activeGroup.meetingSchedule && (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>{activeGroup.meetingSchedule}</span>
                        </div>
                      )}
                      {activeGroup.locationRoom && (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{activeGroup.locationRoom}</span>
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ឆ្នាំសិក្សា: {activeGroup.academicYear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit / Delete Group Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    id="btn-edit-active-group"
                    onClick={() => handleOpenEditModal(activeGroup)}
                    className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl border border-slate-200 transition-colors"
                    title="កែសម្រួលក្រុម"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    id="btn-delete-active-group"
                    onClick={() => handleDeleteGroup(activeGroup)}
                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                    title="លុបក្រុម"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Members Section Header & Member Quick Add Controls */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      បញ្ជីសមាជិកក្រុម ({(activeGroup.members || []).length} នាក់)
                    </h4>
                    <span className="text-xs text-slate-400 font-normal">
                      (គ្រូ {(activeGroup.members || []).filter(m => m?.memberType === 'teacher').length} នាក់, សិស្ស {(activeGroup.members || []).filter(m => m?.memberType === 'student').length} នាក់)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      id="btn-open-bulk-add-members"
                      onClick={() => {
                        setSelectedBulkStudentIds([]);
                        setIsBulkAddModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-all"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>បញ្ចូលសិស្សតាមថ្នាក់ (Bulk)</span>
                    </button>

                    <button
                      id="btn-open-add-member-modal"
                      onClick={() => {
                        setCandidateSearch('');
                        setNewMemberCandidate({
                          memberType: 'student',
                          memberId: '',
                          role: 'member'
                        });
                        setIsMemberModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ បន្ថែមសមាជិក</span>
                    </button>
                  </div>
                </div>

                {/* Member Search Bar & Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="member-search-input"
                      type="text"
                      value={memberSearchQuery}
                      onChange={e => setMemberSearchQuery(e.target.value)}
                      placeholder="ស្វែងរកសមាជិកក្នុងក្រុមតាមឈ្មោះ លេខកូដ ឬតួនាទី..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {memberSearchQuery && (
                      <button
                        onClick={() => setMemberSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                    {(['all', 'teacher', 'student'] as const).map(type => (
                      <button
                        key={type}
                        id={`filter-member-type-${type}`}
                        onClick={() => setMemberTypeFilter(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          memberTypeFilter === type
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'all' && 'ទាំងអស់'}
                        {type === 'teacher' && 'លោកគ្រូ/អ្នកគ្រូ'}
                        {type === 'student' && 'សិស្សានុសិស្ស'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Members Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3">ឈ្មោះសមាជិក</th>
                          <th className="px-3 py-3">ប្រភេទ</th>
                          <th className="px-3 py-3">កូដសម្គាល់ / ថ្នាក់</th>
                          <th className="px-3 py-3">តួនាទីក្នុងក្រុម</th>
                          <th className="px-3 py-3">កាលបរិច្ឆេទចូល</th>
                          <th className="px-3 py-3 text-right">សកម្មភាព</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredMembers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                              <UserMinus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                              <p>មិនទាន់មានសមាជិកក្នុងក្រុមនេះ ឬមិនត្រូវនឹងការស្វែងរកឡើយ</p>
                            </td>
                          </tr>
                        ) : (
                          filteredMembers.map((member, idx) => {
                            const roleInfo = getRoleLabel(member.role);
                            return (
                              <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-slate-400 font-mono text-[10px] w-4">
                                      {idx + 1}.
                                    </span>
                                    <div>
                                      <span className="font-semibold text-slate-900 text-xs">
                                        {member.nameKhmer}
                                      </span>
                                      {member.gender && (
                                        <span className="ml-1.5 text-[10px] text-slate-400">
                                          ({member.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-3 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    member.memberType === 'teacher'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {member.memberType === 'teacher' ? 'គ្រូបង្រៀន' : 'សិស្ស'}
                                  </span>
                                </td>

                                <td className="px-3 py-3">
                                  <div className="text-[11px]">
                                    <span className="font-mono text-slate-600 font-medium">
                                      {member.codeOrStaffId || 'N/A'}
                                    </span>
                                    {member.gradeOrPosition && (
                                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                        {member.gradeOrPosition}
                                      </p>
                                    )}
                                  </div>
                                </td>

                                <td className="px-3 py-3">
                                  {/* Role selector dropdown */}
                                  <select
                                    value={member.role}
                                    onChange={e => updateGroupMemberRole(activeGroup.id, member.id, e.target.value as GroupMemberRole)}
                                    className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 ${roleInfo.badge}`}
                                  >
                                    <option value="leader">ប្រធានក្រុម</option>
                                    <option value="deputy_leader">អនុប្រធាន</option>
                                    <option value="secretary">លេខាធិការ</option>
                                    <option value="treasurer">ហិរញ្ញិក</option>
                                    <option value="advisor">ទីប្រឹក្សា / គ្រូដឹកនាំ</option>
                                    <option value="member">សមាជិក</option>
                                  </select>
                                </td>

                                <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                                  {member.joinedDate || 'N/A'}
                                </td>

                                <td className="px-3 py-3 text-right">
                                  <button
                                    onClick={() => removeMemberFromGroup(activeGroup.id, member.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="ដកសមាជិកចេញពីក្រុម"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">សូមជ្រើសរើសក្រុមដើម្បីមើលព័ត៌មាន</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                ជ្រើសរើសក្រុមពីបញ្ជីខាងឆ្វេង ឬចុចប៊ូតុងបង្កើតក្រុមថ្មី ដើម្បីចាប់ផ្តើម
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. Modal Create / Edit Group */}
      {/* ========================================================================= */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-base">
                  {editingGroup ? 'កែសម្រួលព័ត៌មានក្រុម' : 'បង្កើតក្រុមសាលារៀនថ្មី'}
                </h3>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះក្រុម (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="ឧ. ក្លឹបបច្ចេកវិទ្យា STEM & Robot"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះក្រុម (អង់គ្លេស / English Name)
                </label>
                <input
                  type="text"
                  value={groupForm.nameEnglish || ''}
                  onChange={e => setGroupForm({ ...groupForm, nameEnglish: e.target.value })}
                  placeholder="ឧ. STEM & Robotics Club"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខកូដសម្គាល់ក្រុម
                  </label>
                  <input
                    type="text"
                    value={groupForm.code || ''}
                    onChange={e => setGroupForm({ ...groupForm, code: e.target.value })}
                    placeholder="ឧ. CLUB-STEM-01"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ប្រភេទក្រុម / ដេប៉ាតឺម៉ង់ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={groupForm.category}
                    onChange={e => setGroupForm({ ...groupForm, category: e.target.value as SchoolGroupCategory })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="extracurricular_club">ក្លឹបក្រៅម៉ោងសិក្សា & STEM</option>
                    <option value="internal_department">ដេប៉ាតឺម៉ង់ & រដ្ឋបាលផ្ទៃក្នុង</option>
                    <option value="study_tutoring">ក្រុមរៀនបំប៉ន & ស្រាវជ្រាវ</option>
                    <option value="academic_year">ក្រុមជំនាន់ឆ្នាំសិក្សា</option>
                    <option value="other">ក្រុមផ្សេងៗ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    កាលវិភាគជួបប្រជុំ / អនុវត្ត
                  </label>
                  <input
                    type="text"
                    value={groupForm.meetingSchedule || ''}
                    onChange={e => setGroupForm({ ...groupForm, meetingSchedule: e.target.value })}
                    placeholder="ឧ. រសៀលថ្ងៃពុធ ម៉ោង 2:00 - 4:00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ទីតាំង / បន្ទប់
                  </label>
                  <input
                    type="text"
                    value={groupForm.locationRoom || ''}
                    onChange={e => setGroupForm({ ...groupForm, locationRoom: e.target.value })}
                    placeholder="ឧ. បន្ទប់កុំព្យូទ័រ / បណ្ណាល័យ"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ពណ៌សម្គាល់ (Theme Color)
                  </label>
                  <select
                    value={groupForm.colorTheme || 'sky'}
                    onChange={e => setGroupForm({ ...groupForm, colorTheme: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="sky">ផ្ទៃមេឃ (Sky Blue)</option>
                    <option value="emerald">បៃតង (Emerald Green)</option>
                    <option value="indigo">ទឹកប៊ិច (Indigo Navy)</option>
                    <option value="purple">ស្វាយ (Purple)</option>
                    <option value="amber">លឿងទុំ (Amber Gold)</option>
                    <option value="rose">ផ្កាឈូក (Rose Red)</option>
                    <option value="teal">ខៀវស្រាល (Teal Cyan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ស្ថានភាពក្រុម
                  </label>
                  <select
                    value={groupForm.status}
                    onChange={e => setGroupForm({ ...groupForm, status: e.target.value as 'active' | 'archived' })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="active">ដំណើរការ (Active)</option>
                    <option value="archived">បណ្ណសារ (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ការពិពណ៌នាសង្ខេបពីគោលបំណងក្រុម
                </label>
                <textarea
                  rows={3}
                  value={groupForm.description || ''}
                  onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="រៀបរាប់ពីគោលបំណង សកម្មភាពស្នូល និងលទ្ធផលរំពឹងទុក..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {editingGroup ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតក្រុមថ្មី'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Modal Add Member to Active Group with Instant Search Bar */}
      {/* ========================================================================= */}
      {isMemberModalOpen && activeGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-base">
                  បន្ថែមសមាជិកទៅក្នុង «{activeGroup.name}»
                </h3>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Type Switcher */}
              <div className="flex rounded-xl p-1 bg-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setNewMemberCandidate(prev => ({ ...prev, memberType: 'student', memberId: '' }));
                    setCandidateSearch('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    newMemberCandidate.memberType === 'student'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  សិស្សានុសិស្ស ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewMemberCandidate(prev => ({ ...prev, memberType: 'teacher', memberId: '' }));
                    setCandidateSearch('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    newMemberCandidate.memberType === 'teacher'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  លោកគ្រូ / អ្នកគ្រូ ({teachers.length})
                </button>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  តួនាទីក្នុងក្រុម (Role)
                </label>
                <select
                  value={newMemberCandidate.role}
                  onChange={e => setNewMemberCandidate(prev => ({ ...prev, role: e.target.value as GroupMemberRole }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="member">សមាជិក (Member)</option>
                  <option value="leader">ប្រធានក្រុម (Leader)</option>
                  <option value="deputy_leader">អនុប្រធាន (Deputy Leader)</option>
                  <option value="secretary">លេខាធិការ (Secretary)</option>
                  <option value="treasurer">ហិរញ្ញិក (Treasurer)</option>
                  <option value="advisor">ទីប្រឹក្សា / គ្រូដឹកនាំ (Advisor)</option>
                </select>
              </div>

              {/* Instant Search Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ស្វែងរក និងជ្រើសរើសឈ្មោះ <span className="text-rose-500">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={e => setCandidateSearch(e.target.value)}
                    placeholder={
                      newMemberCandidate.memberType === 'teacher'
                        ? 'ស្វែងរកឈ្មោះលោកគ្រូ/អ្នកគ្រូ ឬលេខកូដ...'
                        : 'ស្វែងរកឈ្មោះសិស្ស លេខកូដ ឬថ្នាក់...'
                    }
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Candidate Selection List */}
                <div className="border border-slate-200 rounded-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {candidateList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      មិនមានឈ្មោះត្រូវនឹងការស្វែងរក ឬបានបញ្ចូលក្នុងក្រុមរួចរាល់ហើយ
                    </div>
                  ) : (
                    candidateList.slice(0, 50).map(c => {
                      const isSelected = newMemberCandidate.memberId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setNewMemberCandidate(prev => ({ ...prev, memberId: c.id }))}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-900 font-medium">
                                {c.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({c.gender === 'female' ? 'ស្រី' : 'ប្រុស'})
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {c.subtext}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-sky-600" />
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] text-slate-500 bg-slate-100 rounded">
                                ជ្រើស
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  disabled={!newMemberCandidate.memberId}
                  onClick={handleAddMember}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  បញ្ចូលសមាជិក
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Modal Bulk Add Students by Grade & Section */}
      {/* ========================================================================= */}
      {isBulkAddModalOpen && activeGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-base">
                  បញ្ចូលសិស្សជាក្រុមតាមកម្រិតថ្នាក់ (Bulk Student Enrollment)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ជ្រើសរើសកម្រិតថ្នាក់
                  </label>
                  <select
                    value={bulkGradeFilter}
                    onChange={e => setBulkGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="all">គ្រប់កម្រិតថ្នាក់ (១ ដល់ ៦)</option>
                    <option value="1">ថ្នាក់ទី ១</option>
                    <option value="2">ថ្នាក់ទី ២</option>
                    <option value="3">ថ្នាក់ទី ៣</option>
                    <option value="4">ថ្នាក់ទី ៤</option>
                    <option value="5">ថ្នាក់ទី ៥</option>
                    <option value="6">ថ្នាក់ទី ៦</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ជ្រើសរើសបន្ទប់ / បន្ទុក
                  </label>
                  <select
                    value={bulkSectionFilter}
                    onChange={e => setBulkSectionFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="all">គ្រប់បន្ទប់</option>
                    <option value="ក">បន្ទប់ ក</option>
                    <option value="ខ">បន្ទប់ ខ</option>
                    <option value="គ">បន្ទប់ គ</option>
                  </select>
                </div>
              </div>

              {/* Select All or None */}
              <div className="flex items-center justify-between text-xs pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBulkStudentIds(bulkAvailableStudents.map(s => s.id))}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    ជ្រើសរើសទាំងអស់ ({bulkAvailableStudents.length})
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBulkStudentIds([])}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ដោះការជ្រើស
                  </button>
                </div>
                <span className="font-bold text-indigo-700">
                  បានជ្រើស: {selectedBulkStudentIds.length} នាក់
                </span>
              </div>

              {/* Students List for Bulk Checkbox */}
              <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                {bulkAvailableStudents.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    មិនមានសិស្សដែលអាចបញ្ចូលបានក្នុងថ្នាក់នេះឡើយ (ឬសិស្សទាំងអស់បានចូលក្រុមរួចហើយ)
                  </div>
                ) : (
                  bulkAvailableStudents.map(s => {
                    const isChecked = selectedBulkStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedBulkStudentIds(prev =>
                                isChecked ? prev.filter(id => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="text-xs font-semibold text-slate-900">
                              {s.nameKhmer}
                            </span>
                            <span className="ml-1.5 text-[10px] text-slate-400">
                              ({s.gender === 'female' || s.gender === 'F' ? 'ស្រី' : 'ប្រុស'})
                            </span>
                            <p className="text-[10px] text-slate-500">
                              ថ្នាក់ទី {s.grade} {s.section} • អត្តលេខ: {s.studentId || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">
                          {s.studentId}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  disabled={selectedBulkStudentIds.length === 0}
                  onClick={handleBulkAdd}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  បញ្ចូលសិស្ស {selectedBulkStudentIds.length} នាក់ ទៅក្នុងក្រុម
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Official Printable Roster Modal */}
      {/* ========================================================================= */}
      {isPrintModalOpen && activeGroup && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">
                  បោះពុម្ពបញ្ជីរាយនាមសមាជិកក្រុមផ្លូវការ
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព (Print)</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-serif">
              {/* Header */}
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                <p className="text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1" />
              </div>

              <div className="flex items-start justify-between text-xs pt-2">
                <div>
                  <p className="font-bold">{schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ'}</p>
                  <p>កូដសាលា: {schoolProfile.schoolCode || '02100108027'}</p>
                  <p>ឆ្នាំសិក្សា: {activeGroup.academicYear}</p>
                </div>
                <div className="text-right">
                  <p>លេខកូដក្រុម: <span className="font-mono font-bold">{activeGroup.code}</span></p>
                  <p>កាលបរិច្ឆេទបោះពុម្ព: {new Date().toLocaleDateString('km-KH')}</p>
                </div>
              </div>

              <div className="text-center pt-2">
                <h3 className="text-base font-bold uppercase underline">
                  បញ្ជីរាយនាមសមាជិក {activeGroup.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  ទីតាំង: {activeGroup.locationRoom || 'សាលាបឋមសិក្សា'} • កាលវិភាគ: {activeGroup.meetingSchedule || 'តាមការកំណត់'}
                </p>
              </div>

              {/* Roster Table */}
              <table className="w-full text-xs border border-slate-400 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400">
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-10">ល.រ</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-left">គោត្តនាម និងនាម</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-14">ភេទ</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-left">កូដ / ថ្នាក់</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-center">តួនាទីក្នុងក្រុម</th>
                    <th className="border border-slate-400 px-3 py-1.5 text-center w-24">កាលបរិច្ឆេទចូល</th>
                  </tr>
                </thead>
                <tbody>
                  {(!activeGroup.members || activeGroup.members.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-400 px-4 py-6 text-center text-slate-500 italic">
                        មិនទាន់មានសមាជិកត្រូវបានចាត់តាំង
                      </td>
                    </tr>
                  ) : (
                    (activeGroup.members || []).map((m, idx) => (
                      <tr key={m.id} className="border-b border-slate-300">
                        <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 px-3 py-1.5 font-bold">{m.nameKhmer}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">
                          {m.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                        </td>
                        <td className="border border-slate-400 px-3 py-1.5">
                          {m.gradeOrPosition || m.codeOrStaffId}
                        </td>
                        <td className="border border-slate-400 px-3 py-1.5 text-center font-semibold">
                          {getRoleLabel(m.role).text}
                        </td>
                        <td className="border border-slate-400 px-3 py-1.5 text-center font-mono">
                          {m.joinedDate || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-2 text-xs pt-8 text-center">
                <div>
                  <p className="font-bold">ប្រធានក្រុម / អ្នកទទួលបន្ទុក</p>
                  <div className="h-16" />
                  <p>.......................................</p>
                </div>
                <div>
                  <p className="font-bold">បានឃើញ និងអនុម័ត ដោយនាយកសាលា</p>
                  <div className="h-16" />
                  <p className="font-bold">{schoolProfile.principalName || 'លោក លីម សន'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
