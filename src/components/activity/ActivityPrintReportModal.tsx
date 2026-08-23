import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ActivityLogItem, ActivityDomain, ActivityActionType } from '../../types';
import {
  formatKhmerFullDateTime
} from '../../utils/activityTracker';
import { printElement, downloadElementAsPdf } from '../../utils/printUtils';
import {
  Printer,
  Download,
  FileSpreadsheet,
  X,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  Users,
  GraduationCap,
  CircleDollarSign,
  Loader2,
  CheckCircle2,
  FileText,
  Stamp,
  Sliders
} from 'lucide-react';
import { AngkorWatSilhouette } from '../AngkorMotif';
import { ActivityReportWatermark, ActivityWatermarkType } from './ActivityReportWatermark';
import { PrintOptimizedBadge } from './PrintOptimizedBadge';

interface ActivityPrintReportModalProps {
  logs: ActivityLogItem[];
  appliedFilters: {
    domain: string;
    action: string;
    role: string;
    date: string;
    search: string;
  };
  onClose: () => void;
}

export const ActivityPrintReportModal: React.FC<ActivityPrintReportModalProps> = ({
  logs,
  appliedFilters,
  onClose
}) => {
  const { schoolProfile, currentUser, showToast } = useSchool();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [watermarkType, setWatermarkType] = useState<ActivityWatermarkType>('official');
  const [watermarkPrintOnly, setWatermarkPrintOnly] = useState<boolean>(true);
  const [enablePageBreaksEvery20, setEnablePageBreaksEvery20] = useState<boolean>(true);

  // Summarize metrics for the printable report
  const summary = React.useMemo(() => {
    const total = logs.length;
    const studentCount = logs.filter(l => l.domain === 'student').length;
    const teacherCount = logs.filter(l => l.domain === 'teacher').length;
    const financeCount = logs.filter(l => l.domain === 'finance').length;
    const academicCount = logs.filter(l => l.domain === 'academic').length;
    const adminCount = logs.filter(l => l.domain === 'admin').length;

    const totalMoneyFlow = logs
      .filter(l => l.domain === 'finance' && l.financialAmountRiel)
      .reduce((sum, l) => sum + (l.financialAmountRiel || 0), 0);

    return {
      total,
      studentCount,
      teacherCount,
      financeCount,
      academicCount,
      adminCount,
      totalMoneyFlow
    };
  }, [logs]);

  // Printable Date Formatter
  const currentDateKhmer = React.useMemo(() => {
    const d = new Date();
    const khmerMonths = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    return `ថ្ងៃទី ${d.getDate()} ខែ ${khmerMonths[d.getMonth()]} ឆ្នាំ ២០២៦`;
  }, []);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printElement('activity-printable-report-area', {
        landscape: true,
        pageTitle: `របាយការណ៍សវនកម្មសកម្មភាព_${schoolProfile.schoolNameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ'}`
      });
      showToast('បានបញ្ជូនបញ្ជាបោះពុម្ពជោគជ័យ', 'success');
    } catch (err) {
      console.error('Print failed:', err);
      showToast('បរាជ័យក្នុងការបោះពុម្ព', 'error');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const filename = `របាយការណ៍សវនកម្មសកម្មភាព_${new Date().toISOString().split('T')[0]}`;
      const success = await downloadElementAsPdf('activity-printable-report-area', filename, {
        landscape: true,
        quality: 0.98,
        scale: 2
      });
      if (success) {
        showToast('បានទាញយកឯកសារ PDF ជោគជ័យ', 'success');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('បរាជ័យក្នុងការទាញយក PDF', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  function getDomainName(domain: string): string {
    switch (domain) {
      case 'student': return 'សិស្សានុសិស្ស';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'finance': return 'ហិរញ្ញវត្ថុ';
      case 'academic': return 'ពិន្ទុ & លទ្ធផល';
      case 'admin': return 'រដ្ឋបាល & ប្រព័ន្ធ';
      default: return domain;
    }
  }

  function getActionName(action: string): string {
    switch (action) {
      case 'create': return 'បង្កើតថ្មី';
      case 'update': return 'កែប្រែ';
      case 'delete': return 'លុប';
      case 'income': return 'ចំណូល';
      case 'expense': return 'ចំណាយ';
      case 'score': return 'ពិន្ទុ';
      case 'attendance': return 'វត្តមាន';
      case 'document': return 'ឯកសារ';
      case 'approval': return 'អនុម័ត';
      case 'transfer': return 'ផ្ទេរសិស្ស';
      default: return action;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-150">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-moul text-white">
                  ទម្រង់របាយការណ៍បោះពុម្ព & រក្សាទុកជា PDF (Official Audit Report)
                </h3>
                <PrintOptimizedBadge isPrintModalActive={true} />
              </div>
              <p className="text-xs text-slate-300">
                ឯកសារផ្លូវការស្របតាមរចនាប័ទ្មក្រសួងអប់រំ យុវជន និងកីឡា សម្រាប់តម្កល់ជាឯកសាររដ្ឋបាល
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="print-report-action-btn"
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              <span>{isPrinting ? 'កំពុងបោះពុម្ព...' : 'បោះពុម្ព (Print A4)'}</span>
            </button>

            <button
              id="download-pdf-report-action-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloadingPdf ? 'កំពុងទាញយក...' : 'ទាញយកជា PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Configuration Controls Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-3">
            {/* Watermark Toggle Control */}
            <div className="flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-700 text-xs">ត្រាសម្គាល់ (Watermark)៖</span>
              <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
                <button
                  type="button"
                  id="watermark-toggle-official"
                  onClick={() => setWatermarkType('official')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    watermarkType === 'official'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ផ្លូវការ (Official)
                </button>
                <button
                  type="button"
                  id="watermark-toggle-draft"
                  onClick={() => setWatermarkType('draft')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    watermarkType === 'draft'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ឯកសារព្រាង (Draft)
                </button>
                <button
                  type="button"
                  id="watermark-toggle-confidential"
                  onClick={() => setWatermarkType('confidential')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    watermarkType === 'confidential'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  សម្ងាត់ (Confidential)
                </button>
                <button
                  type="button"
                  id="watermark-toggle-none"
                  onClick={() => setWatermarkType('none')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    watermarkType === 'none'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  គ្មាន
                </button>
              </div>
            </div>

            {/* Watermark Visibility in Preview vs Print Only */}
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={watermarkPrintOnly}
                onChange={(e) => setWatermarkPrintOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>បង្ហាញតែពេលបោះពុម្ព (Print Process Only)</span>
            </label>
          </div>

          {/* Page Break Control */}
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
              <input
                type="checkbox"
                checked={enablePageBreaksEvery20}
                onChange={(e) => setEnablePageBreaksEvery20(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span className="font-semibold">កាត់ទំព័ររៀងរាល់ ២០ ជួរ (Page-break / 20 items)</span>
            </label>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/80">
          {/* Printable Container Document */}
          <div
            id="activity-printable-report-area"
            className="bg-white max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 relative text-slate-900 space-y-6 print:border-0 print:shadow-none print:p-2"
            style={{ minHeight: '842px' }}
          >
            {/* Angkor Wat Silhouette Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
              <AngkorWatSilhouette className="w-[550px] h-[350px]" opacity={0.3} />
            </div>

            {/* Toggleable Draft/Official Administration Watermark */}
            <ActivityReportWatermark
              type={watermarkType}
              opacity={watermarkType === 'draft' ? 0.12 : watermarkType === 'confidential' ? 0.12 : 0.08}
              printOnly={watermarkPrintOnly}
            />

            {/* Official MoEYS Kingdom Header */}
            <div className="relative z-10 text-center space-y-1">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                ព្រះរាជាណាចក្រកម្ពុជា
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </div>
              <div className="w-24 h-0.5 bg-amber-600 mx-auto mt-1" />

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 text-left border-b border-slate-200 pb-3">
                <div>
                  <div className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                  <div>មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្ត/រាជធានី</div>
                  <div className="font-bold text-indigo-950 font-moul">
                    {schoolProfile.schoolNameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ'}
                  </div>
                </div>
                <div className="text-right sm:text-right mt-2 sm:mt-0">
                  <div className="text-[11px] text-slate-500">កាលបរិច្ឆេទរបាយការណ៍៖</div>
                  <div className="font-bold text-slate-800">{currentDateKhmer}</div>
                  <div className="text-[11px] text-slate-500">
                    ឆ្នាំសិក្សា៖ <strong>{schoolProfile.currentAcademicYear || '២០២៥-២០២៦'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Title */}
            <div className="relative z-10 text-center space-y-1 py-1">
              <h2 className="text-base sm:text-lg font-bold font-moul text-slate-900 tracking-wide">
                របាយការណ៍កំណត់ត្រាសវនកម្ម & សកម្មភាពរដ្ឋបាលសាលារៀន
              </h2>
              <p className="text-xs text-slate-600">
                (School Administrative Activity & System Audit Trail Report)
              </p>
            </div>

            {/* Applied Filters & Summary Metadata Box */}
            <div className="relative z-10 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">ចំនួនសកម្មភាពសរុប</span>
                <strong className="text-slate-900 text-sm font-mono">{summary.total} កំណត់ត្រា</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">តម្រងផ្នែក (Domain)</span>
                <strong className="text-blue-800">{getDomainName(appliedFilters.domain)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">តម្រងប្រភេទសកម្មភាព</span>
                <strong className="text-indigo-800">{getActionName(appliedFilters.action)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ចរាចរណ៍ថវិកាពាក់ព័ន្ធ</span>
                <strong className="text-emerald-700 font-mono font-bold">
                  {summary.totalMoneyFlow > 0 ? `${summary.totalMoneyFlow.toLocaleString()} ៛` : '-'}
                </strong>
              </div>
            </div>

            {/* Table of Activity Logs (Optimized compact font & padding during print) */}
            <div className="relative z-10 overflow-x-auto print:overflow-visible no-scrollbar print-view">
              <table className="activity-log-table print-compact w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="py-2.5 px-2 border border-slate-300 text-center w-10">ល.រ</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center whitespace-nowrap">កាលបរិច្ឆេទ & ម៉ោង</th>
                    <th className="py-2.5 px-2.5 border border-slate-300 text-center whitespace-nowrap">ផ្នែក</th>
                    <th className="py-2.5 px-2.5 border border-slate-300 text-center whitespace-nowrap">សកម្មភាព</th>
                    <th className="py-2.5 px-3 border border-slate-300">ចំណងជើង & ព័ត៌មានលម្អិត</th>
                    <th className="py-2.5 px-3 border border-slate-300">កម្មវត្ថុ / កូដ</th>
                    <th className="py-2.5 px-3 border border-slate-300">អ្នកកែប្រែ (តួនាទី)</th>
                    <th className="py-2.5 px-2.5 border border-slate-300 text-right whitespace-nowrap">ទឹកប្រាក់ (៛)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                        ពុំមានទិន្នន័យកំណត់ត្រាស្របតាមតម្រងដែលបានជ្រើសរើសឡើយ។
                      </td>
                    </tr>
                  ) : (
                    logs.map((item, idx) => {
                      const isBreakAfter = enablePageBreaksEvery20 && (idx + 1) % 20 === 0 && idx + 1 < logs.length;
                      return (
                        <tr
                          key={item.id}
                          className={`${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} ${
                            isBreakAfter ? 'print-break-after-20 print-page-break' : ''
                          }`}
                        >
                          <td className="py-2 px-2 border border-slate-300 text-center font-mono text-slate-600 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center text-[11px] whitespace-nowrap font-mono text-slate-700">
                            {formatKhmerFullDateTime(item.timestamp)}
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300 text-center text-[11px] font-semibold">
                            {getDomainName(item.domain)}
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300 text-center text-[11px]">
                            {getActionName(item.actionType)}
                          </td>
                          <td className="py-2 px-3 border border-slate-300">
                            <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                            <div className="text-[11px] text-slate-600 line-clamp-1">{item.description}</div>
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-[11px]">
                            <div className="font-semibold text-slate-800">{item.entityName}</div>
                            {item.entityCode && (
                              <div className="font-mono text-slate-500 text-[10px]">{item.entityCode}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-[11px]">
                            <strong className="text-slate-800">{item.actorName}</strong>
                            <div className="text-slate-500 text-[10px]">({item.actorRole})</div>
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-bold text-xs whitespace-nowrap">
                            {item.financialAmountRiel ? (
                              <span className={item.actionType === 'income' ? 'text-emerald-700' : 'text-rose-700'}>
                                {item.actionType === 'income' ? '+' : '-'}{item.financialAmountRiel.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signature and Stamps Block */}
            <div className="relative z-10 pt-6 grid grid-cols-2 gap-6 text-xs text-center border-t border-slate-200 page-break-inside-avoid">
              <div className="space-y-16">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">អ្នករៀបចំរបាយការណ៍</div>
                  <div className="text-slate-500 text-[11px]">ហត្ថលេខា និងឈ្មោះ</div>
                </div>
                <div className="font-bold text-slate-800">
                  {currentUser?.nameKhmer || 'លោក លីម សន'}
                </div>
              </div>

              <div className="space-y-16">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">បានឃើញ និងឯកភាព</div>
                  <div className="font-bold text-indigo-950 font-moul text-[11px]">នាយកសាលាបឋមសិក្សាភ្នំពុំ</div>
                  <div className="text-slate-500 text-[11px]">(ហត្ថលេខា និងត្រា)</div>
                </div>
                <div className="font-bold text-slate-800">
                  លោក លីម សន
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500">
            បង្ហាញទំព័រសម្រាប់បោះពុម្ព A4 Landscape | កំណត់ត្រាសរុប៖ {logs.length} | កាត់ទំព័ររៀងរាល់ ២០ ជួរ៖ {enablePageBreaksEvery20 ? 'បើក' : 'បិទ'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};

