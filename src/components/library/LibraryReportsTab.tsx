import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  QrCode,
  BookMarked,
  AlertTriangle,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { UniversalPrintModal } from '../UniversalPrintModal';

export const LibraryReportsTab: React.FC = () => {
  const { schoolProfile, libraryBooks, readingLogs, libraryVisitors } = useSchool();
  const [selectedReportType, setSelectedReportType] = useState<string>('circulation_ledger');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  const handleOpenPrint = (type: string, title: string) => {
    setSelectedReportType(type);
    setReportTitle(title);
    setIsPrintModalOpen(true);
  };

  const reportsList = [
    {
      id: 'circulation_ledger',
      title: 'សៀវភៅតាមដានការខ្ចី-សងសៀវភៅ (Circulation Ledger)',
      desc: 'តារាងកត់ត្រាលម្អិតអំពីឈ្មោះសិស្ស ចំណងជើងសៀវភៅ កាលបរិច្ឆេទខ្ចី-សង និងហត្ថលេខាអ្នកខ្ចី',
      icon: BookMarked,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      count: `${readingLogs.length} កំណត់ត្រា`
    },
    {
      id: 'inventory_catalog',
      title: 'បញ្ជីសារពើភណ្ឌសៀវភៅបណ្ណាល័យ (Book Inventory)',
      desc: 'តារាងបូកសរុបចំនួនសៀវភៅតាមប្រភេទ កម្រិតថ្នាក់ ចំនួនក្បាលសរុប និងទីតាំងទូ/ធ្នើ',
      icon: Layers,
      color: 'bg-teal-100 text-teal-700 border-teal-200',
      count: `${libraryBooks.length} ចំណងជើង`
    },
    {
      id: 'visitor_attendance',
      title: 'តារាងស្ថិតិវត្តមានចូលប្រើប្រាស់បណ្ណាល័យ (Visitor Log)',
      desc: 'របាយការណ៍តាមដានចំនួនសិស្សចូលអាន ខ្ចីសៀវភៅ និងធ្វើស្វ័យសិក្សាប្រចាំខែ',
      icon: FileText,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      count: `${libraryVisitors.length} វត្តមាន`
    },
    {
      id: 'overdue_notices',
      title: 'លិខិតរំលឹកការសងសៀវភៅហួសកាលកំណត់ (Overdue Notice)',
      desc: 'លិខិតផ្លូវការផ្ញើជូនគ្រូបន្ទុកថ្នាក់ និងអាណាព្យាបាលដើម្បីរំលឹកសិស្សឱ្យយកសៀវភៅមកសង',
      icon: AlertTriangle,
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      count: `${readingLogs.filter(l => l.status === 'overdue').length} ករណី`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 mb-2 border border-white/20">
            <Printer className="w-3.5 h-3.5" />
            <span>មជ្ឈមណ្ឌលរបាយការណ៍ និងទម្រង់បោះពុម្ព MoEYS</span>
          </div>
          <h2 className="font-moul text-xl sm:text-2xl text-white">របាយការណ៍បណ្ណាល័យផ្លូវការ</h2>
          <p className="text-xs sm:text-sm text-blue-100 font-battambang mt-1">
            បោះពុម្ពសៀវភៅបញ្ជរចរាចរណ៍ បញ្ជីសារពើភណ្ឌ និងលិខិតរំលឹកតាមស្តង់ដាក្រសួងអប់រំ
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map(rep => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${rep.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold font-times px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {rep.count}
                  </span>
                </div>

                <h3 className="font-moul text-sm sm:text-base text-slate-800 leading-snug">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-500 font-battambang leading-relaxed">
                  {rep.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenPrint(rep.id, rep.title)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>បើកទម្រង់បោះពុម្ព (Print)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Universal Print Modal Integration */}
      <UniversalPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        titleKhmer={reportTitle || 'របាយការណ៍បណ្ណាល័យសាលាបឋមសិក្សា'}
        documentSubtitle={`បណ្ណាល័យ ${schoolProfile.nameKhmer} • ឆ្នាំសិក្សា ${schoolProfile.academicYear}`}
      />
    </div>
  );
};
