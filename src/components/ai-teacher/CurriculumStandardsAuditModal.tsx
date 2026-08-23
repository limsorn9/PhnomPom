import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Award,
  ExternalLink,
  Printer,
  X,
  FileText,
  Layers,
  Sparkles,
  Check,
  Library,
  Compass,
  GraduationCap
} from 'lucide-react';
import {
  CurriculumValidationReport,
  validateMoEYSLessonPlan
} from '../../services/curriculumValidationService';
import { AngkorPageWatermark, MoEYSRoyalHeader } from '../AngkorMotif';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report?: CurriculumValidationReport;
  lessonPlanData?: any;
}

export const CurriculumStandardsAuditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  report: customReport,
  lessonPlanData
}) => {
  if (!isOpen) return null;

  const report: CurriculumValidationReport = customReport || (lessonPlanData ? validateMoEYSLessonPlan(lessonPlanData) : validateMoEYSLessonPlan({
    subject: 'ភាសាខ្មែរ',
    grade: 5,
    topic: 'មេរៀនបឋមសិក្សា'
  }));

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-moul tracking-wide">
                  របាយការណ៍ផ្ទៀងផ្ទាត់ស្តង់ដារកម្មវិធីសិក្សាជាតិ MoEYS
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950">
                  sala.moeys.gov.kh
                </span>
              </div>
              <p className="text-xs text-blue-200">
                ផ្ទៀងផ្ទាត់ភាពស្របគ្នានឹងសៀវភៅពុម្ពរដ្ឋ កម្រិតថ្នាក់ទី១ ដល់ទី៦ និងក្បួនគរុកោសល្យ ៥ ជំហាន
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintAudit}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="បោះពុម្ពវិញ្ញាបនបត្រវាយតម្លៃ"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-all cursor-pointer"
              title="បិទ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Top Score Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-md ${
                  report.totalScore >= 90
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 ring-4 ring-amber-400/30'
                    : report.totalScore >= 75
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 ring-4 ring-emerald-500/30'
                    : 'bg-gradient-to-br from-blue-600 to-blue-800 ring-4 ring-blue-500/30'
                }`}>
                  <span className="text-2xl font-mono leading-none">{report.totalScore}</span>
                  <span className="text-[10px] uppercase font-sans mt-0.5">ពិន្ទុ / 100</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">កម្រិតស្តង់ដារជាតិ៖</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-moul ${
                      report.totalScore >= 90
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : report.totalScore >= 75
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}>
                      {report.standardLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    មុខវិជ្ជា៖ <strong className="text-blue-900 font-bold">{report.subject} ថ្នាក់ទី {report.grade}</strong> • ប្រធានបទ៖ <strong className="text-slate-800">{report.topic || 'មេរៀនបឋមសិក្សា'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>សៀវភៅពុម្ពគោល៖ <strong>{report.matchedTextbook}</strong></span>
                  </p>
                </div>
              </div>

              {/* Digital Library Cross Reference Link */}
              <div className="w-full md:w-auto bg-indigo-50 border border-indigo-200/80 p-3.5 rounded-2xl flex flex-col justify-center space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Library className="w-4 h-4 text-indigo-700" />
                  <span>បណ្ណាល័យឌីជីថល MoEYS</span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  ទិន្នន័យត្រូវបានផ្ទៀងផ្ទាត់ជាមួយបណ្ណាល័យ <strong>sala.moeys.gov.kh</strong>
                </p>
                <a
                  href={report.salaMoeysReference.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold underline"
                >
                  <span>ចូលមើលសៀវភៅអេឡិចត្រូនិចផ្លូវការ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Badges Bar */}
            {report.complianceBadges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {report.complianceBadges.map((badge, bIdx) => (
                  <span
                    key={bIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs"
                    title={badge.description}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{badge.labelKhmer}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detailed 4-Pillars Validation Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-moul text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>ការវាយតម្លៃលម្អិតតាម ៤ ផ្នែកស្នូល</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.criteria.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    c.status === 'pass'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : c.status === 'warning'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {c.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <h5 className="text-xs font-bold text-slate-900">{c.titleKhmer}</h5>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                      {c.score}/{c.maxScore}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {c.messageKhmer}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
                    {c.evidenceKhmer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Step MoEYS Pedagogy Integrity Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-moul text-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>ការត្រួតពិនិត្យ ៥ ជំហានគរុកោសល្យបឋមសិក្សា (5-Step Structure)</span>
              </h4>
              <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {report.pedagogy5StepsAnalysis.completenessRate}% ពេញលេញ
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { label: '១. រដ្ឋបាលថ្នាក់', ok: report.pedagogy5StepsAnalysis.step1Admin },
                { label: '២. រំលឹកមេរៀន', ok: report.pedagogy5StepsAnalysis.step2Review },
                { label: '៣. មេរៀនថ្មី', ok: report.pedagogy5StepsAnalysis.step3NewLesson },
                { label: '៤. ពង្រឹងចំណេះ', ok: report.pedagogy5StepsAnalysis.step4Reinforce },
                { label: '៥. បណ្តាំផ្ញើ', ok: report.pedagogy5StepsAnalysis.step5Advice }
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${
                    s.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {s.ok ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-3.5 h-3.5 text-[10px] text-slate-400">✗</span>
                  )}
                  <span className="text-[11px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings and Recommendations */}
          {(report.warnings.length > 0 || report.recommendations.length > 0) && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl space-y-2">
              <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>អនុសាសន៍កែលម្អបន្ថែមពីប្រព័ន្ធ AI Standards</span>
              </h5>
              <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                {report.warnings.map((w, idx) => (
                  <li key={`w-${idx}`}>{w}</li>
                ))}
                {report.recommendations.map((r, idx) => (
                  <li key={`r-${idx}`}>{r}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            ត្រួតពិនិត្យដោយប្រព័ន្ធ MoEYS Standards Validator • កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              យល់ព្រម
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
