import React, { useState } from 'react';
import { AppUser, UserRole, Teacher } from '../types';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Settings,
  X,
  Sparkles,
  Search,
  Check,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface RolePermissionsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  teachers: Teacher[];
  preselectedUser?: AppUser | null;
  onUpdateUser?: (id: string, updated: Partial<AppUser>) => void;
}

interface FeatureAccessItem {
  id: string;
  categoryKh: string;
  featureKh: string;
  featureEn: string;
  descriptionKh: string;
  directorAccess: 'full' | 'restricted' | 'none';
  teacherAccess: 'full' | 'restricted' | 'none';
  secretaryAccess: 'full' | 'restricted' | 'none';
  librarianAccess: 'full' | 'restricted' | 'none';
  studentAccess: 'full' | 'restricted' | 'none';
  teacherRestrictionNote?: string;
}

const FEATURE_ACCESS_MATRIX: FeatureAccessItem[] = [
  {
    id: 'students_view',
    categoryKh: 'គ្រប់គ្រងសិស្ស',
    featureKh: 'មើលបញ្ជី និងប្រវត្តិរូបសិស្សទូទាំងសាលា',
    featureEn: 'View Student Directory',
    descriptionKh: 'អាចមើលបញ្ជីឈ្មោះ ប្រវត្តិរូប និងព័ត៌មានលម្អិតរបស់សិស្ស',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'full',
    librarianAccess: 'restricted',
    studentAccess: 'restricted',
    teacherRestrictionNote: 'គ្រូមើលបានតែសិស្សក្នុងបន្ទុកថ្នាក់របស់ខ្លួនប៉ុណ្ណោះ'
  },
  {
    id: 'students_edit',
    categoryKh: 'គ្រប់គ្រងសិស្ស',
    featureKh: 'បញ្ចូល និងកែប្រែព័ត៌មានសិស្ស',
    featureEn: 'Add / Edit Student Records',
    descriptionKh: 'បង្កើតប្រវត្តិរូបសិស្សថ្មី ឬកែប្រែព័ត៌មានផ្ទាល់ខ្លួន',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'full',
    librarianAccess: 'none',
    studentAccess: 'none',
    teacherRestrictionNote: 'គ្រូអាចកែប្រែព័ត៌មានសិស្សក្នុងថ្នាក់ខ្លួន ឬស្នើសុំនាយក'
  },
  {
    id: 'attendance_record',
    categoryKh: 'វត្តមាន & សុខភាព',
    featureKh: 'កត់ត្រាវត្តមានប្រចាំថ្ងៃ និងពិនិត្យសុខភាព',
    featureEn: 'Daily Attendance & Health Checks',
    descriptionKh: 'ស្រង់វត្តមាន វត្តមានរហ័ស និងកត់ត្រាអាការៈសុខភាពសិស្ស',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'full',
    librarianAccess: 'none',
    studentAccess: 'restricted',
    teacherRestrictionNote: 'កត់ត្រាបានចំពោះតែបន្ទុកថ្នាក់ដែលបានចាត់តាំង'
  },
  {
    id: 'scores_grading',
    categoryKh: 'ពិន្ទុ & ចំណាត់ថ្នាក់',
    featureKh: 'បញ្ចូលពិន្ទុ និងគណនាចំណាត់ថ្នាក់ប្រចាំខែ/ឆមាស',
    featureEn: 'Score Input & Ranking Calculation',
    descriptionKh: 'បញ្ចូលពិន្ទុតាមមុខវិជ្ជា បង្កើតតារាងកិត្តិយស និងកត់ត្រាមតិកែលម្អ',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'restricted',
    librarianAccess: 'none',
    studentAccess: 'restricted',
    teacherRestrictionNote: 'បញ្ចូលពិន្ទុបានតែលើមុខវិជ្ជា និងបន្ទុកថ្នាក់របស់ខ្លួន'
  },
  {
    id: 'scores_publish',
    categoryKh: 'ពិន្ទុ & ចំណាត់ថ្នាក់',
    featureKh: 'ផ្សព្វផ្សាយលទ្ធផលប្រឡងជាផ្លូវការជូនអាណាព្យាបាល',
    featureEn: 'Publish Official Results',
    descriptionKh: 'បើកសិទ្ធិឱ្យសិស្ស និងអាណាព្យាបាលមើលលទ្ធផល និងចំណាត់ថ្នាក់',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'none',
    librarianAccess: 'none',
    studentAccess: 'none',
    teacherRestrictionNote: 'ផ្សព្វផ្សាយបានតែថ្នាក់បន្ទុករបស់ខ្លួន'
  },
  {
    id: 'lesson_plans',
    categoryKh: 'ការបង្រៀន & ធនធាន',
    featureKh: 'កិច្ចតែងការបង្រៀន & របៀបវារៈប្រចាំថ្ងៃ',
    featureEn: 'Lesson Plans & Teaching Agenda',
    descriptionKh: 'បង្កើតកិច្ចតែងការបង្រៀន គ្រប់គ្រងកាលវិភាគ និងធនធានបង្រៀន',
    directorAccess: 'full',
    teacherAccess: 'full',
    secretaryAccess: 'none',
    librarianAccess: 'none',
    studentAccess: 'restricted',
    teacherRestrictionNote: 'គ្រូបង្រៀនមានសិទ្ធិពេញលេញលើកិច្ចតែងការខ្លួនឯង'
  },
  {
    id: 'at_risk_students',
    categoryKh: 'អន្តរាគមន៍សិស្ស',
    featureKh: 'តាមដាន និងអន្តរាគមន៍សិស្សជួបការលំបាក',
    featureEn: 'At-Risk Student Tracking',
    descriptionKh: 'កំណត់ត្រាសិស្សប្រឈមនឹងការបោះបង់ការសិក្សា និងផែនការជួយសិស្ស',
    directorAccess: 'full',
    teacherAccess: 'full',
    secretaryAccess: 'restricted',
    librarianAccess: 'none',
    studentAccess: 'none',
    teacherRestrictionNote: 'កត់ត្រានិងតាមដានអន្តរាគមន៍សិស្សក្នុងថ្នាក់'
  },
  {
    id: 'budget_finance',
    categoryKh: 'ហិរញ្ញវត្ថុ & ថវិកា',
    featureKh: 'គ្រប់គ្រងចំណូល ចំណាយ និងរបាយការណ៍ហិរញ្ញវត្ថុ',
    featureEn: 'School Budget & Finance',
    descriptionKh: 'កត់ត្រាថវិការដ្ឋ ថវិកាសហគមន៍ និងរបាយការណ៍ទូទាត់',
    directorAccess: 'full',
    teacherAccess: 'none',
    secretaryAccess: 'full',
    librarianAccess: 'none',
    studentAccess: 'none',
    teacherRestrictionNote: 'គ្រូបង្រៀនគ្មានសិទ្ធិចូលមើល ឬកែប្រែថវិកាសាលាឡើយ'
  },
  {
    id: 'library_mgmt',
    categoryKh: 'បណ្ណាល័យ',
    featureKh: 'គ្រប់គ្រងបញ្ជីសៀវភៅ និងការខ្ចី-សង',
    featureEn: 'Library Catalog & Loans',
    descriptionKh: 'ចុះបញ្ជីសៀវភៅ ស្រង់កំណត់ត្រាការអាន និងការខ្ចីសៀវភៅ',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'full',
    librarianAccess: 'full',
    studentAccess: 'restricted',
    teacherRestrictionNote: 'គ្រូអាចកត់ត្រាការអានរបស់សិស្សក្នុងថ្នាក់'
  },
  {
    id: 'accounts_mgmt',
    categoryKh: 'រដ្ឋបាលប្រព័ន្ធ',
    featureKh: 'គ្រប់គ្រងគណនី និងសិទ្ធិប្រើប្រាស់ (RBAC)',
    featureEn: 'User & Role Management',
    descriptionKh: 'បង្កើតគណនី លុបគណនី កំណត់ពាក្យសម្ងាត់ និងមើលកំណត់ត្រាសវនកម្ម',
    directorAccess: 'full',
    teacherAccess: 'restricted',
    secretaryAccess: 'restricted',
    librarianAccess: 'none',
    studentAccess: 'none',
    teacherRestrictionNote: 'គ្រូអាចបង្កើតបានតែគណនីសិស្សក្នុងបន្ទុកថ្នាក់របស់ខ្លួន'
  },
  {
    id: 'audit_security_logs',
    categoryKh: 'រដ្ឋបាលប្រព័ន្ធ',
    featureKh: 'ពិនិត្យកំណត់ត្រាសវនកម្ម និង Security Logs',
    featureEn: 'Audit & Security Logs',
    descriptionKh: 'តាមដានប្រវត្តិបង្កើត លុប កែប្រែគណនី និងការចូលប្រើប្រាស់',
    directorAccess: 'full',
    teacherAccess: 'none',
    secretaryAccess: 'restricted',
    librarianAccess: 'none',
    studentAccess: 'none',
    teacherRestrictionNote: 'កំណត់ត្រាសវនកម្មសម្រាប់តែនាយកសាលា និងរដ្ឋបាល'
  }
];

export const RolePermissionsInspectorModal: React.FC<RolePermissionsInspectorModalProps> = ({
  isOpen,
  onClose,
  users,
  teachers,
  preselectedUser,
  onUpdateUser
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(
    preselectedUser?.id || (users.find(u => u.role === 'teacher')?.id || users[0]?.id || '')
  );
  const [activeSubTab, setActiveSubTab] = useState<'specific_user' | 'matrix_overview' | 'troubleshoot'>('specific_user');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const targetUser = users.find(u => u.id === selectedUserId) || preselectedUser || users[0];
  const linkedTeacher = targetUser ? teachers.find(
    t => t.id === targetUser.id.replace('u-', '') ||
         (targetUser.email && t.email?.toLowerCase() === targetUser.email.toLowerCase()) ||
         (targetUser.phone && t.phone?.replace(/\s+/g, '') === targetUser.phone.replace(/\s+/g, '')) ||
         (targetUser.staffCode && t.staffCode === targetUser.staffCode)
  ) : null;

  const categories = ['all', ...Array.from(new Set(FEATURE_ACCESS_MATRIX.map(item => item.categoryKh)))];

  const getAccessBadge = (accessLevel: 'full' | 'restricted' | 'none', note?: string) => {
    switch (accessLevel) {
      case 'full':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ពេញលេញ (Full)</span>
          </span>
        );
      case 'restricted':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
            title={note}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>មានកម្រិត (Restricted)</span>
          </span>
        );
      case 'none':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>គ្មានសិទ្ធិ (None)</span>
          </span>
        );
    }
  };

  const getUserAccessForFeature = (item: FeatureAccessItem, role: UserRole) => {
    switch (role) {
      case 'director':
        return item.directorAccess;
      case 'teacher':
        return item.teacherAccess;
      case 'secretary':
        return item.secretaryAccess;
      case 'librarian':
        return item.librarianAccess;
      case 'student':
        return item.studentAccess;
      default:
        return 'none';
    }
  };

  // Diagnostics check for target user
  const diagnostics = [
    {
      title: 'ស្ថានភាពគណនី (Account Status)',
      passed: targetUser?.status === 'active',
      detail: targetUser?.status === 'active' ? 'គណនីកំពុងដំណើរការជាធម្មតា (Active)' : 'គណនីត្រូវបានផ្អាកដំណើរការ (Inactive/Suspended)',
      action: targetUser?.status !== 'active' && onUpdateUser ? () => onUpdateUser(targetUser.id, { status: 'active' }) : null,
      actionText: 'បើកដំណើរការឡើងវិញ'
    },
    {
      title: 'ការភ្ជាប់ប្រវត្តិរូបគ្រូបង្រៀន (Teacher Profile Sync)',
      passed: targetUser?.role !== 'teacher' || !!linkedTeacher,
      detail: linkedTeacher
        ? `បានភ្ជាប់ជាមួយទិន្នន័យគ្រូ: ${linkedTeacher.nameKhmer} (កូដ: ${linkedTeacher.staffCode})`
        : targetUser?.role === 'teacher'
        ? 'មិនទាន់មានទិន្នន័យគ្រូក្នុងបញ្ជីទូទៅឡើយ (អាចធ្វើឱ្យគ្រូបាត់មុខងារបង្រៀន)'
        : 'មិនតម្រូវឱ្យភ្ជាប់ទិន្នន័យគ្រូទេ',
      action: null
    },
    {
      title: 'ការចាត់តាំងបន្ទុកថ្នាក់ (Classroom Assignment)',
      passed: targetUser?.role !== 'teacher' || (!!targetUser?.assignedGrade && !!targetUser?.assignedSection),
      detail: targetUser?.role === 'teacher'
        ? targetUser.assignedGrade && targetUser.assignedSection
          ? `ទទួលបន្ទុកថ្នាក់ទី ${targetUser.assignedGrade}${targetUser.assignedSection}`
          : 'មិនទាន់បានកំណត់ថ្នាក់បន្ទុក (គ្រូនឹងមិនអាចបញ្ចូលពិន្ទុ ឬស្រង់វត្តមានបានឡើយ)'
        : 'មិនតម្រូវការចាត់តាំងបន្ទុកថ្នាក់ទេ',
      action: null
    },
    {
      title: 'សុពលភាពពាក្យសម្ងាត់ (Password Expiry)',
      passed: !targetUser?.forcePasswordChange,
      detail: targetUser?.forcePasswordChange
        ? 'គណនីកំពុងជាប់កំណត់ឱ្យប្តូរពាក្យសម្ងាត់ពេលចូលបន្ទាប់ (Force Rotation)'
        : 'ពាក្យសម្ងាត់ត្រឹមត្រូវ គ្មានការទាមទារផ្លាស់ប្តូរបង្ខំ',
      action: targetUser?.forcePasswordChange && onUpdateUser ? () => onUpdateUser(targetUser.id, { forcePasswordChange: false }) : null,
      actionText: 'ដោះលែងការបង្ខំប្តូរពាក្យសម្ងាត់'
    }
  ];

  const filteredMatrix = FEATURE_ACCESS_MATRIX.filter(item => {
    const matchesSearch =
      item.featureKh.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.featureEn.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.categoryKh.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.categoryKh === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-moul text-base text-slate-800">
                ការត្រួតពិនិត្យសិទ្ធិ & មុខងារតាមតួនាទី (Role & Feature Access Inspector)
              </h3>
              <p className="text-xs text-slate-500">
                ពិនិត្យសិទ្ធិចូលប្រើប្រាស់ជាក់ស្តែងរបស់គ្រូបង្រៀន និងដោះស្រាយបញ្ហាចូលមិនឃើញមុខងារ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('specific_user')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeSubTab === 'specific_user'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ពិនិត្យសិទ្ធិគណនីជាក់លាក់ (User Access Inspector)
          </button>
          <button
            onClick={() => setActiveSubTab('matrix_overview')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeSubTab === 'matrix_overview'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            តារាងម៉ាទ្រីសសិទ្ធិទូទៅ (All Roles Matrix)
          </button>
          <button
            onClick={() => setActiveSubTab('troubleshoot')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeSubTab === 'troubleshoot'
                ? 'border-amber-600 text-amber-600 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>មគ្គុទ្ទេសក៍ដោះស្រាយបញ្ហាគណនីគ្រូ (Troubleshooting)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: SPECIFIC USER ACCESS INSPECTOR */}
          {activeSubTab === 'specific_user' && targetUser && (
            <div className="space-y-6">
              {/* User Selector Dropdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ជ្រើសរើសគណនីដែលត្រូវត្រួតពិនិត្យ (Select Account to Inspect):
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nameKhmer} ({u.role === 'director' ? 'នាយកសាលា' : u.role === 'teacher' ? 'គ្រូបង្រៀន' : u.role === 'secretary' ? 'លេខាធិការ' : u.role === 'librarian' ? 'បណ្ណារក្ស' : 'សិស្ស'}) — {u.email || u.phone || u.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profile Card Snippet */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={targetUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt={targetUser.nameKhmer}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{targetUser.nameKhmer}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 uppercase">
                        {targetUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{targetUser.email || targetUser.phone || 'គ្មានអ៊ីមែល'}</p>
                    {targetUser.assignedGrade && (
                      <p className="text-[11px] text-emerald-600 font-medium">
                        បន្ទុកថ្នាក់: ទី{targetUser.assignedGrade}{targetUser.assignedSection || 'ក'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>លទ្ធផលនៃការធ្វើរោគវិនិច្ឆ័យសិទ្ធិ និងភាពត្រឹមត្រូវនៃគណនី (Diagnostics)</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diagnostics.map((diag, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border flex items-start gap-3 ${
                        diag.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="mt-0.5">
                        {diag.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{diag.title}</p>
                          {diag.action && (
                            <button
                              type="button"
                              onClick={diag.action}
                              className="text-[11px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              {diag.actionText}
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{diag.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Accessible Features Table for Selected User */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-800">
                    សិទ្ធិចូលប្រើប្រាស់មុខងារជាក់លាក់ (Feature Permissions for {targetUser.nameKhmer})
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ស្វែងរកមុខងារ..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">ជំពូកមុខងារ</th>
                        <th className="px-4 py-2.5">មុខងារ / សកម្មភាព</th>
                        <th className="px-4 py-2.5">កម្រិតសិទ្ធិ</th>
                        <th className="px-4 py-2.5">កំណត់សម្គាល់សិទ្ធិ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredMatrix.map(item => {
                        const access = getUserAccessForFeature(item, targetUser.role);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-500">{item.categoryKh}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-800">{item.featureKh}</p>
                              <p className="text-[11px] text-slate-400">{item.descriptionKh}</p>
                            </td>
                            <td className="px-4 py-3">
                              {getAccessBadge(access, item.teacherRestrictionNote)}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-slate-600">
                              {targetUser.role === 'teacher' ? (
                                item.teacherRestrictionNote || 'សិទ្ធិស្តង់ដារតាមតួនាទី'
                              ) : targetUser.role === 'director' ? (
                                'នាយកសាលាមានសិទ្ធិពេញលេញលើគ្រប់ទិន្នន័យ'
                              ) : (
                                'កំណត់តាមកម្រិតតួនាទី'
                              )}
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

          {/* TAB 2: GENERAL MATRIX OVERVIEW */}
          {activeSubTab === 'matrix_overview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'ទាំងអស់' : cat}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ស្វែងរកក្នុងតារាង..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">មុខងារ</th>
                        <th className="px-3 py-3 text-center">នាយក (Director)</th>
                        <th className="px-3 py-3 text-center">គ្រូបង្រៀន (Teacher)</th>
                        <th className="px-3 py-3 text-center">លេខាធិការ (Secretary)</th>
                        <th className="px-3 py-3 text-center">បណ្ណារក្ស (Librarian)</th>
                        <th className="px-3 py-3 text-center">សិស្ស (Student)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredMatrix.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800">{item.featureKh}</p>
                            <p className="text-[11px] text-slate-400">{item.categoryKh}</p>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {getAccessBadge(item.directorAccess)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {getAccessBadge(item.teacherAccess, item.teacherRestrictionNote)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {getAccessBadge(item.secretaryAccess)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {getAccessBadge(item.librarianAccess)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {getAccessBadge(item.studentAccess)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TROUBLESHOOTING GUIDE */}
          {activeSubTab === 'troubleshoot' && (
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-moul text-sm text-amber-900">
                      ហេតុអ្វីគណនីគ្រូបង្រៀនចូលប្រើមិនឃើញមុខងារ ឬបាត់ពីបញ្ជី? (Troubleshooting Guide)
                    </h4>
                    <p className="text-xs text-amber-800 mt-1">
                      នេះជាមូលហេតុចម្បង និងដំណោះស្រាយជាក់ស្តែងក្នុងការគ្រប់គ្រងគណនីលោកគ្រូ-អ្នកគ្រូ៖
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs">មិនទាន់បានកំណត់ថ្នាក់បន្ទុក (No Assigned Grade)</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    មុខងារបញ្ចូលពិន្ទុ ស្រង់វត្តមាន និងមើលបញ្ជីសិស្ស តម្រូវឱ្យគណនីគ្រូមានការកំណត់កម្រិតថ្នាក់ (ឧ. ថ្នាក់ទី១ «ក»)។ ប្រសិនបើទុកចោលទទេ គ្រូនឹងមិនឃើញបញ្ជីសិស្សឡើយ។
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-blue-700 font-medium">
                    💡 ដំណោះស្រាយ: ចុចប៊ូតុងកែប្រែ (Edit) លើគណនី រួចជ្រើសរើសកម្រិតថ្នាក់ និងបន្ទប់។
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs">គណនីត្រូវបានលុប ឬផ្លាស់ទីទៅធុងសំរាម (Soft Deleted)</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ប្រសិនបើអ្នកគ្រប់គ្រងម្នាក់ទៀតបានលុបគណនី គណនីនោះនឹងមិនបាត់ភ្លាមៗឡើយ ប៉ុន្តែត្រូវបានផ្លាស់ទីទៅក្នុងថត «ធុងសំរាម (Recently Deleted)» រយៈពេល ៣០ ថ្ងៃ។
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-emerald-700 font-medium">
                    💡 ដំណោះស្រាយ: ចូលទៅកាន់ថេប «ធុងសំរាម (Recently Deleted)» រួចចុច «ស្តារឡើងវិញ (Restore)»។
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs">ការមិនស៊ីសង្វាក់គ្នារវាងគណនី និងប្រវត្តិរូបគ្រូ (Sync Issue)</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    គណនីចូលប្រើ (`AppUser`) និងប្រវត្តិរូបបង្រៀន (`Teacher Profile`) ត្រូវតែមានលេខទូរស័ព្ទ អ៊ីមែល ឬអត្តលេខដូចគ្នា ដើម្បីឱ្យប្រព័ន្ធផ្គូផ្គងកាលវិភាគបង្រៀន។
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-amber-700 font-medium">
                    💡 ដំណោះស្រាយ: ពិនិត្យក្នុង tab ធ្វើរោគវិនិច្ឆ័យដើម្បីផ្ទៀងផ្ទាត់ការ sync ទិន្នន័យ។
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs">ការផុតសុពលភាព ឬជាប់បង្ខំប្តូរពាក្យសម្ងាត់ (Force Rotation)</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    នៅពេលដែលនាយកសាលាបានកំណត់ឱ្យបុគ្គលិកប្តូរពាក្យសម្ងាត់ គណនីគ្រូត្រូវតែបញ្ចូលពាក្យសម្ងាត់ថ្មីជាមុនសិន ទើបអាចចូលប្រើផ្ទាំងគ្រប់គ្រងបាន។
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-purple-700 font-medium">
                    💡 ដំណោះស្រាយ: ណែនាំគ្រូឱ្យចូលគណនី និងកំណត់ពាក្យសម្ងាត់ថ្មីភ្លាមៗ។
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            បិទផ្ទាំង (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
