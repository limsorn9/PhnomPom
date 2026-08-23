import React from 'react';
import {
  ActivityLogItem,
  ActiveTab
} from '../../types';
import {
  formatKhmerRelativeTime,
  formatKhmerFullDateTime
} from '../../utils/activityTracker';
import {
  generateOperationalImpactSummary,
  OperationalImpactResult
} from '../../utils/activityImpactAnalyzer';
import {
  Eye,
  Zap,
  GitCompare,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  Archive,
  Clock,
  CircleDollarSign,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Building,
  HeartPulse,
  Tag,
  MessageSquare,
  AlertOctagon
} from 'lucide-react';

interface ActivityTableViewProps {
  logs: ActivityLogItem[];
  selectedIds: string[];
  focusedIndex: number;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectRow: (index: number) => void;
  onOpenDetail: (item: ActivityLogItem) => void;
  onOpenQuickAction: (item: ActivityLogItem) => void;
  onOpenDiff: (item: ActivityLogItem) => void;
  onOpenComments?: (item: ActivityLogItem) => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenAnomalyPanel?: () => void;
  getDomainBadgeStyles: (domain: string) => string;
  getDomainLabel: (domain: string) => string;
  getActionLabel: (action: string) => string;
}

export const ActivityTableView: React.FC<ActivityTableViewProps> = ({
  logs,
  selectedIds,
  focusedIndex,
  onToggleSelect,
  onToggleSelectAll,
  onSelectRow,
  onOpenDetail,
  onOpenQuickAction,
  onOpenDiff,
  onOpenComments,
  onNavigate,
  onOpenAnomalyPanel,
  getDomainBadgeStyles,
  getDomainLabel,
  getActionLabel
}) => {
  const isAllSelected = logs.length > 0 && logs.every(log => selectedIds.includes(log.id));
  const isPartiallySelected = selectedIds.length > 0 && !isAllSelected;

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-left text-xs border-collapse activity-log-table">
        <thead>
          <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-200 text-[11px] font-bold select-none sticky top-0 z-10 backdrop-blur-xs">
            {/* Master Checkbox Header */}
            <th className="py-3 px-3 w-10 text-center">
              <button
                type="button"
                id="activity-table-master-checkbox"
                onClick={onToggleSelectAll}
                className="p-1 rounded hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title={isAllSelected ? 'ដកការជ្រើសរើសទាំងអស់' : 'ជ្រើសរើសទាំងអស់ (Select All)'}
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : isPartiallySelected ? (
                  <MinusSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </th>
            <th className="py-3 px-2 text-center w-10">ល.រ</th>
            <th className="py-3 px-3 whitespace-nowrap">កាលបរិច្ឆេទ & ម៉ោង</th>
            <th className="py-3 px-2.5 text-center">ប្រភេទ / សកម្មភាព</th>
            <th className="py-3 px-3 min-w-[200px]">ឈ្មោះ & ខ្លឹមសារកែប្រែ</th>
            {/* Impact Summary AI Column */}
            <th className="py-3 px-3 min-w-[260px] bg-indigo-50/50 text-indigo-950 border-x border-indigo-100">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>ផលប៉ះពាល់ប្រតិបត្តិការ (AI Impact Summary)</span>
              </div>
            </th>
            <th className="py-3 px-3">អ្នកប្រតិបត្តិ (Actor)</th>
            <th className="py-3 px-3 text-right whitespace-nowrap">ទឹកប្រាក់ (៛)</th>
            <th className="py-3 px-3 text-center w-28">សកម្មភាព</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((item, idx) => {
            const isSelected = selectedIds.includes(item.id);
            const isFocused = idx === focusedIndex;
            const isIncome = item.actionType === 'income';
            const isExpense = item.actionType === 'expense';
            const isDelete = item.actionType === 'delete';
            const hasAnomalies = item.anomalies && item.anomalies.length > 0;
            const impact: OperationalImpactResult = generateOperationalImpactSummary(item);

            return (
              <tr
                key={item.id}
                id={`activity-row-${item.id}`}
                onClick={() => onSelectRow(idx)}
                className={`transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                    : isFocused
                    ? 'bg-blue-50/70 ring-2 ring-inset ring-blue-400'
                    : idx % 2 === 1
                    ? 'bg-slate-50/50 hover:bg-slate-100/70'
                    : 'bg-white hover:bg-slate-50'
                } ${hasAnomalies && !isSelected ? 'bg-rose-50/30 hover:bg-rose-50/60' : ''}`}
              >
                {/* Row Checkbox */}
                <td
                  className="py-2.5 px-3 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id);
                  }}
                >
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                    )}
                  </button>
                </td>

                {/* Index */}
                <td className="py-2.5 px-2 text-center font-mono text-slate-500 text-[11px]">
                  {idx + 1}
                </td>

                {/* Timestamp */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <div className="font-semibold text-slate-800 text-xs">
                    {formatKhmerRelativeTime(item.timestamp)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* Domain & Action */}
                <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                  <div className="space-y-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDomainBadgeStyles(
                        item.domain
                      )}`}
                    >
                      {getDomainLabel(item.domain)}
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {getActionLabel(item.actionType)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Entity & Title Description */}
                <td className="py-2.5 px-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                      {item.isArchived && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                          បណ្ណសារ
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      {item.description}
                    </div>
                    {item.entityName && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="font-medium text-slate-700">{item.entityName}</span>
                        {item.entityCode && (
                          <span className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.2 rounded text-[9px]">
                            {item.entityCode}
                          </span>
                        )}
                      </div>
                    )}

                    {/* High Risk warning alert */}
                    {item.isHighRisk && (
                      <div className="pt-0.5">
                        <span
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-xs animate-pulse"
                          title={(item.riskReasons || []).join(' | ') || 'ហានិភ័យសវនកម្មខ្ពស់'}
                        >
                          <AlertOctagon className="w-2.5 h-2.5" />
                          <span>ហានិភ័យខ្ពស់ ({item.riskScore || 75}/100)</span>
                        </span>
                      </div>
                    )}

                    {/* Anomalies alert */}
                    {hasAnomalies && (
                      <div className="pt-0.5">
                        {item.anomalies!.map((ano, aIdx) => (
                          <span
                            key={aIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenAnomalyPanel) onOpenAnomalyPanel();
                            }}
                            className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer"
                          >
                            <ShieldAlert className="w-2.5 h-2.5" />
                            <span>{ano.titleKhmer}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comments summary pill if exists */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenComments) onOpenComments(item);
                          }}
                          className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 cursor-pointer"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{item.comments.length} កំណត់សម្គាល់៖ «{item.comments[0].text}»</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* Impact Summary Column */}
                <td className="py-2.5 px-3 bg-indigo-50/30 border-x border-indigo-100/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          impact.impactLevel === 'high'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : impact.impactLevel === 'medium'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {impact.impactLevel === 'high'
                          ? 'កម្រិតខ្ពស់'
                          : impact.impactLevel === 'medium'
                          ? 'កម្រិតមធ្យម'
                          : 'កម្រិតធម្មតា'}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded">
                        {impact.categoryKhmer}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug font-kantumruy">
                      {impact.summaryKhmer}
                    </p>
                    {impact.recommendedAction && (
                      <div className="text-[10px] text-indigo-900 font-medium bg-white/80 border border-indigo-200/70 px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="font-bold">ការណែនាំ៖</span>
                        <span>{impact.recommendedAction}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Actor */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <div className="font-bold text-slate-800 text-xs">{item.actorName}</div>
                  <div className="text-[10px] text-slate-500">{item.actorRole}</div>
                </td>

                {/* Financial Amount */}
                <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                  {item.financialAmountRiel !== undefined ? (
                    <div
                      className={`text-xs font-bold ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{item.financialAmountRiel.toLocaleString()} ៛
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    {/* Diff button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDiff(item);
                      }}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                      title="ប្រៀបធៀប Diff"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>

                    {/* Comments button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenComments) onOpenComments(item);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                        item.comments && item.comments.length > 0
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="កំណត់សម្គាល់ & មតិយោបល់សវនកម្ម"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {item.comments && item.comments.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-3.5 h-3.5 text-[8.5px] flex items-center justify-center font-mono font-bold shadow-xs">
                          {item.comments.length}
                        </span>
                      )}
                    </button>

                    {/* Quick action button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuickAction(item);
                      }}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer"
                      title="សកម្មភាពរហ័ស"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>

                    {/* Detail button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(item);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="មើលព័ត៌មានលម្អិត"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {item.targetTab && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigate) onNavigate(item.targetTab!);
                        }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="ចូលទៅកាន់ផ្នែកនេះផ្ទាល់"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
