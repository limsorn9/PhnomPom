import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { LibraryBook, LibraryReadingLog, LibraryBookCategory, LibraryBookFormat } from '../types';
import {
  Library,
  BookOpen,
  BookMarked,
  Users,
  Trophy,
  Printer,
  Plus,
  Search,
  Sparkles,
  Layers,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Bookmark,
  Calendar,
  Award,
  ChevronRight,
  Eye,
  Star,
  ExternalLink
} from 'lucide-react';
import { BookCatalogTab } from './library/BookCatalogTab';
import { CirculationDeskTab } from './library/CirculationDeskTab';
import { VisitorTrackerTab } from './library/VisitorTrackerTab';
import { ReadingLadderTab } from './library/ReadingLadderTab';
import { LibraryReportsTab } from './library/LibraryReportsTab';

export const LibraryManagement: React.FC = () => {
  const {
    libraryBooks,
    readingLogs,
    libraryVisitors,
    addLibraryBook,
    updateLibraryBook,
    addReadingLog,
    students,
    currentUser,
    schoolProfile,
    showToast
  } = useSchool();

  const isReadOnly = currentUser?.role === 'student' || currentUser?.role === 'parent';

  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'circulation' | 'visitors' | 'ladder' | 'reports'>('overview');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookFormData, setBookFormData] = useState<Omit<LibraryBook, 'id'>>({
    code: '',
    titleKhmer: '',
    titleLatin: '',
    category: 'storybook',
    format: 'physical',
    digitalFileUrl: '',
    author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publisher: 'MoEYS',
    gradeLevel: 1,
    totalCopies: 10,
    availableCopies: 10,
    shelfLocation: 'ទូ A-01',
    coverPhotoUrl: '',
    publishedYear: '2024',
    description: '',
    bookCondition: 'good'
  });

  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [lendFormData, setLendFormData] = useState<{
    studentId: string;
    studentCode: string;
    studentNameKhmer: string;
    grade: number;
    section: string;
    bookId: string;
    bookCode: string;
    bookTitle: string;
    bookCategory: string;
    borrowDate: string;
    dueDate: string;
    notes: string;
  }>({
    studentId: students[0]?.id || '',
    studentCode: students[0]?.code || '',
    studentNameKhmer: students[0]?.nameKhmer || '',
    grade: students[0]?.grade || 1,
    section: students[0]?.section || 'ក',
    bookId: libraryBooks[0]?.id || '',
    bookCode: libraryBooks[0]?.code || '',
    bookTitle: libraryBooks[0]?.titleKhmer || '',
    bookCategory: libraryBooks[0]?.category || 'storybook',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  // Overview Statistics
  const stats = useMemo(() => {
    const totalTitles = libraryBooks.length;
    let totalCopies = 0;
    let availableCopies = 0;
    libraryBooks.forEach(b => {
      totalCopies += b.totalCopies;
      availableCopies += b.availableCopies;
    });
    const borrowedCopies = totalCopies - availableCopies;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayVisitors = libraryVisitors.filter(v => v.visitDate === todayStr).length;

    const overdueCount = readingLogs.filter(l => {
      if (l.status === 'returned') return false;
      const due = new Date(l.dueDate);
      const today = new Date();
      return due < today;
    }).length;

    const totalLoans = readingLogs.length;

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      borrowedCopies,
      todayVisitors,
      overdueCount,
      totalLoans
    };
  }, [libraryBooks, readingLogs, libraryVisitors]);

  // Handle Book Modal Open
  const handleOpenCreateBook = () => {
    setEditingBookId(null);
    setBookFormData({
      code: `BK-2024-${String(libraryBooks.length + 1).padStart(3, '0')}`,
      titleKhmer: '',
      titleLatin: '',
      category: 'storybook',
      format: 'physical',
      digitalFileUrl: '',
      author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
      publisher: 'MoEYS',
      gradeLevel: 1,
      totalCopies: 10,
      availableCopies: 10,
      shelfLocation: 'ទូ A-01',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      publishedYear: '2024',
      description: '',
      bookCondition: 'good'
    });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: LibraryBook) => {
    setEditingBookId(book.id);
    setBookFormData({
      code: book.code,
      titleKhmer: book.titleKhmer,
      titleLatin: book.titleLatin || '',
      category: book.category,
      format: book.format || 'physical',
      digitalFileUrl: book.digitalFileUrl || '',
      author: book.author || '',
      publisher: book.publisher || '',
      gradeLevel: book.gradeLevel || 1,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || '',
      coverPhotoUrl: book.coverPhotoUrl || '',
      publishedYear: book.publishedYear || '',
      description: book.description || '',
      bookCondition: book.bookCondition || 'good'
    });
    setIsBookModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.titleKhmer.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងសៀវភៅ!', 'warning');
      return;
    }

    if (editingBookId) {
      updateLibraryBook(editingBookId, bookFormData);
    } else {
      addLibraryBook(bookFormData);
    }
    setIsBookModalOpen(false);
  };

  // Handle Lend Modal Open
  const handleOpenLendModal = () => {
    const firstStu = students[0];
    const availableBooks = libraryBooks.filter(b => b.availableCopies > 0);
    const firstBook = availableBooks[0] || libraryBooks[0];

    setLendFormData({
      studentId: firstStu?.id || '',
      studentCode: firstStu?.code || '',
      studentNameKhmer: firstStu?.nameKhmer || '',
      grade: firstStu?.grade || 1,
      section: firstStu?.section || 'ក',
      bookId: firstBook?.id || '',
      bookCode: firstBook?.code || '',
      bookTitle: firstBook?.titleKhmer || '',
      bookCategory: firstBook?.category || 'storybook',
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    });
    setIsLendModalOpen(true);
  };

  const handleSaveLend = (e: React.FormEvent) => {
    e.preventDefault();
    const book = libraryBooks.find(b => b.id === lendFormData.bookId);
    if (!book || book.availableCopies <= 0) {
      showToast('សៀវភៅនេះត្រូវបានខ្ចីអស់ពីស្តុកហើយ!', 'warning');
      return;
    }

    addReadingLog({
      studentId: lendFormData.studentId,
      studentCode: lendFormData.studentCode,
      studentNameKhmer: lendFormData.studentNameKhmer,
      grade: lendFormData.grade,
      section: lendFormData.section,
      bookId: lendFormData.bookId,
      bookCode: lendFormData.bookCode,
      bookTitle: lendFormData.bookTitle,
      bookCategory: lendFormData.bookCategory,
      borrowDate: lendFormData.borrowDate,
      dueDate: lendFormData.dueDate,
      status: 'borrowed',
      pagesRead: 0,
      librarianName: currentUser?.nameKhmer || 'បណ្ណារក្ស'
    });

    setIsLendModalOpen(false);
  };

  interface LibraryTabItem {
    id: 'overview' | 'catalog' | 'circulation' | 'visitors' | 'ladder' | 'reports';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const tabs: LibraryTabItem[] = [
    { id: 'overview', label: '📊 ផ្ទាំងសង្ខេប (Dashboard)', icon: Library },
    { id: 'catalog', label: '📚 បញ្ជីសៀវភៅ (Catalog)', icon: BookOpen, count: libraryBooks.length },
    { id: 'circulation', label: '🔄 ខ្ចី-សងសៀវភៅ (Circulation)', icon: BookMarked, count: readingLogs.filter(l => l.status === 'borrowed').length },
    { id: 'visitors', label: '👥 វត្តមានបណ្ណាល័យ (Visitors)', icon: Users, count: stats.todayVisitors },
    { id: 'ladder', label: '🏆 ជណ្តើរអំណាន (Champions)', icon: Trophy },
    { id: 'reports', label: '🖨️ របាយការណ៍ MoEYS', icon: Printer }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-moul text-lg sm:text-2xl text-slate-800">
                  ផ្ទាំងគ្រប់គ្រងបណ្ណារក្ស
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  បណ្ណាល័យសាលា
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-battambang mt-0.5">
                ប្រព័ន្ធគ្រប់គ្រងសៀវភៅ ចរាចរណ៍ខ្ចី-សង និងតាមដានសកម្មភាពអានរបស់សិស្សានុសិស្ស {schoolProfile.nameKhmer}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={handleOpenLendModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>កត់ត្រាការខ្ចី (Lend)</span>
              </button>
            )}

            {!isReadOnly && (
              <button
                onClick={handleOpenCreateBook}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែមសៀវភៅ (Add Book)</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-slate-100 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      isActive ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {toKhmerNum(tab.count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview Dashboard */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-battambang">សៀវភៅក្នុងបណ្ណាល័យ</p>
                <p className="text-2xl sm:text-3xl font-bold font-times text-teal-800 mt-1">
                  {toKhmerNum(stats.totalTitles)}{' '}
                  <span className="text-xs text-slate-500 font-battambang font-normal">
                    ចំណងជើង ({toKhmerNum(stats.totalCopies)} ច្បាប់)
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-battambang">សៀវភៅកំពុងខ្ចី</p>
                <p className="text-2xl sm:text-3xl font-bold font-times text-blue-700 mt-1">
                  {toKhmerNum(stats.borrowedCopies)}{' '}
                  <span className="text-xs text-slate-500 font-battambang font-normal">ច្បាប់</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 font-bold font-battambang">ហួសកាលកំណត់</p>
                <p className="text-2xl sm:text-3xl font-bold font-times text-rose-700 mt-1">
                  {toKhmerNum(stats.overdueCount)}{' '}
                  <span className="text-xs text-slate-500 font-battambang font-normal">ក្បាល</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-battambang">វត្តមានសិស្សថ្ងៃនេះ</p>
                <p className="text-2xl sm:text-3xl font-bold font-times text-emerald-700 mt-1">
                  {toKhmerNum(stats.todayVisitors)}{' '}
                  <span className="text-xs text-slate-500 font-battambang font-normal">នាក់</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Live Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Loans Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-purple-700" />
                  <h3 className="font-moul text-sm sm:text-base text-slate-800">
                    សៀវភៅកំពុងស្ថិតក្នុងការខ្ចី ({toKhmerNum(readingLogs.filter(l => l.status === 'borrowed').length)})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('circulation')}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                >
                  <span>មើលទាំងអស់</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm font-battambang">
                {readingLogs.filter(l => l.status === 'borrowed').length === 0 ? (
                  <p className="py-6 text-center text-slate-400">មិនមានសៀវភៅកំពុងខ្ចីឡើយ</p>
                ) : (
                  readingLogs
                    .filter(l => l.status === 'borrowed')
                    .slice(0, 5)
                    .map(log => (
                      <div key={log.id} className="py-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800">{log.bookTitle}</p>
                          <p className="text-xs text-slate-500 font-mono">
                            ខ្ចីដោយ៖ <span className="font-bold text-blue-900">{log.studentNameKhmer}</span> (ថ្នាក់ទី {toKhmerNum(log.grade || log.studentGrade || 1)}{log.section || 'ក'})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            ត្រូវសង៖ {log.dueDate}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Quick Actions & Top Books */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-teal-700 to-emerald-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="font-moul text-sm sm:text-base text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-200" />
                  <span>សកម្មភាពរហ័ស (Quick Actions)</span>
                </h3>
                <p className="text-xs text-teal-100 font-battambang">
                  ចុចដើម្បីកត់ត្រាការងារបណ្ណាល័យប្រចាំថ្ងៃបានឆាប់រហ័ស
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setActiveTab('visitors')}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>កត់ត្រាវត្តមានចូលបណ្ណាល័យ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('ladder')}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>ចេញលិខិតសរសើរជើងឯកអាន</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>បោះពុម្ពបញ្ជីសារពើភណ្ឌ MoEYS</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Catalog Tab */}
      {activeTab === 'catalog' && (
        <BookCatalogTab
          onOpenCreateBook={handleOpenCreateBook}
          onOpenEditBook={handleOpenEditBook}
        />
      )}

      {/* Tab 3: Circulation Desk Tab */}
      {activeTab === 'circulation' && (
        <CirculationDeskTab onOpenLendModal={handleOpenLendModal} />
      )}

      {/* Tab 4: Visitors Tab */}
      {activeTab === 'visitors' && <VisitorTrackerTab />}

      {/* Tab 5: Reading Ladder Tab */}
      {activeTab === 'ladder' && <ReadingLadderTab />}

      {/* Tab 6: Reports Tab */}
      {activeTab === 'reports' && <LibraryReportsTab />}

      {/* Add / Edit Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-teal-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-200" />
                <h3 className="font-moul text-sm sm:text-base">
                  {editingBookId ? 'កែប្រែទិន្នន័យសៀវភៅ' : 'បន្ថែមសៀវភៅថ្មីចូលបណ្ណាល័យ'}
                </h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-5 sm:p-6 space-y-4 font-battambang text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">កូដសៀវភៅ (Book Code)</label>
                  <input
                    type="text"
                    value={bookFormData.code}
                    onChange={e => setBookFormData({ ...bookFormData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ទម្រង់សៀវភៅ</label>
                  <select
                    value={bookFormData.format || 'physical'}
                    onChange={e => setBookFormData({ ...bookFormData, format: e.target.value as LibraryBookFormat })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="physical">📚 សៀវភៅរូបវន្ត (Physical Book)</option>
                    <option value="digital">💻 សៀវភៅឌីជីថល (E-Book / PDF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ចំណងជើងសៀវភៅ (ភាសាខ្មែរ)</label>
                  <input
                    type="text"
                    value={bookFormData.titleKhmer}
                    onChange={e => setBookFormData({ ...bookFormData, titleKhmer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    placeholder="ឧ. រឿងកូនទន្សាយឈ្លាសវៃ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ចំណងជើងជាអក្សរឡាតាំង (Title Latin)</label>
                  <input
                    type="text"
                    value={bookFormData.titleLatin || ''}
                    onChange={e => setBookFormData({ ...bookFormData, titleLatin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-times"
                    placeholder="The Clever Rabbit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ប្រភេទសៀវភៅ</label>
                  <select
                    value={bookFormData.category}
                    onChange={e => setBookFormData({ ...bookFormData, category: e.target.value as LibraryBookCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="storybook">រឿងនិទានកុមារ</option>
                    <option value="core_textbook">សៀវភៅពុម្ពគោល</option>
                    <option value="science">វិទ្យាសាស្ត្រ</option>
                    <option value="history">ប្រវត្តិសាស្ត្រ</option>
                    <option value="mathematics">គណិតវិទ្យា</option>
                    <option value="geography">ភូមិវិទ្យា</option>
                    <option value="literature">អក្សរសាស្ត្រ & កំណាព្យ</option>
                    <option value="reference">ឯកសារយោង & វចនានុក្រម</option>
                    <option value="magazine">ទស្សនាវដ្តី</option>
                    <option value="general">ចំណេះដឹងទូទៅ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ថ្នាក់គោលដៅ</label>
                  <select
                    value={bookFormData.gradeLevel || 1}
                    onChange={e => setBookFormData({ ...bookFormData, gradeLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>
                        ថ្នាក់ទី {toKhmerNum(g)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ទីតាំងទូ/ធ្នើ</label>
                  <input
                    type="text"
                    value={bookFormData.shelfLocation || ''}
                    onChange={e => setBookFormData({ ...bookFormData, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    placeholder="ទូ A-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">អ្នកនិពន្ធ</label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={e => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="MoEYS / SIPAR"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ចំនួនសរុប (Total Copies)</label>
                  <input
                    type="number"
                    min="1"
                    value={bookFormData.totalCopies}
                    onChange={e => {
                      const total = parseInt(e.target.value) || 1;
                      setBookFormData({
                        ...bookFormData,
                        totalCopies: total,
                        availableCopies: editingBookId ? Math.min(total, bookFormData.availableCopies) : total
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ចំនួននៅសល់ (Available)</label>
                  <input
                    type="number"
                    min="0"
                    max={bookFormData.totalCopies}
                    value={bookFormData.availableCopies}
                    onChange={e => setBookFormData({ ...bookFormData, availableCopies: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              {bookFormData.format === 'digital' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">តំណភ្ជាប់ PDF / Google Drive E-Book</label>
                  <input
                    type="url"
                    value={bookFormData.digitalFileUrl || ''}
                    onChange={e => setBookFormData({ ...bookFormData, digitalFileUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">តំណភ្ជាប់រូបភាពក្របសៀវភៅ (Cover Photo URL)</label>
                <input
                  type="url"
                  value={bookFormData.coverPhotoUrl || ''}
                  onChange={e => setBookFormData({ ...bookFormData, coverPhotoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">សេចក្តីសង្ខេបខ្លឹមសារសៀវភៅ</label>
                <textarea
                  rows={2}
                  value={bookFormData.description || ''}
                  onChange={e => setBookFormData({ ...bookFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="សេចក្តីសង្ខេបខ្លីៗអំពីខ្លឹមសាររឿង ឬមេរៀន..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingBookId ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមសៀវភៅ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lend Book Wizard Modal */}
      {isLendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-purple-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-200" />
                <h3 className="font-moul text-sm sm:text-base">កត់ត្រាការខ្ចីសៀវភៅបណ្ណាល័យ</h3>
              </div>
              <button
                onClick={() => setIsLendModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLend} className="p-5 space-y-4 font-battambang text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ជ្រើសរើសសិស្សដែលខ្ចី</label>
                <select
                  value={lendFormData.studentId}
                  onChange={e => {
                    const stu = students.find(s => s.id === e.target.value);
                    if (stu) {
                      setLendFormData({
                        ...lendFormData,
                        studentId: stu.id,
                        studentCode: stu.code || '',
                        studentNameKhmer: stu.nameKhmer,
                        grade: stu.grade || 1,
                        section: stu.section || 'ក'
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameKhmer} ({s.code || 'STU'}) - ថ្នាក់ទី {toKhmerNum(s.grade || 1)}{s.section || 'ក'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ជ្រើសរើសសៀវភៅដែលត្រូវខ្ចី</label>
                <select
                  value={lendFormData.bookId}
                  onChange={e => {
                    const bk = libraryBooks.find(b => b.id === e.target.value);
                    if (bk) {
                      setLendFormData({
                        ...lendFormData,
                        bookId: bk.id,
                        bookCode: bk.code,
                        bookTitle: bk.titleKhmer,
                        bookCategory: bk.category
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  required
                >
                  {libraryBooks.map(b => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.titleKhmer} ({b.code}) {b.availableCopies > 0 ? `- នៅសល់ ${toKhmerNum(b.availableCopies)} ច្បាប់` : '(ខ្ចីអស់)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ថ្ងៃខ្ចី</label>
                  <input
                    type="date"
                    value={lendFormData.borrowDate}
                    onChange={e => setLendFormData({ ...lendFormData, borrowDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ថ្ងៃត្រូវសង</label>
                  <input
                    type="date"
                    value={lendFormData.dueDate}
                    onChange={e => setLendFormData({ ...lendFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">កំណត់រយៈពេល៖</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setLendFormData({ ...lendFormData, dueDate: d.toISOString().split('T')[0] });
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                >
                  ៧ ថ្ងៃ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    setLendFormData({ ...lendFormData, dueDate: d.toISOString().split('T')[0] });
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                >
                  ១៤ ថ្ងៃ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setLendFormData({ ...lendFormData, dueDate: d.toISOString().split('T')[0] });
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                >
                  ១ ខែ
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLendModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
                >
                  កត់ត្រាការខ្ចី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
