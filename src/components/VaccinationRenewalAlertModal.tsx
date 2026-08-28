import React, { useState } from 'react';
import { Student } from '../types';
import {
  ShieldAlert,
  X,
  Check,
  Send,
  Download,
  AlertTriangle,
  Calendar,
  User,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Syringe,
  Pill,
  Clock,
  Phone
} from 'lucide-react';

interface VaccinationRenewalAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onBatchUpdateVaccinated?: (studentIds: string[]) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const VaccinationRenewalAlertModal: React.FC<VaccinationRenewalAlertModalProps> = ({
  isOpen,
  onClose,
  students,
  onBatchUpdateVaccinated,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [filterType, setFilterType] = useState<'all' | 'mandatory' | 'deworming' | 'grade6_td'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSendingNotice, setIsSendingNotice] = useState<boolean>(false);
  const [noticeSentSuccess, setNoticeSentSuccess] = useState<boolean>(false);

  // Analyze which students need vaccine renewals or updates
  const vaccineAuditList = React.useMemo(() => {
    return students.map(student => {
      const issues: Array<{ type: 'mandatory' | 'deworming' | 'grade6_td'; title: string; desc: string; priority: 'high' | 'medium' }> = [];

      // 1. Mandatory Childhood Vaccines (BCG / Polio / MR)
      if (!student.health?.vaccinated) {
        issues.push({
          type: 'mandatory',
          title: 'ខ្វះទិន្នន័យ/មិនទាន់គ្រប់វ៉ាក់សាំងកាតព្វកិច្ច',
          desc: 'ខ្វះកំណត់ត្រាវ៉ាក់សាំងកុមារភាព (BCG, Polio, DTP, MR)',
          priority: 'high'
        });
      }

      // 2. Grade 6 Booster (Td / HPV for Grade 6)
      if (student.grade === 6) {
        issues.push({
          type: 'grade6_td',
          title: 'ដល់កាលបរិច្ឆេទវ៉ាក់សាំងរំលឹកថ្នាក់ទី ៦ (Td Booster)',
          desc: 'វ៉ាក់សាំងការពារតេតាណុស-ឌីបតេរី និង HPV សិស្សស្រី (អាយុ ១១-១២ ឆ្នាំ)',
          priority: 'medium'
        });
      }

      // 3. Bi-annual Deworming (ថ្នាំទម្លាក់ព្រូន ៦ ខែម្តង)
      const lastCheck = student.health?.lastCheckedDate;
      const needsDeworming = !lastCheck || lastCheck.startsWith('2025') || !student.health?.notes?.includes('ព្រូន');
      if (needsDeworming && student.grade <= 3) {
        issues.push({
          type: 'deworming',
          title: 'ដល់កាលបរិច្ឆេទផ្តល់ថ្នាំទម្លាក់ព្រូនជុំថ្មី',
          desc: 'យុទ្ធនាការទម្លាក់ព្រូនប្រចាំឆមាសក្រសួងអប់រំ និងសុខាភិបាល',
          priority: 'medium'
        });
      }

      return {
        student,
        issues,
        hasIssue: issues.length > 0
      };
    }).filter(item => item.hasIssue);
  }, [students]);

  // Filtered by selected category and search
  const filteredAuditList = vaccineAuditList.filter(item => {
    if (filterType !== 'all') {
      const hasMatchingIssue = item.issues.some(iss => iss.type === filterType);
      if (!hasMatchingIssue) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.student.nameKhmer.toLowerCase().includes(q);
      const matchCode = item.student.code.toLowerCase().includes(q);
      const matchGrade = `ថ្នាក់ទី ${item.student.grade}`.includes(q);
      return matchName || matchCode || matchGrade;
    }

    return true;
  });

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedStudentIds.length === filteredAuditList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredAuditList.map(a => a?.student?.id).filter(Boolean) as string[]);
    }
  };

  const handleSendReminderToParents = () => {
    setIsSendingNotice(true);
    setTimeout(() => {
      setIsSendingNotice(false);
      setNoticeSentSuccess(true);
      if (onShowToast) {
        onShowToast(
          `បានផ្ញើសេចក្តីជូនដំណឹងរំលឹកបច្ចុប្បន្នភាពវ៉ាក់សាំងជូនអាណាព្យាបាលសិស្ស ${selectedStudentIds.length > 0 ? selectedStudentIds.length : filteredAuditList.length} នាក់រួចរាល់!`,
          'success'
        );
      }
      setTimeout(() => {
        setNoticeSentSuccess(false);
      }, 3000);
    }, 800);
  };

  const handleBatchMarkResolved = () => {
    const idsToUpdate = selectedStudentIds.length > 0 ? selectedStudentIds : (filteredAuditList.map(a => a?.student?.id).filter(Boolean) as string[]);
    if (onBatchUpdateVaccinated) {
      onBatchUpdateVaccinated(idsToUpdate);
    }
    if (onShowToast) {
      onShowToast(`បានសម្គាល់ថាបានធ្វើបច្ចុប្បន្នភាពវ៉ាក់សាំងសម្រាប់សិស្ស ${idsToUpdate.length} នាក់រួចរាល់!`, 'success');
    }
    setSelectedStudentIds([]);
  };

  const handleExportCsv = () => {
    const headers = ['ល.រ', 'អត្តលេខ', 'គោត្តនាម-នាម', 'ភេទ', 'ថ្នាក់', 'អាណាព្យាបាល', 'លេខទូរស័ព្ទ', 'បញ្ហាដែលត្រូវបច្ចុប្បន្នភាព'];
    const rows = filteredAuditList
      .filter(item => item && item.student)
      .map((item, idx) => [
        idx + 1,
        item.student.code,
        item.student.nameKhmer,
        item.student.gender === 'F' ? 'ស្រី' : 'ប្រុស',
        `ថ្នាក់ទី ${item.student.grade}${item.student.section}`,
        item.student.guardianName || '-',
        item.student.guardianPhone || '-',
        item.issues.map(i => i.title).join('; ')
      ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `បញ្ជីសិស្សត្រូវបច្ចុប្បន្នភាពវ៉ាក់សាំង_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('បានទាញយកបញ្ជីឈ្មោះសិស្សត្រូវបច្ចុប្បន្នភាពវ៉ាក់សាំងជា CSV រួចរាល់!', 'success');
    }
  };

  // Counts
  const mandatoryCount = vaccineAuditList.filter(a => a.issues.some(i => i.type === 'mandatory')).length;
  const grade6TdCount = vaccineAuditList.filter(a => a.issues.some(i => i.type === 'grade6_td')).length;
  const dewormingCount = vaccineAuditList.filter(a => a.issues.some(i => i.type === 'deworming')).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm">
              <ShieldAlert className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-moul">
                  ប្រព័ន្ធជូនដំណឹងបច្ចុប្បន្នភាពវ៉ាក់សាំង (Vaccination Alert System)
                </h3>
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                  MoEYS Standard
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                របាយការណ៍ស្វ័យប្រវត្តិតាមដាន និងដាស់តឿនការចាក់វ៉ាក់សាំង និងថ្នាំទម្លាក់ព្រូន
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Summary Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-slate-200/80 shrink-0 text-xs">
          {/* Card 1 */}
          <button
            type="button"
            onClick={() => setFilterType('mandatory')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filterType === 'mandatory'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                : 'bg-white border-slate-200 hover:border-rose-200'
            }`}
          >
            <div className="flex justify-between items-center text-rose-700 font-bold">
              <span>ខ្វះវ៉ាក់សាំងកាតព្វកិច្ច</span>
              <Syringe className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-rose-950 mt-1">
              {mandatoryCount} <span className="text-xs font-sans font-normal text-rose-700">នាក់</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">BCG, OPV, Pentavalent, MR</p>
          </button>

          {/* Card 2 */}
          <button
            type="button"
            onClick={() => setFilterType('grade6_td')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filterType === 'grade6_td'
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400'
                : 'bg-white border-slate-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex justify-between items-center text-indigo-700 font-bold">
              <span>វ៉ាក់សាំងរំលឹកថ្នាក់ទី ៦</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-indigo-950 mt-1">
              {grade6TdCount} <span className="text-xs font-sans font-normal text-indigo-700">នាក់</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Td Booster & HPV (អាយុ ១១-១២ ឆ្នាំ)</p>
          </button>

          {/* Card 3 */}
          <button
            type="button"
            onClick={() => setFilterType('deworming')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filterType === 'deworming'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-200'
            }`}
          >
            <div className="flex justify-between items-center text-amber-700 font-bold">
              <span>ថ្នាំទម្លាក់ព្រូន ៦ ខែម្តង</span>
              <Pill className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono text-amber-950 mt-1">
              {dewormingCount} <span className="text-xs font-sans font-normal text-amber-700">នាក់</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">យុទ្ធនាការទម្លាក់ព្រូនប្រចាំឆមាស</p>
          </button>
        </div>

        {/* Action Controls & Search Toolbar */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={selectAll}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs whitespace-nowrap cursor-pointer"
            >
              {selectedStudentIds.length === filteredAuditList.length ? 'ដោះការជ្រើសរើស' : 'ជ្រើសទាំងអស់'}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              title="ទាញយកបញ្ជីឈ្មោះសម្រាប់មណ្ឌលសុខភាព"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយកបញ្ជី (CSV)</span>
            </button>

            <button
              onClick={handleBatchMarkResolved}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>សម្គាល់ថាបានចាក់រួច ({selectedStudentIds.length > 0 ? selectedStudentIds.length : 'ទាំងអស់'})</span>
            </button>

            <button
              onClick={handleSendReminderToParents}
              disabled={isSendingNotice}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {noticeSentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>បានផ្ញើដំណឹងរួច!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ផ្ញើដំណឹងរំលឹកអាណាព្យាបាល</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Student Records List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredAuditList.length === 0 ? (
            <div className="text-center py-12 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-emerald-950 text-sm font-kantumruy">
                សិស្សានុសិស្សទាំងអស់មានកំណត់ត្រាវ៉ាក់សាំងពេញលេញ និងត្រឹមត្រូវ!
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                មិនមានករណីខកខាន ឬហួសកាលបរិច្ឆេទវ៉ាក់សាំងកាតព្វកិច្ចឡើយ។
              </p>
            </div>
          ) : (
            filteredAuditList.map(({ student, issues }) => {
              const isSelected = selectedStudentIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => toggleSelectStudent(student.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />

                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shrink-0">
                      {student.gender === 'F' ? 'ស' : 'ប'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm font-kantumruy">{student.nameKhmer}</strong>
                        <span className="text-[11px] text-slate-500 font-mono">({student.code})</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                          ថ្នាក់ទី {student.grade}{student.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>អាណាព្យាបាល៖ <strong>{student.guardianName || student.fatherName || '-'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.guardianPhone || student.phone || '-'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Issues Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                    {issues.map((iss, iIdx) => (
                      <span
                        key={iIdx}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 ${
                          iss.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title={iss.desc}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{iss.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500">
            បង្ហាញសិស្សចំនួន <strong>{filteredAuditList.length}</strong> នាក់ដែលត្រូវផ្ទៀងផ្ទាត់
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
