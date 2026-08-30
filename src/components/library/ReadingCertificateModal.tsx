import React, { useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Award, Printer, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { MoEYSRoyalHeader } from '../AngkorMotif';

interface ReadingCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentCode?: string;
  grade: number;
  section: string;
  booksCount: number;
  rank?: number;
}

export const ReadingCertificateModal: React.FC<ReadingCertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentCode,
  grade,
  section,
  booksCount,
  rank
}) => {
  const { schoolProfile } = useSchool();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const toKhmerNum = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
  };

  const getHonorTitle = () => {
    if (rank === 1) return 'ជើងឯកអានឆ្នើមលេខ ១ ប្រចាំបណ្ណាល័យ';
    if (rank === 2) return 'ជើងឯកអានឆ្នើមលេខ ២ ប្រចាំបណ្ណាល័យ';
    if (rank === 3) return 'ជើងឯកអានឆ្នើមលេខ ៣ ប្រចាំបណ្ណាល័យ';
    return 'សិស្សស្រឡាញ់ការអានសៀវភៅឆ្នើម';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Controls */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-200" />
            <div>
              <h3 className="font-moul text-sm sm:text-base">លិខិតសរសើរជើងឯកអានសៀវភៅ</h3>
              <p className="text-xs text-amber-100 font-battambang">ក្រសួងអប់រំ យុវជន និងកីឡា • បណ្ណាល័យសាលាបឋមសិក្សា</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-amber-800 font-bold rounded-lg hover:bg-amber-50 text-xs sm:text-sm shadow"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas for Screen & Print */}
        <div className="p-4 sm:p-8 bg-amber-50/40 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-2xl bg-white border-8 border-double border-amber-600/80 p-6 sm:p-10 shadow-lg rounded-xl relative overflow-hidden text-center text-slate-800"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-600 text-xl select-none">❖</div>
            <div className="absolute top-2 right-2 text-amber-600 text-xl select-none">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-xl select-none">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-xl select-none">❖</div>

            {/* MoEYS Royal Header */}
            <MoEYSRoyalHeader className="mb-4" />

            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-xs mb-2">
                🏆 កិត្តិយសជើងឯកអំណាន (Reading Champion)
              </span>
              <h2 className="font-moul text-amber-900 text-lg sm:text-2xl tracking-wide uppercase">
                លិខិតសរសើរ
              </h2>
              <p className="font-moul text-amber-700 text-xs sm:text-sm mt-1">
                បណ្ណារក្ស និងគណៈគ្រប់គ្រង{schoolProfile.nameKhmer}
              </p>
            </div>

            {/* Recipient Details */}
            <div className="space-y-4 font-battambang text-sm sm:text-base leading-relaxed my-4 text-slate-700">
              <p className="text-slate-600 italic">សូមសម្តែងនូវការកោតសរសើរ និងផ្តល់កិត្តិយសជូនចំពោះ៖</p>

              <div className="my-3 py-2 border-y-2 border-dashed border-amber-300 bg-amber-50/60 rounded-lg">
                <h3 className="font-moul text-blue-900 text-xl sm:text-2xl text-center">
                  សិស្ស {studentName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-times mt-1">
                  អត្តលេខ៖ <span className="font-bold font-mono">{studentCode || 'N/A'}</span> • សិស្សថ្នាក់ទី <span className="font-bold">{toKhmerNum(grade)}{section}</span>
                </p>
              </div>

              <p className="text-slate-800">
                ដែលបានខិតខំប្រឹងប្រែងអាន និងខ្ចីសៀវភៅពីបណ្ណាល័យសរុបចំនួន{' '}
                <span className="font-bold text-amber-900 text-lg font-times px-1.5 py-0.5 bg-amber-100 rounded">
                  {toKhmerNum(booksCount)}
                </span>{' '}
                ក្បាល ទទួលបានគោរមងារជា៖
              </p>

              <div className="font-moul text-amber-800 text-base sm:text-lg bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 py-2 rounded-lg border border-amber-200">
                ⭐ {getHonorTitle()} ⭐
              </div>

              <p className="text-xs sm:text-sm text-slate-600 italic mt-3">
                សូមជូនពរឱ្យក្មួយបន្តរក្សាទម្លាប់អានដ៏ល្អប្រសើរនេះ និងទទួលបានជោគជ័យក្នុងការសិក្សារៀនសូត្រគ្រប់ពេលវេលា។
              </p>
            </div>

            {/* Signature & Stamp Section */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-200 text-xs sm:text-sm font-battambang text-center">
              <div>
                <p className="font-bold text-slate-700">បណ្ណារក្សទទួលបន្ទុក</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-slate-400 italic text-xs">[ហត្ថលេខា]</span>
                </div>
                <p className="font-bold text-slate-800">អ្នកគ្រូ បណ្ណារក្ស</p>
              </div>

              <div>
                <p className="text-slate-600 text-[11px]">
                  {schoolProfile.commune || 'ថ្ងៃទី'}, ថ្ងៃទី {toKhmerNum(new Date().getDate())} ខែ {toKhmerNum(new Date().getMonth() + 1)} ឆ្នាំ {toKhmerNum(new Date().getFullYear())}
                </p>
                <p className="font-bold text-slate-800 font-moul text-xs mt-0.5">នាយកសាលា</p>
                <div className="h-14 flex items-center justify-center">
                  <span className="inline-block px-3 py-1 border-2 border-red-500 rounded-full text-red-600 font-bold text-[10px] uppercase rotate-[-5deg]">
                    (ត្រា & ហត្ថលេខា)
                  </span>
                </div>
                <p className="font-bold text-red-700 font-moul text-xs">{schoolProfile.principalName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 flex items-center justify-end no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
