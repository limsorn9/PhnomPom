import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { LibraryBook, LibraryBookCategory } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  QrCode,
  FileSpreadsheet,
  Grid,
  List,
  CheckCircle,
  Sparkles,
  Bookmark,
  BookMarked
} from 'lucide-react';

interface BookCatalogTabProps {
  onOpenCreateBook: () => void;
  onOpenEditBook: (book: LibraryBook) => void;
}

export const BookCatalogTab: React.FC<BookCatalogTabProps> = ({
  onOpenCreateBook,
  onOpenEditBook
}) => {
  const {
    libraryBooks,
    deleteLibraryBook,
    currentUser,
    showToast
  } = useSchool();

  const isReadOnly = currentUser?.role === 'student' || currentUser?.role === 'parent';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<LibraryBook | null>(null);

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  const categoryLabels: Record<string, string> = {
    storybook: 'រឿងនិទានកុមារ',
    core_textbook: 'សៀវភៅពុម្ពគោល',
    science: 'វិទ្យាសាស្ត្រ',
    history: 'ប្រវត្តិសាស្ត្រ',
    mathematics: 'គណិតវិទ្យា',
    geography: 'ភូមិវិទ្យា',
    literature: 'អក្សរសាស្ត្រ & កំណាព្យ',
    reference: 'ឯកសារយោង & វចនានុក្រម',
    magazine: 'ទស្សនាវដ្តី & ព័ត៌មាន',
    general: 'ចំណេះដឹងទូទៅ'
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    return libraryBooks.filter(b => {
      const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchG = selectedGrade === 'all' || b.gradeLevel === parseInt(selectedGrade);
      const matchF = selectedFormat === 'all' || (b.format || 'physical') === selectedFormat;
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        b.titleKhmer.toLowerCase().includes(q) ||
        (b.titleLatin && b.titleLatin.toLowerCase().includes(q)) ||
        b.code.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.shelfLocation && b.shelfLocation.toLowerCase().includes(q));

      return matchCat && matchG && matchF && matchQ;
    });
  }, [libraryBooks, selectedCategory, selectedGrade, selectedFormat, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['កូដសៀវភៅ,ចំណងជើងខ្មែរ,ចំណងជើងឡាតាំង,ប្រភេទ,ទម្រង់,អ្នកនិពន្ធ,កម្រិតថ្នាក់,ចំនួនសរុប,ចំនួននៅសល់,ទីតាំងទូ/ធ្នើ,ISBN'];
    const rows = filteredBooks.map(b =>
      `"${b.code}","${b.titleKhmer}","${b.titleLatin || ''}","${categoryLabels[b.category] || b.category}","${b.format === 'digital' ? 'E-Book' : 'រូបវន្ត'}","${b.author || ''}","ថ្នាក់ទី ${b.gradeLevel || 1}","${b.totalCopies}","${b.availableCopies}","${b.shelfLocation || ''}","${b.isbnBarcode || ''}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `បញ្ជីសារពើភណ្ឌសៀវភៅ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('បានទាញយកតារាងបញ្ជីសៀវភៅជា CSV ជោគជ័យ!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-2 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>កាតាឡុកសៀវភៅ និងសារពើភណ្ឌ (Book Catalog & Inventory)</span>
          </div>
          <h2 className="font-moul text-xl sm:text-2xl text-white">បញ្ជីសៀវភៅបណ្ណាល័យសរុប</h2>
          <p className="text-xs sm:text-sm text-teal-100 font-battambang mt-1">
            គ្រប់គ្រងសៀវភៅពុម្ព រឿងនិទាន ឯកសារយោង និងសៀវភៅឌីជីថល (E-Books)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-300" />
            <span>ទាញយក CSV</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={onOpenCreateBook}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមសៀវភៅថ្មី (Add Book)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង, កូដ, អ្នកនិពន្ធ, ទូ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 font-battambang"
          >
            <option value="all">គ្រប់ប្រភេទសៀវភៅ</option>
            {Object.entries(categoryLabels).map(([catKey, catName]) => (
              <option key={catKey} value={catKey}>
                {catName}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 font-battambang"
          >
            <option value="all">គ្រប់កម្រិតថ្នាក់</option>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>
                ថ្នាក់ទី {toKhmerNum(g)}
              </option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 font-battambang"
          >
            <option value="all">គ្រប់ទម្រង់ (រូបវន្ត & E-Book)</option>
            <option value="physical">📚 សៀវភៅរូបវន្ត</option>
            <option value="digital">💻 សៀវភៅឌីជីថល (E-Book)</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>មិនមានសៀវភៅស្របតាមការស្វែងរកឡើយ</p>
            </div>
          ) : (
            filteredBooks.map(book => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Book Cover Photo / Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      book.coverPhotoUrl ||
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={book.titleKhmer}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Format & Grade Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-md font-mono">
                      {book.code}
                    </span>
                    {book.format === 'digital' && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>E-Book</span>
                      </span>
                    )}
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute bottom-2 right-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg backdrop-blur-md shadow ${
                        book.availableCopies > 0
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-rose-600/90 text-white'
                      }`}
                    >
                      {book.availableCopies > 0
                        ? `នៅសល់ ${toKhmerNum(book.availableCopies)}/${toKhmerNum(book.totalCopies)}`
                        : 'ខ្ចីអស់'}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-battambang">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px] font-bold mb-1.5">
                      {categoryLabels[book.category] || book.category}
                    </span>
                    <h3 className="font-moul text-sm text-slate-800 line-clamp-2 leading-relaxed">
                      {book.titleKhmer}
                    </h3>
                    {book.titleLatin && (
                      <p className="text-xs text-slate-500 font-times line-clamp-1 italic mt-0.5">
                        {book.titleLatin}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">អ្នកនិពន្ធ/រៀបចំ៖</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                        {book.author || 'MoEYS'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ទីតាំងទូ/ធ្នើ៖</span>
                      <span className="font-mono font-bold text-teal-700">
                        {book.shelfLocation || 'ទូទូទៅ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ថ្នាក់គោលដៅ៖</span>
                      <span className="font-bold text-slate-700">
                        ថ្នាក់ទី {toKhmerNum(book.gradeLevel || 1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedBookForDetail(book)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 flex-1 justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ព័ត៌មាន</span>
                    </button>

                    {book.format === 'digital' && book.digitalFileUrl && (
                      <a
                        href={book.digitalFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-lg flex items-center gap-1"
                        title="អាន E-Book Online"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>អាន E-Book</span>
                      </a>
                    )}

                    {!isReadOnly && (
                      <button
                        onClick={() => onOpenEditBook(book)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="កែប្រែ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {!isReadOnly && (
                      <button
                        onClick={() => deleteLibraryBook(book.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="លុប"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-moul text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">កូដសៀវភៅ</th>
                  <th className="py-3 px-4">ចំណងជើងសៀវភៅ</th>
                  <th className="py-3 px-4">ប្រភេទ</th>
                  <th className="py-3 px-4">ទីតាំងទូ/ធ្នើ</th>
                  <th className="py-3 px-4 text-center">ចំនួននៅសល់/សរុប</th>
                  <th className="py-3 px-4 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-battambang text-slate-700">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      មិនមានសៀវភៅស្របតាមការស្វែងរកឡើយ
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map(book => (
                    <tr key={book.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-teal-800">{book.code}</span>
                        {book.isbnBarcode && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {book.isbnBarcode}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{book.titleKhmer}</div>
                        <div className="text-[11px] text-slate-500 font-times italic">
                          {book.author || 'MoEYS'} • ថ្នាក់ទី {toKhmerNum(book.gradeLevel || 1)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          {categoryLabels[book.category] || book.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {book.shelfLocation || '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold font-times text-sm px-2.5 py-1 rounded-lg ${
                            book.availableCopies > 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {toKhmerNum(book.availableCopies)} / {toKhmerNum(book.totalCopies)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBookForDetail(book)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                            title="មើលព័ត៌មានលម្អិត"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isReadOnly && (
                            <button
                              onClick={() => onOpenEditBook(book)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="កែប្រែ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {!isReadOnly && (
                            <button
                              onClick={() => deleteLibraryBook(book.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              title="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBookForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-teal-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-200" />
                <h3 className="font-moul text-sm sm:text-base">ព័ត៌មានលម្អិតសៀវភៅ</h3>
              </div>
              <button
                onClick={() => setSelectedBookForDetail(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 font-battambang text-xs sm:text-sm text-slate-700">
              <div className="flex gap-4 items-start">
                <img
                  src={
                    selectedBookForDetail.coverPhotoUrl ||
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={selectedBookForDetail.titleKhmer}
                  referrerPolicy="no-referrer"
                  className="w-24 h-32 object-cover rounded-xl border border-slate-200 shadow"
                />
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-bold rounded">
                    {selectedBookForDetail.code}
                  </span>
                  <h4 className="font-moul text-slate-900 text-sm sm:text-base mt-1">
                    {selectedBookForDetail.titleKhmer}
                  </h4>
                  {selectedBookForDetail.titleLatin && (
                    <p className="text-xs text-slate-500 font-times italic">
                      {selectedBookForDetail.titleLatin}
                    </p>
                  )}
                  <p className="text-xs text-slate-600">
                    អ្នកនិពន្ធ៖ <span className="font-bold">{selectedBookForDetail.author || 'MoEYS'}</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    បោះពុម្ពឆ្នាំ៖ <span className="font-mono">{selectedBookForDetail.publishedYear || '2024'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 text-xs">ប្រភេទសៀវភៅ៖</span>
                  <p className="font-bold text-slate-800">
                    {categoryLabels[selectedBookForDetail.category] || selectedBookForDetail.category}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs">ទីតាំងទូ/ធ្នើ៖</span>
                  <p className="font-mono font-bold text-teal-800">
                    {selectedBookForDetail.shelfLocation || 'ទូទូទៅ'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs">ចំនួនក្នុងស្តុក៖</span>
                  <p className="font-bold text-slate-800">
                    នៅសល់ {toKhmerNum(selectedBookForDetail.availableCopies)} / សរុប {toKhmerNum(selectedBookForDetail.totalCopies)} ច្បាប់
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs">កម្រិតថ្នាក់៖</span>
                  <p className="font-bold text-slate-800">
                    ថ្នាក់ទី {toKhmerNum(selectedBookForDetail.gradeLevel || 1)}
                  </p>
                </div>
              </div>

              {selectedBookForDetail.description && (
                <div>
                  <span className="text-slate-500 text-xs block mb-1">សេចក្តីសង្ខេបខ្លឹមសារ៖</span>
                  <p className="text-slate-600 text-xs leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                    {selectedBookForDetail.description}
                  </p>
                </div>
              )}

              {selectedBookForDetail.format === 'digital' && selectedBookForDetail.digitalFileUrl && (
                <a
                  href={selectedBookForDetail.digitalFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>បើកអាន E-Book ពេញលេញ</span>
                </a>
              )}
            </div>

            <div className="bg-slate-100 px-5 py-3 flex items-center justify-end">
              <button
                onClick={() => setSelectedBookForDetail(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
