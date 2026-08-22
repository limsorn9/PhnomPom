import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, StudentBadgeAssignment } from '../../types';
import { BadgeIcon, getTierStyle } from './BadgeIcon';
import { CertificateModal } from './CertificateModal';
import { AwardBadgeModal } from './AwardBadgeModal';
import {
  X,
  Award,
  Sparkles,
  Trophy,
  Calendar,
  User,
  Printer,
  Trash2,
  Plus,
  ShieldCheck,
  Zap,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface StudentBadgeShowcaseModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentBadgeShowcaseModal: React.FC<StudentBadgeShowcaseModalProps> = ({
  student,
  onClose
}) => {
  const {
    getStudentBadges,
    getStudentTotalPoints,
    removeBadgeAssignment,
    schoolProfile
  } = useSchool();

  const [selectedCertificateAssignment, setSelectedCertificateAssignment] = useState<StudentBadgeAssignment | null>(null);
  const [showAwardModal, setShowAwardModal] = useState<boolean>(false);

  const studentBadges = getStudentBadges(student.id);
  const totalPoints = getStudentTotalPoints(student.id);

  // Group badges by tier
  const tierCounts = studentBadges.reduce<Record<string, number>>((acc, curr) => {
    const tier = curr.badge?.tier || 'bronze';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const handleDeleteAssignment = (id: string, badgeName: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបការប្រគល់ផ្លាកសញ្ញា «${badgeName}» នេះមែនទេ?`)) {
      removeBadgeAssignment(id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-battambang">
          {/* Header Showcase Banner */}
          <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-amber-950 text-white p-6 overflow-hidden">
            {/* Ambient blur lights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-1 flex items-center justify-center shadow-lg ring-4 ring-white/10">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-amber-300">
                    <Trophy className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-moul text-amber-300">
                      {student.nameKhmer}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-times font-semibold">
                      {student.nameLatin}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 flex items-center gap-2">
                    <span>អត្តលេខ៖ <strong className="text-amber-200">{student.code}</strong></span>
                    <span>•</span>
                    <span>ថ្នាក់ទី <strong>{student.grade}{student.section}</strong></span>
                    <span>•</span>
                    <span>ភេទ៖ <strong>{student.gender === 'F' ? 'ស្រី' : 'ប្រុស'}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ប្រគល់ផ្លាកសញ្ញាថ្មី</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Achievement Stats Summary Strip */}
            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider block">មេដាយទទួលបាន</span>
                <span className="text-lg font-bold text-white font-times">{studentBadges.length}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="text-[10px] text-amber-200 uppercase tracking-wider block">ពិន្ទុសន្សមកិត្តិយស</span>
                <span className="text-lg font-bold text-amber-400 font-times">+{totalPoints}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="text-[10px] text-cyan-200 uppercase tracking-wider block">កម្រិតមាស-ពេជ្រ</span>
                <span className="text-lg font-bold text-cyan-300 font-times">
                  {(tierCounts['diamond'] || 0) + (tierCounts['platinum'] || 0) + (tierCounts['gold'] || 0)}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 text-center">
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider block">ចំណាត់ថ្នាក់កិត្តិយស</span>
                <span className="text-xs font-bold text-emerald-300 block mt-1">
                  {totalPoints >= 150 ? '🌟 ឆ្នើមបំផុត' : totalPoints >= 70 ? '🎖️ ល្អប្រសើរ' : totalPoints > 0 ? '👍 ល្អ' : 'ទើបចាប់ផ្តើម'}
                </span>
              </div>
            </div>
          </div>

          {/* Badges List Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>បញ្ជីមេដាយ និងផ្លាកសញ្ញាទាំងអស់ ({studentBadges.length})</span>
              </h3>
            </div>

            {studentBadges.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">មិនទាន់មានផ្លាកសញ្ញានៅឡើយទេ</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    ចុចប៊ូតុង «ប្រគល់ផ្លាកសញ្ញាថ្មី» ដើម្បីទទួលស្គាល់ការខិតខំប្រឹងប្រែង ការសិក្សា វត្តមាន និងវិន័យរបស់សិស្ស។
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAwardModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>ប្រគល់ផ្លាកសញ្ញាដំបូង</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studentBadges.map(assignment => {
                  const tierStyle = getTierStyle(assignment.badge.tier);
                  return (
                    <div
                      key={assignment.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <BadgeIcon
                          iconName={assignment.badge.iconName}
                          tier={assignment.badge.tier}
                          size="md"
                          showTierGlow
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {assignment.badge.titleKhmer}
                            </h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tierStyle.pillBg}`}>
                              +{assignment.badge.points} ពិន្ទុ
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                            « {assignment.reasonOrEvidence || assignment.badge.description} »
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {assignment.awardedDate}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">
                              {assignment.awardedBy}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {assignment.certificateNumber || 'CERT-DIGITAL'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCertificateAssignment(assignment)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-amber-700" />
                            <span>លិខិតសរសើរ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(assignment.id, assignment.badge.titleKhmer)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="លុបផ្លាកសញ្ញា"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              ផ្លាកសញ្ញា និងមេដាយឌីជីថលសម្រាប់សាលារៀនគំរូ
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertificateAssignment && (
        <CertificateModal
          assignment={selectedCertificateAssignment}
          schoolProfile={schoolProfile}
          onClose={() => setSelectedCertificateAssignment(null)}
        />
      )}

      {/* Sub-award modal */}
      {showAwardModal && (
        <AwardBadgeModal
          initialStudent={student}
          onClose={() => setShowAwardModal(false)}
        />
      )}
    </>
  );
};
