import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BudgetTransaction, BudgetSource } from '../types';
import { exportFinanceToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  Trash2,
  Tag,
  X,
  Wallet,
  Building2,
  Users2,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  Printer
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const BudgetFinance: React.FC = () => {
  const {
    budgetTransactions,
    addBudgetTransaction,
    deleteBudgetTransaction,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    schoolProfile,
    showToast
  } = useSchool();

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);


  // Form State
  const initialFormState = {
    title: '',
    type: 'expense' as 'income' | 'expense',
    source: 'ថវិការដ្ឋ (PB)' as BudgetSource,
    category: 'សម្ភារៈឧបទេស',
    amountRiel: 500000,
    date: new Date().toISOString().split('T')[0],
    recordedBy: 'អ្នកគ្រូ ពេជ្រ ធីតា',
    description: '',
    status: 'approved' as const
  };

  const [formData, setFormData] = useState(initialFormState);

  const totalIncomeRiel = getTotalIncome();
  const totalExpenseRiel = getTotalExpense();
  const balanceRiel = getBalance();
  const balanceUsd = Math.round(balanceRiel / 4050);

  const filteredTransactions = budgetTransactions.filter(tx => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSource = filterSource === 'all' || tx.source === filterSource;
    const matchesSearch =
      searchTerm === '' ||
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSource && matchesSearch;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amountRiel <= 0) return;

    addBudgetTransaction({
      title: formData.title,
      type: formData.type,
      source: formData.source,
      category: formData.category,
      amountRiel: Number(formData.amountRiel),
      amountUsd: Number((formData.amountRiel / 4050).toFixed(2)),
      date: formData.date,
      recordedBy: formData.recordedBy,
      description: formData.description,
      status: formData.status
    });

    setIsAddModalOpen(false);
    setFormData(initialFormState);
  };

  // Funding source comparison data for charts
  const sourcesList: BudgetSource[] = [
    'ថវិការដ្ឋ (PB)',
    'មូលនិធិកែលម្អសាលា (SIG)',
    'សហគមន៍/សមាគមមាតាបិតា',
    'ដៃគូអភិវឌ្ឍន៍/NGO'
  ];

  const sourceChartData = sourcesList.map(src => {
    const income = budgetTransactions
      .filter(tx => tx.source === src && tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amountRiel, 0);
    const expense = budgetTransactions
      .filter(tx => tx.source === src && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amountRiel, 0);

    return {
      name: src.replace(' (PB)', '').replace(' (SIG)', ''),
      ចំណូល: Number((income / 1000000).toFixed(1)),
      ចំណាយ: Number((expense / 1000000).toFixed(1))
    };
  });

  const exportBudgetToCSV = () => {
    const headers = ['លេខកូដ', 'បរិយាយប្រតិបត្តិការ', 'ប្រភេទ', 'ប្រភពថវិកា', 'ជំពូកចំណាយ', 'ចំនួនទឹកប្រាក់ (រៀល)', 'ទឹកប្រាក់ (ដុល្លារ)', 'កាលបរិច្ឆេទ', 'អ្នកកត់ត្រា'];
    const rows = filteredTransactions.map(tx => [
      tx.referenceCode,
      `"${tx.title}"`,
      tx.type === 'income' ? 'ចំណូល' : 'ចំណាយ',
      `"${tx.source}"`,
      `"${tx.category}"`,
      tx.amountRiel,
      tx.amountUsd,
      tx.date,
      `"${tx.recordedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `របាយការណ៍ហិរញ្ញវត្ថុ_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFinanceToSheets = async () => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        } else {
          return;
        }
      } catch (err: any) {
        showToast(err.message || 'សូមភ្ជាប់គណនី Google ដើម្បីនាំចេញ', 'error');
        return;
      }
    }

    if (!token) return;

    setIsExportingSheets(true);
    try {
      const res = await exportFinanceToGoogleSheets(schoolProfile, budgetTransactions);
      showToast(`បានបង្កើត Google Sheet «${res.title}» ដោយជោគជ័យ!`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      showToast(err.message || 'បរាជ័យក្នុងការនាំចេញទិន្នន័យហិរញ្ញវត្ថុ', 'error');
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Cards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-moul">គ្រប់គ្រងថវិកា និងហិរញ្ញវត្ថុសាលា</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Program Budgeting (PB)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              តាមដានចំណូល ចំណាយ ថវិកាកម្មវិធីរដ្ឋ (PB) មូលនិធិកែលម្អសាលា (SIG) និងវិភាគទានសហគមន៍
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="export-finance-sheets-btn"
              onClick={handleExportFinanceToSheets}
              disabled={isExportingSheets}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isExportingSheets ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>{isExportingSheets ? 'កំពុងនាំចេញ...' : 'នាំចេញទៅ Google Sheet'}</span>
            </button>
            <button
              id="export-budget-csv-btn"
              onClick={exportBudgetToCSV}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-600" />
              ទាញយក CSV
            </button>
            <button
              id="print-budget-btn"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors shadow-sm"
              title="បោះពុម្ពរបាយការណ៍ហិរញ្ញវត្ថុ"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              បោះពុម្ព
            </button>
            <button
              id="add-budget-transaction-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              កត់ត្រាចំណូល/ចំណាយថ្មី
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>ចំណូលសរុប (Total Income)</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-950 font-mono">
              {totalIncomeRiel.toLocaleString()} <span className="text-xs font-kantumruy font-normal">៛</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              ~${Math.round(totalIncomeRiel / 4050).toLocaleString()} USD
            </span>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
              <span>ចំណាយសរុប (Total Expense)</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-950 font-mono">
              {totalExpenseRiel.toLocaleString()} <span className="text-xs font-kantumruy font-normal">៛</span>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">
              ~${Math.round(totalExpenseRiel / 4050).toLocaleString()} USD
            </span>
          </div>

          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span>សមតុល្យថវិកានៅសល់ (Balance)</span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-950 font-mono">
              {balanceRiel.toLocaleString()} <span className="text-xs font-kantumruy font-normal">៛</span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium">
              ~${balanceUsd.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      {/* Chart: Income vs Expense by Source */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-kantumruy">
              ការប្រៀបធៀបចំណូល និងចំណាយតាមប្រភពថវិកា (គិតជាលានរៀល)
            </h3>
            <p className="text-xs text-slate-500">
              ការបែងចែកថវិការដ្ឋ PB មូលនិធិ SIG សហគមន៍ និងអង្គការដៃគូ
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip
                formatter={(value, name) => [`${value} លានរៀល`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="ចំណូល" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ចំណាយ" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Official Ministry Heading shown only on Print */}
        <div className="hidden print:block p-6 mb-4 border-b border-slate-300">
          <div className="flex justify-between items-start text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
              <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolProfile.province}</p>
              <p className="text-slate-700">ការិយាល័យអប់រំ យុវជន និងកីឡា {schoolProfile.district}</p>
              <p className="font-bold text-blue-950 font-moul text-sm">{schoolProfile.nameKhmer}</p>
              <p className="text-[10px] text-slate-500 font-mono">កូដសាលា: {schoolProfile.schoolCode}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold text-xs text-slate-900 font-moul">ស្តង់ដារសាលាបឋមសិក្សាគំរូ</p>
              <p className="text-xs text-slate-700">ឆ្នាំសិក្សា៖ <span className="font-bold">{schoolProfile.academicYear}</span></p>
              <p className="text-[10px] text-slate-500">កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
            </div>
          </div>
          <div className="text-center mt-4">
            <h2 className="font-moul text-base text-slate-950">
              សៀវភៅតាមដានចំណូល-ចំណាយថវិកាសាលា (PB & SIG)
            </h2>
            <p className="text-xs text-slate-700 mt-1">
              ចំណូលសរុប៖ <strong className="text-emerald-700">{totalIncomeRiel.toLocaleString()} ៛</strong> • ចំណាយសរុប៖ <strong className="text-rose-700">{totalExpenseRiel.toLocaleString()} ៛</strong> • សមតុល្យនៅសល់៖ <strong className="text-blue-900">{balanceRiel.toLocaleString()} ៛</strong>
            </p>
          </div>
        </div>

        {/* Table Filters */}
        <div className="p-4 bg-slate-50/90 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ស្វែងរកតាមបរិយាយ លេខកូដ ជំពូក..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
            >
              <option value="all">គ្រប់ប្រភេទ (ចំណូល & ចំណាយ)</option>
              <option value="income">ចំណូល (Income)</option>
              <option value="expense">ចំណាយ (Expense)</option>
            </select>
          </div>

          <div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
            >
              <option value="all">គ្រប់ប្រភពថវិកាទាំងអស់</option>
              <option value="ថវិការដ្ឋ (PB)">ថវិការដ្ឋ (PB)</option>
              <option value="មូលនិធិកែលម្អសាលា (SIG)">មូលនិធិកែលម្អសាលា (SIG)</option>
              <option value="សហគមន៍/សមាគមមាតាបិតា">សហគមន៍/សមាគមមាតាបិតា</option>
              <option value="ដៃគូអភិវឌ្ឍន៍/NGO">ដៃគូអភិវឌ្ឍន៍/NGO</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">កូដយោង</th>
                <th className="py-3 px-4">បរិយាយចំណូល/ចំណាយ</th>
                <th className="py-3 px-4">ប្រភេទ</th>
                <th className="py-3 px-4">ប្រភពថវិកា</th>
                <th className="py-3 px-4">ទឹកប្រាក់ (រៀល)</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-4">អ្នកកត់ត្រា</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{tx.referenceCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tx.title}</div>
                      <div className="text-[11px] text-slate-500">{tx.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.type === 'income' ? 'ចំណូល' : 'ចំណាយ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{tx.source}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tx.amountRiel.toLocaleString()} ៛
                    </td>
                    <td className="py-3 px-4 text-slate-600">{tx.date}</td>
                    <td className="py-3 px-4 text-slate-600">{tx.recordedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`តើអ្នកចង់លុបប្រតិបត្តិការ «${tx.title}» ឬទេ?`)) {
                            deleteBudgetTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    មិនមានប្រតិបត្តិការត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures on Print */}
        <div className="hidden print:flex justify-between items-end mt-8 text-xs text-slate-800 p-6 pt-2">
          <div className="text-center">
            <p>បានឃើញ និងយល់ព្រម</p>
            <strong className="block mt-1 font-moul text-slate-900">នាយិកាសាលា</strong>
            <div className="h-16" />
            <p className="font-bold">{schoolProfile.principalName}</p>
          </div>

          <div className="text-center">
            <p>{schoolProfile.district}, ថ្ងៃទី {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ២០២៤</p>
            <strong className="block mt-1 font-moul text-slate-900">គណនេយ្យករ / បេឡា</strong>
            <div className="h-16" />
            <p className="font-bold">អ្នកគ្រូ ម៉េង គីមឡាង</p>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold font-moul">កត់ត្រាប្រតិបត្តិការហិរញ្ញវត្ថុថ្មី</h3>
                <p className="text-xs text-emerald-100">
                  បញ្ចូលចំណូល ឬចំណាយថវិកាសាលាស្របតាមជំពូកថវិការដ្ឋបាល
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  បរិយាយ / ឈ្មោះប្រតិបត្តិការ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ឧ. ទិញសម្ភារៈឧបទេសបង្រៀនថ្នាក់ទី១-ទី៣"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ប្រភេទ</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="expense">ចំណាយ (Expense)</option>
                    <option value="income">ចំណូល (Income)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ប្រភពថវិកា</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ថវិការដ្ឋ (PB)">ថវិការដ្ឋ (PB)</option>
                    <option value="មូលនិធិកែលម្អសាលា (SIG)">មូលនិធិកែលម្អសាលា (SIG)</option>
                    <option value="សហគមន៍/សមាគមមាតាបិតា">សហគមន៍/សមាគមមាតាបិតា</option>
                    <option value="ដៃគូអភិវឌ្ឍន៍/NGO">ដៃគូអភិវឌ្ឍន៍/NGO</option>
                    <option value="ចំណូលផ្សេងៗ">ចំណូលផ្សេងៗ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ចំនួនទឹកប្រាក់ (រៀល ៛) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={formData.amountRiel}
                    onChange={(e) => setFormData({ ...formData, amountRiel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">កាលបរិច្ឆេទ</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ជំពូក / ប្រភេទចំណាយ</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ឧ. សម្ភារៈឧបទេស, ជួសជុលអគារ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">អ្នកកត់ត្រា/ទទួលខុសត្រូវ</label>
                  <input
                    type="text"
                    value={formData.recordedBy}
                    onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                    placeholder="ឈ្មោះអ្នកកត់ត្រា"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">កំណត់ចំណាំបន្ថែម</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="បញ្ជាក់ព័ត៌មានលម្អិតនៃប្រតិបត្តិការ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  កត់ត្រាប្រតិបត្តិការ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
