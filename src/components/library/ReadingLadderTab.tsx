import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Award, Sparkles, Trophy, Star, BookOpen, Layers, Printer, FileSpreadsheet, Medal, ChevronRight } from 'lucide-react';
import { ReadingCertificateModal } from './ReadingCertificateModal';

export const ReadingLadderTab: React.FC = () => {
  const { readingLogs, students, showToast } = useSchool();

  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<{
    name: string;
    code?: string;
    grade: number;
    section: string;
    count: number;
    rank?: number;
  } | null>(null);

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  // Student Reading Ladder Stats
  const studentRankings = useMemo(() => {
    const counts: {
      [key: string]: {
        name: string;
        code: string;
        grade: number;
        section: string;
        booksCount: number;
        totalPages: number;
        lastReadDate: string;
      };
    } = {};

    readingLogs.forEach(log => {
      const key = log.studentNameKhmer;
      if (!counts[key]) {
        counts[key] = {
          name: log.studentNameKhmer,
          code: log.studentCode || '',
          grade: log.grade || log.studentGrade || 1,
          section: log.section || log.studentSection || 'ក',
          booksCount: 0,
          totalPages: 0,
          lastReadDate: log.borrowDate
        };
      }
      counts[key].booksCount += 1;
      counts[key].totalPages += log.pagesRead || 0;
      if (log.borrowDate > counts[key].lastReadDate) {
        counts[key].lastReadDate = log.borrowDate;
      }
    });

    const list = Object.values(counts);

    if (selectedGrade !== 'all') {
      return list.filter(s => s.grade === parseInt(selectedGrade)).sort((a, b) => b.booksCount - a.booksCount);
    }

    return list.sort((a, b) => b.booksCount - a.booksCount);
  }, [readingLogs, selectedGrade]);

  const getTier = (count: number) => {
    if (count >= 30) return { title: 'ជើងឯកកំពូល (Master)', badge: 'bg-purple-100 text-purple-800 border-purple-300', icon: '👑' };
    if (count >= 20) return { title: 'កម្រិតមាស (Gold)', badge: 'bg-amber-100 text-amber-800 border-amber-300', icon: '🥇' };
    if (count >= 10) return { title: 'កម្រិតប្រាក់ (Silver)', badge: 'bg-slate-100 text-slate-800 border-slate-300', icon: '🥈' };
    if (count >= 5) return { title: 'កម្រិតសំរឹទ្ធ (Bronze)', badge: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🥉' };
    return { title: 'អ្នកអានចាប់ផ្តើម (Starter)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🌱' };
  };

  const topThree = studentRankings.slice(0, 3);

  const handleExportCSV = () => {
    const headers = ['ចំណាត់ថ្នាក់,ឈ្មោះសិស្ស,អត្តលេខ,ថ្នាក់,ចំនួនសៀវភៅអាន,ចំនួនទំព័រសរុប,កម្រិតជណ្តើរអំណាន'];
    const rows = studentRankings.map((s, idx) =>
      `"${idx + 1}","${s.name}","${s.code}","ថ្នាក់ទី ${s.grade}${s.section}","${s.booksCount}","${s.totalPages}","${getTier(s.booksCount).title}"`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ជើងឯកអំណានបណ្ណាល័យ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('បានទាញយកតារាងជើងឯកអំណានជា CSV ជោគជ័យ!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-200 mb-2 border border-white/20">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>ជណ្តើរអំណាន និងជើងឯកអានសៀវភៅ (Reading Ladder & Champions)</span>
          </div>
          <h2 className="font-moul text-xl sm:text-2xl text-white">ចំណាត់ថ្នាក់ និងជើងឯកអានសៀវភៅ</h2>
          <p className="text-xs sm:text-sm text-amber-100 font-battambang mt-1">
            លើកទឹកចិត្តសិស្សានុសិស្សឱ្យបង្កើនទម្លាប់អានតាមរយៈកម្រិតជណ្តើរអំណាន និងចេញលិខិតសរសើរផ្លូវការ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold border border-white/20"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>ទាញយក CSV</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 Champions */}
      {studentRankings.length > 0 && (
        <div className="bg-gradient-to-b from-amber-500/10 to-transparent p-6 rounded-2xl border border-amber-200">
          <div className="text-center mb-6">
            <h3 className="font-moul text-amber-900 text-base sm:text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>កំពូលជើងឯកអំណានឆ្នើមទាំង ៣ រូប</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-600 font-battambang">សិស្សដែលបានអានសៀវភៅច្រើនជាងគេប្រចាំបណ្ណាល័យ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto items-end">
            {/* Rank 2 */}
            {topThree[1] && (
              <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-md text-center order-2 sm:order-1 relative">
                <div className="w-12 h-12 bg-slate-200 text-slate-700 font-moul text-xl rounded-full flex items-center justify-center mx-auto -mt-10 border-4 border-white shadow">
                  🥈
                </div>
                <h4 className="font-moul text-slate-800 text-sm mt-3">{topThree[1].name}</h4>
                <p className="text-xs text-slate-500 font-mono">
                  ថ្នាក់ទី {toKhmerNum(topThree[1].grade)}{topThree[1].section}
                </p>
                <div className="my-3 py-1.5 bg-slate-50 rounded-xl">
                  <p className="text-xl font-bold font-times text-slate-800">
                    {toKhmerNum(topThree[1].booksCount)} <span className="text-xs font-battambang">ក្បាល</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    សរុប {toKhmerNum(topThree[1].totalPages)} ទំព័រ
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSelectedStudentForCert({
                      name: topThree[1].name,
                      code: topThree[1].code,
                      grade: topThree[1].grade,
                      section: topThree[1].section,
                      count: topThree[1].booksCount,
                      rank: 2
                    })
                  }
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>ចេញលិខិតសរសើរ</span>
                </button>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="bg-white rounded-2xl p-6 border-4 border-amber-400 shadow-xl text-center order-1 sm:order-2 relative scale-105 sm:-translate-y-2">
                <div className="w-14 h-14 bg-amber-400 text-white font-moul text-2xl rounded-full flex items-center justify-center mx-auto -mt-12 border-4 border-white shadow-lg">
                  👑
                </div>
                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold mt-2">
                  ជើងឯកលេខ ១
                </span>
                <h4 className="font-moul text-amber-950 text-base mt-2">{topThree[0].name}</h4>
                <p className="text-xs text-slate-500 font-mono">
                  ថ្នាក់ទី {toKhmerNum(topThree[0].grade)}{topThree[0].section}
                </p>
                <div className="my-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-2xl font-bold font-times text-amber-900">
                    {toKhmerNum(topThree[0].booksCount)} <span className="text-xs font-battambang">ក្បាល</span>
                  </p>
                  <p className="text-xs text-amber-700 font-semibold">
                    សរុប {toKhmerNum(topThree[0].totalPages)} ទំព័រ
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSelectedStudentForCert({
                      name: topThree[0].name,
                      code: topThree[0].code,
                      grade: topThree[0].grade,
                      section: topThree[0].section,
                      count: topThree[0].booksCount,
                      rank: 1
                    })
                  }
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-200" />
                  <span>ចេញលិខិតសរសើរលេខ ១</span>
                </button>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className="bg-white rounded-2xl p-5 border-2 border-orange-300 shadow-md text-center order-3 sm:order-3 relative">
                <div className="w-12 h-12 bg-orange-200 text-orange-800 font-moul text-xl rounded-full flex items-center justify-center mx-auto -mt-10 border-4 border-white shadow">
                  🥉
                </div>
                <h4 className="font-moul text-slate-800 text-sm mt-3">{topThree[2].name}</h4>
                <p className="text-xs text-slate-500 font-mono">
                  ថ្នាក់ទី {toKhmerNum(topThree[2].grade)}{topThree[2].section}
                </p>
                <div className="my-3 py-1.5 bg-orange-50 rounded-xl">
                  <p className="text-xl font-bold font-times text-orange-900">
                    {toKhmerNum(topThree[2].booksCount)} <span className="text-xs font-battambang">ក្បាល</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    សរុប {toKhmerNum(topThree[2].totalPages)} ទំព័រ
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSelectedStudentForCert({
                      name: topThree[2].name,
                      code: topThree[2].code,
                      grade: topThree[2].grade,
                      section: topThree[2].section,
                      count: topThree[2].booksCount,
                      rank: 3
                    })
                  }
                  className="w-full py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>ចេញលិខិតសរសើរ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter & Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="font-moul text-sm sm:text-base text-slate-800">
              តារាងជណ្តើរអំណានសិស្សានុសិស្សទាំងអស់ ({toKhmerNum(studentRankings.length)} នាក់)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 font-battambang"
            >
              <option value="all">គ្រប់កម្រិតថ្នាក់ (១-៦)</option>
              {[1, 2, 3, 4, 5, 6].map(g => (
                <option key={g} value={g}>
                  ថ្នាក់ទី {toKhmerNum(g)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-moul text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center">ល.រ</th>
                <th className="py-3 px-4">សិស្សានុសិស្ស</th>
                <th className="py-3 px-4">ថ្នាក់</th>
                <th className="py-3 px-4 text-center">សៀវភៅបានអាន</th>
                <th className="py-3 px-4 text-center">ទំព័រសរុប</th>
                <th className="py-3 px-4">កម្រិតជណ្តើរអំណាន</th>
                <th className="py-3 px-4 text-center">លិខិតសរសើរ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-battambang text-slate-700">
              {studentRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    មិនទាន់មានកំណត់ត្រាអានសៀវភៅសម្រាប់កម្រិតថ្នាក់នេះឡើយ
                  </td>
                </tr>
              ) : (
                studentRankings.map((s, idx) => {
                  const tier = getTier(s.booksCount);
                  return (
                    <tr key={s.name} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-4 text-center font-bold font-times text-slate-700">
                        {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : toKhmerNum(idx + 1)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-950">{s.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.code || 'STU'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-xs">
                          ថ្នាក់ទី {toKhmerNum(s.grade)}{s.section}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold font-times text-base text-amber-900 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                          {toKhmerNum(s.booksCount)} ក្បាល
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {toKhmerNum(s.totalPages)} ទំព័រ
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${tier.badge}`}
                        >
                          <span>{tier.icon}</span>
                          <span>{tier.title}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            setSelectedStudentForCert({
                              name: s.name,
                              code: s.code,
                              grade: s.grade,
                              section: s.section,
                              count: s.booksCount,
                              rank: idx + 1
                            })
                          }
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1 mx-auto"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>លិខិតសរសើរ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedStudentForCert && (
        <ReadingCertificateModal
          isOpen={!!selectedStudentForCert}
          onClose={() => setSelectedStudentForCert(null)}
          studentName={selectedStudentForCert.name}
          studentCode={selectedStudentForCert.code}
          grade={selectedStudentForCert.grade}
          section={selectedStudentForCert.section}
          booksCount={selectedStudentForCert.count}
          rank={selectedStudentForCert.rank}
        />
      )}
    </div>
  );
};
