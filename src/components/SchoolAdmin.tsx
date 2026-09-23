import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  OfficialCorrespondence,
  StaffAdministrativeRecord,
  SchoolCommittee,
  CorrespondenceType,
  CorrespondenceUrgency,
  CorrespondenceClassification,
  StaffActionType
} from '../types';
import {
  FileText,
  Send,
  Inbox,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Building,
  Tag,
  Phone,
  Printer,
  ChevronRight,
  ChevronDown,
  History,
  Layers
} from 'lucide-react';
import { RecentActivityDashboard } from './RecentActivityDashboard';
import { GroupManagement } from './GroupManagement';

export const SchoolAdmin: React.FC = () => {
  const {
    correspondences,
    addCorrespondence,
    updateCorrespondence,
    deleteCorrespondence,
    staffAdminRecords,
    addStaffAdminRecord,
    updateStaffAdminRecord,
    deleteStaffAdminRecord,
    schoolCommittees,
    addSchoolCommittee,
    updateSchoolCommittee,
    deleteSchoolCommittee,
    schoolGroups,
    teachers,
    schoolProfile,
    showToast,
    activityLogs,
    selectedAcademicYear
  } = useSchool();

  // Active Tab within School Admin
  const [adminTab, setAdminTab] = useState<'correspondence' | 'staff_records' | 'committees' | 'groups' | 'audit_logs'>('correspondence');

  // Search & Filter States
  const [corSearch, setCorSearch] = useState('');
  const [corTypeFilter, setCorTypeFilter] = useState<'all' | 'inward' | 'outward'>('all');
  const [corClassFilter, setCorClassFilter] = useState<string>('all');

  const [staffSearch, setStaffSearch] = useState('');
  const [staffTypeFilter, setStaffTypeFilter] = useState<string>('all');

  // Modals
  const [isCorModalOpen, setIsCorModalOpen] = useState(false);
  const [editingCor, setEditingCor] = useState<OfficialCorrespondence | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffRec, setEditingStaffRec] = useState<StaffAdministrativeRecord | null>(null);

  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [editingComm, setEditingComm] = useState<SchoolCommittee | null>(null);

  // Correspondence Form State
  const [corForm, setCorForm] = useState<Omit<OfficialCorrespondence, 'id'>>({
    type: 'inward',
    logNumber: '',
    referenceNumber: '',
    docDate: new Date().toISOString().split('T')[0],
    receivedOrSentDate: new Date().toISOString().split('T')[0],
    subject: '',
    senderOrRecipient: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
    urgency: 'normal',
    classification: 'official_letter',
    responsibleStaffName: schoolProfile.directorNameKhmer || '',
    notes: '',
    status: 'completed',
    academicYear: selectedAcademicYear
  });

  // Staff Record Form State
  const [staffForm, setStaffForm] = useState<Omit<StaffAdministrativeRecord, 'id'>>({
    type: 'mission_order',
    staffId: '',
    staffName: '',
    staffRole: 'គ្រូបង្រៀន',
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    durationDays: 1,
    reasonOrMission: '',
    destinationOrLocation: '',
    status: 'approved',
    approvedBy: schoolProfile.directorNameKhmer || 'នាយកសាលា',
    approvedDate: new Date().toISOString().split('T')[0],
    documentRefNumber: '',
    remarks: '',
    createdAt: new Date().toISOString().split('T')[0]
  });

  // Committee Form State
  const [commForm, setCommForm] = useState<Omit<SchoolCommittee, 'id'>>({
    committeeName: '',
    decisionNumber: '',
    establishedDate: new Date().toISOString().split('T')[0],
    mandateYears: '២០២៤ - ២០២៦',
    members: [],
    mainResponsibilities: []
  });

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('សមាជិក');
  const [newMemberOrg, setNewMemberOrg] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const [newRespText, setNewRespText] = useState('');

  // Filtered Correspondences
  const filteredCorrespondences = useMemo(() => {
    return correspondences.filter(c => {
      const matchSearch =
        c.subject.toLowerCase().includes(corSearch.toLowerCase()) ||
        c.logNumber.toLowerCase().includes(corSearch.toLowerCase()) ||
        c.senderOrRecipient.toLowerCase().includes(corSearch.toLowerCase());

      const matchType = corTypeFilter === 'all' || c.type === corTypeFilter;
      const matchClass = corClassFilter === 'all' || c.classification === corClassFilter;

      return matchSearch && matchType && matchClass;
    });
  }, [correspondences, corSearch, corTypeFilter, corClassFilter]);

  // Filtered Staff Records
  const filteredStaffRecords = useMemo(() => {
    return staffAdminRecords.filter(r => {
      const matchSearch =
        r.staffName.toLowerCase().includes(staffSearch.toLowerCase()) ||
        r.title.toLowerCase().includes(staffSearch.toLowerCase()) ||
        (r.reasonOrMission && r.reasonOrMission.toLowerCase().includes(staffSearch.toLowerCase())) ||
        (r.destinationOrLocation && r.destinationOrLocation.toLowerCase().includes(staffSearch.toLowerCase()));

      const matchType = staffTypeFilter === 'all' || r.type === staffTypeFilter;

      return matchSearch && matchType;
    });
  }, [staffAdminRecords, staffSearch, staffTypeFilter]);

  // Open Correspondence Modal
  const handleOpenCorModal = (cor?: OfficialCorrespondence) => {
    if (cor) {
      setEditingCor(cor);
      setCorForm({
        type: cor.type,
        logNumber: cor.logNumber,
        referenceNumber: cor.referenceNumber || '',
        docDate: cor.docDate,
        receivedOrSentDate: cor.receivedOrSentDate,
        subject: cor.subject,
        senderOrRecipient: cor.senderOrRecipient,
        urgency: cor.urgency,
        classification: cor.classification,
        responsibleStaffName: cor.responsibleStaffName || '',
        notes: cor.notes || '',
        status: cor.status,
        academicYear: cor.academicYear || selectedAcademicYear
      });
    } else {
      setEditingCor(null);
      const nextNum = correspondences.filter(c => c.type === 'inward').length + 1;
      setCorForm({
        type: 'inward',
        logNumber: `លខ/ចូល-${String(nextNum).padStart(3, '0')}`,
        referenceNumber: '',
        docDate: new Date().toISOString().split('T')[0],
        receivedOrSentDate: new Date().toISOString().split('T')[0],
        subject: '',
        senderOrRecipient: 'មន្ទីរអប់រំ យុវជន និងកីឡា',
        urgency: 'normal',
        classification: 'official_letter',
        responsibleStaffName: schoolProfile.directorNameKhmer || '',
        notes: '',
        status: 'completed',
        academicYear: selectedAcademicYear
      });
    }
    setIsCorModalOpen(true);
  };

  const handleSaveCor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corForm.logNumber || !corForm.subject || !corForm.senderOrRecipient) {
      showToast('សូមបំពេញព័ត៌មានចាំបាច់អោយបានគ្រប់គ្រាន់!', 'error');
      return;
    }

    if (editingCor) {
      updateCorrespondence(editingCor.id, corForm);
    } else {
      addCorrespondence(corForm);
    }
    setIsCorModalOpen(false);
  };

  // Open Staff Record Modal
  const handleOpenStaffModal = (rec?: StaffAdministrativeRecord) => {
    if (rec) {
      setEditingStaffRec(rec);
      setStaffForm({
        staffId: rec.staffId,
        staffName: rec.staffName,
        staffRole: rec.staffRole,
        type: rec.type,
        title: rec.title,
        startDate: rec.startDate,
        endDate: rec.endDate,
        durationDays: rec.durationDays,
        reasonOrMission: rec.reasonOrMission,
        destinationOrLocation: rec.destinationOrLocation || '',
        status: rec.status,
        approvedBy: rec.approvedBy || schoolProfile.directorNameKhmer || 'នាយកសាលា',
        approvedDate: rec.approvedDate || new Date().toISOString().split('T')[0],
        documentRefNumber: rec.documentRefNumber || '',
        remarks: rec.remarks || '',
        createdAt: rec.createdAt
      });
    } else {
      setEditingStaffRec(null);
      const defaultTeacher = teachers[0];
      setStaffForm({
        staffId: defaultTeacher ? defaultTeacher.id : '',
        staffName: defaultTeacher ? defaultTeacher.nameKhmer : '',
        staffRole: defaultTeacher ? defaultTeacher.position || 'គ្រូបង្រៀន' : 'គ្រូបង្រៀន',
        type: 'leave_request',
        title: 'សុំច្បាប់ឈប់សម្រាកធុរៈផ្ទាល់ខ្លួន',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        durationDays: 1,
        reasonOrMission: 'មានធុរៈចាំបាច់ក្នុងក្រុមគ្រួសារ',
        destinationOrLocation: '',
        status: 'approved',
        approvedBy: schoolProfile.directorNameKhmer || 'នាយកសាលា',
        approvedDate: new Date().toISOString().split('T')[0],
        documentRefNumber: `ច្ប-${new Date().getFullYear()}-${String(staffAdminRecords.length + 1).padStart(3, '0')}`,
        remarks: '',
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaffRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.staffName || !staffForm.title) {
      showToast('សូមបំពេញឈ្មោះបុគ្គលិក និងកម្មវត្ថុ!', 'error');
      return;
    }

    if (editingStaffRec) {
      updateStaffAdminRecord(editingStaffRec.id, staffForm);
    } else {
      addStaffAdminRecord(staffForm);
    }
    setIsStaffModalOpen(false);
  };

  // Open Committee Modal
  const handleOpenCommModal = (comm?: SchoolCommittee) => {
    if (comm) {
      setEditingComm(comm);
      setCommForm({
        committeeName: comm.committeeName,
        decisionNumber: comm.decisionNumber,
        establishedDate: comm.establishedDate,
        mandateYears: comm.mandateYears,
        members: [...comm.members],
        mainResponsibilities: [...comm.mainResponsibilities]
      });
    } else {
      setEditingComm(null);
      setCommForm({
        committeeName: 'គណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.ក.ស.)',
        decisionNumber: `សេចក្តីសម្រេចលេខ ០${schoolCommittees.length + 1}/${new Date().getFullYear().toString().slice(-2)} សបក`,
        establishedDate: new Date().toISOString().split('T')[0],
        mandateYears: '២០២៤ - ២០២៦ (អាណត្តិ ២ឆ្នាំ)',
        members: [],
        mainResponsibilities: [
          'អនុម័តផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលារៀន (SDSP)',
          'ត្រួតពិនិត្យ និងតាមដានការប្រើប្រាស់ថវិកាដំណើរការសាលា (PB & SIG)',
          'កៀរគរធនធាន និងការចូលរួមពីសហគមន៍ដើម្បីជួសជុលហេដ្ឋារចនាសម្ព័ន្ធ'
        ]
      });
    }
    setIsCommModalOpen(true);
  };

  const handleAddMember = () => {
    if (!newMemberName) return;
    const newMember = {
      id: `cm-${Date.now()}`,
      name: newMemberName,
      roleInCommittee: newMemberRole,
      organizationOrPosition: newMemberOrg,
      phone: newMemberPhone
    };
    setCommForm(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    setNewMemberName('');
    setNewMemberOrg('');
    setNewMemberPhone('');
  };

  const handleRemoveMember = (id: string) => {
    setCommForm(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  const handleAddResponsibility = () => {
    if (!newRespText.trim()) return;
    setCommForm(prev => ({
      ...prev,
      mainResponsibilities: [...prev.mainResponsibilities, newRespText.trim()]
    }));
    setNewRespText('');
  };

  const handleRemoveResponsibility = (idx: number) => {
    setCommForm(prev => ({
      ...prev,
      mainResponsibilities: prev.mainResponsibilities.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commForm.committeeName || !commForm.decisionNumber) {
      showToast('សូមបំពេញឈ្មោះគណៈកម្មការ និងលេខសេចក្តីសម្រេច!', 'error');
      return;
    }
    if (editingComm) {
      updateSchoolCommittee(editingComm.id, commForm);
    } else {
      addSchoolCommittee(commForm);
    }
    setIsCommModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shadow-inner">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-moul text-blue-950 flex items-center gap-2">
                រដ្ឋបាល & លិខិតស្នាមសាលារៀន
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                សៀវភៅលិខិតចូល-ចេញផ្លូវការ • បេសកកម្ម & ច្បាប់ឈប់សម្រាក • គណៈកម្មការសាលារៀន
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block">លិខិតចូល-ចេញ</span>
              <span className="text-base font-bold text-blue-950">{correspondences.length} ច្បាប់</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block">គណៈកម្មការ</span>
              <span className="text-base font-bold text-emerald-800">{schoolCommittees.length} គណៈ</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setAdminTab('correspondence')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              adminTab === 'correspondence'
                ? 'bg-blue-800 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>សៀវភៅលិខិតចូល-ចេញ ({correspondences.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('staff_records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              adminTab === 'staff_records'
                ? 'bg-blue-800 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>បេសកកម្ម & ច្បាប់បុគ្គលិក ({staffAdminRecords.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('committees')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              adminTab === 'committees'
                ? 'bg-blue-800 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>គណៈកម្មការសាលារៀន ({schoolCommittees.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('groups')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              adminTab === 'groups'
                ? 'bg-blue-800 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>គ្រប់គ្រងក្រុម & ក្លឹបសិក្សា ({schoolGroups.length})</span>
          </button>
          <button
            onClick={() => setAdminTab('audit_logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              adminTab === 'audit_logs'
                ? 'bg-blue-800 text-white shadow-sm shadow-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>កំណត់ត្រាសកម្មភាព & សវនកម្ម ({activityLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CORRESPONDENCES */}
      {adminTab === 'correspondence' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមលេខកូដ, កម្មវត្ថុ..."
                  value={corSearch}
                  onChange={e => setCorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={corTypeFilter}
                onChange={e => setCorTypeFilter(e.target.value as any)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់ប្រភេទលិខិត</option>
                <option value="inward">លិខិតចូល (Inward)</option>
                <option value="outward">លិខិតចេញ (Outward)</option>
              </select>

              <select
                value={corClassFilter}
                onChange={e => setCorClassFilter(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់ប្រភេទឯកសារ</option>
                <option value="ministerial_directive">សារាចរ / សេចក្តីណែនាំក្រសួង</option>
                <option value="administrative_decision">សេចក្តីសម្រេច / បង្គាប់ការ</option>
                <option value="official_letter">លិខិតផ្លូវការ / លិខិតអញ្ជើញ</option>
                <option value="report_document">របាយការណ៍</option>
                <option value="mission_order">លិខិតបញ្ជាបេសកកម្ម</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenCorModal()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-xl font-medium text-sm hover:bg-blue-900 shadow-sm shadow-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាលិខិតថ្មី</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">ប្រភេទ</th>
                    <th className="py-3 px-4">លេខកត់ត្រា</th>
                    <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                    <th className="py-3 px-4 min-w-[220px]">កម្មវត្ថុ / ខ្លឹមសារសង្ខេប</th>
                    <th className="py-3 px-4">ស្ថាប័នផ្ញើ/ទទួល</th>
                    <th className="py-3 px-4">កម្រិតប្រញាប់</th>
                    <th className="py-3 px-4">អ្នកទទួលបន្ទុក</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCorrespondences.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        មិនមានទិន្នន័យលិខិតស្របតាមការស្វែងរកនេះទេ
                      </td>
                    </tr>
                  ) : (
                    filteredCorrespondences.map(cor => (
                      <tr key={cor.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          {cor.type === 'inward' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <Inbox className="w-3.5 h-3.5" />
                              <span>លិខិតចូល</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <Send className="w-3.5 h-3.5" />
                              <span>លិខិតចេញ</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {cor.logNumber}
                          {cor.referenceNumber && (
                            <span className="block text-[11px] text-slate-400 font-normal font-sans">
                              យោង: {cor.referenceNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          <div>{cor.receivedOrSentDate}</div>
                          {cor.docDate && <div className="text-slate-400">ចុះថ្ងៃ: {cor.docDate}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 line-clamp-2">{cor.subject}</p>
                          {cor.notes && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{cor.notes}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                          {cor.senderOrRecipient}
                        </td>
                        <td className="py-3 px-4">
                          {cor.urgency === 'most_urgent' && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">ប្រញាប់ណាស់</span>
                          )}
                          {cor.urgency === 'urgent' && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">ប្រញាប់</span>
                          )}
                          {cor.urgency === 'normal' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">ធម្មតា</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {cor.responsibleStaffName || '—'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenCorModal(cor)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="កែប្រែ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបលិខិតលេខ ${cor.logNumber} មែនទេ?`)) {
                                  deleteCorrespondence(cor.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="លុប"
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
        </div>
      )}

      {/* TAB 2: STAFF ADMINISTRATIVE RECORDS */}
      {adminTab === 'staff_records' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ, ទីកន្លែង..."
                  value={staffSearch}
                  onChange={e => setStaffSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={staffTypeFilter}
                onChange={e => setStaffTypeFilter(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">គ្រប់ប្រភេទឯកសារបុគ្គលិក</option>
                <option value="mission_order">លិខិតបញ្ជាបេសកកម្ម</option>
                <option value="leave_request">ពាក្យសុំច្បាប់ឈប់សម្រាក</option>
                <option value="commendation">ប័ណ្ណសរសើរ / លើកទឹកចិត្ត</option>
                <option value="appraisal">ការវាយតម្លៃការងារ</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenStaffModal()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-xl font-medium text-sm hover:bg-blue-900 shadow-sm shadow-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាបេសកកម្ម/ច្បាប់ថ្មី</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">ប្រភេទ</th>
                    <th className="py-3 px-4">ឈ្មោះបុគ្គលិក</th>
                    <th className="py-3 px-4 min-w-[200px]">កម្មវត្ថុ / ខ្លឹមសារ</th>
                    <th className="py-3 px-4">រយៈពេល & កាលបរិច្ឆេទ</th>
                    <th className="py-3 px-4">ទីកន្លែង/មូលហេតុ</th>
                    <th className="py-3 px-4">ស្ថានភាព</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaffRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        មិនមានទិន្នន័យឯកសារបុគ្គលិកនៅឡើយទេ
                      </td>
                    </tr>
                  ) : (
                    filteredStaffRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            rec.type === 'mission_order'
                              ? 'bg-blue-100 text-blue-800'
                              : rec.type === 'leave_request'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {rec.type === 'mission_order' && 'បេសកកម្ម'}
                            {rec.type === 'leave_request' && 'សុំច្បាប់'}
                            {rec.type === 'commendation' && 'ប័ណ្ណសរសើរ'}
                            {rec.type === 'appraisal' && 'វាយតម្លៃ'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{rec.staffName}</div>
                          <div className="text-xs text-slate-400">{rec.staffRole}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{rec.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{rec.reasonOrMission}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700 whitespace-nowrap">
                          <div className="font-bold text-blue-900">{rec.durationDays} ថ្ងៃ</div>
                          <div className="text-slate-500">{rec.startDate} ដល់ {rec.endDate}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {rec.destinationOrLocation || rec.reasonOrMission}
                        </td>
                        <td className="py-3 px-4">
                          {rec.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">បានអនុម័ត</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">រង់ចាំ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenStaffModal(rec)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="កែប្រែ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?`)) {
                                  deleteStaffAdminRecord(rec.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="លុប"
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
        </div>
      )}

      {/* TAB 3: COMMITTEES */}
      {adminTab === 'committees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              បញ្ជីគណៈកម្មការគ្រប់គ្រង & អភិវឌ្ឍន៍សាលារៀន
            </h2>
            <button
              onClick={() => handleOpenCommModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-xl font-medium text-sm hover:bg-blue-900 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>បង្កើតគណៈកម្មការថ្មី</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolCommittees.map(comm => (
              <div key={comm.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-blue-950 font-moul">{comm.committeeName}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {comm.decisionNumber} • អាណត្តិ: {comm.mandateYears}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 shrink-0">
                      {comm.members.length} សមាជិក
                    </span>
                  </div>

                  {/* Members List */}
                  <div className="mt-3 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">សមាសភាពសមាជិក៖</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {comm.members.map(m => (
                        <div key={m.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                          <div>
                            <span className="font-bold text-slate-900">{m.name}</span>
                            <span className="text-blue-800 font-semibold ml-2">({m.roleInCommittee})</span>
                            <span className="text-slate-400 block text-[11px]">{m.organizationOrPosition}</span>
                          </div>
                          {m.phone && (
                            <span className="text-slate-600 font-mono text-[11px]">{m.phone}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responsibilities */}
                  {comm.mainResponsibilities && comm.mainResponsibilities.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 mb-1.5">តួនាទី & ភារកិច្ចចម្បង៖</h4>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                        {comm.mainResponsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenCommModal(comm)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>កែប្រែ</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`តើលោកអ្នកពិតជាចង់លុប «${comm.committeeName}» មែនទេ?`)) {
                        deleteSchoolCommittee(comm.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុប</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCHOOL GROUPS & CLUBS */}
      {adminTab === 'groups' && (
        <div className="space-y-4">
          <GroupManagement />
        </div>
      )}

      {/* TAB 5: AUDIT & ACTIVITY LOGS */}
      {adminTab === 'audit_logs' && (
        <div className="space-y-4">
          <RecentActivityDashboard />
        </div>
      )}

      {/* MODAL 1: ADD/EDIT CORRESPONDENCE */}
      {isCorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <h2 className="text-lg font-bold font-moul text-blue-950 mb-4">
              {editingCor ? 'កែប្រែកំណត់ត្រាលិខិត' : 'កត់ត្រាលិខិតថ្មី'}
            </h2>

            <form onSubmit={handleSaveCor} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទលិខិត *</label>
                  <select
                    value={corForm.type}
                    onChange={e => setCorForm({ ...corForm, type: e.target.value as CorrespondenceType })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="inward">លិខិតចូល (Inward)</option>
                    <option value="outward">លិខិតចេញ (Outward)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">លេខកត់ត្រាក្នុងសៀវភៅ *</label>
                  <input
                    type="text"
                    required
                    value={corForm.logNumber}
                    onChange={e => setCorForm({ ...corForm, logNumber: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">កម្មវត្ថុ / ខ្លឹមសារសង្ខេប *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ស្តីពីការអនុវត្តកម្មវិធីអាន និងសរសេរភាសាខ្មែរថ្នាក់ដំបូង"
                  value={corForm.subject}
                  onChange={e => setCorForm({ ...corForm, subject: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ស្ថាប័នផ្ញើមក / ទទួល *</label>
                  <input
                    type="text"
                    required
                    value={corForm.senderOrRecipient}
                    onChange={e => setCorForm({ ...corForm, senderOrRecipient: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទឯកសារ</label>
                  <select
                    value={corForm.classification}
                    onChange={e => setCorForm({ ...corForm, classification: e.target.value as CorrespondenceClassification })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="ministerial_directive">សារាចរ / សេចក្តីណែនាំក្រសួង</option>
                    <option value="administrative_decision">សេចក្តីសម្រេច / បង្គាប់ការ</option>
                    <option value="official_letter">លិខិតផ្លូវការ / លិខិតអញ្ជើញ</option>
                    <option value="report_document">របាយការណ៍បូកសរុប</option>
                    <option value="mission_order">លិខិតបញ្ជាបេសកកម្ម</option>
                    <option value="transfer_document">លិខិតផ្ទេរ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កាលបរិច្ឆេទចូល/ចេញ</label>
                  <input
                    type="date"
                    value={corForm.receivedOrSentDate}
                    onChange={e => setCorForm({ ...corForm, receivedOrSentDate: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">កម្រិតប្រញាប់</label>
                  <select
                    value={corForm.urgency}
                    onChange={e => setCorForm({ ...corForm, urgency: e.target.value as CorrespondenceUrgency })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="normal">ធម្មតា</option>
                    <option value="urgent">ប្រញាប់</option>
                    <option value="most_urgent">ប្រញាប់ណាស់</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អ្នកទទួលបន្ទុកអនុវត្ត</label>
                <input
                  type="text"
                  value={corForm.responsibleStaffName}
                  onChange={e => setCorForm({ ...corForm, responsibleStaffName: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCorModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-blue-800 text-white rounded-xl hover:bg-blue-900 shadow-sm transition-colors"
                >
                  {editingCor ? 'រក្សាទុក' : 'កត់ត្រាលិខិត'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT STAFF RECORD */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <h2 className="text-lg font-bold font-moul text-blue-950 mb-4">
              {editingStaffRec ? 'កែប្រែកំណត់ត្រាបុគ្គលិក' : 'កត់ត្រាបេសកកម្ម / ច្បាប់ឈប់សម្រាក'}
            </h2>

            <form onSubmit={handleSaveStaffRec} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទឯកសារ *</label>
                  <select
                    value={staffForm.type}
                    onChange={e => setStaffForm({ ...staffForm, type: e.target.value as StaffActionType })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="mission_order">លិខិតបញ្ជាបេសកកម្ម</option>
                    <option value="leave_request">ពាក្យសុំច្បាប់ឈប់សម្រាក</option>
                    <option value="commendation">ប័ណ្ណសរសើរ / លើកទឹកចិត្ត</option>
                    <option value="appraisal">ការវាយតម្លៃការងារ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ជ្រើសរើសបុគ្គលិក *</label>
                  <select
                    value={staffForm.staffId}
                    onChange={e => {
                      const sel = teachers.find(t => t.id === e.target.value);
                      if (sel) {
                        setStaffForm({
                          ...staffForm,
                          staffId: sel.id,
                          staffName: sel.nameKhmer,
                          staffRole: sel.position || 'គ្រូបង្រៀន'
                        });
                      }
                    }}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nameKhmer} ({t.position || 'គ្រូបង្រៀន'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">កម្មវត្ថុ / ខ្លឹមសារការងារ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. បេសកកម្មចូលរួមវគ្គបណ្តុះបណ្តាល STEM"
                  value={staffForm.title}
                  onChange={e => setStaffForm({ ...staffForm, title: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ថ្ងៃចាប់ផ្តើម</label>
                  <input
                    type="date"
                    value={staffForm.startDate}
                    onChange={e => setStaffForm({ ...staffForm, startDate: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ថ្ងៃបញ្ចប់</label>
                  <input
                    type="date"
                    value={staffForm.endDate}
                    onChange={e => setStaffForm({ ...staffForm, endDate: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ចំនួនថ្ងៃ</label>
                  <input
                    type="number"
                    min={1}
                    value={staffForm.durationDays}
                    onChange={e => setStaffForm({ ...staffForm, durationDays: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ទីកន្លែងទៅ / មូលហេតុជាក់ស្ដែង</label>
                <input
                  type="text"
                  placeholder="ឧ. សាលាគរុកោសល្យខេត្តបាត់ដំបង"
                  value={staffForm.destinationOrLocation}
                  onChange={e => setStaffForm({ ...staffForm, destinationOrLocation: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-blue-800 text-white rounded-xl hover:bg-blue-900 shadow-sm transition-colors"
                >
                  {editingStaffRec ? 'រក្សាទុក' : 'កត់ត្រា'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD/EDIT COMMITTEE */}
      {isCommModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
            <h2 className="text-lg font-bold font-moul text-blue-950 mb-4">
              {editingComm ? 'កែប្រែគណៈកម្មការ' : 'បង្កើតគណៈកម្មការថ្មី'}
            </h2>

            <form onSubmit={handleSaveCommittee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះគណៈកម្មការ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. គណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.ក.ស.)"
                  value={commForm.committeeName}
                  onChange={e => setCommForm({ ...commForm, committeeName: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">លេខសេចក្តីសម្រេចបង្កើត *</label>
                  <input
                    type="text"
                    required
                    value={commForm.decisionNumber}
                    onChange={e => setCommForm({ ...commForm, decisionNumber: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">អាណត្តិ</label>
                  <input
                    type="text"
                    value={commForm.mandateYears}
                    onChange={e => setCommForm({ ...commForm, mandateYears: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Members Builder */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">បន្ថែមសមាជិកគណៈកម្មការ</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="ឈ្មោះ"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="តួនាទី (ឧ. ប្រធាន)"
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="អង្គភាព/មុខតំណែង"
                    value={newMemberOrg}
                    onChange={e => setNewMemberOrg(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="text-xs bg-blue-800 text-white rounded-lg p-2 font-medium hover:bg-blue-900"
                  >
                    + បន្ថែម
                  </button>
                </div>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {commForm.members.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                      <span><b>{m.name}</b> ({m.roleInCommittee}) - {m.organizationOrPosition}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        លុប
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCommModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-blue-800 text-white rounded-xl hover:bg-blue-900 shadow-sm transition-colors"
                >
                  {editingComm ? 'រក្សាទុក' : 'បង្កើតគណៈកម្មការ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
