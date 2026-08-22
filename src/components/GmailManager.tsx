import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../services/googleAuth';
import {
  listGmailMessages,
  getGmailMessage,
  sendGmailEmail,
  createGmailDraft,
  deleteGmailMessage,
  modifyGmailLabels,
  getGmailProfile,
  generateSchoolEmailTemplate,
  GmailMessageSummary,
  GmailProfile
} from '../services/gmail';
import {
  Mail,
  Send,
  Inbox,
  FileEdit,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
  GraduationCap,
  Bell,
  Check,
  ChevronRight,
  Reply,
  ArrowLeft,
  X,
  FileText,
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Layers,
  SendHorizontal,
  Bookmark,
  Star,
  Eye,
  LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';

export const GmailManager: React.FC = () => {
  const {
    schoolProfile,
    students,
    teachers,
    scores,
    attendanceRecords,
    showToast
  } = useSchool();

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);

  // Folder/View Mode: 'inbox' | 'sent' | 'compose' | 'templates'
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'compose' | 'templates'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);

  // Compose / Send State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBodyHtml, setEmailBodyHtml] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Send Confirmation Modal State (MANDATORY User Confirmation)
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);

  // Delete Confirmation Modal State (MANDATORY User Confirmation)
  const [messageToDelete, setMessageToDelete] = useState<GmailMessageSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // School Template Quick-Fill State
  const [selectedTemplateType, setSelectedTemplateType] = useState<
    'student_score' | 'parent_meeting' | 'attendance_warning' | 'teacher_announcement'
  >('student_score');
  const [templateStudentId, setTemplateStudentId] = useState<string>('');
  const [templateMonth, setTemplateMonth] = useState<string>('តុលា');
  const [templateMeetingDate, setTemplateMeetingDate] = useState<string>('ថ្ងៃសៅរ៍ ទី២៨ ខែនេះ');
  const [templateMeetingTime, setTemplateMeetingTime] = useState<string>('វេលាម៉ោង ០៨:០០ ព្រឹក');
  const [templateAnnouncementTitle, setTemplateAnnouncementTitle] = useState<string>('ការប្រជុំបច្ចេកទេសប្រចាំខែ');
  const [templateAnnouncementBody, setTemplateAnnouncementBody] = useState<string>(
    'សូមគោរពអញ្ជើញលោកគ្រូ អ្នកគ្រូទាំងអស់ ចូលរួមការប្រជុំបច្ចេកទេសនៅបន្ទប់ប្រជុំធំ វេលាម៉ោង ២:០០ រសៀល។'
  );

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
        setGmailProfile(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch messages and profile when authenticated
  useEffect(() => {
    if (hasToken && currentUser) {
      loadProfileAndMessages();
    }
  }, [hasToken, currentUser, activeFolder]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        showToast(`បានភ្ជាប់គណនី Gmail «${res.user.displayName || res.user.email}» ដោយជោគជ័យ!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'បរាជ័យក្នុងការភ្ជាប់ Google', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setHasToken(false);
      setMessages([]);
      setSelectedMessage(null);
      showToast('បានផ្ដាច់គណនី Google រួចរាល់', 'info');
    } catch (err: any) {
      showToast('មានបញ្ហាក្នុងការចាកចេញ', 'error');
    }
  };

  const loadProfileAndMessages = async () => {
    setIsLoadingMessages(true);
    try {
      // Load Profile
      getGmailProfile()
        .then(prof => setGmailProfile(prof))
        .catch(e => console.warn('Could not fetch gmail profile', e));

      // Load Messages based on folder
      let labelQuery = '';
      if (activeFolder === 'inbox') {
        labelQuery = 'label:INBOX';
      } else if (activeFolder === 'sent') {
        labelQuery = 'label:SENT';
      }

      const fullQuery = [labelQuery, searchQuery].filter(Boolean).join(' ');
      const res = await listGmailMessages({
        query: fullQuery || undefined,
        maxResults: 20
      });
      setMessages(res.messages);
    } catch (err: any) {
      console.error('Failed to load Gmail messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Prepare & Confirm Send Email
  const handleOpenSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      showToast('សូមបញ្ចូលអ៊ីមែលអ្នកទទួល (To Email)', 'error');
      return;
    }
    if (!emailSubject.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងអ៊ីមែល (Subject)', 'error');
      return;
    }
    setShowSendConfirmation(true);
  };

  // Perform Actual Send Email (with user confirmation)
  const handleConfirmSend = async () => {
    setIsSending(true);
    try {
      await sendGmailEmail({
        to: recipientEmail.trim(),
        cc: ccEmail.trim() || undefined,
        subject: emailSubject.trim(),
        bodyHtml: emailBodyHtml || `<p>${emailSubject}</p>`,
        senderName: schoolProfile.nameKhmer
      });

      showToast(`បានផ្ញើអ៊ីមែលទៅកាន់ «${recipientEmail}» តាមរយៈ Gmail ដោយជោគជ័យ!`);
      setShowSendConfirmation(false);
      // Reset form
      setRecipientEmail('');
      setCcEmail('');
      setEmailSubject('');
      setEmailBodyHtml('');
      setActiveFolder('sent');
    } catch (err: any) {
      console.error('Send email error:', err);
      showToast(err.message || 'បរាជ័យក្នុងការផ្ញើអ៊ីមែល', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!recipientEmail.trim() && !emailSubject.trim()) {
      showToast('សូមបញ្ចូលយ៉ាងហោចណាស់អ្នកទទួល ឬចំណងជើង', 'error');
      return;
    }

    setIsSavingDraft(true);
    try {
      await createGmailDraft({
        to: recipientEmail.trim(),
        subject: emailSubject.trim() || '(គ្មានចំណងជើង)',
        bodyHtml: emailBodyHtml || '<p></p>',
        senderName: schoolProfile.nameKhmer
      });
      showToast('បានរក្សាទុកក្នុងសារព្រាង (Draft) ដោយជោគជ័យ!');
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការរក្សាទុកសារព្រាង', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Handle Delete Message (with explicit confirmation)
  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGmailMessage(messageToDelete.id);
      showToast('បានលុបសារចេញពី Gmail រួចរាល់', 'info');
      setMessageToDelete(null);
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      loadProfileAndMessages();
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការលុបសារ', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Apply Template into Compose Box
  const handleApplyTemplate = () => {
    const selectedStudent = students.find(s => s.id === templateStudentId) || students[0];
    const studentScores = scores.filter(
      s => s.studentId === selectedStudent?.id && s.monthOrSemester === templateMonth
    );
    const scoreItem = studentScores[0];

    const teacher = teachers.find(t => t.assignedGrade === (selectedStudent?.grade || 1)) || teachers[0];

    const templateResult = generateSchoolEmailTemplate({
      templateType: selectedTemplateType,
      schoolName: schoolProfile.nameKhmer,
      studentName: selectedStudent ? `${selectedStudent.lastName} ${selectedStudent.firstName}` : 'សុខ វាសនា',
      grade: selectedStudent?.grade || 1,
      section: selectedStudent?.section || 'ក',
      month: templateMonth,
      totalScore: scoreItem ? scoreItem.totalScore : 48.5,
      average: scoreItem ? scoreItem.average : 8.08,
      rank: scoreItem ? scoreItem.rank : 1,
      meetingDate: templateMeetingDate,
      meetingTime: templateMeetingTime,
      meetingLocation: `បន្ទប់រៀនទី ${selectedStudent?.grade || 1}${selectedStudent?.section || 'ក'}`,
      announcementTitle: templateAnnouncementTitle,
      announcementContent: templateAnnouncementBody,
      teacherName: teacher ? `${teacher.lastName} ${teacher.firstName}` : schoolProfile.principalName,
      contactPhone: schoolProfile.phone
    });

    setEmailSubject(templateResult.subject);
    setEmailBodyHtml(templateResult.bodyHtml);
    // If student or parent contact exists, fill recipient
    if (selectedStudent?.contactPhone && selectedStudent.contactPhone.includes('@')) {
      setRecipientEmail(selectedStudent.contactPhone);
    } else {
      setRecipientEmail('parent.contact@example.com');
    }

    setActiveFolder('compose');
    showToast('បានបញ្ចូលទម្រង់លិខិតសាលាទៅក្នុងប្រអប់សរសេរសាររួចរាល់!');
  };

  const months = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'ឆមាសទី១', 'ឆមាសទី២'];

  return (
    <div className="space-y-6">
      {/* Top Banner: Gmail Integration Header */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-red-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ប្រព័ន្ធផ្ញើអ៊ីមែលផ្លូវការ Google Gmail API</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-moul tracking-wide text-white">
              Gmail & ប្រព័ន្ធសារអេឡិចត្រូនិចសាលារៀន
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ផ្ញើរបាយការណ៍ពិន្ទុប្រចាំខែទៅកាន់អាណាព្យាបាលសិស្ស លិខិតអញ្ជើញប្រជុំ សេចក្តីជូនដំណឹងផ្ទៃក្នុង និងគ្រប់គ្រងសារអ៊ីមែល Gmail ផ្លូវការរបស់សាលាបឋមសិក្សា។
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            {hasToken && currentUser ? (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full border-2 border-red-400 object-cover shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg border-2 border-red-400">
                      {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Connected" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white leading-snug">
                      {currentUser.displayName || 'គណនី Gmail សាលា'}
                    </span>
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      ភ្ជាប់រួចរាល់
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]">
                    {currentUser.email}
                  </p>
                  <p className="text-[11px] text-red-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Gmail API & Send Enabled
                  </p>
                </div>
                <button
                  id="gmail-signout-btn"
                  onClick={handleSignOut}
                  className="ml-auto sm:ml-2 p-2 hover:bg-white/20 rounded-xl text-rose-300 hover:text-rose-200 transition-colors"
                  title="ផ្ដាច់គណនី (Sign out)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center sm:text-left space-y-3 w-full">
                <div>
                  <h4 className="text-xs font-bold text-white">ចូលប្រើប្រាស់ជាមួយ Google</h4>
                  <p className="text-[11px] text-slate-300">
                    ដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធអាន និងផ្ញើសារ Gmail
                  </p>
                </div>

                <button
                  id="gmail-signin-btn"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'កំពុងភ្ជាប់...' : 'ចូលគណនីជាមួយ Google (Sign in)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Mailbox Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          {/* Compose Button */}
          <button
            id="gmail-btn-compose"
            onClick={() => {
              setSelectedMessage(null);
              setActiveFolder('compose');
            }}
            disabled={!hasToken}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <FileEdit className="w-4 h-4" />
            <span>សរសេរសារថ្មី (Compose Email)</span>
          </button>

          {/* Quick Mailbox Links */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-1 text-xs">
            <button
              id="folder-inbox-btn"
              onClick={() => {
                setSelectedMessage(null);
                setActiveFolder('inbox');
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl font-medium transition-colors ${
                activeFolder === 'inbox'
                  ? 'bg-red-50 text-red-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-red-500" />
                <span>ប្រអប់សារទទួល (Inbox)</span>
              </div>
              {gmailProfile && (
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                  {gmailProfile.messagesTotal}
                </span>
              )}
            </button>

            <button
              id="folder-sent-btn"
              onClick={() => {
                setSelectedMessage(null);
                setActiveFolder('sent');
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl font-medium transition-colors ${
                activeFolder === 'sent'
                  ? 'bg-red-50 text-red-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>សារបានផ្ញើ (Sent)</span>
              </div>
            </button>

            <button
              id="folder-templates-btn"
              onClick={() => {
                setSelectedMessage(null);
                setActiveFolder('templates');
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl font-medium transition-colors ${
                activeFolder === 'templates'
                  ? 'bg-red-50 text-red-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ទម្រង់លិខិតសាលា (Templates)</span>
              </div>
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>សុវត្ថិភាពទិន្នន័យ</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              ការផ្ញើសារទាំងអស់ត្រូវបានការពារតាមរយៈស្តង់ដារ OAuth 2.0 របស់ Google។ រាល់ការផ្ញើ ឬលុបសារ តម្រូវឱ្យមានការបញ្ជាក់ច្បាស់លាស់ពីអ្នកប្រើប្រាស់ជានិច្ច។
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* SEARCH & REFRESH BAR */}
          {(activeFolder === 'inbox' || activeFolder === 'sent') && !selectedMessage && (
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadProfileAndMessages()}
                  placeholder="ស្វែងរកអ៊ីមែល (Search mail)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  id="gmail-refresh-btn"
                  onClick={loadProfileAndMessages}
                  disabled={!hasToken || isLoadingMessages}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
                  title="ទាញយកសារឡើងវិញ"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  <span>ទាញយកឡើងវិញ</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: Message Detail Reader */}
          {selectedMessage ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                    title="ត្រឡប់ក្រោយ"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-moul">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedMessage.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRecipientEmail(selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from);
                      setEmailSubject(`Re: ${selectedMessage.subject.replace(/^Re:\s*/i, '')}`);
                      setEmailBodyHtml(`<br/><br/><blockquote>On ${selectedMessage.date}, wrote:<br/>${selectedMessage.bodyHtml || selectedMessage.bodyText || ''}</blockquote>`);
                      setSelectedMessage(null);
                      setActiveFolder('compose');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>ឆ្លើយតប</span>
                  </button>

                  <button
                    onClick={() => setMessageToDelete(selectedMessage)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="លុបសារនេះ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta information */}
              <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 min-w-[50px]">ផ្ញើពី (From):</span>
                  <span className="text-slate-900 font-medium">{selectedMessage.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 min-w-[50px]">ទៅកាន់ (To):</span>
                  <span className="text-slate-900 font-medium">{selectedMessage.to}</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 text-sm text-slate-800 leading-relaxed overflow-x-auto min-h-[300px]">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="prose prose-sm max-w-none font-battambang"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-battambang text-xs text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {selectedMessage.bodyText || selectedMessage.snippet}
                  </pre>
                )}
              </div>
            </div>
          ) : activeFolder === 'inbox' || activeFolder === 'sent' ? (
            /* VIEW: Message List */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {!hasToken ? (
                <div className="text-center py-16 px-4 space-y-4">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">សូមភ្ជាប់គណនី Google ជាមុនសិន</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      ចុចប៊ូតុង «ចូលគណនីជាមួយ Google» ខាងលើ ដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធទាញយកសារ និងបញ្ជូនសារតាម Gmail
                    </p>
                  </div>
                </div>
              ) : isLoadingMessages ? (
                <div className="text-center py-16 space-y-3">
                  <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">កំពុងទាញយកសារអ៊ីមែលពី Gmail...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">គ្មានសារនៅក្នុងប្រអប់នេះទេ</h4>
                  <p className="text-xs text-slate-500">
                    អ្នកអាចសរសេរសារថ្មី ឬផ្ញើលិខិតសាលាទៅកាន់អាណាព្យាបាល និងគ្រូបង្រៀនបានគ្រប់ពេល
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-4 ${
                        msg.isUnread ? 'bg-red-50/30 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          msg.isUnread ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {msg.from || 'Google User'}
                            </span>
                            {msg.isUnread && (
                              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-bold">
                                សារថ្មី
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 truncate">
                            {msg.subject}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate font-normal">
                            {msg.snippet}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.date.split(' ').slice(0, 4).join(' ') || '-'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeFolder === 'compose' ? (
            /* VIEW: Compose Email Form */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <FileEdit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-moul">
                      សរសេរសារអេឡិចត្រូនិចថ្មី (Compose Email)
                    </h3>
                    <p className="text-xs text-slate-500">
                      ផ្ញើអ៊ីមែលផ្លូវការតាមរយៈគណនី Google Gmail របស់សាលា
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveFolder('templates')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors border border-amber-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>ជ្រើសទម្រង់លិខិតសាលា</span>
                </button>
              </div>

              <form onSubmit={handleOpenSendConfirmation} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    អ្នកទទួល (To Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="ឧ. parent@gmail.com ឬ teacher@school.edu.kh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ចម្លងជូន (Cc)
                  </label>
                  <input
                    type="email"
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    placeholder="ឧ. principal@school.edu.kh (ស្រេចចិត្ត)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ចំណងជើងសារ (Subject) *
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="ឧ. របាយការណ៍លទ្ធផលការសិក្សាប្រចាំខែតុលា..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ខ្លឹមសារសារ (Email Body HTML / Text) *
                  </label>
                  <textarea
                    rows={10}
                    required
                    value={emailBodyHtml}
                    onChange={(e) => setEmailBodyHtml(e.target.value)}
                    placeholder="បញ្ចូលខ្លឹមសារសារជាភាសាខ្មែរ ឬ HTML..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-battambang leading-relaxed"
                  />
                </div>

                {/* Preview Box */}
                {emailBodyHtml && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      ទិដ្ឋភាពជាក់ស្តែង (HTML Email Preview):
                    </span>
                    <div
                      className="bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto max-h-64 text-xs"
                      dangerouslySetInnerHTML={{ __html: emailBodyHtml }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || !hasToken}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Bookmark className="w-4 h-4 text-slate-500" />
                    <span>{isSavingDraft ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកជាសារព្រាង (Save Draft)'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSending || !hasToken}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>ផ្ញើសារឥឡូវនេះ (Send Email)</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* VIEW: Official School Email Templates */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-moul">
                      ទម្រង់លិខិតសាលាស្វ័យប្រវត្តិ (School Email Templates)
                    </h3>
                    <p className="text-xs text-slate-500">
                      បង្កើតទម្រង់លិខិតផ្លូវការដោយស្វ័យប្រវត្តិតាមទិន្នន័យពិន្ទុ វត្តមាន និងកិច្ចប្រជុំ
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Category Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateType('student_score')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'student_score'
                      ? 'border-red-500 bg-red-50/70 text-red-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-red-600 mb-1.5" />
                  <div className="font-semibold">របាយការណ៍ពិន្ទុប្រចាំខែ</div>
                  <div className="text-[10px] text-slate-500 font-normal">ផ្ញើជូនអាណាព្យាបាល</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplateType('parent_meeting')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'parent_meeting'
                      ? 'border-red-500 bg-red-50/70 text-red-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 text-red-600 mb-1.5" />
                  <div className="font-semibold">លិខិតអញ្ជើញប្រជុំ</div>
                  <div className="text-[10px] text-slate-500 font-normal">កិច្ចប្រជុំអាណាព្យាបាល</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplateType('attendance_warning')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'attendance_warning'
                      ? 'border-red-500 bg-red-50/70 text-red-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Bell className="w-4 h-4 text-red-600 mb-1.5" />
                  <div className="font-semibold">លិខិតជូនដំណឹងវត្តមាន</div>
                  <div className="text-[10px] text-slate-500 font-normal">ករណីអវត្តមានឥតច្បាប់</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplateType('teacher_announcement')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'teacher_announcement'
                      ? 'border-red-500 bg-red-50/70 text-red-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-red-600 mb-1.5" />
                  <div className="font-semibold">សេចក្តីជូនដំណឹងផ្ទៃក្នុង</div>
                  <div className="text-[10px] text-slate-500 font-normal">ជូនលោកគ្រូ-អ្នកគ្រូ</div>
                </button>
              </div>

              {/* Template Customization Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                {selectedTemplateType === 'student_score' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ជ្រើសរើសសិស្ស</label>
                      <select
                        value={templateStudentId}
                        onChange={(e) => setTemplateStudentId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="">-- ជ្រើសរើសសិស្សដើម្បីទាញពិន្ទុ --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.lastName} {s.firstName} (ថ្នាក់ទី {s.grade}{s.section})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ខែ / ឆមាស</label>
                      <select
                        value={templateMonth}
                        onChange={(e) => setTemplateMonth(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      >
                        {months.map(m => (
                          <option key={m} value={m}>ខែ {m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {selectedTemplateType === 'parent_meeting' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">កាលបរិច្ឆេទប្រជុំ</label>
                      <input
                        type="text"
                        value={templateMeetingDate}
                        onChange={(e) => setTemplateMeetingDate(e.target.value)}
                        placeholder="ឧ. ថ្ងៃសៅរ៍ ទី២៨ ខែតុលា"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ពេលវេលាប្រជុំ</label>
                      <input
                        type="text"
                        value={templateMeetingTime}
                        onChange={(e) => setTemplateMeetingTime(e.target.value)}
                        placeholder="ឧ. វេលាម៉ោង ០៨:០០ ព្រឹក"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {selectedTemplateType === 'teacher_announcement' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ចំណងជើងសេចក្ដីជូនដំណឹង</label>
                      <input
                        type="text"
                        value={templateAnnouncementTitle}
                        onChange={(e) => setTemplateAnnouncementTitle(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ខ្លឹមសារលម្អិត</label>
                      <textarea
                        rows={3}
                        value={templateAnnouncementBody}
                        onChange={(e) => setTemplateAnnouncementBody(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <button
                  id="btn-apply-template"
                  onClick={handleApplyTemplate}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>អនុវត្តទម្រង់នេះ និងចូលទៅកាន់ប្រអប់ផ្ញើសារ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANDATORY CONFIRMATION DIALOG 1: SEND EMAIL */}
      {showSendConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-battambang border border-slate-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-moul">
                  បញ្ជាក់ការផ្ញើសារ Gmail
                </h3>
                <p className="text-xs text-slate-500">
                  សូមពិនិត្យព័ត៌មានលម្អិតមុនពេលបញ្ជូនសារជាផ្លូវការ
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-slate-700">
              <p>
                <strong>ផ្ញើទៅកាន់៖</strong> <span className="text-slate-900 font-mono">{recipientEmail}</span>
              </p>
              {ccEmail && (
                <p>
                  <strong>ចម្លងជូន (Cc)៖</strong> <span className="text-slate-900 font-mono">{ccEmail}</span>
                </p>
              )}
              <p>
                <strong>ចំណងជើង៖</strong> <span className="text-slate-900 font-semibold">{emailSubject}</span>
              </p>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed">
              សារនេះនឹងត្រូវបញ្ជូនចេញពីគណនី Gmail ផ្លូវការរបស់អ្នកទៅកាន់អ្នកទទួលភ្លាមៗ។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSendConfirmation(false)}
                disabled={isSending}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 transition-colors"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>កំពុងផ្ញើ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>បញ្ជាក់ផ្ញើសារ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG 2: DELETE EMAIL */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs font-battambang border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-moul">
                  តើអ្នកប្រាកដជាចង់លុបសារនេះ?
                </h3>
                <p className="text-xs text-slate-500">
                  ប្រតិបត្តិការនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ
                </p>
              </div>
            </div>

            <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 space-y-1.5 text-slate-700">
              <p>
                <strong>ចំណងជើងសារ៖</strong> {messageToDelete.subject}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                ផ្ញើពី៖ {messageToDelete.from}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>កំពុងលុប...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុបជាអចិន្ត្រៃយ៍</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
