import React from 'react';
import { StudentBadgeAssignment, SchoolProfile } from '../../types';
import { BadgeIcon } from './BadgeIcon';
import { MoEYSRoyalHeader, AngkorPageWatermark, AngkorBorderOrnament } from '../AngkorMotif';
import { Printer, X, Award, CheckCircle2, Calendar, ShieldCheck, Sparkles, Download } from 'lucide-react';

interface CertificateModalProps {
  assignment: StudentBadgeAssignment;
  schoolProfile: SchoolProfile;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  assignment,
  schoolProfile,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-battambang">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm font-moul">លិខិតសរសើរឌីជីថល (Certificate of Recognition)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពលិខិតសរសើរ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 relative">
          <div className="relative border-4 border-double border-amber-600/60 p-6 sm:p-8 rounded-2xl bg-white shadow-md print:shadow-none print:border-amber-700">
            <AngkorPageWatermark opacity={0.045} />
            <AngkorBorderOrnament />

            {/* Ministry Header */}
            <div className="text-center relative z-10 space-y-1">
              <MoEYSRoyalHeader />
              <div className="pt-2 text-xs font-semibold text-slate-700">
                <p>មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
                <p>ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
                <p className="font-bold text-blue-900 font-moul text-sm">{schoolProfile.nameKhmer}</p>
              </div>

              {/* Title */}
              <div className="pt-5 pb-3">
                <div className="inline-block relative">
                  <h1 className="text-2xl sm:text-3xl font-bold font-moul text-amber-700 tracking-wide drop-shadow-xs">
                    លិខិតសរសើរ
                  </h1>
                  <p className="text-[11px] font-times text-slate-500 uppercase tracking-widest mt-0.5">
                    Certificate of Outstanding Achievement
                  </p>
                </div>
              </div>

              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-4" />
            </div>

            {/* Certificate Body */}
            <div className="relative z-10 text-center space-y-4 my-4 max-w-xl mx-auto">
              <p className="text-xs sm:text-sm text-slate-700">
                គណៈគ្រប់គ្រង និងក្រុមប្រឹក្សាវិន័យនៃ <strong className="font-bold text-slate-900">{schoolProfile.nameKhmer}</strong> មានកិត្តិយសសូមប្រគល់លិខិតសរសើរ និងមេដាយឌីជីថលនេះជូនដល់៖
              </p>

              {/* Recipient Name Box */}
              <div className="py-2.5 px-6 bg-amber-50/80 border border-amber-200/80 rounded-2xl inline-block shadow-xs">
                <div className="text-xl sm:text-2xl font-bold font-moul text-blue-950">
                  {assignment.studentGender === 'F' ? 'កុមារី ' : 'កុមារា '}
                  {assignment.studentName}
                </div>
                <div className="text-xs text-slate-600 font-medium flex items-center justify-center gap-2 mt-0.5">
                  <span>អត្តលេខ៖ <span className="font-times font-bold text-blue-700">{assignment.studentCode}</span></span>
                  <span>•</span>
                  <span>សិស្សថ្នាក់ទី <strong className="text-slate-900">{assignment.grade}{assignment.section}</strong></span>
                </div>
              </div>

              {/* Badge Visual & Citation */}
              <div className="bg-gradient-to-r from-slate-50 via-amber-50/40 to-slate-50 border border-amber-200/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 text-left">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <BadgeIcon
                    iconName={assignment.badge.iconName}
                    tier={assignment.badge.tier}
                    size="lg"
                    showTierGlow
                  />
                  <span className="mt-1.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    +{assignment.badge.points} ពិន្ទុ
                  </span>
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h3 className="font-bold text-base text-slate-900 font-moul">
                      {assignment.badge.titleKhmer}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-times">
                      ({assignment.badge.titleEnglish})
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    « {assignment.reasonOrEvidence || assignment.badge.description} »
                  </p>
                  {assignment.progressMetricSnapshot && (
                    <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-slate-600 font-medium">
                      {assignment.progressMetricSnapshot.scoreAvg !== undefined && (
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          ពិន្ទុមធ្យមភាគ៖ <strong>{assignment.progressMetricSnapshot.scoreAvg}/10</strong>
                        </span>
                      )}
                      {assignment.progressMetricSnapshot.attendanceRate !== undefined && (
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          អត្រាវត្តមាន៖ <strong>{assignment.progressMetricSnapshot.attendanceRate}%</strong>
                        </span>
                      )}
                      {assignment.progressMetricSnapshot.readingBooksCount !== undefined && (
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          សៀវភៅអាន៖ <strong>{assignment.progressMetricSnapshot.readingBooksCount} ក្បាល</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 italic">
                ដើម្បីជាការលើកទឹកចិត្ត និងជាគំរូល្អដល់សិស្សានុសិស្សដទៃទៀតក្នុងសាលារៀន។
              </p>
            </div>

            {/* Signatures & Serial Area */}
            <div className="relative z-10 mt-8 pt-4 border-t border-amber-200 text-xs text-slate-800">
              <div className="flex justify-between items-end">
                {/* Left: Homeroom Teacher & Serial */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-slate-500 font-mono">
                    លេខកូដប័ណ្ណ៖ {assignment.certificateNumber || 'CERT-2024-001'}
                  </p>
                  <strong className="block font-moul text-slate-900 text-xs pt-1">
                    គ្រូបន្ទុកថ្នាក់
                  </strong>
                  <div className="h-14 flex items-center justify-center text-slate-300 italic text-[11px]">
                    (ហត្ថលេខា)
                  </div>
                  <p className="font-bold text-slate-900">{assignment.awardedBy}</p>
                </div>

                {/* Center: Digital Seal */}
                <div className="hidden sm:flex flex-col items-center justify-center opacity-85">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 flex flex-col items-center justify-center p-1 text-center bg-amber-50/50">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-[8px] font-bold text-amber-800 leading-tight">ត្រាឌីជីថល</span>
                    <span className="text-[7px] text-slate-500 font-times">{schoolProfile.schoolCode}</span>
                  </div>
                </div>

                {/* Right: Principal */}
                <div className="text-center space-y-1">
                  <p className="text-[11px] text-slate-600">
                    {schoolProfile.district}, ថ្ងៃទី {new Date(assignment.awardedDate).getDate()} ខែ {new Date(assignment.awardedDate).getMonth() + 1} ឆ្នាំ {new Date(assignment.awardedDate).getFullYear()}
                  </p>
                  <strong className="block font-moul text-slate-900 text-xs">
                    នាយកសាលា
                  </strong>
                  <div className="h-14 flex items-center justify-center text-slate-300 italic text-[11px]">
                    (ហត្ថលេខា និងត្រា)
                  </div>
                  <p className="font-bold text-slate-900">{schoolProfile.principalName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
