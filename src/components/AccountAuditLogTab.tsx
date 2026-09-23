import React, { useState } from 'react';
import { AccountAuditLog, AccountAuditEventType, UserRole } from '../types';
import {
  FileText,
  UserPlus,
  Trash2,
  RotateCcw,
  Shield,
  KeyRound,
  Edit2,
  Clock,
  Search,
  Filter,
  UserX,
  UserCheck,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Download,
  Calendar,
  CheckCircle2,
  Eye,
  Info,
  ArrowRight,
  ShieldAlert,
  Hash
} from 'lucide-react';

interface AccountAuditLogTabProps {
  logs: AccountAuditLog[];
  onClearLogs: () => void;
  isDirector: boolean;
}

export const AccountAuditLogTab: React.FC<AccountAuditLogTabProps> = ({
  logs,
  onClearLogs,
  isDirector
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AccountAuditLog | null>(null);
  const [showTroubleshootingHelp, setShowTroubleshootingHelp] = useState(false);

  const formatKhmerDateTime = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('km-KH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const getEventBadge = (type: AccountAuditEventType) => {
    switch (type) {
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>បង្កើតគណនី</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>លុបទៅធុងសំរាម</span>
          </span>
        );
      case 'restore':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>ស្តារគណនីឡើងវិញ</span>
          </span>
        );
      case 'permanent_delete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <UserX className="w-3.5 h-3.5 text-purple-600" />
            <span>លុបជាស្ថាពរ</span>
          </span>
        );
      case 'update_role':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>ប្តូរសិទ្ធិ/តួនាទី</span>
          </span>
        );
      case 'reset_password':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>ប្តូរពាក្យសម្ងាត់</span>
          </span>
        );
      case 'toggle_status':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>ស្ថានភាពគណនី</span>
          </span>
        );
      case 'update_profile':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            <span>កែប្រែប្រវត្តិរូប</span>
          </span>
        );
    }
  };

  const getRoleLabel = (role?: UserRole | string) => {
    switch (role) {
      case 'director': return 'នាយក';
      case 'teacher': return 'គ្រូបង្រៀន';
      case 'secretary': return 'លេខាធិការ';
      case 'librarian': return 'បណ្ណារក្ស';
      case 'student': return 'សិស្ស';
      default: return role || 'ទូទៅ';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.targetUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetUserEmail && log.targetUserEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.targetStaffCode && log.targetStaffCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.actor.nameKhmer && log.actor.nameKhmer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedEventType === 'all' || log.eventType === selectedEventType;
    const matchesRole = selectedRole === 'all' || log.targetUserRole === selectedRole;

    return matchesSearch && matchesType && matchesRole;
  });

  // Recent deletion events for troubleshooting
  const recentDeletions = logs.filter(l => l.eventType === 'delete' || l.eventType === 'permanent_delete');

  return (
    <div className="space-y-5">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-moul text-sm sm:text-base text-slate-800">
                កំណត់ត្រាសវនកម្មគណនី (Account Audit Logs)
              </h3>
              <span className="bg-blue-200 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {logs.length} កំណត់ត្រា
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              តាមដានរាល់សកម្មភាពបង្កើត លុប ស្តារ កែប្រែសិទ្ធិ និងប្តូរពាក្យសម្ងាត់លើគណនីគ្រូបង្រៀន និងបុគ្គលិក ជួយស្វែងរកមូលហេតុជាក់ស្តែងប្រសិនបើមានករណីគណនីបាត់ ឬមានការផ្លាស់ប្តូរដោយគ្មានការអនុញ្ញាត។
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowTroubleshootingHelp(!showTroubleshootingHelp)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>ហេតុអ្វីគណនីគ្រូបាត់?</span>
          </button>

          {isDirector && logs.length > 0 && (
            <button
              type="button"
              onClick={onClearLogs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>សម្អាត Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Troubleshooting Helper Box */}
      {showTroubleshootingHelp && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-moul text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ការឆ្លើយតបចំពោះសំណួរ: «ហេតុអ្វីគណនីគ្រូដែលខ្ញុំបង្កើតតែងតែបាត់ទៅវិញ?»</span>
            </h4>
            <button
              onClick={() => setShowTroubleshootingHelp(false)}
              className="text-xs text-amber-700 hover:text-amber-950 font-bold cursor-pointer"
            >
              បិទ
            </button>
          </div>

          <p className="text-xs text-amber-900/90 leading-relaxed">
            តាមរយៈប្រព័ន្ធសវនកម្មនេះ អ្នកអាចដឹងច្បាស់ពីមូលហេតុជាក់លាក់៖
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>1. មានអ្នកគ្រប់គ្រងផ្សេងលុប</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ពិនិត្យមើលតារាងខាងក្រោមសម្រាប់ព្រឹត្តិការណ៍ «លុបទៅធុងសំរាម» ដើម្បីដឹងថាអ្នកណាជាអ្នកលុប នៅថ្ងៃណា និងដោយមូលហេតុអ្វី។
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                <span>2. អាចស្តារឡើងវិញបាន</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                រាល់គណនីដែលបានលុប ត្រូវបានរក្សាទុកក្នុងថេប <b>«ធុងសំរាម (Recently Deleted)»</b> រយៈពេល ៣០ ថ្ងៃ។ លោកអ្នកគ្រាន់តែចុច «ស្តារឡើងវិញ» ជាការស្រេច។
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>3. ទិន្នន័យបាន sync រួចរាល់</span>
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ប្រព័ន្ធឥឡូវនេះបាន sync ដោយស្វ័យប្រវត្តិនូវគណនី `AppUser` ជាមួយនឹងប្រវត្តិរូបគ្រូ (`Teacher`) មិនធ្វើឱ្យបាត់ការចាត់តាំងបន្ទុកថ្នាក់ឡើយ។
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះគ្រូ អ៊ីមែល អត្តលេខ អ្នកធ្វើសកម្មភាព ឬមូលហេតុ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">គ្រប់ព្រឹត្តិការណ៍ (All Events)</option>
            <option value="create">បង្កើតគណនី (Create)</option>
            <option value="delete">លុបគណនី (Delete)</option>
            <option value="restore">ស្តារគណនី (Restore)</option>
            <option value="permanent_delete">លុបជាស្ថាពរ (Permanent Purge)</option>
            <option value="update_role">ប្តូរសិទ្ធិ/តួនាទី (Role Change)</option>
            <option value="reset_password">ប្តូរពាក្យសម្ងាត់ (Password Reset)</option>
            <option value="toggle_status">ស្ថានភាពគណនី (Status Toggle)</option>
            <option value="update_profile">កែប្រែប្រវត្តិរូប (Profile Edit)</option>
          </select>

          {/* Target Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">គ្រប់តួនាទី (All Roles)</option>
            <option value="teacher">គ្រូបង្រៀន (Teacher)</option>
            <option value="director">នាយកសាលា (Director)</option>
            <option value="secretary">លេខាធិការ (Secretary)</option>
            <option value="librarian">បណ្ណារក្ស (Librarian)</option>
            <option value="student">សិស្ស (Student)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">រកមិនឃើញកំណត់ត្រាសវនកម្មឡើយ</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            មិនមានកំណត់ត្រាសវនកម្មដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរករបស់អ្នកឡើយ។
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                  <th className="px-4 py-3">ប្រភេទព្រឹត្តិការណ៍</th>
                  <th className="px-4 py-3">គណនីគោលដៅ (Target Account)</th>
                  <th className="px-4 py-3">អ្នកធ្វើសកម្មភាព (Admin/Actor)</th>
                  <th className="px-4 py-3">មូលហេតុ & ព័ត៌មានលម្អិត</th>
                  <th className="px-4 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatKhmerDateTime(log.timestamp)}</span>
                      </div>
                    </td>

                    {/* Event Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getEventBadge(log.eventType)}
                    </td>

                    {/* Target User */}
                    <td className="px-4 py-3.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{log.targetUserName}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {getRoleLabel(log.targetUserRole)}
                          </span>
                        </div>
                        {log.targetUserEmail && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{log.targetUserEmail}</p>
                        )}
                        {log.targetStaffCode && (
                          <p className="text-[10px] text-slate-500 font-mono">កូដ: {log.targetStaffCode}</p>
                        )}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {log.actor.nameKhmer.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{log.actor.nameKhmer}</p>
                          <p className="text-[10px] text-slate-400">{getRoleLabel(log.actor.role)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Reason & Details */}
                    <td className="px-4 py-3.5 max-w-xs">
                      {log.reason && (
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                          «{log.reason}»
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {log.details}
                      </p>
                    </td>

                    {/* Action View */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedLogForDetails(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>មើលលម្អិត</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-moul text-sm text-slate-800">
                  ព័ត៌មានលម្អិតនៃសវនកម្ម (Audit Log Details)
                </h4>
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">ប្រភេទព្រឹត្តិការណ៍:</span>
                <div>{getEventBadge(selectedLogForDetails.eventType)}</div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">កាលបរិច្ឆេទ & ម៉ោង:</span>
                <span className="font-bold text-slate-800">{formatKhmerDateTime(selectedLogForDetails.timestamp)}</span>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-100">
                <span className="text-slate-500">គណនីគោលដៅ:</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 text-sm">{selectedLogForDetails.targetUserName}</p>
                  <p className="text-slate-500">តួនាទី: {getRoleLabel(selectedLogForDetails.targetUserRole)}</p>
                  {selectedLogForDetails.targetUserEmail && (
                    <p className="text-slate-500">អ៊ីមែល: {selectedLogForDetails.targetUserEmail}</p>
                  )}
                  {selectedLogForDetails.targetStaffCode && (
                    <p className="text-slate-500 font-mono">អត្តលេខ: {selectedLogForDetails.targetStaffCode}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-slate-100">
                <span className="text-slate-500">អ្នកប្រតិបត្តិ (Performed By):</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 text-sm">{selectedLogForDetails.actor.nameKhmer}</p>
                  <p className="text-slate-500">តួនាទី: {getRoleLabel(selectedLogForDetails.actor.role)}</p>
                  {selectedLogForDetails.actor.email && (
                    <p className="text-slate-500">អ៊ីមែល: {selectedLogForDetails.actor.email}</p>
                  )}
                </div>
              </div>

              {selectedLogForDetails.reason && (
                <div className="space-y-1 pb-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">មូលហេតុនៃការផ្លាស់ប្តូរ (Reason/Intent):</span>
                  <p className="font-bold text-slate-800 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                    «{selectedLogForDetails.reason}»
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">សេចក្តីពិពណ៌នា (Details):</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedLogForDetails.details}
                </p>
              </div>

              {selectedLogForDetails.changesSummary && selectedLogForDetails.changesSummary.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-slate-500 font-bold">ព័ត៌មានដែលបានផ្លាស់ប្តូរ (Changes Diff):</span>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                    {selectedLogForDetails.changesSummary.map((diff, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-600 font-bold">{diff.field}:</span>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {String(diff.before ?? 'none')}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {String(diff.after ?? 'none')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
