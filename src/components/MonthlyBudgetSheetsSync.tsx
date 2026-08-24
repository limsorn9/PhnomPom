import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { exportMonthlyBudgetReportToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  CheckCircle2,
  Filter,
  Download,
  Building2,
  Coins,
  HardDrive,
  Check
} from 'lucide-react';

export const MonthlyBudgetSheetsSync: React.FC = () => {
  const {
    schoolProfile,
    budgetTransactions,
    selectedAcademicYear,
    getMonthlyBudgetSummaries,
    syncFinancialReportToDrive,
    isDriveSyncing,
    driveAutoSyncConfig,
    showToast
  } = useSchool();

  const [selectedYear, setSelectedYear] = useState(selectedAcademicYear);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string | null>(null);
  const [googleDriveReportUrl, setGoogleDriveReportUrl] = useState<string | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  const monthlySummaries = getMonthlyBudgetSummaries(selectedYear);

  // Overall calculations
  const totalIncomeRiel = monthlySummaries.reduce((sum, m) => sum + m.incomeRiel, 0);
  const totalExpenseRiel = monthlySummaries.reduce((sum, m) => sum + m.expenseRiel, 0);
  const netBalanceRiel = totalIncomeRiel - totalExpenseRiel;

  const handleSyncToGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        }
      }

      if (!token) {
        showToast('សូមចូលប្រើប្រាស់គណនី Google ជាមុនសិន!', 'error');
        setIsSyncing(false);
        return;
      }

      const res = await exportMonthlyBudgetReportToGoogleSheets(
        schoolProfile,
        budgetTransactions,
        monthlySummaries,
        selectedYear
      );

      setGoogleSheetUrl(res.spreadsheetUrl);
      showToast('បាន sync របាយការណ៍ថវិកាប្រចាំខែទៅ Google Sheets ជោគជ័យ!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'មានបញ្ហាក្នុងការ sync ទៅ Google Sheets', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToDrive = async () => {
    try {
      const res = await syncFinancialReportToDrive(selectedYear);
      if (res && res.webViewLink) {
        setGoogleDriveReportUrl(res.webViewLink);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredSummaries = selectedMonthFilter === 'all'
    ? monthlySummaries
    : monthlySummaries.filter(m => m.monthName === selectedMonthFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Coins className="w-3.5 h-3.5" />
            <span>ប្រព័ន្ធតាមដាន និងវិភាគថវិកាសាលាប្រចាំខែ</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-moul text-amber-300">
            តារាងតាមដានថវិកាចំណូល-ចំណាយប្រចាំខែ (១២ ខែ)
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            ទាញទិន្នន័យចំណូល-ចំណាយតាមប្រភពមូលនិធិរដ្ឋ (PB), ជំនួយអភិវឌ្ឍន៍សាលា (SIG), និងវិភាគទានសហគមន៍ រួចធ្វើសមកាលកម្មទៅ Google Sheets។
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncToDrive}
            disabled={isDriveSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50 text-sm"
            title={`Sync របាយការណ៍ហិរញ្ញវត្ថុទៅ Google Drive Folder (${driveAutoSyncConfig.folderId || '1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g'})`}
          >
            {isDriveSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4" />
            )}
            <span>Sync របាយការណ៍ទៅ Google Drive</span>
          </button>

          <button
            onClick={handleSyncToGoogleSheets}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50 text-sm"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Sync ទៅ Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Google Drive Link Notification */}
      {googleDriveReportUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4 text-blue-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">បាន Sync របាយការណ៍ហិរញ្ញវត្ថុទៅ Google Drive រួចរាល់!</p>
              <p className="text-xs text-blue-600">Folder ID: {driveAutoSyncConfig.folderId || '1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g'}</p>
            </div>
          </div>
          <a
            href={googleDriveReportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          >
            <span>បើកមើលក្នុង Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Google Sheets Link Notification */}
      {googleSheetUrl && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 text-emerald-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">បានបង្កើត និង Sync តារាងថវិកាទៅ Google Sheets រួចរាល់!</p>
              <p className="text-xs text-emerald-600">អ្នកអាចបើកមើលទម្រង់តារាង Excel/Sheets តាមតំណភ្ជាប់ខាងស្តាំ។</p>
            </div>
          </div>
          <a
            href={googleSheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          >
            <span>បើក Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ចំណូលសរុប (១២ ខែ)</p>
            <h3 className="text-xl font-bold text-emerald-600">
              {totalIncomeRiel.toLocaleString()} <span className="text-xs text-slate-500 font-normal">រៀល</span>
            </h3>
            <p className="text-[11px] text-slate-400">≈ ${(totalIncomeRiel / 4050).toFixed(0)} USD</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ចំណាយសរុប (១២ ខែ)</p>
            <h3 className="text-xl font-bold text-rose-600">
              {totalExpenseRiel.toLocaleString()} <span className="text-xs text-slate-500 font-normal">រៀល</span>
            </h3>
            <p className="text-[11px] text-slate-400">≈ ${(totalExpenseRiel / 4050).toFixed(0)} USD</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">សមតុល្យថវិកានៅសល់</p>
            <h3 className={`text-xl font-bold ${netBalanceRiel >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {netBalanceRiel.toLocaleString()} <span className="text-xs text-slate-500 font-normal">រៀល</span>
            </h3>
            <p className="text-[11px] text-slate-400">≈ ${(netBalanceRiel / 4050).toFixed(0)} USD</p>
          </div>
        </div>
      </div>

      {/* Monthly Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">តារាងលម្អិតចំណូល-ចំណាយតាមខែនីមួយៗ ឆ្នាំសិក្សា {selectedYear}</h3>
            <p className="text-xs text-slate-500">គណនាដោយស្វ័យប្រវត្តិពីប្រតិបត្តិការចំណូលចំណាយជាក់ស្តែង</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonthFilter}
              onChange={e => setSelectedMonthFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ខែទាំងអស់ (១២ ខែ)</option>
              {monthlySummaries.map(m => (
                <option key={m.monthName} value={m.monthName}>ខែ {m.monthName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ល.រ</th>
                <th className="px-4 py-3">ខែ / រដូវកាល</th>
                <th className="px-4 py-3 text-right text-emerald-700">ចំណូល (រៀល)</th>
                <th className="px-4 py-3 text-right text-rose-700">ចំណាយ (រៀល)</th>
                <th className="px-4 py-3 text-right text-blue-700">សមតុល្យ (រៀល)</th>
                <th className="px-4 py-3 text-center">រដ្ឋ (PB)</th>
                <th className="px-4 py-3 text-center">ជំនួយ (SIG)</th>
                <th className="px-4 py-3 text-center">សហគមន៍</th>
                <th className="px-4 py-3 text-center">ប្រតិបត្តិការ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map((summary, idx) => (
                <tr key={summary.monthName} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    ខែ {summary.monthName}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">
                    {summary.incomeRiel > 0 ? `+${summary.incomeRiel.toLocaleString()}` : '០'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-rose-600">
                    {summary.expenseRiel > 0 ? `-${summary.expenseRiel.toLocaleString()}` : '០'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span className={summary.balanceRiel >= 0 ? 'text-blue-600' : 'text-rose-600'}>
                      {summary.balanceRiel.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono">
                    {summary.bySource.pbStateBudget.income > 0 || summary.bySource.pbStateBudget.expense > 0 ? '✓' : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono">
                    {summary.bySource.sigImprovementGrant.income > 0 || summary.bySource.sigImprovementGrant.expense > 0 ? '✓' : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono">
                    {summary.bySource.communityParents.income > 0 || summary.bySource.communityParents.expense > 0 ? '✓' : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {summary.transactionCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right">សរុបរួមប្រចាំឆ្នាំ៖</td>
                <td className="px-4 py-3 text-right text-emerald-600 font-mono">{totalIncomeRiel.toLocaleString()} ៛</td>
                <td className="px-4 py-3 text-right text-rose-600 font-mono">{totalExpenseRiel.toLocaleString()} ៛</td>
                <td className="px-4 py-3 text-right text-blue-600 font-mono">{netBalanceRiel.toLocaleString()} ៛</td>
                <td colSpan={4} className="px-4 py-3 text-center text-xs text-slate-500">
                  ប្រតិបត្តិការសរុប {budgetTransactions.length} លើក
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
