import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { LibraryBook, LibraryReadingLog, LibraryBookCategory } from '../types';
import {
  BookOpen,
  Library,
  Plus,
  Search,
  Filter,
  Bookmark,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Download,
  Award,
  Sparkles,
  Layers,
  Star,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Save,
  BookMarked,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';
import { UniversalPrintModal } from './UniversalPrintModal';

export const LibraryManagement: React.FC = () => {
  const {
    libraryBooks,
    readingLogs,
    addLibraryBook,
    updateLibraryBook,
    deleteLibraryBook,
    addReadingLog,
    updateReadingLog,
    deleteReadingLog,
    students,
    schoolProfile,
    currentUser,
    printSettings,
    showToast
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'logs' | 'ladder'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<LibraryBook | null>(null);

  // Book Form State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookFormData, setBookFormData] = useState<Omit<LibraryBook, 'id'>>({
    code: '',
    titleKhmer: '',
    titleLatin: '',
    category: 'literature',
    format: 'physical',
    digitalFileUrl: '',
    author: '',
    publisher: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    gradeLevel: 1,
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'ទូ A-01',
    coverPhotoUrl: '',
    publishedYear: '2024',
    description: ''
  });

  // Log Form State
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logFormData, setLogFormData] = useState<Omit<LibraryReadingLog, 'id'>>({
    bookId: libraryBooks[0]?.id || '',
    bookTitle: libraryBooks[0]?.titleKhmer || '',
    studentId: students[0]?.id || '',
    studentCode: students[0]?.code || '',
    studentNameKhmer: students[0]?.nameKhmer || '',
    studentGrade: students[0]?.grade || 1,
    studentSection: students[0]?.section || 'ក',
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'borrowed',
    pagesRead: 15,
    summaryOrImpression: '',
    librarianName: currentUser?.nameKhmer || 'បណ្ណារក្ស'
  });

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return libraryBooks.filter(b => {
      const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchG = selectedGrade === 'all' || b.gradeLevel === parseInt(selectedGrade);
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        b.titleKhmer.toLowerCase().includes(q) ||
        (b.titleLatin && b.titleLatin.toLowerCase().includes(q)) ||
        b.code.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q));
      return matchCat && matchG && matchQ;
    });
  }, [libraryBooks, selectedCategory, selectedGrade, searchQuery]);

  // Statistics
  const libraryStats = useMemo(() => {
    const totalTitles = libraryBooks.length;
    let totalCopiesCount = 0;
    let availableCopiesCount = 0;
    libraryBooks.forEach(b => {
      totalCopiesCount += b.totalCopies;
      availableCopiesCount += b.availableCopies;
    });
    const currentlyBorrowedCount = totalCopiesCount - availableCopiesCount;
    const totalReadingSessions = readingLogs.length;

    // Student Reading Champions
    const readerCounts: { [studentName: string]: { count: number; grade: number; section: string; code: string } } = {};
    readingLogs.forEach(l => {
      if (!readerCounts[l.studentNameKhmer]) {
        readerCounts[l.studentNameKhmer] = { count: 0, grade: l.studentGrade, section: l.studentSection, code: l.studentCode };
      }
      readerCounts[l.studentNameKhmer].count += 1;
    });

    const topReaders = Object.entries(readerCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTitles,
      totalCopiesCount,
      availableCopiesCount,
      currentlyBorrowedCount,
      totalReadingSessions,
      topReaders
    };
  }, [libraryBooks, readingLogs]);

  // Open Create Book Modal
  const handleOpenCreateBook = () => {
    setEditingBookId(null);
    setBookFormData({
      code: `BK-2024-${String(libraryBooks.length + 1).padStart(3, '0')}`,
      titleKhmer: '',
      titleLatin: '',
      category: 'literature',
      format: 'physical',
      digitalFileUrl: '',
      author: 'ក្រសួងអប់រំ / អង្គការដៃគូ',
      publisher: 'MoEYS',
      gradeLevel: 2,
      totalCopies: 6,
      availableCopies: 6,
      shelfLocation: 'ទូ A-01',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      publishedYear: '2024',
      description: ''
    });
    setIsAddBookModalOpen(true);
  };

  // Open Edit Book Modal
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
      gradeLevel: book.gradeLevel,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || '',
      coverPhotoUrl: book.coverPhotoUrl || '',
      publishedYear: book.publishedYear || '',
      description: book.description || ''
    });
    setIsAddBookModalOpen(true);
  };

  // Save Book
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.titleKhmer.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងសៀវភៅជាភាសាខ្មែរ!', 'error');
      return;
    }
    if (editingBookId) {
      updateLibraryBook(editingBookId, bookFormData);
    } else {
      addLibraryBook(bookFormData);
    }
    setIsAddBookModalOpen(false);
  };

  // Open Create Reading Log Modal
  const handleOpenCreateLog = (presetBook?: LibraryBook) => {
    setEditingLogId(null);
    const targetBook = presetBook || libraryBooks[0];
    const targetStudent = students[0];

    setLogFormData({
      bookId: targetBook?.id || '',
      bookTitle: targetBook?.titleKhmer || '',
      studentId: targetStudent?.id || '',
      studentCode: targetStudent?.code || '',
      studentNameKhmer: targetStudent?.nameKhmer || '',
      studentGrade: targetStudent?.grade || 1,
      studentSection: targetStudent?.section || 'ក',
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'borrowed',
      pagesRead: 20,
      summaryOrImpression: '',
      librarianName: currentUser?.nameKhmer || 'បណ្ណារក្ស'
    });
    setIsAddLogModalOpen(true);
  };

  // Save Reading Log
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logFormData.studentNameKhmer) {
      showToast('សូមជ្រើសរើសសិស្សានុសិស្ស!', 'error');
      return;
    }
    if (editingLogId) {
      updateReadingLog(editingLogId, logFormData);
    } else {
      addReadingLog(logFormData);
    }
    setIsAddLogModalOpen(false);
  };

  // Return Book Action
  const handleMarkReturned = (log: LibraryReadingLog) => {
    updateReadingLog(log.id, {
      status: 'returned',
      returnDate: new Date().toISOString().split('T')[0]
    });
    showToast(`សិស្ស «${log.studentNameKhmer}» បានសងសៀវភៅ «${log.bookTitle}» រួចរាល់!`);
  };

  const getCategoryLabel = (cat: LibraryBookCategory) => {
    switch (cat) {
      case 'storybook':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">សៀវភៅរឿងនិទានកុមារ</span>;
      case 'core_textbook':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">សៀវភៅពុម្ពគោល MoEYS</span>;
      case 'reference':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">វចនានុក្រម / ឯកសារស្រាវជ្រាវ</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ទូទៅ</span>;
    }
  };

  // Export Library CSV
  const handleExportCsv = () => {
    const headers = ['លេខកូដ', 'ចំណងជើងខ្មែរ', 'ចំណងជើងឡាតាំង', 'ប្រភេទ', 'ថ្នាក់', 'អ្នកនិពន្ធ', 'ចំនួនសរុប', 'នៅសល់', 'ទីតាំងទូ'];
    const rows = libraryBooks.map(b => [
      `"${b.code}"`,
      `"${b.titleKhmer}"`,
      `"${b.titleLatin || ''}"`,
      `"${b.category}"`,
      b.gradeLevel,
      `"${b.author || ''}"`,
      b.totalCopies,
      b.availableCopies,
      `"${b.shelfLocation || ''}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Library_Catalog_${schoolProfile.nameLatin.replace(/\s+/g, '_')}.csv`;
    link.click();
    showToast('បានទាញយកទិន្នន័យបណ្ណាល័យជា CSV ជោគជ័យ!');
  };

  return (
    <div className="space-y-6">
      {/* Screen & Printable Watermark */}
      <AngkorPageWatermark />

      {/* Screen Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-teal-600 shadow-inner">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 font-moul">បណ្ណាល័យ & កំណត់ត្រាអានសៀវភៅ</h1>
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                MoEYS Library Standards
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              គ្រប់គ្រងសៀវភៅរឿង សៀវភៅពុម្ពគោល និងតាមដានជណ្តើរអំណានសិស្សានុសិស្ស {schoolProfile.nameKhmer}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>ទាញយក CSV</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-all"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>បោះពុម្ពបញ្ជីបណ្ណាល័យ</span>
          </button>

          <button
            onClick={() => handleOpenCreateLog()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all"
          >
            <BookMarked className="w-4 h-4" />
            <span>កត់ត្រាការខ្ចី-អាន (Borrow)</span>
          </button>

          <button
            onClick={handleOpenCreateBook}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>បញ្ចូលសៀវភៅថ្មី (New Book)</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ចំណងជើងសៀវភៅ</span>
            <BookOpen className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-moul">{libraryStats.totalTitles} <span className="text-xs font-normal text-slate-500 font-battambang">ក្បាល</span></p>
          <span className="text-[11px] text-teal-600 font-medium mt-1">ក្នុងបញ្ជីសារពើភណ្ឌ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ច្បាប់សៀវភៅសរុប</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2 font-moul">{libraryStats.totalCopiesCount} <span className="text-xs font-normal text-slate-500 font-battambang">ច្បាប់</span></p>
          <span className="text-[11px] text-blue-600 font-medium mt-1">គ្រប់ប្រភេទទាំងអស់</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">សៀវភៅក្នុងបណ្ណាល័យ</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2 font-moul">{libraryStats.availableCopiesCount} <span className="text-xs font-normal text-slate-500 font-battambang">ច្បាប់</span></p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1">ទំនេរអាចខ្ចីបាន</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">កំពុងខ្ចីអាន</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2 font-moul">{libraryStats.currentlyBorrowedCount} <span className="text-xs font-normal text-slate-500 font-battambang">ច្បាប់</span></p>
          <span className="text-[11px] text-amber-600 font-medium mt-1">សិស្សកំពុងខ្ចី</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">កំណត់ត្រាអានសរុប</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2 font-moul">{libraryStats.totalReadingSessions} <span className="text-xs font-normal text-slate-500 font-battambang">លើក</span></p>
          <span className="text-[11px] text-purple-600 font-medium mt-1">ជណ្តើរអំណានសិស្ស</span>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'catalog'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>កាតាឡុកសៀវភៅ ({libraryBooks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'logs'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>កំណត់ហេតុខ្ចី-សង ({readingLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ladder')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === 'ladder'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ជណ្តើរអំណាន & ជើងឯកអាន</span>
          </button>
        </div>

        {/* Filters for Catalog */}
        {activeSubTab === 'catalog' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-slate-500">ប្រភេទ៖</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">គ្រប់ប្រភេទទាំងអស់</option>
                <option value="storybook">សៀវភៅរឿងនិទានកុមារ</option>
                <option value="core_textbook">សៀវភៅពុម្ពគោល MoEYS</option>
                <option value="reference">វចនានុក្រម / ស្រាវជ្រាវ</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-slate-500">កម្រិតថ្នាក់៖</span>
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">គ្រប់ថ្នាក់ (១-៦)</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>ថ្នាក់ទី{g}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកចំណងជើង ឬកូដ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBTAB 1: Catalog Presentation */}
      {activeSubTab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 no-print">
          {filteredBooks.map(b => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Book Cover Photo */}
                <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  <img
                    src={b.coverPhotoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                    alt={b.titleKhmer}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category Pill Top Left */}
                  <div className="absolute top-3 left-3">
                    {getCategoryLabel(b.category)}
                  </div>

                  {/* Grade Badge Top Right */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-sm">
                    ថ្នាក់ទី{b.gradeLevel}
                  </div>

                  {/* Shelf Location & Code Overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-[11px] font-mono text-amber-300 font-bold">{b.code}</p>
                    <p className="text-sm font-bold font-moul leading-tight line-clamp-1 drop-shadow-sm">{b.titleKhmer}</p>
                  </div>
                </div>

                {/* Book Information Body */}
                <div className="p-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">អ្នកនិពន្ធ/រៀបរៀង៖</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{b.author || 'MoEYS'}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">ទីតាំងទូដាក់៖</span>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {b.shelfLocation || 'ទូ A-01'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">ចំនួនក្នុងស្តុក៖</span>
                    <span className="font-bold text-slate-900">
                      <span className="text-emerald-600 font-bold">{b.availableCopies}</span> / {b.totalCopies} ច្បាប់
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleOpenCreateLog(b)}
                  disabled={b.availableCopies <= 0}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    b.availableCopies > 0
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{b.availableCopies > 0 ? 'កត់ត្រាខ្ចី' : 'អស់ពីស្តុក'}</span>
                </button>

                <button
                  onClick={() => handleOpenEditBook(b)}
                  className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                  title="កែសម្រួល"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`តើអ្នកពិតជាចង់លុបសៀវភៅ «${b.titleKhmer}» ចេញពីបណ្ណាល័យមែនទេ?`)) {
                      deleteLibraryBook(b.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="លុបសៀវភៅ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: Borrowing and Return Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm no-print">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-purple-600" />
              <span>បញ្ជីតាមដានការខ្ចី និងសងសៀវភៅបណ្ណាល័យ ({readingLogs.length} កំណត់ត្រា)</span>
            </h3>
            <button
              onClick={() => handleOpenCreateLog()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>កត់ត្រាការខ្ចីថ្មី</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center font-bold">ល.រ</th>
                  <th className="py-3 px-4 font-bold">ឈ្មោះសិស្ស</th>
                  <th className="py-3 px-4 font-bold">ថ្នាក់</th>
                  <th className="py-3 px-4 font-bold">ចំណងជើងសៀវភៅ</th>
                  <th className="py-3 px-4 font-bold">ថ្ងៃខ្ចី</th>
                  <th className="py-3 px-4 font-bold">ថ្ងៃកំណត់សង</th>
                  <th className="py-3 px-4 font-bold text-center">ស្ថានភាព</th>
                  <th className="py-3 px-4 font-bold text-center">ទំព័រអាន</th>
                  <th className="py-3 px-4 font-bold text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {readingLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{log.studentNameKhmer}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.studentCode}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      ថ្នាក់ទី{log.studentGrade}{log.studentSection}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-900">
                      {log.bookTitle}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.borrowDate}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.dueDate}</td>
                    <td className="py-3 px-4 text-center">
                      {log.status === 'returned' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>បានសងរួច</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>កំពុងខ្ចី</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-purple-700">
                      {log.pagesRead || '-'} ទំព័រ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {log.status === 'borrowed' && (
                          <button
                            onClick={() => handleMarkReturned(log)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm flex items-center gap-1"
                            title="ទទួលសៀវភៅមកវិញ"
                          >
                            <Check className="w-3 h-3" />
                            <span>សងសៀវភៅ</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រាអាននេះមែនទេ?`)) {
                              deleteReadingLog(log.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Reading Ladder & Champions */}
      {activeSubTab === 'ladder' && (
        <div className="space-y-6 no-print">
          {/* Champions Podium */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>កម្មវិធីជំរុញការអានសាលាបឋមសិក្សារដ្ឋ</span>
                </div>
                <h2 className="text-2xl font-bold font-moul">ជើងឯកអំណានប្រចាំឆ្នាំសិក្សា</h2>
                <p className="text-xs text-amber-100 max-w-xl">
                  លើកទឹកចិត្តសិស្សានុសិស្សដែលបានអានសៀវភៅ និងកត់ត្រាចំណាប់អារម្មណ៍អំណានបានច្រើនជាងគេក្នុងបណ្ណាល័យ {schoolProfile.nameKhmer}
                </p>
              </div>

              {/* Gold Trophy Icon */}
              <div className="w-24 h-24 bg-white/15 rounded-3xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Award className="w-14 h-14 text-yellow-200 drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* Top Readers Roster */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {libraryStats.topReaders.map((reader, idx) => (
              <div
                key={reader.name}
                className={`bg-white rounded-2xl border p-5 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                  idx === 0 ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Ranking Tag */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-blue-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{reader.name}</h4>
                      <p className="text-[11px] text-slate-500">ថ្នាក់ទី{reader.grade}{reader.section} • {reader.code}</p>
                    </div>
                  </div>

                  <Award className={`w-6 h-6 ${idx === 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>

                {/* Score Stats */}
                <div className="py-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ចំនួនសៀវភៅបានអាន៖</span>
                    <span className="font-bold font-moul text-base text-purple-700">{reader.count} ក្បាល</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">កម្រិតជណ្តើរអំណាន៖</span>
                    <span className="font-bold text-emerald-700">កម្រិត {Math.min(5, Math.ceil(reader.count / 2))} (ផ្កាយ ៥)</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 text-center text-xs font-bold text-blue-700">
                  ★ ប័ណ្ណសរសើរអំណានឆ្នើម MoEYS ★
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official MoEYS Printable Library Ledger (Hidden on screen, shown in print) */}
      <div className="hidden print:block bg-white p-4 space-y-6">
        <MoEYSRoyalHeader />

        <div className="text-center space-y-1 mt-4">
          <h2 className="text-lg font-bold font-moul text-slate-900">សៀវភៅតាមដានការខ្ចី-សងសៀវភៅ និងជណ្តើរអំណាន</h2>
          <p className="text-xs font-bold text-slate-700">
            {schoolProfile.nameKhmer} • បណ្ណាល័យបឋមសិក្សា
          </p>
          <p className="text-[11px] text-slate-600">
            ឆ្នាំសិក្សា {schoolProfile.academicYear} • ឃុំ{schoolProfile.commune} ស្រុក{schoolProfile.district} {schoolProfile.province}
          </p>
        </div>

        {/* Printable Table */}
        <table className="w-full text-[11px] border-collapse border border-slate-900 mt-4">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-900 text-center font-bold">
              <th className="border border-slate-900 p-1.5 w-10">ល.រ</th>
              <th className="border border-slate-900 p-1.5">ឈ្មោះសិស្ស</th>
              <th className="border border-slate-900 p-1.5 w-14">ថ្នាក់</th>
              <th className="border border-slate-900 p-1.5">ចំណងជើងសៀវភៅអាន</th>
              <th className="border border-slate-900 p-1.5 w-20">ថ្ងៃខ្ចី</th>
              <th className="border border-slate-900 p-1.5 w-20">ថ្ងៃសង</th>
              <th className="border border-slate-900 p-1.5 w-16">ទំព័រ</th>
              <th className="border border-slate-900 p-1.5 w-20">ស្ថានភាព</th>
              <th className="border border-slate-900 p-1.5">បណ្ណារក្ស</th>
            </tr>
          </thead>
          <tbody>
            {readingLogs.map((log, i) => (
              <tr key={log.id} className="border-b border-slate-800 text-slate-900">
                <td className="border border-slate-900 p-1.5 text-center">{i + 1}</td>
                <td className="border border-slate-900 p-1.5 font-bold">{log.studentNameKhmer}</td>
                <td className="border border-slate-900 p-1.5 text-center">ថ្នាក់ទី{log.studentGrade}{log.studentSection}</td>
                <td className="border border-slate-900 p-1.5 font-semibold">{log.bookTitle}</td>
                <td className="border border-slate-900 p-1.5 text-center font-mono">{log.borrowDate}</td>
                <td className="border border-slate-900 p-1.5 text-center font-mono">{log.returnDate || log.dueDate}</td>
                <td className="border border-slate-900 p-1.5 text-center font-bold">{log.pagesRead || '-'}</td>
                <td className="border border-slate-900 p-1.5 text-center">{log.status === 'returned' ? 'បានសង' : 'កំពុងខ្ចី'}</td>
                <td className="border border-slate-900 p-1.5">{log.librarianName || 'បណ្ណារក្ស'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Printable Signatures & Stamps Footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-slate-900 mt-6 page-break-inside-avoid">
          <div className="text-center space-y-1">
            <p className="font-bold">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</p>
            <p className="font-bold">បណ្ណារក្សសាលារៀន</p>
            <div className="h-20" />
            <p className="font-bold">{currentUser?.nameKhmer || 'អ្នកគ្រូ បណ្ណារក្ស'}</p>
          </div>

          <div className="text-center space-y-1 relative">
            <p>ថ្ងៃ................ខែ..........ឆ្នាំ..............ព.ស.២៥៦...</p>
            <p className="font-bold">{schoolProfile.district}, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</p>
            <p className="font-bold font-moul text-sm text-blue-950">នាយកសាលាបឋមសិក្សា</p>

            <div className="h-24 relative flex items-center justify-center">
              {/* Optional Official Stamp */}
              {printSettings.showRoundStamp && (
                <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-red-600/80 flex flex-col items-center justify-center text-red-600 p-1 opacity-90 rotate-[-8deg]">
                  <span className="text-[9px] font-bold">ក្រសួងអប់រំ យុវជន និងកីឡា</span>
                  <span className="text-[8px] font-bold text-center">★ សាលាបឋមសិក្សាភ្នំពុំ ★</span>
                  <span className="text-[7px]">បាត់ដំបង</span>
                </div>
              )}

              {/* Optional Director Signature */}
              {printSettings.showDirectorSignature && (
                <span className="font-cursive text-2xl text-blue-900 transform -rotate-6 z-10 select-none">
                  Lim Sorn
                </span>
              )}
            </div>

            {/* Director Name */}
            <p className={`font-bold font-moul text-sm ${printSettings.showDirectorRedName ? 'text-red-600' : 'text-slate-900'}`}>
              {schoolProfile.principalName}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add/Edit Book */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-lg font-moul">
                  {editingBookId ? 'កែប្រែព័ត៌មានសៀវភៅ' : 'បញ្ចូលសៀវភៅថ្មីក្នុងបណ្ណាល័យ'}
                </h3>
              </div>
              <button onClick={() => setIsAddBookModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">លេខកូដសៀវភៅ / ISBN *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.code}
                    onChange={e => setBookFormData({ ...bookFormData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ប្រភេទសៀវភៅ *</label>
                  <select
                    value={bookFormData.category}
                    onChange={e => setBookFormData({ ...bookFormData, category: e.target.value as LibraryBookCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                  >
                    <option value="storybook">សៀវភៅរឿងនិទានកុមារ</option>
                    <option value="core_textbook">សៀវភៅពុម្ពគោល MoEYS</option>
                    <option value="reference">វចនានុក្រម / ស្រាវជ្រាវ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ចំណងជើងជាភាសាខ្មែរ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. រឿងកូនទន្សាយឈ្លាសវៃ"
                  value={bookFormData.titleKhmer}
                  onChange={e => setBookFormData({ ...bookFormData, titleKhmer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">កម្រិតថ្នាក់</label>
                  <select
                    value={bookFormData.gradeLevel}
                    onChange={e => setBookFormData({ ...bookFormData, gradeLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ចំនួនច្បាប់សរុប</label>
                  <input
                    type="number"
                    min="1"
                    value={bookFormData.totalCopies}
                    onChange={e => setBookFormData({
                      ...bookFormData,
                      totalCopies: parseInt(e.target.value) || 1,
                      availableCopies: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ទីតាំងទូ (Shelf)</label>
                  <input
                    type="text"
                    value={bookFormData.shelfLocation || ''}
                    onChange={e => setBookFormData({ ...bookFormData, shelfLocation: e.target.value })}
                    placeholder="ទូ A-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">តំណរូបភាពក្របសៀវភៅ (Cover Image URL)</label>
                <input
                  type="url"
                  value={bookFormData.coverPhotoUrl || ''}
                  onChange={e => setBookFormData({ ...bookFormData, coverPhotoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
                >
                  រក្សាទុកសៀវភៅ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Borrowing / Reading Log */}
      {isAddLogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookMarked className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-lg font-moul">កត់ត្រាការខ្ចី ឬអានសៀវភៅ</h3>
              </div>
              <button onClick={() => setIsAddLogModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-6 space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">ជ្រើសរើសសិស្សានុសិស្ស *</label>
                <select
                  value={logFormData.studentId}
                  onChange={e => {
                    const st = students.find(s => s.id === e.target.value);
                    if (st) {
                      setLogFormData({
                        ...logFormData,
                        studentId: st.id,
                        studentCode: st.code,
                        studentNameKhmer: st.nameKhmer,
                        studentGrade: st.grade,
                        studentSection: st.section
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameKhmer} ({s.code}) - ថ្នាក់ទី{s.grade}{s.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Book */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">ជ្រើសរើសសៀវភៅ *</label>
                <select
                  value={logFormData.bookId}
                  onChange={e => {
                    const bk = libraryBooks.find(b => b.id === e.target.value);
                    if (bk) {
                      setLogFormData({
                        ...logFormData,
                        bookId: bk.id,
                        bookTitle: bk.titleKhmer
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm"
                >
                  {libraryBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.titleKhmer} ({b.code}) - នៅសល់ {b.availableCopies} ច្បាប់
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ថ្ងៃខ្ចី</label>
                  <input
                    type="date"
                    value={logFormData.borrowDate}
                    onChange={e => setLogFormData({ ...logFormData, borrowDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ថ្ងៃត្រូវសង</label>
                  <input
                    type="date"
                    value={logFormData.dueDate}
                    onChange={e => setLogFormData({ ...logFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ចំនួនទំព័រអានបាន</label>
                <input
                  type="number"
                  min="1"
                  value={logFormData.pagesRead || 10}
                  onChange={e => setLogFormData({ ...logFormData, pagesRead: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ចំណាប់អារម្មណ៍ ឬសេចក្តីសង្ខេបរបស់សិស្ស</label>
                <textarea
                  rows={2}
                  placeholder="សិស្សបានសង្ខេប ឬរៀបរាប់អំពីចំណុចល្អក្នុងសៀវភៅ..."
                  value={logFormData.summaryOrImpression || ''}
                  onChange={e => setLogFormData({ ...logFormData, summaryOrImpression: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddLogModalOpen(false)}
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

      {/* Universal Print Modal */}
      <UniversalPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        titleKhmer="សៀវភៅតាមដានការខ្ចី-សងសៀវភៅ និងជណ្តើរអំណានបណ្ណាល័យ"
        documentSubtitle={`បណ្ណាល័យ ${schoolProfile.nameKhmer} • ឆ្នាំសិក្សា ${schoolProfile.academicYear}`}
      />
    </div>
  );
};
