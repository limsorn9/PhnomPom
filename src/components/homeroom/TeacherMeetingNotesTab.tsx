import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherMeetingRecord, MeetingActionItem } from '../../types';
import { createTeacherMeetingGoogleCalendarEvent, PRIMARY_SCHOOL_DRIVE_FOLDER_ID } from '../../services/googleCalendar';
import { getAccessToken, googleSignIn } from '../../services/googleAuth';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Printer,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  FileText,
  Bookmark,
  CheckSquare,
  X,
  AlertCircle,
  HardDrive,
  CloudUpload,
  Check,
  FolderSync,
  Building2,
  UserCheck,
  ArrowRight,
  Send,
  CalendarCheck
} from 'lucide-react';

interface TeacherMeetingNotesTabProps {
  selectedGrade?: number;
  selectedSection?: string;
  isTeacherRole?: boolean;
}

export const TeacherMeetingNotesTab: React.FC<TeacherMeetingNotesTabProps> = ({
  selectedGrade,
  selectedSection,
  isTeacherRole = true
}) => {
  const {
    schoolProfile,
    teacherMeetings,
    addTeacherMeeting,
    updateTeacherMeeting,
    deleteTeacherMeeting,
    syncMeetingToDrive,
    syncAllMeetingsToDrive,
    syncFinancialReportToDrive,
    triggerDriveAutoSyncAll,
    selectedAcademicYear,
    isDriveSyncing,
    teachers,
    currentUser,
    showToast
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<TeacherMeetingRecord | null>(null);
  const [selectedMeetingForPrint, setSelectedMeetingForPrint] = useState<TeacherMeetingRecord | null>(null);
  const [selectedMeetingForDetail, setSelectedMeetingForDetail] = useState<TeacherMeetingRecord | null>(null);
  const [syncingMeetingId, setSyncingMeetingId] = useState<string | null>(null);
  const [syncingDriveMeetingId, setSyncingDriveMeetingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const TARGET_DRIVE_FOLDER_ID = PRIMARY_SCHOOL_DRIVE_FOLDER_ID; // 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g

  // Form State
  const initialForm = {
    title: '',
    meetingType: 'monthly' as 'monthly' | 'technical' | 'emergency' | 'curriculum' | 'disciplinary',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:30',
    location: 'សាលប្រជុំសាលាបឋមសិក្សា',
    chairPerson: schoolProfile.principalNameKhmer || 'លោក នាយកសាលា',
    secretary: currentUser?.nameKhmer || 'អ្នកគ្រូ កែវ ផល្លា',
    totalAttendees: teachers.length || 15,
    absentCount: 0,
    agendasInput: '១. ត្រួតពិនិត្យវត្តមាន និងកិច្ចតែងការបង្រៀនរបស់លោកគ្រូ-អ្នកគ្រូ\n២. តាមដានការជួយសិស្សរៀនយឺត និងការបំប៉នបន្ថែម\n៣. ការរៀបចំសម្ភាររូបវន្ត និងការងារថ្នាក់រៀន',
    keyDecisionsInput: '១. ឯកភាពអនុវត្តកម្មវិធីបំប៉នសិស្សរៀនយឺតរៀងរាល់រសៀលថ្ងៃព្រហស្បតិ៍\n២. គ្រូបន្ទុកថ្នាក់ទាំងអស់ត្រូវបូកសរុបពិន្ទុ និងវត្តមានឱ្យបានមុនថ្ងៃទី២៥ នៃខែនីមួយៗ\n៣. បង្កើនការអានសៀវភៅនៅបណ្ណាល័យយ៉ាងតិច ២ម៉ោងក្នុងមួយសប្តាហ៍សម្រាប់គ្រប់ថ្នាក់',
    actionItemsInput: 'បូកសរុបពិន្ទុ និងបញ្ជីវត្តមានប្រចាំខែ | គ្រូបន្ទុកថ្នាក់ទាំងអស់ | 2026-09-25\nរៀបចំកាលវិភាគបង្រៀនបង្ហាញ និងបំប៉ន | គណៈកម្មការបច្ចេកទេស | 2026-09-20\nត្រួតពិនិត្យអនាម័យតាមបន្ទប់រៀន | ក្រុមការងារបរិស្ថានសាលា | 2026-09-15',
    syncToGoogleCalendar: true
  };

  const [formData, setFormData] = useState(initialForm);

  // Quick resolution templates for Cambodian schools
  const resolutionTemplates = [
    {
      id: 'monthly_routine',
      name: 'គំរូសេចក្ដីសម្រេច៖ ប្រជុំប្រចាំខែទូទៅ',
      type: 'monthly',
      title: 'កិច្ចប្រជុំបូកសរុបការងារបង្រៀន និងរៀនប្រចាំខែ',
      agendas: '១. ត្រួតពិនិត្យវត្តមាន និងកិច្ចតែងការបង្រៀនរបស់លោកគ្រូ-អ្នកគ្រូ\n២. តាមដានសិស្សរៀនយឺត និងការបំប៉នបន្ថែម\n៣. ការគ្រប់គ្រង និងថែទាំសម្ភាររូបវន្តក្នុងសាលា',
      decisions: '១. ឯកភាពអនុវត្តកម្មវិធីបំប៉នសិស្សរៀនយឺតរៀងរាល់រសៀលថ្ងៃព្រហស្បតិ៍\n២. គ្រូបន្ទុកថ្នាក់ត្រូវបញ្ជូនបញ្ជីវត្តមាន និងពិន្ទុប្រចាំខែត្រឹមថ្ងៃទី២៧\n៣. បន្តរឹតបន្តឹងវិន័យ និងអនាម័យបរិស្ថានក្នុងបរិវេណសាលា',
      actions: 'រៀបចំបញ្ជីឈ្មោះសិស្សរៀនយឺតតាមថ្នាក់ | គ្រូបន្ទុកថ្នាក់ទាំងអស់ | 2026-09-10\nបូកសរុបស្ថិតិវត្តមានប្រចាំខែ | លេខាធិការដ្ឋាន | 2026-09-28'
    },
    {
      id: 'pedagogical',
      name: 'គំរូសេចក្ដីសម្រេច៖ ប្រជុំបច្ចេកទេសគរុកោសល្យ',
      type: 'technical',
      title: 'កិច្ចប្រជុំបច្ចេកទេស និងវិធីសាស្ត្របង្រៀនបែបសកម្ម',
      agendas: '១. ការចែករំលែកវិធីសាស្ត្របង្រៀនគណិតវិទ្យា និងភាសាខ្មែរថ្នាក់ដំបូង\n២. ការផលិត និងប្រើប្រាស់ឧបទេសបង្រៀន\n៣. ការរៀបចំផែនការបង្រៀនរួមគ្នា (Lesson Study)',
      decisions: '១. ឯកភាពបង្កើតក្រុមផលិតឧបទេសបង្រៀនប្រចាំកម្រិតថ្នាក់ (១-៣ និង ៤-៦)\n២. រៀបចំការបង្រៀនបង្ហាញ (Demonstration Lesson) ១ដងក្នុងមួយខែ\n៣. លើកកម្ពស់ការប្រើប្រាស់សម្ភាររូបីក្នុងការបង្រៀនលេខនព្វន្ត',
      actions: 'រៀបចំកាលវិភាគបង្រៀនបង្ហាញគំរូ | ប្រធានក្រុមបច្ចេកទេស | 2026-09-18\nប្រមូល និងចងក្រងកិច្ចតែងការគំរូ | គ្រូតំណាងកម្រិតថ្នាក់ | 2026-09-22'
    },
    {
      id: 'exam_prep',
      name: 'គំរូសេចក្ដីសម្រេច៖ ត្រៀមប្រឡងឆមាស',
      type: 'curriculum',
      title: 'កិច្ចប្រជុំរៀបចំដំណើរការប្រឡងឆមាស និងតេស្តស្ទង់សមត្ថភាព',
      agendas: '១. ការកំណត់កាលវិភាគ និងវិញ្ញាសាប្រឡង\n២. ការចាត់តាំងគណៈកម្មការរៀបចំវិញ្ញាសា អនុរក្ស និងកំណែ\n៣. បទបញ្ជាផ្ទៃក្នុង និងការប្រកាសលទ្ធផល',
      decisions: '១. ឯកភាពកាលបរិច្ឆេទប្រឡងឆមាសចាប់ពីថ្ងៃទី ១៥ ដល់ ១៨ នៃខែបន្ទាប់\n២. គណៈកម្មការវិញ្ញាសាត្រូវរក្សាការសម្ងាត់ និងផ្ទៀងផ្ទាត់កម្រិតស្តង់ដារ\n៣. ប្រជុំបូកសរុប និងចែកព្រឹត្តិបត្រពិន្ទុនៅសប្តាហ៍បន្ទាប់ពីកំណែរួច',
      actions: 'តាក់តែង និងផ្ទៀងផ្ទាត់វិញ្ញាសា | គណៈកម្មការវិញ្ញាសា | 2026-09-12\nបែងចែកបន្ទប់ និងបញ្ជីឈ្មោះសិស្ស | លេខាធិការដ្ឋាន | 2026-09-14'
    },
    {
      id: 'at_risk_support',
      name: 'គំរូសេចក្ដីសម្រេច៖ ការគាំទ្រសិស្សរៀនយឺត & អាកប្បកិរិយា',
      type: 'disciplinary',
      title: 'កិច្ចប្រជុំយុទ្ធសាស្ត្រជួយសិស្សរៀនយឺត និងការទប់ស្កាត់ការបោះបង់ការសិក្សា',
      agendas: '១. របាយការណ៍ស្ថិតិសិស្សអវត្តមានញឹកញាប់ និងសិស្សពិន្ទុទាប\n២. ការរៀបចំម៉ោងបំប៉នបន្ថែម និងការផ្គូផ្គងមិត្តជួយមិត្ត\n៣. ការចុះសួរសុខទុក្ខ និងជួបពិភាក្សាជាមួយអាណាព្យាបាលផ្ទាល់',
      decisions: '១. គ្រូបន្ទុកថ្នាក់ទាំងអស់ត្រូវកំណត់អត្តសញ្ញាណសិស្សរៀនយឺត និងធ្វើផែនការបំប៉នផ្ទាល់ខ្លួន\n២. ទំនាក់ទំនងជាមួយមាតាបិតាភ្លាមៗពេលសិស្សអវត្តមានលើសពី ២ថ្ងៃជាប់គ្នា\n៣. ប្រើប្រាស់សៀវភៅតាមដានការអាន និងលំហាត់ផ្ទះប្រចាំថ្ងៃ',
      actions: 'រៀបចំកាលវិភាគបំប៉នបន្ថែមតាមថ្នាក់ | គ្រូបន្ទុកថ្នាក់ទាំងអស់ | 2026-09-10\nជួបប្រជុំជាមួយមាតាបិតាសិស្សរៀនយឺត | គណៈគ្រប់គ្រង & គ្រូ | 2026-09-15'
    }
  ];

  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = resolutionTemplates.find(t => t.id === tmplId);
    if (!tmpl) return;
    setFormData(prev => ({
      ...prev,
      title: tmpl.title,
      meetingType: tmpl.type as any,
      agendasInput: tmpl.agendas,
      keyDecisionsInput: tmpl.decisions,
      actionItemsInput: tmpl.actions
    }));
    setSelectedTemplate(tmplId);
    showToast(`បានអនុវត្ត «${tmpl.name}» រួចរាល់!`, 'success');
  };

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    return teacherMeetings.filter(m => {
      const matchesType = filterType === 'all' || m.meetingType === filterType;
      const matchesMonth = filterMonth === 'all' || m.meetingDate.startsWith(filterMonth);
      const matchesSearch =
        searchTerm === '' ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.chairpersonName && m.chairpersonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.secretaryName && m.secretaryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.resolutions && m.resolutions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase())));

      return matchesType && matchesMonth && matchesSearch;
    });
  }, [teacherMeetings, filterType, filterMonth, searchTerm]);

  // Metrics
  const totalMeetings = teacherMeetings.length;
  const totalResolutions = teacherMeetings.reduce((acc, m) => acc + (m.resolutions?.length || 0), 0);
  const syncedCalendarCount = teacherMeetings.filter(m => m.isSyncedToGoogleCalendar).length;
  const syncedDriveCount = teacherMeetings.filter(m => m.isSyncedToGoogleDrive).length;

  // Handle Create or Update Meeting
  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងកិច្ចប្រជុំ!', 'error');
      return;
    }

    const agendas = formData.agendasInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const keyDecisions = formData.keyDecisionsInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const actionItems: MeetingActionItem[] = formData.actionItemsInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `act-${Date.now()}-${idx}`,
          taskTitle: parts[0] || line,
          responsiblePerson: parts[1] || 'គណៈគ្រប់គ្រង/គ្រូ',
          deadlineDate: parts[2] || formData.meetingDate,
          isCompleted: false
        };
      });

    let gCalEventId: string | undefined = editingMeeting?.googleCalendarEventId;
    let gCalHtmlLink: string | undefined = editingMeeting?.googleCalendarHtmlLink;

    const meetingPayload: Omit<TeacherMeetingRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      meetingCode: editingMeeting?.meetingCode || `MTG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      meetingType: formData.meetingType,
      academicYear: schoolProfile.academicYear,
      meetingDate: formData.meetingDate,
      meetingTime: `${formData.startTime} - ${formData.endTime}`,
      location: formData.location,
      chairpersonName: formData.chairPerson,
      secretaryName: formData.secretary,
      totalInvited: Number(formData.totalAttendees) || 15,
      totalPresent: Math.max(0, (Number(formData.totalAttendees) || 15) - (Number(formData.absentCount) || 0)),
      attendees: [],
      agendas,
      discussionSummary: formData.agendasInput,
      resolutions: keyDecisions,
      actionItems,
      isSyncedToGoogleCalendar: editingMeeting?.isSyncedToGoogleCalendar || false,
      googleCalendarEventId: gCalEventId,
      googleCalendarHtmlLink: gCalHtmlLink,
      status: 'approved'
    };

    if (formData.syncToGoogleCalendar) {
      try {
        let token = await getAccessToken();
        if (!token) {
          const authRes = await googleSignIn();
          if (authRes) {
            token = authRes.accessToken;
          }
        }

        if (token) {
          const res = await createTeacherMeetingGoogleCalendarEvent(
            {
              ...meetingPayload,
              id: editingMeeting?.id || 'temp_' + Date.now(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            schoolProfile,
            TARGET_DRIVE_FOLDER_ID
          );
          gCalEventId = res.eventId;
          gCalHtmlLink = res.htmlLink;
          meetingPayload.isSyncedToGoogleCalendar = true;
          meetingPayload.googleCalendarEventId = gCalEventId;
          meetingPayload.googleCalendarHtmlLink = gCalHtmlLink;
        }
      } catch (err) {
        console.warn('Could not auto-sync meeting to Google Calendar', err);
      }
    }

    if (editingMeeting) {
      updateTeacherMeeting(editingMeeting.id, {
        ...meetingPayload,
        googleCalendarEventId: gCalEventId,
        googleCalendarHtmlLink: gCalHtmlLink,
        isSyncedToGoogleCalendar: !!gCalEventId
      });
      showToast(`បានកែសម្រួលកំណត់ត្រាការប្រជុំ «${formData.title}» ជោគជ័យ!`, 'success');
    } else {
      addTeacherMeeting({
        ...meetingPayload,
        googleCalendarEventId: gCalEventId,
        googleCalendarHtmlLink: gCalHtmlLink,
        isSyncedToGoogleCalendar: !!gCalEventId
      });
      showToast(`បានកត់ត្រាកិច្ចប្រជុំ «${formData.title}» និងសេចក្ដីសម្រេចចិត្តជោគជ័យ!`, 'success');
    }

    setIsAddModalOpen(false);
    setEditingMeeting(null);
    setFormData(initialForm);
  };

  // Sync a single meeting to Google Calendar
  const handleSyncToCalendar = async (meeting: TeacherMeetingRecord) => {
    setSyncingMeetingId(meeting.id);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        }
      }

      if (!token) {
        showToast('សូមភ្ជាប់គណនី Google ជាមុនសិន ដើម្បី Sync ទៅ Google Calendar!', 'error');
        return;
      }

      const res = await createTeacherMeetingGoogleCalendarEvent(meeting, schoolProfile, TARGET_DRIVE_FOLDER_ID);
      if (res.success) {
        updateTeacherMeeting(meeting.id, {
          isSyncedToGoogleCalendar: true,
          googleCalendarEventId: res.eventId,
          googleCalendarHtmlLink: res.htmlLink,
          syncedAt: new Date().toISOString()
        });
        showToast(`បាន Sync កិច្ចប្រជុំ «${meeting.title}» ទៅ Google Calendar ជោគជ័យ!`, 'success');
      }
    } catch (err: any) {
      showToast(`បរាជ័យក្នុងការ Sync ទៅ Calendar: ${err.message}`, 'error');
    } finally {
      setSyncingMeetingId(null);
    }
  };

  // Sync meeting minutes doc to Google Drive Folder
  const handleSyncToDrive = async (meeting: TeacherMeetingRecord) => {
    setSyncingDriveMeetingId(meeting.id);
    try {
      await syncMeetingToDrive(meeting, TARGET_DRIVE_FOLDER_ID);
      showToast(`បាន Sync កំណត់ត្រាកិច្ចប្រជុំទៅ Google Drive Folder (ID: ${TARGET_DRIVE_FOLDER_ID}) រួចរាល់!`, 'success');
    } catch (err: any) {
      showToast(`បរាជ័យក្នុងការ Sync ទៅ Drive: ${err.message}`, 'error');
    } finally {
      setSyncingDriveMeetingId(null);
    }
  };

  const openEditModal = (m: TeacherMeetingRecord) => {
    setEditingMeeting(m);
    const times = (m.meetingTime || '14:00 - 16:30').split('-').map(t => t.trim());
    setFormData({
      title: m.title,
      meetingType: m.meetingType as any,
      meetingDate: m.meetingDate,
      startTime: times[0] || '14:00',
      endTime: times[1] || '16:30',
      location: m.location,
      chairPerson: m.chairpersonName,
      secretary: m.secretaryName,
      totalAttendees: m.totalInvited || 15,
      absentCount: Math.max(0, (m.totalInvited || 15) - (m.totalPresent || 15)),
      agendasInput: (m.agendas || []).join('\n'),
      keyDecisionsInput: (m.resolutions || []).join('\n'),
      actionItemsInput: (m.actionItems || []).map(a => `${a.taskTitle} | ${a.responsiblePerson} | ${a.deadlineDate}`).join('\n'),
      syncToGoogleCalendar: m.isSyncedToGoogleCalendar || false
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 font-battambang animate-fadeIn">
      {/* Top Banner & Folder ID Link Indicator */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>ប្រព័ន្ធកំណត់ត្រាការប្រជុំគ្រូ & សេចក្តីសម្រេចចិត្តផ្លូវការ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-moul tracking-wide">
              កំណត់ត្រាការប្រជុំគ្រូ និងសេចក្តីសម្រេចចិត្ត
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              កត់ត្រារបៀបវារៈ សេចក្តីសម្រេចចិត្ត និងផែនការសកម្មភាពបន្តរបស់អង្គប្រជុំគ្រូ ព្រមទាំងធ្វើសមកាលកម្ម (Sync) ទៅកាន់ <strong className="text-amber-300">Google Calendar</strong> និងតម្កល់ទុកក្នុង <strong className="text-blue-300">Google Drive Folder (ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)</strong>។
            </p>

            {/* Folder ID Pill */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Drive Folder ID: <strong className="text-white">1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g</strong></span>
              </span>

              <a
                href={`https://drive.google.com/drive/folders/${TARGET_DRIVE_FOLDER_ID}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium text-[11px] flex items-center gap-1 transition-all shadow-xs"
              >
                <span>បើកមើលក្នុង Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all shadow-xs"
              >
                <span>បើកមើល Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={async () => {
                try {
                  await triggerDriveAutoSyncAll();
                } catch (e) {
                  showToast('បញ្ហាក្នុងការ Sync ទៅ Google Drive', 'error');
                }
              }}
              disabled={isDriveSyncing}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              title="Sync កំណត់ហេតុប្រជុំ និងរបាយការណ៍ហិរញ្ញវត្ថុទាំងអស់ទៅ Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g"
            >
              <RefreshCw className={`w-4 h-4 ${isDriveSyncing ? 'animate-spin' : ''}`} />
              <span>{isDriveSyncing ? 'កំពុង Sync Drive...' : 'Sync ឯកសារទាំងអស់ទៅ Drive'}</span>
            </button>

            <button
              onClick={() => {
                setEditingMeeting(null);
                setFormData(initialForm);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាការប្រជុំថ្មី (New Minutes)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">កិច្ចប្រជុំសរុប</div>
            <div className="text-xl font-black text-slate-800">{totalMeetings} <span className="text-xs font-normal text-slate-400">លើក</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">សេចក្ដីសម្រេចចិត្ត</div>
            <div className="text-xl font-black text-slate-800">{totalResolutions} <span className="text-xs font-normal text-slate-400">ចំណុច</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Sync Google Calendar</div>
            <div className="text-xl font-black text-emerald-600">{syncedCalendarCount} <span className="text-xs font-normal text-slate-400">ប្រជុំ</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">តម្កល់លើ Google Drive</div>
            <div className="text-xl font-black text-indigo-600">{syncedDriveCount} <span className="text-xs font-normal text-slate-400">ឯកសារ</span></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង, ប្រធានអង្គប្រជុំ, លេខា ឬសេចក្តីសម្រេច..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">គ្រប់ប្រភេទកិច្ចប្រជុំ</option>
            <option value="monthly">ប្រជុំប្រចាំខែទូទៅ</option>
            <option value="technical">ប្រជុំបច្ចេកទេស/គរុកោសល្យ</option>
            <option value="curriculum">កម្មវិធីសិក្សា/ប្រឡង</option>
            <option value="emergency">ប្រជុំបន្ទាន់</option>
            <option value="disciplinary">វិន័យ & គាំទ្រសិស្ស</option>
          </select>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">គ្រប់ខែ</option>
            <option value="2026-08">ខែសីហា ២០២៦</option>
            <option value="2026-09">ខែកញ្ញា ២០២៦</option>
            <option value="2026-10">ខែតុលា ២០២៦</option>
            <option value="2026-11">ខែវិច្ឆិកា ២០២៦</option>
            <option value="2026-12">ខែធ្នូ ២០២៦</option>
          </select>
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">មិនទាន់មានកំណត់ត្រាការប្រជុំនៅឡើយទេ</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              លោកគ្រូ-អ្នកគ្រូអាចចុចប៊ូតុង «កត់ត្រាការប្រជុំថ្មី» ខាងលើ ដើម្បីសរសេរសេចក្តីសម្រេចចិត្តពីការប្រជុំ និងធ្វើការ Sync ទៅ Google Calendar និង Google Drive ដោយស្វ័យប្រវត្តិ។
            </p>
            <button
              onClick={() => {
                setEditingMeeting(null);
                setFormData(initialForm);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>កត់ត្រាការប្រជុំឥឡូវនេះ</span>
            </button>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      meeting.meetingType === 'monthly'
                        ? 'bg-blue-100 text-blue-800'
                        : meeting.meetingType === 'technical'
                        ? 'bg-indigo-100 text-indigo-800'
                        : meeting.meetingType === 'curriculum'
                        ? 'bg-purple-100 text-purple-800'
                        : meeting.meetingType === 'emergency'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {meeting.meetingType === 'monthly'
                        ? 'ប្រជុំប្រចាំខែ'
                        : meeting.meetingType === 'technical'
                        ? 'ប្រជុំបច្ចេកទេស'
                        : meeting.meetingType === 'curriculum'
                        ? 'កម្មវិធីសិក្សា/ប្រឡង'
                        : meeting.meetingType === 'emergency'
                        ? 'ប្រជុំបន្ទាន់'
                        : 'វិន័យ & គាំទ្រសិស្ស'}
                    </span>

                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {meeting.meetingCode || 'MTG-OFFICIAL'}
                    </span>

                    {/* Sync status badges */}
                    {meeting.isSyncedToGoogleCalendar ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Google Calendar Synced</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                        <span>មិនទាន់ Sync Calendar</span>
                      </span>
                    )}

                    {meeting.isSyncedToGoogleDrive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <HardDrive className="w-3 h-3 text-blue-600" />
                        <span>Drive Synced</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {meeting.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{meeting.meetingDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{meeting.meetingTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{meeting.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>វត្តមាន៖ <strong>{meeting.totalPresent || meeting.totalInvited || 15}</strong> / {meeting.totalInvited || 15} នាក់</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Google Calendar Sync Button */}
                  <button
                    onClick={() => handleSyncToCalendar(meeting)}
                    disabled={syncingMeetingId === meeting.id}
                    title="Sync ទៅ Google Calendar ជាមួយ Folder ID 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      meeting.isSyncedToGoogleCalendar
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                    }`}
                  >
                    {syncingMeetingId === meeting.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CalendarCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{meeting.isSyncedToGoogleCalendar ? 'Re-Sync Calendar' : 'Sync Calendar'}</span>
                  </button>

                  {/* Google Drive Sync Button */}
                  <button
                    onClick={() => handleSyncToDrive(meeting)}
                    disabled={syncingDriveMeetingId === meeting.id || isDriveSyncing}
                    title="Sync ឯកសារទៅ Google Drive Folder (ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {syncingDriveMeetingId === meeting.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <HardDrive className="w-3.5 h-3.5" />
                    )}
                    <span>Sync Drive Folder</span>
                  </button>

                  {/* Print Button */}
                  <button
                    onClick={() => setSelectedMeetingForPrint(meeting)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                    title="បោះពុម្ពទម្រង់កំណត់ហេតុប្រជុំផ្លូវការ (A4 Print)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(meeting)}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer"
                    title="កែសម្រួល"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`តើលោកគ្រូ-អ្នកគ្រូពិតជាចង់លុបកំណត់ត្រាប្រជុំ «${meeting.title}» នេះមែនទេ?`)) {
                        deleteTeacherMeeting(meeting.id);
                        showToast('បានលុបកំណត់ត្រាការប្រជុំរួចរាល់', 'info');
                      }
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                    title="លុប"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Body: Resolutions & Action Items */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Side: Agendas & Discussion */}
                <div className="lg:col-span-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                      <span>របៀបវារៈកិច្ចប្រជុំ (Agenda)</span>
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {meeting.agendas && meeting.agendas.length > 0 ? (
                        meeting.agendas.map((ag, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {ag.startsWith('១') || ag.startsWith('1') ? ag : `${idx + 1}. ${ag}`}
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 italic">គ្មានរបៀបវារៈបានកត់ត្រា</li>
                      )}
                    </ul>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div>
                      <span className="font-semibold text-slate-700">ប្រធានអង្គប្រជុំ៖</span> {meeting.chairpersonName || 'លោកនាយក'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">លេខាធិការ៖</span> {meeting.secretaryName || 'អ្នកគ្រូ កែវ ផល្លា'}
                    </div>
                  </div>
                </div>

                {/* Middle & Right Side: Key Decisions / Resolutions & Action Items */}
                <div className="lg:col-span-8 space-y-4">
                  {/* KEY RESOLUTIONS HIGHLIGHT BOX */}
                  <div className="bg-gradient-to-br from-amber-50/80 via-amber-50/40 to-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>សេចក្តីសម្រេចចិត្តពីការប្រជុំ (Key Decisions & Resolutions)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {meeting.resolutions?.length || 0} ចំណុច
                      </span>
                    </h4>

                    {meeting.resolutions && meeting.resolutions.length > 0 ? (
                      <div className="space-y-2">
                        {meeting.resolutions.map((res, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-800 bg-white/90 p-2.5 rounded-xl border border-amber-100"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="leading-relaxed font-medium">
                              {res}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">មិនទាន់បានបញ្ចូលសេចក្តីសម្រេចចិត្តនៅឡើយទេ។</p>
                    )}
                  </div>

                  {/* Action Items List */}
                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>ផែនការសកម្មភាពបន្ត (Action Items & Deadlines)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {meeting.actionItems.map((action, idx) => (
                          <div
                            key={action.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                          >
                            <div className="font-semibold text-slate-800 flex items-center justify-between gap-2">
                              <span className="line-clamp-1">{action.taskTitle}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0 font-mono">
                                {action.deadlineDate}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              អ្នកទទួលបន្ទុក៖ <strong className="text-slate-700">{action.responsiblePerson}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MEETING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5 max-h-[90vh] overflow-y-auto font-battambang">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {editingMeeting ? 'កែសម្រួលកំណត់ត្រាការប្រជុំ' : 'កត់ត្រាការប្រជុំគ្រូ និងសេចក្តីសម្រេចចិត្ត'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    បញ្ចូលព័ត៌មានលម្អិត និងសេចក្តីសម្រេចចិត្តដើម្បី Sync ទៅ Google Calendar & Drive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>គំរូសេចក្ដីសម្រេចចិត្តរហ័ស (Quick Resolution Templates)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {resolutionTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl.id)}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                      selectedTemplate === tmpl.id
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">{tmpl.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{tmpl.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4">
              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">ចំណងជើងកិច្ចប្រជុំ *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ឧ. កិច្ចប្រជុំបូកសរុបការងារបង្រៀនប្រចាំខែសីហា"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ប្រភេទកិច្ចប្រជុំ</label>
                  <select
                    value={formData.meetingType}
                    onChange={(e) => setFormData({ ...formData, meetingType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">ប្រជុំប្រចាំខែទូទៅ</option>
                    <option value="technical">ប្រជុំបច្ចេកទេស/គរុកោសល្យ</option>
                    <option value="curriculum">កម្មវិធីសិក្សា/ប្រឡង</option>
                    <option value="emergency">ប្រជុំបន្ទាន់</option>
                    <option value="disciplinary">វិន័យ & គាំទ្រសិស្ស</option>
                  </select>
                </div>
              </div>

              {/* Date, Time, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">កាលបរិច្ឆេទ</label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ម៉ោងចាប់ផ្តើម</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ម៉ោងបញ្ចប់</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ទីកន្លែងប្រជុំ</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="សាលប្រជុំសាលា..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Chairperson, Secretary, Attendees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ប្រធានអង្គប្រជុំ</label>
                  <input
                    type="text"
                    value={formData.chairPerson}
                    onChange={(e) => setFormData({ ...formData, chairPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">លេខាអង្គប្រជុំ</label>
                  <input
                    type="text"
                    value={formData.secretary}
                    onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ចំនួនអ្នកចូលរួមសរុប (នាក់)</label>
                  <input
                    type="number"
                    value={formData.totalAttendees}
                    onChange={(e) => setFormData({ ...formData, totalAttendees: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Agenda input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">របៀបវារៈកិច្ចប្រជុំ (មួយជួរ = ១ចំណុច)</label>
                <textarea
                  rows={3}
                  value={formData.agendasInput}
                  onChange={(e) => setFormData({ ...formData, agendasInput: e.target.value })}
                  placeholder="១. ត្រួតពិនិត្យវត្តមាន..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* KEY DECISIONS / RESOLUTIONS (CORE FEATURE) */}
              <div className="space-y-1 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>សេចក្តីសម្រេចចិត្តពីការប្រជុំ (Key Decisions & Agreed Resolutions) *</span>
                </label>
                <p className="text-[11px] text-amber-800/80 mb-1">
                  សរសេរសេចក្តីសម្រេចដែលអង្គប្រជុំបានឯកភាពគ្នា (មួយជួរ = ១សេចក្តីសម្រេច)៖
                </p>
                <textarea
                  rows={4}
                  required
                  value={formData.keyDecisionsInput}
                  onChange={(e) => setFormData({ ...formData, keyDecisionsInput: e.target.value })}
                  placeholder="១. ឯកភាពអនុវត្តកម្មវិធីបំប៉នសិស្សរៀនយឺត...\n២. គ្រូបន្ទុកថ្នាក់ទាំងអស់ត្រូវបូកសរុបពិន្ទុ..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-amber-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Action items input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ផែនការសកម្មភាពបន្ត (ទម្រង់៖ កិច្ចការ | អ្នកទទួលបន្ទុក | ថ្ងៃផុតកំណត់)
                </label>
                <textarea
                  rows={3}
                  value={formData.actionItemsInput}
                  onChange={(e) => setFormData({ ...formData, actionItemsInput: e.target.value })}
                  placeholder="បូកសរុបពិន្ទុ និងបញ្ជីវត្តមាន | គ្រូបន្ទុកថ្នាក់ | 2026-09-25"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Google Sync Checkbox with Folder ID */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="syncGoogleCalCheck"
                    checked={formData.syncToGoogleCalendar}
                    onChange={(e) => setFormData({ ...formData, syncToGoogleCalendar: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="syncGoogleCalCheck" className="text-xs text-slate-700 cursor-pointer">
                    <span className="font-bold text-blue-900 block">ធ្វើសមកាលកម្ម (Sync) ទៅកាន់ Google Calendar ភ្លាមៗ</span>
                    <span className="text-[11px] text-slate-500">
                      រួមបញ្ចូលសេចក្តីសម្រេចចិត្ត និងតំណភ្ជាប់ Google Drive Folder (ID: {TARGET_DRIVE_FOLDER_ID})
                    </span>
                  </label>
                </div>
                <CalendarCheck className="w-5 h-5 text-blue-600 shrink-0" />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  បោះបង់
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMeeting ? 'រក្សាទុកការកែប្រែ' : 'កត់ត្រា និង Sync ទៅ Google'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL MEETING PRINT MODAL (A4) */}
      {selectedMeetingForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl my-8 space-y-6 max-h-[90vh] overflow-y-auto font-battambang">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <span className="text-sm font-bold text-slate-700">ទម្រង់កំណត់ហេតុប្រជុំគ្រូបង្រៀនផ្លូវការ (Print Preview)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>បោះពុម្ព (Print)</span>
                </button>
                <button
                  onClick={() => setSelectedMeetingForPrint(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="space-y-6 text-slate-900 print:m-0">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="font-moul text-sm text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div className="font-moul text-xs text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                <div className="text-xs pt-1 font-semibold">{schoolProfile.nameKhmer}</div>
                <div className="text-[11px] text-slate-600">ឆ្នាំសិក្សា {selectedMeetingForPrint.academicYear || schoolProfile.academicYear}</div>
                <div className="font-moul text-base text-slate-900 pt-3 border-b-2 border-slate-800 pb-2">
                  កំណត់ហេតុកិច្ចប្រជុំគរុកោសល្យ និងការងារបង្រៀន
                </div>
              </div>

              {/* Basic Info Table */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><strong>កាលបរិច្ឆេទ៖</strong> {selectedMeetingForPrint.meetingDate} ({selectedMeetingForPrint.meetingTime})</div>
                <div><strong>ទីកន្លែង៖</strong> {selectedMeetingForPrint.location}</div>
                <div><strong>ប្រធានអង្គប្រជុំ៖</strong> {selectedMeetingForPrint.chairpersonName}</div>
                <div><strong>លេខាធិការ៖</strong> {selectedMeetingForPrint.secretaryName}</div>
                <div><strong>វត្តមានសរុប៖</strong> {selectedMeetingForPrint.totalPresent || 15}/{selectedMeetingForPrint.totalInvited || 15} នាក់</div>
                <div><strong>ថតឯកសារយោង៖</strong> Google Drive Folder ID: {TARGET_DRIVE_FOLDER_ID}</div>
              </div>

              {/* Agenda */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">១. របៀបវារៈកិច្ចប្រជុំ</div>
                <div className="pl-4 space-y-1">
                  {selectedMeetingForPrint.agendas?.map((ag, idx) => (
                    <div key={idx}>- {ag}</div>
                  ))}
                </div>
              </div>

              {/* Key Decisions / Resolutions */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">២. សេចក្តីសម្រេចចិត្តរបស់អង្គប្រជុំ (Resolutions)</div>
                <div className="pl-4 space-y-2">
                  {selectedMeetingForPrint.resolutions?.map((res, idx) => (
                    <div key={idx} className="font-semibold text-slate-900">
                      ២.{idx + 1}. {res}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              {selectedMeetingForPrint.actionItems && selectedMeetingForPrint.actionItems.length > 0 && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">៣. ផែនការសកម្មភាពបន្ត និងអ្នកទទួលបន្ទុក</div>
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-center w-12">ល.រ</th>
                        <th className="border border-slate-300 p-2 text-left">សកម្មភាពការងារ</th>
                        <th className="border border-slate-300 p-2 text-left">អ្នកទទួលបន្ទុក</th>
                        <th className="border border-slate-300 p-2 text-center w-28">កាលបរិច្ឆេទ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMeetingForPrint.actionItems.map((act, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-medium">{act.taskTitle}</td>
                          <td className="border border-slate-300 p-2">{act.responsiblePerson}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{act.deadlineDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs gap-6">
                <div>
                  <div className="font-semibold">លេខាធិការអង្គប្រជុំ</div>
                  <div className="h-16" />
                  <div className="font-bold">{selectedMeetingForPrint.secretaryName}</div>
                </div>

                <div>
                  <div className="text-slate-500">ថ្ងៃទី........ ខែ........ ឆ្នាំ២០២៦</div>
                  <div className="font-semibold">ប្រធានអង្គប្រជុំ (នាយកសាលា)</div>
                  <div className="h-16" />
                  <div className="font-bold text-red-600">{selectedMeetingForPrint.chairpersonName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
