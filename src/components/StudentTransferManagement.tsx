import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { StudentTransferRecord, Student } from '../types';
import {
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Phone,
  FileCheck,
  Check,
  X,
  Sparkles,
  Download
} from 'lucide-react';
import {
  MoEYSRoyalHeader,
  AngkorPageWatermark,
  SchoolOfficialStamp,
  KhmerKbachCorner
} from './AngkorMotif';

export const StudentTransferManagement: React.FC = () => {
  const {
    transfers,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    students,
    schoolProfile,
    showToast,
    currentUser
  } = useSchool();

  const isTeacher = currentUser?.role === 'teacher';
  const teacherGrade = currentUser?.assignedGrade || 1;
  const teacherSection = currentUser?.assignedSection || 'ក';

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'out' | 'in'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>(isTeacher ? String(teacherGrade) : 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<StudentTransferRecord | null>(null);
  const [viewingLetter, setViewingLetter] = useState<StudentTransferRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<StudentTransferRecord>>({
    transferType: 'out',
    letterNumber: `លខ.${String(transfers.length + 1).padStart(3, '0')}/${new Date().getFullYear()}`,
    transferDate: new Date().toISOString().split('T')[0],
    studentNameKhmer: '',
    studentNameLatin: '',
    studentCode: '',
    gender: 'M',
    dob: '2014-01-01',
    grade: isTeacher ? teacherGrade : 1,
    section: isTeacher ? teacherSection : 'ក',
    academicYear: schoolProfile.academicYear,
    fromSchool: schoolProfile.nameKhmer,
    fromSchoolCode: schoolProfile.schoolCode,
    toSchool: '',
    toSchoolCode: '',
    toDistrictProvince: '',
    reason: 'ផ្លាស់ប្តូរទីលំនៅតាមឪពុកម្តាយ',
    guardianName: '',
    guardianPhone: '',
    principalApprovalName: schoolProfile.principalName,
    officerName: currentUser?.nameKhmer || '',
    status: 'approved',
    notes: ''
  });

  // Accessible students for teacher
  const accessibleStudents = isTeacher
    ? students.filter(s => s.grade === teacherGrade && s.section === teacherSection)
    : students;

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    const matchesTab = activeSubTab === 'all' || t.transferType === activeSubTab;
    const matchesGrade = isTeacher
      ? (t.grade === teacherGrade && (!t.section || t.section === teacherSection))
      : (selectedGrade === 'all' || t.grade.toString() === selectedGrade);
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.studentNameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.studentNameLatin && t.studentNameLatin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.studentCode && t.studentCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromSchool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toSchool.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesGrade && matchesStatus && matchesSearch;
  });

  const totalOut = transfers.filter(t => t.transferType === 'out').length;
  const totalIn = transfers.filter(t => t.transferType === 'in').length;
  const totalApproved = transfers.filter(t => t.status === 'approved' || t.status === 'completed').length;

  const handleOpenCreate = (type: 'out' | 'in' = 'out') => {
    setEditingTransfer(null);
    setFormData({
      transferType: type,
      letterNumber: `លខ.${String(transfers.length + 1).padStart(3, '0')}/${new Date().getFullYear()}`,
      transferDate: new Date().toISOString().split('T')[0],
      studentNameKhmer: '',
      studentNameLatin: '',
      studentCode: '',
      gender: 'M',
      dob: '2014-01-01',
      grade: 1,
      section: 'ក',
      academicYear: schoolProfile.academicYear,
      fromSchool: type === 'out' ? schoolProfile.nameKhmer : '',
      fromSchoolCode: type === 'out' ? schoolProfile.schoolCode : '',
      toSchool: type === 'in' ? schoolProfile.nameKhmer : '',
      toSchoolCode: type === 'in' ? schoolProfile.schoolCode : '',
      toDistrictProvince: type === 'in' ? `${schoolProfile.district} ${schoolProfile.province}` : '',
      reason: 'ផ្លាស់ប្តូរទីលំនៅតាមឪពុកម្តាយ',
      guardianName: '',
      guardianPhone: '',
      principalApprovalName: schoolProfile.principalName,
      officerName: currentUser?.nameKhmer || '',
      status: 'approved',
      notes: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (transfer: StudentTransferRecord) => {
    setEditingTransfer(transfer);
    setFormData({ ...transfer });
    setIsCreateModalOpen(true);
  };

  const handleSelectStudentForOut = (studentId: string) => {
    const stu = students.find(s => s.id === studentId);
    if (!stu) return;
    setFormData(prev => ({
      ...prev,
      studentId: stu.id,
      studentCode: stu.code,
      studentNameKhmer: stu.nameKhmer,
      studentNameLatin: stu.nameLatin || '',
      gender: stu.gender,
      dob: stu.dob,
      grade: stu.grade,
      section: stu.section,
      guardianName: stu.guardianName || (stu.fatherName ? stu.fatherName : stu.motherName || ''),
      guardianPhone: stu.guardianPhone || stu.phone || '',
      fromSchool: schoolProfile.nameKhmer,
      fromSchoolCode: schoolProfile.schoolCode
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentNameKhmer || !formData.letterNumber) {
      showToast('សូមបំពេញឈ្មោះសិស្ស និងលេខលិខិតផ្ទេរ!', 'error');
      return;
    }

    const payload: Omit<StudentTransferRecord, 'id'> = {
      transferType: formData.transferType || 'out',
      letterNumber: formData.letterNumber,
      transferDate: formData.transferDate || new Date().toISOString().split('T')[0],
      studentId: formData.studentId,
      studentCode: formData.studentCode,
      studentNameKhmer: formData.studentNameKhmer,
      studentNameLatin: formData.studentNameLatin,
      gender: (formData.gender as 'M' | 'F') || 'M',
      dob: formData.dob || '2014-01-01',
      grade: Number(formData.grade) || 1,
      section: formData.section || 'ក',
      academicYear: formData.academicYear || schoolProfile.academicYear,
      fromSchool: formData.fromSchool || '',
      fromSchoolCode: formData.fromSchoolCode,
      toSchool: formData.toSchool || '',
      toSchoolCode: formData.toSchoolCode,
      toDistrictProvince: formData.toDistrictProvince,
      reason: formData.reason || '',
      guardianName: formData.guardianName || '',
      guardianPhone: formData.guardianPhone,
      principalApprovalName: formData.principalApprovalName || schoolProfile.principalName,
      officerName: formData.officerName || currentUser?.nameKhmer,
      status: (formData.status as any) || 'approved',
      notes: formData.notes
    };

    if (editingTransfer) {
      updateTransfer(editingTransfer.id, payload);
    } else {
      addTransfer(payload);
    }

    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: StudentTransferRecord['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            បានអនុម័ត (Approved)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            បានបញ្ចប់សព្វគ្រប់ (Completed)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            រង់ចាំអនុម័ត (Pending)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            បដិសេធ (Rejected)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-battambang">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ArrowRightLeft className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wide">
                  MoEYS Standard Module
                </span>
                <span className="text-xs text-slate-500 font-medium">ឆ្នាំសិក្សា {schoolProfile.academicYear}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-moul text-slate-800 mt-1">
                គ្រប់គ្រងលិខិតផ្ទេរសិស្សចេញ និងបន្ថែមសិស្សចូល
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                រៀបចំលិខិតផ្ទេរផ្លូវការស្របតាមទម្រង់ក្រសួងអប់រំ យុវជន និងកីឡា ព្រមទាំងរក្សាទុកទិន្នន័យស្ថិតិផ្លាស់ប្តូរ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenCreate('out')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>លិខិតផ្ទេរចេញ (Transfer Out)</span>
            </button>
            <button
              onClick={() => handleOpenCreate('in')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>បន្ថែមសិស្សចូល (Transfer In)</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">សរុបលិខិតផ្ទេរទាំងអស់</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-times text-slate-800">{transfers.length}</span>
              <span className="text-xs text-slate-500 font-battambang">ច្បាប់</span>
            </div>
          </div>
          <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-800 font-medium">ផ្ទេរសិស្សចេញ</p>
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-times text-amber-900">{totalOut}</span>
              <span className="text-xs text-amber-700 font-battambang">នាក់</span>
            </div>
          </div>
          <div className="bg-teal-50/70 rounded-xl p-3.5 border border-teal-200/80">
            <div className="flex items-center justify-between">
              <p className="text-xs text-teal-800 font-medium">បន្ថែមសិស្សចូល</p>
              <ArrowDownLeft className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-times text-teal-900">{totalIn}</span>
              <span className="text-xs text-teal-700 font-battambang">នាក់</span>
            </div>
          </div>
          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-800 font-medium">បានអនុម័តផ្លូវការ</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-times text-emerald-900">{totalApproved}</span>
              <span className="text-xs text-emerald-700 font-battambang">ច្បាប់</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Sub-tab selection */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ទាំងអស់ ({transfers.length})
            </button>
            <button
              onClick={() => setActiveSubTab('out')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'out'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              ផ្ទេរចេញ ({totalOut})
            </button>
            <button
              onClick={() => setActiveSubTab('in')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeSubTab === 'in'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              បន្ថែមចូល ({totalIn})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2.5 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, លេខលិខិត, សាលា..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">គ្រប់កម្រិតថ្នាក់</option>
              <option value="1">ថ្នាក់ទី១</option>
              <option value="2">ថ្នាក់ទី២</option>
              <option value="3">ថ្នាក់ទី៣</option>
              <option value="4">ថ្នាក់ទី៤</option>
              <option value="5">ថ្នាក់ទី៥</option>
              <option value="6">ថ្នាក់ទី៦</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">គ្រប់ស្ថានភាព</option>
              <option value="approved">បានអនុម័ត</option>
              <option value="completed">បានបញ្ចប់</option>
              <option value="pending">រង់ចាំ</option>
              <option value="rejected">បដិសេធ</option>
            </select>
          </div>
        </div>

        {/* Transfers Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">ប្រភេទ & លេខលិខិត</th>
                <th className="py-3 px-3.5">ព័ត៌មានសិស្ស</th>
                <th className="py-3 px-3.5">ថ្នាក់/កម្រិត</th>
                <th className="py-3 px-3.5">ផ្ទេរមកពី / ផ្ទេរទៅសាលា</th>
                <th className="py-3 px-3.5">មូលហេតុ & កាលបរិច្ឆេទ</th>
                <th className="py-3 px-3.5 text-center">ស្ថានភាព</th>
                <th className="py-3 px-3.5 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">ពុំមានទិន្នន័យលិខិតផ្ទេរត្រូវគ្នានឹងការស្វែងរកឡើយ</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        {record.transferType === 'out' ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0" title="ផ្ទេរចេញ">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0" title="បន្ថែមចូល">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{record.letterNumber}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {record.transferType === 'out' ? 'លិខិតផ្ទេរចេញ' : 'លិខិតបន្ថែមចូល'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div>
                        <p className="font-bold text-slate-800">{record.studentNameKhmer}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          {record.studentNameLatin && <span className="font-times">{record.studentNameLatin}</span>}
                          {record.studentCode && (
                            <>
                              <span>•</span>
                              <span className="font-times text-blue-600 font-medium">{record.studentCode}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{record.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium text-xs">
                        ថ្នាក់ទី {record.grade}{record.section}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">ឆ្នាំ {record.academicYear}</p>
                    </td>
                    <td className="py-3 px-3.5">
                      {record.transferType === 'out' ? (
                        <div>
                          <p className="text-slate-800 font-medium flex items-center gap-1">
                            <span className="text-slate-400 text-xs">ទៅ៖</span>
                            {record.toSchool || 'មិនទាន់បញ្ជាក់'}
                          </p>
                          {record.toDistrictProvince && (
                            <p className="text-[11px] text-slate-500">{record.toDistrictProvince}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-800 font-medium flex items-center gap-1">
                            <span className="text-slate-400 text-xs">ពី៖</span>
                            {record.fromSchool || 'មិនទាន់បញ្ជាក់'}
                          </p>
                          {record.fromSchoolCode && (
                            <p className="text-[11px] text-slate-500 font-times">កូដសាលា: {record.fromSchoolCode}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <p className="text-xs text-slate-700 line-clamp-1">{record.reason}</p>
                      <p className="text-[11px] text-slate-400 font-times mt-0.5">{record.transferDate}</p>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingLetter(record)}
                          title="មើលលិខិតផ្ទេរផ្លូវការ & បោះពុម្ព"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(record)}
                          title="កែប្រែទិន្នន័យ"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបកំណត់ត្រាផ្ទេរ «${record.letterNumber}» របស់សិស្ស ${record.studentNameKhmer} មែនទេ?`)) {
                              deleteTransfer(record.id);
                            }
                          }}
                          title="លុបកំណត់ត្រា"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Transfer Record */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-moul">
                    {editingTransfer ? 'កែប្រែកំណត់ត្រាផ្ទេរសិស្ស' : 'បង្កើតលិខិតផ្ទេរសិស្សផ្លូវការ'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    ទម្រង់រដ្ឋបាលផ្ទេរសិស្សស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 text-xs sm:text-sm">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, transferType: 'out' }))}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.transferType === 'out'
                      ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 text-amber-600" />
                  <div className="text-left">
                    <p className="font-bold">លិខិតផ្ទេរសិស្សចេញ</p>
                    <p className="text-[11px] font-normal text-slate-500">សិស្សផ្លាស់ទៅសាលាផ្សេង</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, transferType: 'in' }))}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.transferType === 'in'
                      ? 'border-teal-500 bg-teal-50/80 text-teal-900 font-bold ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ArrowDownLeft className="w-5 h-5 text-teal-600" />
                  <div className="text-left">
                    <p className="font-bold">លិខិតបន្ថែមសិស្សចូល</p>
                    <p className="text-[11px] font-normal text-slate-500">សិស្សផ្ទេរមកពីសាលាដទៃ</p>
                  </div>
                </button>
              </div>

              {/* If Transfer Out: Quick picker from existing students */}
              {formData.transferType === 'out' && (
                <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                  <label className="block text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    ជ្រើសរើសសិស្សក្នុងសាលា ដើម្បីបំពេញទិន្នន័យដោយស្វ័យប្រវត្តិ (Quick Fill)
                  </label>
                  <select
                    onChange={e => handleSelectStudentForOut(e.target.value)}
                    defaultValue=""
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>-- ជ្រើសរើសសិស្សដែលត្រូវផ្ទេរចេញ --</option>
                    {accessibleStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.gender === 'F' ? 'ស្រី' : 'ប្រុស'}) - ថ្នាក់ទី{s.grade}{s.section} [អត្តលេខ: {s.code}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Administrative Letter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    លេខលិខិតផ្ទេរ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.letterNumber || ''}
                    onChange={e => setFormData(p => ({ ...p, letterNumber: e.target.value }))}
                    placeholder="ឧ. លខ.០២៥/២០២៤"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កាលបរិច្ឆេទផ្ទេរ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.transferDate || ''}
                    onChange={e => setFormData(p => ({ ...p, transferDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ស្ថានភាពអនុម័ត
                  </label>
                  <select
                    value={formData.status || 'approved'}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="approved">បានអនុម័ត (Approved)</option>
                    <option value="completed">បានបញ្ចប់ (Completed)</option>
                    <option value="pending">រង់ចាំពិនិត្យ (Pending)</option>
                    <option value="rejected">បដិសេធ (Rejected)</option>
                  </select>
                </div>
              </div>

              {/* Student Demographics */}
              <div className="border-t border-slate-200 pt-4 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ព័ត៌មានអត្តសញ្ញាណសិស្ស
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះសិស្សជាភាសាខ្មែរ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentNameKhmer || ''}
                      onChange={e => setFormData(p => ({ ...p, studentNameKhmer: e.target.value }))}
                      placeholder="ឧ. សុខ វាសនា"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ឈ្មោះជាអក្សរឡាតាំង
                    </label>
                    <input
                      type="text"
                      value={formData.studentNameLatin || ''}
                      onChange={e => setFormData(p => ({ ...p, studentNameLatin: e.target.value }))}
                      placeholder="e.g. Sok Veasna"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      អត្តលេខសិស្ស (Student Code)
                    </label>
                    <input
                      type="text"
                      value={formData.studentCode || ''}
                      onChange={e => setFormData(p => ({ ...p, studentCode: e.target.value }))}
                      placeholder="ឧ. STU-2024-010"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ភេទ *
                    </label>
                    <select
                      value={formData.gender || 'M'}
                      onChange={e => setFormData(p => ({ ...p, gender: e.target.value as 'M' | 'F' }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="M">ប្រុស (M)</option>
                      <option value="F">ស្រី (F)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ថ្ងៃខែឆ្នាំកំណើត *
                    </label>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      កម្រិតថ្នាក់ *
                    </label>
                    <select
                      value={formData.grade || 1}
                      onChange={e => setFormData(p => ({ ...p, grade: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="1">ថ្នាក់ទី១</option>
                      <option value="2">ថ្នាក់ទី២</option>
                      <option value="3">ថ្នាក់ទី៣</option>
                      <option value="4">ថ្នាក់ទី៤</option>
                      <option value="5">ថ្នាក់ទី៥</option>
                      <option value="6">ថ្នាក់ទី៦</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      បន្ទប់/ផ្នែក
                    </label>
                    <input
                      type="text"
                      value={formData.section || 'ក'}
                      onChange={e => setFormData(p => ({ ...p, section: e.target.value }))}
                      placeholder="ឧ. ក"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* School Transfer Details */}
              <div className="border-t border-slate-200 pt-4 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ព័ត៌មានសាលារៀនផ្ទេរចេញ & សាលាទទួល
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      សាលារៀនដើម (From School)
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">ឈ្មោះសាលារៀនដើម *</label>
                      <input
                        type="text"
                        required
                        value={formData.fromSchool || ''}
                        onChange={e => setFormData(p => ({ ...p, fromSchool: e.target.value }))}
                        placeholder="ឧ. សាលាបឋមសិក្សាភ្នំពុំ"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">លេខកូដសាលា (School Code)</label>
                      <input
                        type="text"
                        value={formData.fromSchoolCode || ''}
                        onChange={e => setFormData(p => ({ ...p, fromSchoolCode: e.target.value }))}
                        placeholder="ឧ. 020401015"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      សាលារៀនទទួល (To School)
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">ឈ្មោះសាលារៀនទទួល *</label>
                      <input
                        type="text"
                        required
                        value={formData.toSchool || ''}
                        onChange={e => setFormData(p => ({ ...p, toSchool: e.target.value }))}
                        placeholder="ឧ. សាលាបឋមសិក្សាព្រះនរោត្តម"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">ស្រុក/ខណ្ឌ & ខេត្ត/រាជធានី</label>
                      <input
                        type="text"
                        value={formData.toDistrictProvince || ''}
                        onChange={e => setFormData(p => ({ ...p, toDistrictProvince: e.target.value }))}
                        placeholder="ឧ. ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ឈ្មោះអាណាព្យាបាល
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName || ''}
                    onChange={e => setFormData(p => ({ ...p, guardianName: e.target.value }))}
                    placeholder="ឧ. ចាន់ សុខុម"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    លេខទូរស័ព្ទអាណាព្យាបាល
                  </label>
                  <input
                    type="text"
                    value={formData.guardianPhone || ''}
                    onChange={e => setFormData(p => ({ ...p, guardianPhone: e.target.value }))}
                    placeholder="ឧ. 012 998 877"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-times focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    មូលហេតុផ្ទេរ
                  </label>
                  <input
                    type="text"
                    value={formData.reason || ''}
                    onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                    placeholder="ឧ. ផ្លាស់ប្តូរទីលំនៅតាមឪពុកម្តាយ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  កំណត់សម្គាល់បន្ថែម
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="ឧ. បានប្រគល់សៀវភៅតាមដានការសិក្សា និងព្រឹត្តិបត្រពិន្ទុរួចរាល់..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTransfer ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតលិខិតផ្ទេរ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official MoEYS Transfer Letter Modal */}
      {viewingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[96vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Top Toolbar */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between no-print sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-xs sm:text-sm font-moul">
                  លិខិតផ្ទេរសិស្សផ្លូវការ - {viewingLetter.letterNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព (Print)</span>
                </button>
                <button
                  onClick={() => setViewingLetter(null)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letter Canvas */}
            <div className="p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-battambang print:p-6 relative overflow-hidden" id="official-transfer-letter">
              <AngkorPageWatermark opacity={0.04} />

              {/* Department & Royal Header */}
              <div className="flex justify-between items-start text-xs sm:text-sm mb-6 border-b border-slate-300 pb-4 relative z-1">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-semibold text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                  <p className="font-semibold text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                  <p className="font-bold text-blue-900 font-moul text-sm sm:text-base pt-0.5">{schoolProfile.nameKhmer}</p>
                  <p className="text-[11px] text-slate-500 font-times">លេខកូដសាលា: {schoolProfile.schoolCode}</p>
                </div>

                <div className="text-center">
                  <MoEYSRoyalHeader />
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-bold text-slate-800">លេខ: {viewingLetter.letterNumber}</p>
                  <p className="text-xs text-slate-600 font-times">{schoolProfile.province.replace('ខេត្ត', '')}, ថ្ងៃទី {viewingLetter.transferDate}</p>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="text-center my-6 space-y-1 relative z-1">
                <h1 className="font-moul text-lg sm:text-xl text-blue-950 underline decoration-2 underline-offset-8">
                  {viewingLetter.transferType === 'out' ? 'លិខិតផ្ទេរសិស្សចេញ' : 'លិខិតបន្ថែមសិស្សចូល'}
                </h1>
                <p className="text-xs font-times text-slate-500 tracking-wider">
                  STUDENT TRANSFER CERTIFICATE
                </p>
              </div>

              {/* Certificate Body Text */}
              <div className="space-y-4 text-xs sm:text-sm text-justify relative z-1">
                <p className="indent-8 leading-loose">
                  នាយកសាលាបឋមសិក្សា <span className="font-bold">{schoolProfile.nameKhmer}</span> សូមបញ្ជាក់ថា៖
                </p>

                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p>
                      កុមារា/កុមារី ឈ្មោះ៖ <span className="font-bold text-slate-900 font-moul">{viewingLetter.studentNameKhmer}</span>
                    </p>
                    <p>
                      អក្សរឡាតាំង៖ <span className="font-times font-bold">{viewingLetter.studentNameLatin || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p>
                      ភេទ៖ <span className="font-semibold">{viewingLetter.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</span>
                    </p>
                    <p>
                      ថ្ងៃខែឆ្នាំកំណើត៖ <span className="font-times font-semibold">{viewingLetter.dob}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p>
                      អត្តលេខសិស្ស៖ <span className="font-times font-bold text-blue-800">{viewingLetter.studentCode || 'N/A'}</span>
                    </p>
                    <p>
                      កម្រិតថ្នាក់៖ <span className="font-bold">ថ្នាក់ទី{viewingLetter.grade}{viewingLetter.section}</span> (ឆ្នាំសិក្សា <span className="font-times">{viewingLetter.academicYear}</span>)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p>
                      ឈ្មោះអាណាព្យាបាល៖ <span className="font-semibold">{viewingLetter.guardianName || 'N/A'}</span>
                    </p>
                    <p>
                      លេខទូរស័ព្ទ៖ <span className="font-times">{viewingLetter.guardianPhone || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <p className="indent-8 leading-loose">
                  ពិតជាបានសិក្សានៅ <span className="font-semibold">{viewingLetter.fromSchool}</span> ហើយត្រូវបានអនុញ្ញាតឱ្យផ្ទេរការសិក្សាទៅកាន់ <span className="font-bold text-blue-900">{viewingLetter.toSchool}</span> {viewingLetter.toDistrictProvince ? `(ស្ថិតនៅ ${viewingLetter.toDistrictProvince})` : ''} ដោយសារមូលហេតុ៖ <span className="font-medium underline decoration-slate-400">{viewingLetter.reason}</span>។
                </p>

                <p className="indent-8 leading-loose">
                  សាលាបានប្រគល់ជូននូវសៀវភៅតាមដានការសិក្សា ព្រឹត្តិបត្រពិន្ទុ និងឯកសារពាក់ព័ន្ធផ្សេងៗជូនសាមីខ្លួន និងអាណាព្យាបាល ដើម្បីយកទៅចុះឈ្មោះចូលរៀននៅសាលារៀនថ្មីស្របតាមច្បាប់និងបទបញ្ជាផ្ទៃក្នុងរបស់ក្រសួងអប់រំ យុវជន និងកីឡា។
                </p>

                {viewingLetter.notes && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">កំណត់សម្គាល់៖ </span>
                    {viewingLetter.notes}
                  </div>
                )}
              </div>

              {/* Signatures Area */}
              <div className="mt-12 grid grid-cols-3 gap-4 text-center text-xs sm:text-sm relative z-1">
                <div>
                  <p className="font-semibold text-slate-700">បានឃើញ និងឯកភាព</p>
                  <p className="font-bold text-slate-900 font-moul mt-1">អាណាព្យាបាលសិស្ស</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-800">{viewingLetter.guardianName || '...............................'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">អ្នកធ្វើលិខិត</p>
                  <p className="font-bold text-slate-900 font-moul mt-1">លេខាធិការ / គ្រូបន្ទុក</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-800">{viewingLetter.officerName || '...............................'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">ថ្ងៃទី........ខែ........ឆ្នាំ២០២...</p>
                  <p className="font-bold font-moul text-slate-900 mt-1">នាយិកាសាលា</p>
                  <div className="h-20"></div>
                  <p className="font-bold font-moul text-blue-950">{schoolProfile.principalName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
