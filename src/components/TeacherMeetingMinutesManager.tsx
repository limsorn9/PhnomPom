import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TeacherMeetingRecord } from '../types';
import { createTeacherMeetingGoogleCalendarEvent } from '../services/googleCalendar';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
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
  CalendarRange,
  Layers,
  Award,
  Clock3,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  ListOrdered,
  FileSpreadsheet,
  Share2,
  Tag,
  FolderSync,
  HardDrive,
  CloudUpload,
  Check
} from 'lucide-react';

export const TeacherMeetingMinutesManager: React.FC = () => {
  const {
    schoolProfile,
    teacherMeetings,
    addTeacherMeeting,
    updateTeacherMeeting,
    deleteTeacherMeeting,
    syncMeetingToDrive,
    syncAllMeetingsToDrive,
    isDriveSyncing,
    driveAutoSyncConfig,
    teachers,
    currentUser,
    showToast
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMonthlyScheduleModalOpen, setIsMonthlyScheduleModalOpen] = useState(false);
  const [selectedMeetingForPrint, setSelectedMeetingForPrint] = useState<TeacherMeetingRecord | null>(null);
  const [syncingMeetingId, setSyncingMeetingId] = useState<string | null>(null);
  const [syncingDriveMeetingId, setSyncingDriveMeetingId] = useState<string | null>(null);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Form State
  const initialForm = {
    title: '',
    meetingType: 'monthly' as 'monthly' | 'technical' | 'emergency' | 'curriculum' | 'disciplinary',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:30',
    location: 'សាលប្រជុំសាលាបឋមសិក្សា',
    chairPerson: schoolProfile.principalNameKhmer || 'លោក នាយកសាលា',
    secretary: currentUser?.name || 'អ្នកគ្រូ កែវ ផល្លា',
    totalAttendees: teachers.length || 15,
    absentCount: 0,
    agendasInput: '១. ត្រួតពិនិត្យវត្តមាន និងលទ្ធផលបង្រៀនប្រចាំខែ\n២. ត្រៀមរៀបចំការប្រឡងឆមាស និងការវាស់ស្ទង់សមត្ថភាពសិស្ស\n៣. ការថែទាំអនាម័យ បរិស្ថាន និងវិន័យសាលារៀន',
    keyDecisionsInput: '១. ឯកភាពកំណត់កាលបរិច្ឆេទប្រឡងឆមាសទី១ នៅសប្តាហ៍ទី៣ នៃខែក្រោយ\n២. គ្រូបន្ទុកថ្នាក់ទាំងអស់ត្រូវបូកសរុបពិន្ទុ និងវត្តមានឱ្យបានមុនថ្ងៃទី២៥ នៃខែនីមួយៗ\n៣. បង្កើនការអានសៀវភៅនៅបណ្ណាល័យយ៉ាងតិច ២ម៉ោងក្នុងមួយសប្តាហ៍សម្រាប់គ្រប់ថ្នាក់',
    actionItemsInput: 'បូកសរុបពិន្ទុ និងបញ្ជីវត្តមានប្រចាំខែ | គ្រូបន្ទុកថ្នាក់ទាំងអស់ | 2026-09-25\nរៀបចំកាលវិភាគប្រឡង និងវិញ្ញាសា | គណៈកម្មការបច្ចេកទេស | 2026-09-20\nត្រួតពិនិត្យអនាម័យតាមបន្ទប់រៀន | ក្រុមការងារបរិស្ថានសាលា | 2026-09-15',
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
      title: 'កិច្ចប្រជុំរៀបចំដំណើរការប្រឡងឆមាស',
      agendas: '១. ការកំណត់កាលវិភាគ និងវិញ្ញាសាប្រឡង\n២. ការចាត់តាំងគណៈកម្មការរៀបចំវិញ្ញាសា អនុរក្ស និងកំណែ\n៣. បទបញ្ជាផ្ទៃក្នុង និងការប្រកាសលទ្ធផល',
      decisions: '១. ឯកភាពកាលបរិច្ឆេទប្រឡងឆមាសចាប់ពីថ្ងៃទី ១៥ ដល់ ១៨ នៃខែបន្ទាប់\n២. គណៈកម្មការវិញ្ញាសាត្រូវរក្សាការសម្ងាត់ និងផ្ទៀងផ្ទាត់កម្រិតស្តង់ដារ\n៣. ប្រជុំបូកសរុប និងចែកព្រឹត្តិបត្រពិន្ទុនៅសប្តាហ៍បន្ទាប់ពីកំណែរួច',
      actions: 'តាក់តែង និងផ្ទៀងផ្ទាត់វិញ្ញាសា | គណៈកម្មការវិញ្ញាសា | 2026-09-12\nបែងចែកបន្ទប់ និងបញ្ជីឈ្មោះសិស្ស | លេខាធិការដ្ឋាន | 2026-09-14'
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
  const filteredMeetings = teacherMeetings.filter(m => {
    const matchesType = filterType === 'all' || m.meetingType === filterType;
    const matchesMonth = filterMonth === 'all' || m.meetingDate.startsWith(filterMonth);
    const matchesSearch =
      searchTerm === '' ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.chairPerson && m.chairPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.secretary && m.secretary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.resolutions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesMonth && matchesSearch;
  });

  // Calculate metrics
  const totalMeetings = teacherMeetings.length;
  const totalResolutions = teacherMeetings.reduce((acc, m) => acc + (m.resolutions?.length || 0), 0);
  const syncedCalendarCount = teacherMeetings.filter(m => m.isSyncedToGoogleCalendar || m.syncedToGoogleCalendar).length;
  const syncedDriveCount = teacherMeetings.filter(m => m.isSyncedToGoogleDrive).length;
  const averageAttendance = totalMeetings > 0
    ? Math.round((teacherMeetings.reduce((acc, m) => acc + ((m.totalPresent || m.totalAttendees || 0) / (m.totalInvited || m.totalAttendees || 1)), 0) / totalMeetings) * 100)
    : 100;

  const handleCreateMeeting = async (e: React.FormEvent) => {
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

    const actionItems = formData.actionItemsInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `act-${Date.now()}-${idx}`,
          task: parts[0] || line,
          assignedTo: parts[1] || 'គណៈគ្រប់គ្រង',
          deadline: parts[2] || formData.meetingDate,
          isCompleted: false
        };
      });

    let gCalEventId: string | undefined = undefined;
    let gCalHtmlLink: string | undefined = undefined;

    const meetingPayload: Omit<TeacherMeetingRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      meetingCode: `MTG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
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
      actionItems: actionItems.map(act => ({
        id: act.id,
        taskTitle: act.task,
        responsiblePerson: act.assignedTo,
        deadlineDate: act.deadline,
        isCompleted: false
      })),
      isSyncedToGoogleCalendar: false,
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
            { ...meetingPayload, id: 'temp_' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            schoolProfile
          );
          gCalEventId = res.eventId;
          gCalHtmlLink = res.htmlLink;
        }
      } catch (err) {
        console.warn('Could not auto-sync meeting to Google Calendar', err);
      }
    }

    addTeacherMeeting({
      ...meetingPayload,
      googleCalendarEventId: gCalEventId,
      googleCalendarHtmlLink: gCalHtmlLink,
      isSyncedToGoogleCalendar: !!gCalEventId
    });

    showToast(`បានកត់ត្រាកិច្ចប្រជុំ «${formData.title}» និងសេចក្ដីសម្រេចចិត្តជោគជ័យ!`, 'success');
    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  // 1-Click Sync Single Meeting to Google Calendar
  const handleSyncSingleMeeting = async (meeting: TeacherMeetingRecord) => {
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
        showToast('សូមចូលប្រើប្រាស់ Google ជាមុនសិន!', 'error');
        setSyncingMeetingId(null);
        return;
      }

      const res = await createTeacherMeetingGoogleCalendarEvent(meeting, schoolProfile);

      updateTeacherMeeting(meeting.id, {
        googleCalendarEventId: res.eventId,
        googleCalendarHtmlLink: res.htmlLink,
        isSyncedToGoogleCalendar: true,
        syncedToGoogleCalendar: true,
        syncedAt: new Date().toISOString()
      });

      showToast(`បាន Sync កិច្ចប្រជុំ «${meeting.title}» និងសេចក្ដីសម្រេចចិត្តទៅ Google Calendar ជោគជ័យ!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'មានបញ្ហាក្នុងការ Sync ទៅ Google Calendar', 'error');
    } finally {
      setSyncingMeetingId(null);
    }
  };

  // Batch Sync All Unsynced Monthly Meetings to Google Calendar
  const handleBatchSyncMonthlyMeetings = async () => {
    setIsBatchSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        }
      }

      if (!token) {
        showToast('សូមភ្ជាប់គណនី Google ជាមុនសិន!', 'error');
        setIsBatchSyncing(false);
        return;
      }

      const unsynced = teacherMeetings.filter(m => !m.isSyncedToGoogleCalendar && !m.syncedToGoogleCalendar);
      if (unsynced.length === 0) {
        showToast('កំណត់ត្រាកិច្ចប្រជុំទាំងអស់ត្រូវបាន Sync ទៅ Google Calendar រួចរាល់ហើយ!', 'info');
        setIsBatchSyncing(false);
        return;
      }

      let successCount = 0;
      for (const m of unsynced) {
        try {
          const res = await createTeacherMeetingGoogleCalendarEvent(m, schoolProfile);
          updateTeacherMeeting(m.id, {
            googleCalendarEventId: res.eventId,
            googleCalendarHtmlLink: res.htmlLink,
            isSyncedToGoogleCalendar: true,
            syncedToGoogleCalendar: true,
            syncedAt: new Date().toISOString()
          });
          successCount++;
        } catch (e) {
          console.warn('Failed syncing meeting', m.title, e);
        }
      }

      showToast(`បាន Sync កិច្ចប្រជុំចំនួន ${successCount} ទៅកាន់ Google Calendar ជោគជ័យ!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'បរាជ័យក្នុងការ Sync ជាក្រុម', 'error');
    } finally {
      setIsBatchSyncing(false);
    }
  };

  const handleSyncSingleMeetingToDrive = async (meeting: TeacherMeetingRecord) => {
    setSyncingDriveMeetingId(meeting.id);
    try {
      await syncMeetingToDrive(meeting.id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSyncingDriveMeetingId(null);
    }
  };

  // Generate 12-Month Teacher Meetings Schedule
  const handleGenerate12MonthSchedule = async () => {
    const currentYear = new Date().getFullYear();
    const months = [
      { num: 1, name: 'មករា', day: 28 },
      { num: 2, name: 'កុម្ភៈ', day: 27 },
      { num: 3, name: 'មីនា', day: 28 },
      { num: 4, name: 'មេសា', day: 28 },
      { num: 5, name: 'ឧសភា', day: 28 },
      { num: 6, name: 'មិថុនា', day: 28 },
      { num: 7, name: 'កក្កដា', day: 28 },
      { num: 8, name: 'សីហា', day: 28 },
      { num: 9, name: 'កញ្ញា', day: 28 },
      { num: 10, name: 'តុលា', day: 28 },
      { num: 11, name: 'វិច្ឆិកា', day: 28 },
      { num: 12, name: 'ធ្នូ', day: 28 }
    ];

    let createdCount = 0;
    for (const m of months) {
      const monthStr = m.num < 10 ? `0${m.num}` : `${m.num}`;
      const meetingDate = `${currentYear}-${monthStr}-${m.day}`;

      // Check if already exists
      const exists = teacherMeetings.some(ex => ex.meetingDate === meetingDate);
      if (!exists) {
        addTeacherMeeting({
          meetingCode: `MTG-${currentYear}-M${m.num}`,
          title: `កិច្ចប្រជុំបូកសរុបការងារបង្រៀន និងសេចក្ដីសម្រេចប្រចាំខែ${m.name}`,
          meetingType: 'monthly',
          academicYear: schoolProfile.academicYear,
          meetingDate: meetingDate,
          meetingTime: '14:00 - 16:30',
          location: 'សាលប្រជុំសាលាបឋមសិក្សា',
          chairpersonName: schoolProfile.principalNameKhmer || 'លោក នាយកសាលា',
          secretaryName: currentUser?.name || 'អ្នកគ្រូ កែវ ផល្លា',
          totalInvited: teachers.length || 15,
          totalPresent: teachers.length || 15,
          attendees: [],
          agendas: [
            `១. ត្រួតពិនិត្យវត្តមាន និងកិច្ចតែងការប្រចាំខែ${m.name}`,
            '២. វាយតម្លៃការអនុវត្តកម្មវិធីសិក្សា និងសិស្សរៀនយឺត',
            '៣. ផ្សព្វផ្សាយសារាចរណែនាំ និងទិសដៅខែបន្ទាប់'
          ],
          discussionSummary: `កិច្ចប្រជុំប្រចាំខែ${m.name} នៃឆ្នាំសិក្សា ${schoolProfile.academicYear}`,
          resolutions: [
            `១. ឯកភាពអនុម័តរបាយការណ៍បង្រៀន និងរៀនប្រចាំខែ${m.name}`,
            '២. គ្រូបន្ទុកថ្នាក់ត្រូវបន្តជួយឧបត្ថម្ភសិស្សរៀនយឺតឱ្យបានទៀងទាត់',
            '៣. ធានាការថែទាំសម្ភាររូបវន្ត និងអនាម័យបរិស្ថានស្អាតក្នុងថ្នាក់'
          ],
          actionItems: [
            {
              id: `act-gen-${m.num}-1`,
              taskTitle: `បូកសរុបពិន្ទុ និងវត្តមានប្រចាំខែ${m.name}`,
              responsiblePerson: 'គ្រូបន្ទុកថ្នាក់ទាំងអស់',
              deadlineDate: `${currentYear}-${monthStr}-25`,
              isCompleted: false
            }
          ],
          isSyncedToGoogleCalendar: false,
          status: 'approved'
        });
        createdCount++;
      }
    }

    setIsMonthlyScheduleModalOpen(false);
    showToast(`បានបង្កើតកាលវិភាគកិច្ចប្រជុំ ១២ ខែចំនួន ${createdCount} កិច្ចប្រជុំជោគជ័យ!`, 'success');
  };

  const getMeetingTypeBadge = (type: string) => {
    switch (type) {
      case 'monthly':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">ប្រជុំប្រចាំខែ</span>;
      case 'technical':
      case 'pedagogical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">ប្រជុំបច្ចេកទេសគរុកោសល្យ</span>;
      case 'curriculum':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">កម្មវិធីសិក្សា/ប្រឡង</span>;
      case 'emergency':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">ប្រជុំបន្ទាន់</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">ទូទៅ</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/25 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ប្រព័ន្ធគ្រប់គ្រង និងកត់ត្រាកំណត់ហេតុកិច្ចប្រជុំផ្លូវការ</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold font-moul text-amber-300 tracking-wide">
            កំណត់ត្រាការប្រជុំគ្រូ & សេចក្ដីសម្រេចចិត្ត
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            កត់ត្រារបៀបវារៈ សេចក្ដីសម្រេចចិត្តសំខាន់ៗ និងការបែងចែកភារកិច្ចរបស់លោកគ្រូ-អ្នកគ្រូ ព្រមទាំង Sync ទៅកាន់ <strong>Google Calendar</strong> ប្រចាំខែដោយស្វ័យប្រវត្តិ។
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full md:w-auto">
          <button
            onClick={() => setIsMonthlyScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium backdrop-blur-sm transition-all text-xs border border-white/15 shadow-sm"
          >
            <CalendarRange className="w-4 h-4 text-amber-300" />
            <span>បង្កើតកាលវិភាគ ១២ ខែ</span>
          </button>

          <button
            onClick={syncAllMeetingsToDrive}
            disabled={isDriveSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-md transition-all text-xs"
            title={`Sync គ្រប់កិច្ចប្រជុំទៅ Google Drive (${driveAutoSyncConfig.folderId || '1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g'})`}
          >
            <HardDrive className={`w-4 h-4 text-amber-300 ${isDriveSyncing ? 'animate-spin' : ''}`} />
            <span>Sync ទៅ Google Drive</span>
          </button>

          <button
            onClick={handleBatchSyncMonthlyMeetings}
            disabled={isBatchSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-md transition-all text-xs"
          >
            {isBatchSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarCheck className="w-4 h-4" />
            )}
            <span>Sync ទៅ Calendar</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតកំណត់ត្រាថ្មី</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">កិច្ចប្រជុំសរុប</p>
            <h3 className="text-xl font-bold text-slate-800">{totalMeetings} <span className="text-xs font-normal text-slate-400">លើក</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">សេចក្ដីសម្រេចចិត្ត</p>
            <h3 className="text-xl font-bold text-slate-800">{totalResolutions} <span className="text-xs font-normal text-slate-400">ប្រការ</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Calendar Sync</p>
            <h3 className="text-xl font-bold text-slate-800">{syncedCalendarCount} <span className="text-xs font-normal text-slate-400">/ {totalMeetings}</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <HardDrive className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Google Drive Sync</p>
            <h3 className="text-xl font-bold text-slate-800">{syncedDriveCount} <span className="text-xs font-normal text-slate-400">/ {totalMeetings}</span></h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">អត្រាវត្តមានគ្រូ</p>
            <h3 className="text-xl font-bold text-slate-800">{averageAttendance}%</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកចំណងជើង សេចក្ដីសម្រេច ឬឈ្មោះអ្នកដឹកនាំ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">គ្រប់ខែទាំងអស់</option>
            <option value="2026-01">ខែមករា 2026</option>
            <option value="2026-02">ខែកុម្ភៈ 2026</option>
            <option value="2026-03">ខែមីនា 2026</option>
            <option value="2026-04">ខែមេសា 2026</option>
            <option value="2026-05">ខែឧសភា 2026</option>
            <option value="2026-06">ខែមិថុនា 2026</option>
            <option value="2026-07">ខែកក្កដា 2026</option>
            <option value="2026-08">ខែសីហា 2026</option>
            <option value="2026-09">ខែកញ្ញា 2026</option>
            <option value="2026-10">ខែតុលា 2026</option>
            <option value="2026-11">ខែវិច្ឆិកា 2026</option>
            <option value="2026-12">ខែធ្នូ 2026</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">ប្រភេទកិច្ចប្រជុំទាំងអស់</option>
            <option value="monthly">ប្រជុំប្រចាំខែ</option>
            <option value="technical">ប្រជុំបច្ចេកទេសគរុកោសល្យ</option>
            <option value="curriculum">កម្មវិធីសិក្សា & ប្រឡង</option>
            <option value="emergency">ប្រជុំបន្ទាន់</option>
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80 shadow-sm space-y-3">
            <FileText className="w-12 h-12 mx-auto text-purple-300" />
            <h4 className="text-sm font-bold text-slate-700">មិនទាន់មានកំណត់ត្រាកិច្ចប្រជុំស្របតាមលក្ខខណ្ឌស្វែងរកទេ</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ចុចប៊ូតុង «បង្កើតកំណត់ត្រាថ្មី» ឬ «បង្កើតកាលវិភាគ ១២ ខែ» ដើម្បីចាប់ផ្តើមកត់ត្រាសេចក្ដីសម្រេចចិត្ត និង sync ទៅ Google Calendar។
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white text-xs rounded-xl font-medium shadow-sm hover:bg-purple-500"
            >
              + បង្កើតកំណត់ត្រាថ្មីឥឡូវនេះ
            </button>
          </div>
        ) : (
          filteredMeetings.map(meeting => {
            const isSynced = meeting.isSyncedToGoogleCalendar || meeting.syncedToGoogleCalendar;
            const isDriveSynced = meeting.isSyncedToGoogleDrive;
            const present = meeting.totalPresent || (meeting.totalAttendees ? meeting.totalAttendees - (meeting.absentCount || 0) : 15);
            const invited = meeting.totalInvited || meeting.totalAttendees || 15;
            const resolutionsList = meeting.resolutions || meeting.keyDecisions || [];

            return (
              <div
                key={meeting.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-4 hover:border-purple-300 hover:shadow-md transition-all"
              >
                {/* Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getMeetingTypeBadge(meeting.meetingType)}
                      <h3 className="font-bold text-slate-900 text-base">{meeting.title}</h3>
                      {meeting.meetingCode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {meeting.meetingCode}
                        </span>
                      )}
                      {isDriveSynced && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>Drive Synced</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <strong className="text-slate-700">{meeting.meetingDate}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{meeting.meetingTime || `${meeting.startTime || '14:00'} - ${meeting.endTime || '16:30'}`}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{meeting.location || 'សាលប្រជុំសាលាបឋមសិក្សា'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>វត្តមាន៖ <strong className="text-emerald-700">{present}/{invited} នាក់</strong></span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Google Drive Link & Sync Button */}
                    {meeting.googleDriveWebViewLink && (
                      <a
                        href={meeting.googleDriveWebViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 text-xs transition-colors"
                        title="បើកមើលក្នុង Google Drive Folder"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleSyncSingleMeetingToDrive(meeting)}
                      disabled={syncingDriveMeetingId === meeting.id || isDriveSyncing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isDriveSynced
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-2xs'
                      }`}
                      title={`Sync ឯកសារ HTML ទៅ Google Drive (${driveAutoSyncConfig.folderId || '1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g'})`}
                    >
                      {syncingDriveMeetingId === meeting.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : isDriveSynced ? (
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>{isDriveSynced ? 'Drive Synced' : 'Sync ទៅ Drive'}</span>
                    </button>

                    {meeting.googleCalendarHtmlLink && (
                      <a
                        href={meeting.googleCalendarHtmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs"
                        title="បើកមើលក្នុង Google Calendar"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleSyncSingleMeeting(meeting)}
                      disabled={syncingMeetingId === meeting.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSynced
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                      }`}
                    >
                      {syncingMeetingId === meeting.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      ) : isSynced ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      <span>{isSynced ? 'Calendar Synced' : 'Sync ទៅ Calendar'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedMeetingForPrint(meeting)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs"
                      title="បោះពុម្ពកំណត់ហេតុផ្លូវការ"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបកំណត់ត្រាកិច្ចប្រជុំ «${meeting.title}» មែនទេ?`)) {
                          deleteTeacherMeeting(meeting.id);
                          showToast('បានលុបកំណត់ត្រាជោគជ័យ!', 'info');
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 text-xs"
                      title="លុបកំណត់ត្រា"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Agendas list */}
                {meeting.agendas && meeting.agendas.length > 0 && (
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
                      <span>របៀបវារៈនៃកិច្ចប្រជុំ៖</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-5">
                      {meeting.agendas.map((ag, idx) => (
                        <p key={idx} className="text-slate-600">• {ag}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Resolutions Box (Highlighted) */}
                {resolutionsList.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-white border border-purple-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <Bookmark className="w-4 h-4 text-purple-600 fill-purple-200" />
                        <span>សេចក្ដីសម្រេចចិត្តសំខាន់ៗពីកិច្ចប្រជុំ (Meeting Resolutions)</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {resolutionsList.length} ប្រការត្រូវបានអនុម័ត
                      </span>
                    </div>

                    <div className="space-y-2">
                      {resolutionsList.map((dec, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 bg-white/90 p-2.5 rounded-lg border border-purple-100 shadow-2xs">
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="leading-relaxed font-medium">{dec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action items Delegation */}
                {meeting.actionItems && meeting.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ផែនការសកម្មភាព និងការចាត់តាំងការងារអនុវត្តបន្ត៖</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {meeting.actionItems.map(item => (
                        <div key={item.id} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{item.taskTitle || (item as any).task}</p>
                            <p className="text-[11px] text-slate-500">អ្នកទទួលបន្ទុក៖ <strong className="text-indigo-600">{item.responsiblePerson || (item as any).assignedTo}</strong></p>
                          </div>
                          <span className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono font-bold shadow-2xs">
                            {item.deadlineDate || (item as any).deadline}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures & Attribution Footer */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>ប្រធានអង្គប្រជុំ៖ <strong className="text-slate-800">{meeting.chairpersonName || meeting.chairPerson}</strong></span>
                  <span>លេខាកត់ត្រា៖ <strong className="text-slate-800">{meeting.secretaryName || meeting.secretary}</strong></span>
                  {meeting.syncedAt && (
                    <span className="text-[10px] text-emerald-700">Calendar Sync: {meeting.syncedAt.split('T')[0]}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Meeting Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-kantumruy">បង្កើតកំណត់ត្រាកិច្ចប្រជុំគ្រូថ្មី</h3>
                  <p className="text-xs text-slate-500">កត់ត្រាសេចក្ដីសម្រេចចិត្ត និង sync ទៅ Google Calendar</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Quick Template Picker */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>ជ្រើសរើសគំរូសេចក្ដីសម្រេចចិត្តរហ័ស (Quick Templates)៖</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {resolutionTemplates.map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                        selectedTemplate === tmpl.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ចំណងជើងកិច្ចប្រជុំ *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ឧ. កិច្ចប្រជុំបូកសរុបការងារបង្រៀនប្រចាំខែកញ្ញា..."
                  className="w-full px-3 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ប្រភេទកិច្ចប្រជុំ
                  </label>
                  <select
                    value={formData.meetingType}
                    onChange={e => setFormData({ ...formData, meetingType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="monthly">ប្រជុំប្រចាំខែ</option>
                    <option value="technical">ប្រជុំបច្ចេកទេសគរុកោសល្យ</option>
                    <option value="curriculum">កម្មវិធីសិក្សា & ប្រឡង</option>
                    <option value="emergency">ប្រជុំបន្ទាន់</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ទីកន្លែងប្រជុំ
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កាលបរិច្ឆេទប្រជុំ
                  </label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={e => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ម៉ោងចាប់ផ្តើម
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ម៉ោងបញ្ចប់
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ប្រធានអង្គប្រជុំ
                  </label>
                  <input
                    type="text"
                    value={formData.chairPerson}
                    onChange={e => setFormData({ ...formData, chairPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    លេខាកត់ត្រា
                  </label>
                  <input
                    type="text"
                    value={formData.secretary}
                    onChange={e => setFormData({ ...formData, secretary: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Agenda items */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  របៀបវារៈប្រជុំ (មួយជួរមួយចំណុច)
                </label>
                <textarea
                  value={formData.agendasInput}
                  onChange={e => setFormData({ ...formData, agendasInput: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                  placeholder="១. របៀបវារៈទី១...&#10;២. របៀបវារៈទី២..."
                />
              </div>

              {/* Key Decisions / Resolutions */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-1.5">
                <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                  <span>សេចក្ដីសម្រេចចិត្តពីការប្រជុំសាលា (មួយជួរមួយចំណុច) *</span>
                </label>
                <p className="text-[11px] text-purple-700">សេចក្ដីសម្រេចនេះនឹងត្រូវចងក្រងក្នុងកំណត់ហេតុ និង sync ចូល Google Calendar</p>
                <textarea
                  value={formData.keyDecisionsInput}
                  onChange={e => setFormData({ ...formData, keyDecisionsInput: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-xs border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white leading-relaxed"
                  placeholder="១. សម្រេច...&#10;២. សម្រេច..."
                  required
                />
              </div>

              {/* Action items */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ភារកិច្ចត្រូវបន្ត (ទម្រង់៖ ភារកិច្ច | អ្នកទទួលបន្ទុក | ថ្ងៃផុតកំណត់)
                </label>
                <textarea
                  value={formData.actionItemsInput}
                  onChange={e => setFormData({ ...formData, actionItemsInput: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-[11px] bg-slate-50/50"
                  placeholder="រៀបចំកាលវិភាគប្រឡង | គណៈកម្មការបច្ចេកទេស | 2026-09-28"
                />
              </div>

              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-purple-600" />
                    <span>Sync ទៅ Google Calendar ដោយស្វ័យប្រវត្តិ</span>
                  </p>
                  <p className="text-purple-600 text-[11px]">បង្កើតព្រឹត្តិការណ៍ និងបញ្ចូលសេចក្ដីសម្រេចចិត្តក្នុង Calendar ភ្លាមៗ</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.syncToGoogleCalendar}
                  onChange={e => setFormData({ ...formData, syncToGoogleCalendar: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>រក្សាទុក & Sync កំណត់ហេតុ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 12-Month Schedule Generator */}
      {isMonthlyScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">បង្កើតកាលវិភាគប្រជុំគ្រូ ១២ ខែ</h3>
                <p className="text-xs text-slate-500">បង្កើតកាលវិភាគប្រជុំប្រចាំខែពេញមួយឆ្នាំសិក្សា</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <p className="font-semibold text-slate-800">ប្រព័ន្ធនឹងបង្កើតកិច្ចប្រជុំប្រចាំខែស្វ័យប្រវត្តិចំនួន ១២ លើក៖</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                <li>កាលបរិច្ឆេទ៖ រៀងរាល់ថ្ងៃទី ២៨ នៃខែនីមួយៗ (មករា ដល់ ធ្នូ)</li>
                <li>ម៉ោង៖ ១៤:០០ ដល់ ១៦:៣០ រសៀល</li>
                <li>មានភ្ជាប់ជាមួយរបៀបវារៈ និងគំរូសេចក្ដីសម្រេចចិត្តស្ដង់ដារ</li>
                <li>អាច Sync ជាក្រុម (Batch Sync) ទៅ Google Calendar គ្រប់ខែទាំងអស់</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMonthlyScheduleModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleGenerate12MonthSchedule}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>បង្កើតកាលវិភាគ ១២ ខែ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Official Meeting Minutes Modal */}
      {selectedMeetingForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 md:p-10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* National Header */}
            <div className="text-center space-y-1 border-b pb-5">
              <h4 className="font-moul text-sm text-slate-900 tracking-wider">ព្រះរាជាណាចក្រកម្ពុជា</h4>
              <p className="font-moul text-xs text-slate-700">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <div className="flex justify-center pt-1">
                <span className="text-slate-400 text-xs">❖❖❖</span>
              </div>
              <div className="pt-4 space-y-1">
                <p className="text-xs text-slate-500">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <h3 className="font-moul text-base text-purple-950">{schoolProfile.nameKhmer || schoolProfile.schoolNameKhmer}</h3>
                <div className="pt-3">
                  <h2 className="font-moul text-lg text-slate-900">កំណត់ហេតុកិច្ចប្រជុំ</h2>
                  <p className="text-sm font-bold text-purple-900 mt-1">«{selectedMeetingForPrint.title}»</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><strong>កាលបរិច្ឆេទ៖</strong> {selectedMeetingForPrint.meetingDate}</div>
                <div><strong>ពេលវេលា៖</strong> {selectedMeetingForPrint.meetingTime || `${selectedMeetingForPrint.startTime} - ${selectedMeetingForPrint.endTime}`}</div>
                <div><strong>ទីកន្លែង៖</strong> {selectedMeetingForPrint.location || 'សាលប្រជុំសាលាបឋមសិក្សា'}</div>
                <div><strong>វត្តមានសរុប៖</strong> {selectedMeetingForPrint.totalPresent || (selectedMeetingForPrint.totalAttendees - (selectedMeetingForPrint.absentCount || 0))}/{selectedMeetingForPrint.totalInvited || selectedMeetingForPrint.totalAttendees} នាក់</div>
              </div>

              {selectedMeetingForPrint.agendas && selectedMeetingForPrint.agendas.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">១. របៀបវារៈនៃកិច្ចប្រជុំ៖</h4>
                  <ul className="list-disc list-inside space-y-1 pl-3 text-slate-700">
                    {selectedMeetingForPrint.agendas.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              {/* Highlighted Official Resolutions */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-purple-950 text-xs uppercase tracking-wide">
                  ២. សេចក្ដីសម្រេចចិត្តពីអង្គប្រជុំ (Resolutions)៖
                </h4>
                <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-2">
                  {(selectedMeetingForPrint.resolutions || selectedMeetingForPrint.keyDecisions || []).map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <strong className="text-purple-700 min-w-5">{i + 1}.</strong>
                      <p className="font-medium text-slate-800">{d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMeetingForPrint.actionItems && selectedMeetingForPrint.actionItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs">៣. ផែនការសកម្មភាពអនុវត្តបន្ត៖</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2 text-left">ល.រ</th>
                          <th className="p-2 text-left">ភារកិច្ច</th>
                          <th className="p-2 text-left">អ្នកទទួលខុសត្រូវ</th>
                          <th className="p-2 text-left">កាលបរិច្ឆេទផុតកំណត់</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedMeetingForPrint.actionItems.map((act, idx) => (
                          <tr key={idx}>
                            <td className="p-2">{idx + 1}</td>
                            <td className="p-2 font-medium">{act.taskTitle || (act as any).task}</td>
                            <td className="p-2 text-indigo-700 font-semibold">{act.responsiblePerson || (act as any).assignedTo}</td>
                            <td className="p-2 font-mono">{act.deadlineDate || (act as any).deadline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
                <div className="space-y-16">
                  <p className="font-bold text-slate-700">លេខាកត់ត្រា</p>
                  <p className="font-bold text-slate-900">{selectedMeetingForPrint.secretaryName || selectedMeetingForPrint.secretary}</p>
                </div>
                <div className="space-y-16">
                  <p className="font-bold text-slate-700">ប្រធានអង្គប្រជុំ / នាយកសាលា</p>
                  <p className="font-bold text-slate-900">{selectedMeetingForPrint.chairpersonName || selectedMeetingForPrint.chairPerson}</p>
                </div>
              </div>
            </div>

            {/* Print Controls */}
            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedMeetingForPrint(null)}
                className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                បិទ
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពកំណត់ហេតុ (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

