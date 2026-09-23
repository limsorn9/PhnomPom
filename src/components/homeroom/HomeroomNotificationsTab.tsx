import React, { useState, useMemo } from 'react';
import {
  Student,
  Teacher,
  ParentRequest,
  ParentRequestType,
  ParentRequestUrgency,
  ParentMeeting,
  DailyAttendanceRecord,
  StudentScoreRecord,
  SystemNotification
} from '../../types';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Send,
  Phone,
  User,
  Users,
  FileText,
  Filter,
  Search,
  Plus,
  Printer,
  Sparkles,
  ShieldAlert,
  HeartPulse,
  Info,
  CalendarClock,
  ArrowRight,
  MessageSquare,
  Check,
  ChevronRight,
  UserX,
  TrendingDown
} from 'lucide-react';

interface HomeroomNotificationsTabProps {
  selectedGrade: number;
  selectedSection: string;
  students: Student[];
  currentTeacher?: Teacher;
  parentRequests: ParentRequest[];
  onAddParentRequest: (req: Omit<ParentRequest, 'id' | 'createdAt'>) => void;
  onUpdateParentRequest: (id: string, updated: Partial<ParentRequest>) => void;
  onResolveParentRequest: (id: string, reply: string, status?: 'approved' | 'resolved' | 'rejected') => void;
  onDeleteParentRequest: (id: string) => void;
  parentMeetings: ParentMeeting[];
  onGoToMeetingsTab: () => void;
  attendanceRecords: DailyAttendanceRecord[];
  scores: StudentScoreRecord[];
  onRecordAttendancePermission?: (studentId: string, date: string) => void;
}

export const HomeroomNotificationsTab: React.FC<HomeroomNotificationsTabProps> = ({
  selectedGrade,
  selectedSection,
  students,
  currentTeacher,
  parentRequests,
  onAddParentRequest,
  onUpdateParentRequest,
  onResolveParentRequest,
  onDeleteParentRequest,
  parentMeetings,
  onGoToMeetingsTab,
  attendanceRecords,
  scores,
  onRecordAttendancePermission
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active view: 'all' | 'requests' | 'meetings' | 'student_alerts'
  const [activeCategory, setActiveCategory] = useState<'all' | 'requests' | 'meetings' | 'alerts'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [replyingRequest, setReplyingRequest] = useState<ParentRequest | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'approved' | 'resolved' | 'rejected'>('resolved');
  const [printingRequest, setPrintingRequest] = useState<ParentRequest | null>(null);

  // New Request Form State
  const [newStudentId, setNewStudentId] = useState('');
  const [newReqType, setNewReqType] = useState<ParentRequestType>('leave_request');
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newUrgency, setNewUrgency] = useState<ParentRequestUrgency>('urgent');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('ឪពុក');
  const [newTargetDate, setNewTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDurationDays, setNewDurationDays] = useState(1);

  // Filter students belonging to this class
  const classStudents = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [students, selectedGrade, selectedSection]);

  // Filter parent requests for this class
  const classParentRequests = useMemo(() => {
    return parentRequests.filter(r => r.grade === selectedGrade && r.section === selectedSection);
  }, [parentRequests, selectedGrade, selectedSection]);

  // Filter upcoming meetings for this class (or schoolwide)
  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return parentMeetings
      .filter(m => m.grade === selectedGrade && m.section === selectedSection && m.status === 'upcoming')
      .sort((a, b) => a.meetingDate.localeCompare(b.meetingDate));
  }, [parentMeetings, selectedGrade, selectedSection]);

  // Automated Class Alerts
  const classAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      studentId: string;
      studentName: string;
      guardianName?: string;
      guardianPhone?: string;
      type: 'absence_risk' | 'low_score' | 'health';
      title: string;
      description: string;
      urgency: 'urgent' | 'immediate';
    }> = [];

    // 1. Identify students with 2+ unexcused absences
    classStudents.forEach(stu => {
      const stuAbsents = attendanceRecords.filter(
        a => a.studentId === stu.id && a.status === 'absent'
      );
      if (stuAbsents.length >= 2) {
        alerts.push({
          id: `alert-absent-${stu.id}`,
          studentId: stu.id,
          studentName: stu.nameKhmer,
          guardianName: stu.guardianName,
          guardianPhone: stu.guardianPhone,
          type: 'absence_risk',
          title: `អវត្តមានឥតច្បាប់ ${stuAbsents.length} លើក`,
          description: `សិស្ស «${stu.nameKhmer}» បានអវត្តមានគ្មានច្បាប់ចំនួន ${stuAbsents.length} លើក។ សូមទំនាក់ទំនងអាណាព្យាបាលជាបន្ទាន់។`,
          urgency: stuAbsents.length >= 3 ? 'immediate' : 'urgent'
        });
      }

      // 2. Low score risk
      const stuScores = scores.filter(s => s.studentId === stu.id);
      if (stuScores.length > 0) {
        const latest = stuScores[stuScores.length - 1];
        if (latest.averageScore < 5.0) {
          alerts.push({
            id: `alert-score-${stu.id}`,
            studentId: stu.id,
            studentName: stu.nameKhmer,
            guardianName: stu.guardianName,
            guardianPhone: stu.guardianPhone,
            type: 'low_score',
            title: `ពិន្ទុមធ្យមភាគប្រឈមធ្លាក់ (${latest.averageScore}/10)`,
            description: `លទ្ធផលប្រឡងប្រចាំខែចុងក្រោយទទួលបានពិន្ទុ ${latest.averageScore}/10 (ខ្សោយ)។ ត្រូវការពិគ្រោះជាមួយមាតាបិតាដើម្បីបំប៉នបន្ថែម។`,
            urgency: 'urgent'
          });
        }
      }
    });

    return alerts;
  }, [classStudents, attendanceRecords, scores]);

  // Statistics
  const pendingRequestsCount = classParentRequests.filter(r => r.status === 'pending').length;
  const urgentRequestsCount = classParentRequests.filter(
    r => (r.urgency === 'urgent' || r.urgency === 'immediate') && r.status === 'pending'
  ).length;

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return classParentRequests.filter(r => {
      const matchType = filterType === 'all' || r.requestType === filterType;
      const matchUrgency = filterUrgency === 'all' || r.urgency === filterUrgency;
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.parentName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q) ||
        r.parentPhone.includes(q);
      return matchType && matchUrgency && matchStatus && matchQ;
    });
  }, [classParentRequests, filterType, filterUrgency, filterStatus, searchQuery]);

  // When student selected in add modal, auto-fill parent info
  const handleStudentSelect = (stuId: string) => {
    setNewStudentId(stuId);
    const stu = classStudents.find(s => s.id === stuId);
    if (stu) {
      setNewParentName(stu.guardianName || 'អាណាព្យាបាល');
      setNewParentPhone(stu.guardianPhone || '');
      setNewRelationship('អាណាព្យាបាល');
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newTitle.trim() || !newDetails.trim()) return;

    const stu = classStudents.find(s => s.id === newStudentId);
    if (!stu) return;

    onAddParentRequest({
      studentId: stu.id,
      studentName: stu.nameKhmer,
      grade: selectedGrade,
      section: selectedSection,
      parentName: newParentName.trim() || stu.guardianName || 'អាណាព្យាបាល',
      parentPhone: newParentPhone.trim() || stu.guardianPhone || '',
      parentRelationship: newRelationship,
      requestType: newReqType,
      title: newTitle.trim(),
      details: newDetails.trim(),
      urgency: newUrgency,
      targetDate: newTargetDate,
      durationDays: newReqType === 'leave_request' ? Number(newDurationDays) : undefined,
      status: 'pending'
    });

    setShowAddModal(false);
    // Reset form
    setNewTitle('');
    setNewDetails('');
    setNewStudentId('');
  };

  const handleOpenReplyModal = (req: ParentRequest) => {
    setReplyingRequest(req);
    setReplyText(req.teacherReply || '');
    setReplyStatus(req.status === 'pending' ? 'approved' : (req.status as any));
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingRequest || !replyText.trim()) return;

    onResolveParentRequest(replyingRequest.id, replyText.trim(), replyStatus);

    // If approved leave request and teacher wants to mark attendance
    if (
      replyingRequest.requestType === 'leave_request' &&
      replyStatus === 'approved' &&
      replyingRequest.targetDate &&
      onRecordAttendancePermission
    ) {
      onRecordAttendancePermission(replyingRequest.studentId, replyingRequest.targetDate);
    }

    setReplyingRequest(null);
    setReplyText('');
  };

  const getUrgencyBadge = (urgency: ParentRequestUrgency) => {
    switch (urgency) {
      case 'immediate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            បន្ទាន់បំផុត (Immediate)
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            បន្ទាន់ (Urgent)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            ធម្មតា (Normal)
          </span>
        );
    }
  };

  const getTypeBadge = (type: ParentRequestType) => {
    switch (type) {
      case 'leave_request':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" />
            សុំច្បាប់ឈប់សម្រាក
          </span>
        );
      case 'consultation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Users className="w-3 h-3 text-purple-600" />
            សុំណាត់ជួបផ្ទាល់
          </span>
        );
      case 'health_alert':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <HeartPulse className="w-3 h-3 text-red-600" />
            ដំណឹងសុខភាព/អាឡែកហ្ស៊ី
          </span>
        );
      case 'academic_support':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            ជំនួយបំប៉នការសិក្សា
          </span>
        );
      case 'profile_update':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <User className="w-3 h-3 text-teal-600" />
            កែប្រែព័ត៌មានទាក់ទង
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
            <MessageSquare className="w-3 h-3" />
            មតិយោបល់ទូទៅ
          </span>
        );
    }
  };

  const getStatusBadge = (status: ParentRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            រង់ចាំការឆ្លើយតប
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            បានអនុម័ត/យល់ព្រម
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Check className="w-3 h-3" />
            បានឆ្លើយតបរួចរាល់
          </span>
        );
      case 'acknowledged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3 h-3" />
            បានជ្រាប/កត់ត្រា
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            មិនអនុញ្ញាត
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn font-battambang">
      {/* Top Notification Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Pending Parent Requests */}
        <div
          onClick={() => setActiveCategory('requests')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategory === 'requests'
              ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            {urgentRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {urgentRequestsCount} បន្ទាន់
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-500 font-medium">សំណើពីមាតាបិតារង់ចាំឆ្លើយតប</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5 font-times">
              {pendingRequestsCount} <span className="text-xs font-normal text-slate-500 font-battambang">/ {classParentRequests.length} សរុប</span>
            </p>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div
          onClick={() => setActiveCategory('meetings')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategory === 'meetings'
              ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
              គ.គ.ថ.
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-500 font-medium">កិច្ចប្រជុំមាតាបិតាជិតមកដល់</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5 font-times">
              {upcomingMeetings.length} <span className="text-xs font-normal text-slate-500 font-battambang">កិច្ចប្រជុំ</span>
            </p>
          </div>
        </div>

        {/* Student Risk & Alerts */}
        <div
          onClick={() => setActiveCategory('alerts')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategory === 'alerts'
              ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {classAlerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                ត្រូវការតាមដាន
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-500 font-medium">ការដាស់តឿនសិស្សក្នុងថ្នាក់</p>
            <p className="text-2xl font-bold text-rose-700 mt-0.5 font-times">
              {classAlerts.length} <span className="text-xs font-normal text-slate-500 font-battambang">ករណី</span>
            </p>
          </div>
        </div>

        {/* All Notifications Overview */}
        <div
          onClick={() => setActiveCategory('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
              ថ្នាក់ {selectedGrade}{selectedSection}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-500 font-medium">ការជូនដំណឹងសរុបទាំងអស់</p>
            <p className="text-2xl font-bold text-blue-900 mt-0.5 font-times">
              {classParentRequests.length + upcomingMeetings.length + classAlerts.length} <span className="text-xs font-normal text-slate-500 font-battambang">ដំណឹង</span>
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BAR: Category filter, Search, and Add Request button */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ទាំងអស់ ({classParentRequests.length + upcomingMeetings.length + classAlerts.length})
          </button>
          <button
            onClick={() => setActiveCategory('requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'requests'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            សំណើមាតាបិតា ({classParentRequests.length})
          </button>
          <button
            onClick={() => setActiveCategory('meetings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'meetings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            កិច្ចប្រជុំជិតមកដល់ ({upcomingMeetings.length})
          </button>
          <button
            onClick={() => setActiveCategory('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'alerts'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ដាស់តឿនសិស្ស ({classAlerts.length})
          </button>
        </div>

        {/* Right tools: Search & Add Request */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះសិស្ស, លេខទូរស័ព្ទ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>កត់ត្រាសំណើមាតាបិតាថ្មី</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: UPCOMING MEETINGS BANNER (Shown if category is 'all' or 'meetings') */}
      {(activeCategory === 'all' || activeCategory === 'meetings') && upcomingMeetings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
              <h3 className="text-sm font-bold text-slate-800 font-moul tracking-wide">
                កិច្ចប្រជុំមាតាបិតាដែលជិតមកដល់ (Upcoming Parent Meetings)
              </h3>
            </div>
            <button
              onClick={onGoToMeetingsTab}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              <span>គ្រប់គ្រងកិច្ចប្រជុំទាំងអស់</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {upcomingMeetings.map(meeting => {
              const meetingDateObj = new Date(meeting.meetingDate);
              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((meetingDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));
              const countdownLabel =
                diffDays === 0
                  ? '🔥 ថ្ងៃនេះ!'
                  : diffDays === 1
                  ? '⚡ ថ្ងៃស្អែកនេះ!'
                  : diffDays > 0
                  ? `⏳ នៅសល់ ${diffDays} ថ្ងៃទៀត`
                  : 'កន្លងផុត';

              return (
                <div
                  key={meeting.id}
                  className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

                  <div className="space-y-2.5 relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-xs">
                        {countdownLabel}
                      </span>
                      <span className="text-xs text-purple-200 font-mono">
                        ថ្នាក់ទី {meeting.grade} «{meeting.section}»
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base leading-snug text-white font-moul tracking-wide">
                      {meeting.meetingTitle}
                    </h4>

                    <div className="space-y-1.5 text-xs text-purple-100/90 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>កាលបរិច្ឆេទ៖ <strong>{meeting.meetingDate}</strong> ({meeting.meetingTime})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span>ទីតាំង៖ {meeting.location} • អញ្ជើញមាតាបិតា {meeting.totalParentsInvited} នាក់</span>
                      </div>
                    </div>

                    {meeting.agenda && meeting.agenda.length > 0 && (
                      <div className="bg-white/10 rounded-xl p-2.5 text-[11px] text-purple-100 border border-white/10 mt-2">
                        <span className="font-bold text-amber-300 block mb-1">របៀបវារៈសង្ខេប៖</span>
                        <ul className="list-disc list-inside space-y-0.5 opacity-90">
                          {meeting.agenda.slice(0, 2).map((ag, i) => (
                            <li key={i} className="truncate">{ag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2 mt-3 relative z-10">
                    <div className="text-[11px] text-purple-200">
                      គ្រូបន្ទុកថ្នាក់៖ {currentTeacher?.nameKhmer || 'លោកគ្រូ ចាន់ វុទ្ធី'}
                    </div>
                    <button
                      onClick={onGoToMeetingsTab}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>មើលរបៀបវារៈពេញលេញ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: STUDENT CLASS ALERTS (Shown if category is 'all' or 'alerts') */}
      {(activeCategory === 'all' || activeCategory === 'alerts') && classAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <h3 className="text-sm font-bold text-slate-800 font-moul tracking-wide">
              ការដាស់តឿនសិស្សក្នុងថ្នាក់ (Urgent Student Alerts)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        {alert.type === 'absence_risk' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                          {alert.studentName}
                        </h4>
                        <p className="text-[11px] font-bold text-rose-700">{alert.title}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {alert.urgency === 'immediate' ? 'បន្ទាន់បំផុត' : 'បន្ទាន់'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    អាណាព្យាបាល៖ <strong>{alert.guardianName || 'ឪពុកម្តាយ'}</strong>
                  </span>
                  {alert.guardianPhone ? (
                    <a
                      href={`tel:${alert.guardianPhone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>ទូរស័ព្ទ៖ {alert.guardianPhone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">គ្មានលេខទូរស័ព្ទ</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: PARENT REQUESTS LIST */}
      {(activeCategory === 'all' || activeCategory === 'requests') && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 font-moul tracking-wide">
                បញ្ជីសំណើ និងមតិយោបល់ពីមាតាបិតា (Parent Requests & Feedback)
              </h3>
            </div>

            {/* Sub Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">ប្រភេទសំណើ៖ ទាំងអស់</option>
                <option value="leave_request">សុំច្បាប់ឈប់សម្រាក</option>
                <option value="consultation">សុំណាត់ជួបផ្ទាល់</option>
                <option value="health_alert">ដំណឹងសុខភាព</option>
                <option value="academic_support">ជំនួយការសិក្សា</option>
                <option value="profile_update">កែប្រែព័ត៌មាន</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">ស្ថានភាព៖ ទាំងអស់</option>
                <option value="pending">រង់ចាំឆ្លើយតប</option>
                <option value="approved">បានអនុម័ត</option>
                <option value="resolved">បានដោះស្រាយរួច</option>
                <option value="acknowledged">បានជ្រាប</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">ពុំមានសំណើពីមាតាបិតានៅក្នុងថ្នាក់នេះទេ</p>
              <p className="text-xs text-slate-400">
                លោកគ្រូ-អ្នកគ្រូអាចកត់ត្រាសំណើថ្មីនៅពេលមាតាបិតាទាក់ទងមកតាមទូរស័ព្ទ ឬផ្ទាល់មាត់។
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredRequests.map(req => (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-3.5 ${
                    req.status === 'pending'
                      ? 'border-amber-200/90 bg-gradient-to-r from-amber-50/20 to-white'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Top line: Badges & Student Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(req.requestType)}
                      {getUrgencyBadge(req.urgency)}
                      {getStatusBadge(req.status)}
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      កាលបរិច្ឆេទផ្ញើ៖ {req.createdAt}
                    </span>
                  </div>

                  {/* Title & Details */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                      {req.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {req.details}
                    </p>
                  </div>

                  {/* Student & Guardian Info Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-slate-400">សិស្ស៖ </span>
                        <strong className="text-slate-800">{req.studentName}</strong>
                        <span className="text-slate-400 font-mono ml-1">
                          (ថ្នាក់ទី {req.grade}«{req.section}»)
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400">អាណាព្យាបាល៖ </span>
                        <strong className="text-slate-800">{req.parentName}</strong>
                      </div>

                      {req.targetDate && (
                        <div>
                          <span className="text-slate-400">
                            {req.requestType === 'leave_request' ? 'ថ្ងៃសុំច្បាប់៖ ' : 'ថ្ងៃណាត់ជួប៖ '}
                          </span>
                          <strong className="text-blue-700 font-mono">{req.targetDate}</strong>
                          {req.durationDays && (
                            <span className="text-slate-600 ml-1">({req.durationDays} ថ្ងៃ)</span>
                          )}
                        </div>
                      )}
                    </div>

                    {req.parentPhone && (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${req.parentPhone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold transition-all text-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{req.parentPhone}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Teacher Reply Section (If resolved or replied) */}
                  {req.teacherReply && (
                    <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          ការឆ្លើយតបរបស់គ្រូបន្ទុកថ្នាក់៖
                        </span>
                        {req.resolvedAt && (
                          <span className="text-[10px] text-blue-500 font-mono">
                            {req.resolvedAt}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{req.teacherReply}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReplyModal(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{req.teacherReply ? 'កែប្រែការឆ្លើយតប' : 'ឆ្លើយតប & ដោះស្រាយ'}</span>
                      </button>

                      {req.requestType === 'leave_request' && req.status === 'pending' && (
                        <button
                          onClick={() => {
                            onResolveParentRequest(
                              req.id,
                              'លោកគ្រូបានទទួល និងអនុញ្ញាតការសុំច្បាប់ឈប់សម្រាកនេះរួចរាល់។ សូមជួយថែរក្សាសុខភាពកូន។',
                              'approved'
                            );
                            if (req.targetDate && onRecordAttendancePermission) {
                              onRecordAttendancePermission(req.studentId, req.targetDate);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>យល់ព្រមច្បាប់ភ្លាមៗ</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintingRequest(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>បោះពុម្ពប័ណ្ណ</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('តើអ្នកពិតជាចង់លុបសំណើនេះមែនទេ?')) {
                            onDeleteParentRequest(req.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="លុបសំណើ"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD NEW PARENT REQUEST */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 font-moul text-sm">
                    កត់ត្រាសំណើថ្មីពីមាតាបិតា
                  </h3>
                  <p className="text-xs text-slate-500">
                    សម្រាប់ថ្នាក់ទី {selectedGrade} «{selectedSection}»
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ជ្រើសរើសសិស្ស <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newStudentId}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- សូមជ្រើសរើសឈ្មោះសិស្ស --</option>
                  {classStudents.map(stu => (
                    <option key={stu.id} value={stu.id}>
                      {stu.nameKhmer} ({stu.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Request Type & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ប្រភេទសំណើ</label>
                  <select
                    value={newReqType}
                    onChange={e => setNewReqType(e.target.value as ParentRequestType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="leave_request">សុំច្បាប់ឈប់សម្រាក</option>
                    <option value="consultation">សុំណាត់ជួបពិគ្រោះផ្ទាល់</option>
                    <option value="health_alert">ដំណឹងសុខភាព/អាឡែកហ្ស៊ី</option>
                    <option value="academic_support">ជំនួយបំប៉នការសិក្សា</option>
                    <option value="profile_update">កែប្រែព័ត៌មានទំនាក់ទំនង</option>
                    <option value="general_inquiry">មតិយោបល់ និងសំណួរទូទៅ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">កម្រិតបន្ទាន់</label>
                  <select
                    value={newUrgency}
                    onChange={e => setNewUrgency(e.target.value as ParentRequestUrgency)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">ធម្មតា (Normal)</option>
                    <option value="urgent">បន្ទាន់ (Urgent)</option>
                    <option value="immediate">បន្ទាន់បំផុត (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Parent Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ឈ្មោះអាណាព្យាបាល</label>
                  <input
                    type="text"
                    required
                    value={newParentName}
                    onChange={e => setNewParentName(e.target.value)}
                    placeholder="ឧ. លោក សុខ សារ៉េត"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">លេខទូរស័ព្ទទាក់ទង</label>
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={e => setNewParentPhone(e.target.value)}
                    placeholder="ឧ. 012 345 678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Target Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {newReqType === 'leave_request' ? 'កាលបរិច្ឆេទសុំច្បាប់' : 'កាលបរិច្ឆេទណាត់ជួប'}
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={e => setNewTargetDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {newReqType === 'leave_request' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ចំនួនថ្ងៃឈប់</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newDurationDays}
                      onChange={e => setNewDurationDays(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ចំណងជើងសំណើ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="ឧ. សុំច្បាប់ឈប់សម្រាក ២ ថ្ងៃដោយសារជំងឺគ្រុនក្តៅ"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ខ្លឹមសារលម្អិតនៃសំណើ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDetails}
                  onChange={e => setNewDetails(e.target.value)}
                  placeholder="សរសេរខ្លឹមសារលម្អិត ឬមូលហេតុ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  រក្សាទុកសំណើ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPLY & RESOLVE REQUEST */}
      {replyingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 font-moul text-sm">
                    ឆ្លើយតបសំណើមាតាបិតា
                  </h3>
                  <p className="text-xs text-slate-500">
                    សិស្ស៖ {replyingRequest.studentName} • {replyingRequest.parentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 text-xs text-slate-700">
              <p className="font-bold text-slate-800">{replyingRequest.title}</p>
              <p className="text-slate-600">{replyingRequest.details}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ស្ថានភាពបន្ទាប់ពីឆ្លើយតប
                </label>
                <select
                  value={replyStatus}
                  onChange={e => setReplyStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="approved">✅ អនុម័ត / យល់ព្រម (Approved)</option>
                  <option value="resolved">💬 បានឆ្លើយតប និងដោះស្រាយ (Resolved)</option>
                  <option value="rejected">❌ មិនអនុញ្ញាត / បដិសេធ (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  សារឆ្លើយតបទៅកាន់មាតាបិតា <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="សរសេរសារឆ្លើយតប ឬការណែនាំពីលោកគ្រូ-អ្នកគ្រូ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Template Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">គំរូសាររហ័ស៖</span>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText('លោកគ្រូបានទទួល និងអនុញ្ញាតការសុំច្បាប់នេះរួចរាល់។ សូមជួយរំលឹកកូនឱ្យមើលមេរៀន និងថែរក្សាសុខភាព។')
                  }
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
                >
                  យល់ព្រមសុំច្បាប់
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText('លោកគ្រូរីករាយនឹងជួបពិភាក្សាជាមួយអាណាព្យាបាលនៅម៉ោងចេញលេងថ្ងៃចន្ទ។ សូមអរគុណ។')
                  }
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
                >
                  យល់ព្រមណាត់ជួប
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText('បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានទំនាក់ទំនងក្នុងបញ្ជីថ្នាក់រៀនរួចរាល់។')
                  }
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
                >
                  បានកែសម្រួល
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>ផ្ញើការឆ្លើយតប</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT REQUEST / LEAVE SLIP */}
      {printingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 font-moul text-sm">
                ប័ណ្ណទំនាក់ទំនង និងសំណើសុំច្បាប់
              </h3>
              <button
                onClick={() => setPrintingRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-2 border-slate-300 rounded-xl space-y-4 bg-white text-slate-900 font-battambang">
              <div className="text-center space-y-1 border-b pb-3">
                <p className="font-moul text-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-[11px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <p className="text-xs font-bold pt-2">សាលាបឋមសិក្សាភ្នំពុំ</p>
                <p className="font-moul text-sm text-blue-950 pt-1">
                  {printingRequest.requestType === 'leave_request'
                    ? 'លិខិតសុំច្បាប់ឈប់សម្រាក'
                    : 'ប័ណ្ណទំនាក់ទំនងមាតាបិតា'}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <p>
                  <strong>ឈ្មោះសិស្ស៖</strong> {printingRequest.studentName} • <strong>ថ្នាក់ទី៖</strong> {printingRequest.grade} «{printingRequest.section}»
                </p>
                <p>
                  <strong>អាណាព្យាបាល៖</strong> {printingRequest.parentName} • <strong>ទូរស័ព្ទ៖</strong> {printingRequest.parentPhone || '—'}
                </p>
                <p>
                  <strong>កាលបរិច្ឆេទ៖</strong> {printingRequest.targetDate || printingRequest.createdAt} {printingRequest.durationDays ? `(${printingRequest.durationDays} ថ្ងៃ)` : ''}
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border">
                  <strong>មូលហេតុ / ខ្លឹមសារ៖</strong>
                  <p className="mt-1">{printingRequest.details}</p>
                </div>
                {printingRequest.teacherReply && (
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-950">
                    <strong>ការសម្រេចរបស់គ្រូបន្ទុកថ្នាក់៖</strong>
                    <p className="mt-1">{printingRequest.teacherReply}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 pt-6 text-center text-xs">
                <div>
                  <p className="font-bold">ហត្ថលេខាអាណាព្យាបាល</p>
                  <div className="h-12" />
                  <p className="text-slate-600">{printingRequest.parentName}</p>
                </div>
                <div>
                  <p className="font-bold">ហត្ថលេខាគ្រូបន្ទុកថ្នាក់</p>
                  <div className="h-12" />
                  <p className="text-slate-600">{currentTeacher?.nameKhmer || 'គ្រូបន្ទុកថ្នាក់'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPrintingRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                បិទ
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ព</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
