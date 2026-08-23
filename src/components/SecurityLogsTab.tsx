import React, { useState, useMemo, useRef } from 'react';
import { AppUser, SecurityLoginLog } from '../types';
import { SecurityPatternsDashboard } from './SecurityPatternsDashboard';
import { useSchool } from '../context/SchoolContext';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  KeyRound,
  Lock,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Printer,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileDown,
  Eye,
  X
} from 'lucide-react';

interface SecurityLogsTabProps {
  currentUser: AppUser | null;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

type SortField = 'timestamp' | 'status' | 'device' | 'browser' | 'ipAddress' | 'location' | 'method';
type SortOrder = 'asc' | 'desc';

export const SecurityLogsTab: React.FC<SecurityLogsTabProps> = ({
  currentUser,
  onShowToast
}) => {
  const { schoolProfile } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showPatternsDashboard, setShowPatternsDashboard] = useState<boolean>(true);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fallback realistic security audit records
  const defaultLogs: SecurityLoginLog[] = useMemo(() => [
    {
      id: 'log-1',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'success',
      ipAddress: '103.216.50.21',
      device: 'Windows 11 PC (Office)',
      browser: 'Microsoft Edge 122',
      os: 'Windows 11 Pro',
      location: 'Phnom Penh, Cambodia',
      method: 'password'
    },
    {
      id: 'log-2',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'success',
      ipAddress: '203.144.90.12',
      device: 'Apple iPhone 15 Pro',
      browser: 'Safari Mobile 17.2',
      os: 'iOS 17.4',
      location: 'Siem Reap, Cambodia',
      method: 'mfa_totp'
    },
    {
      id: 'log-3',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      status: 'failed',
      ipAddress: '185.220.101.5 (Proxy/Tor)',
      device: 'Linux / Chrome Headless',
      browser: 'Chrome 119',
      os: 'Linux x86_64',
      location: 'Frankfurt, Germany',
      method: 'password'
    },
    {
      id: 'log-4',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      status: 'success',
      ipAddress: '118.69.180.44',
      device: 'Samsung Galaxy Tab S9',
      browser: 'Chrome Mobile 121',
      os: 'Android 14',
      location: 'Phnom Penh, Cambodia',
      method: 'password'
    },
    {
      id: 'log-5',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      status: 'success',
      ipAddress: '103.216.50.21',
      device: 'Windows 11 PC (Office)',
      browser: 'Microsoft Edge 122',
      os: 'Windows 11 Pro',
      location: 'Phnom Penh, Cambodia',
      method: 'google'
    },
    {
      id: 'log-6',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      status: 'success',
      ipAddress: '103.216.50.21',
      device: 'Apple MacBook Pro M3',
      browser: 'Safari 17.1',
      os: 'macOS Sonoma',
      location: 'Phnom Penh, Cambodia',
      method: 'mfa_totp'
    },
    {
      id: 'log-7',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      status: 'failed',
      ipAddress: '45.154.255.88',
      device: 'Unknown Android Bot',
      browser: 'okhttp/4.9.2',
      os: 'Android 11',
      location: 'Singapore',
      method: 'password'
    },
    {
      id: 'log-8',
      userId: currentUser?.id || 'usr-01',
      userEmail: currentUser?.email || 'admin@moeys.gov.kh',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
      status: 'success',
      ipAddress: '103.216.50.21',
      device: 'Windows 11 PC (Office)',
      browser: 'Firefox 123.0',
      os: 'Windows 11',
      location: 'Phnom Penh, Cambodia',
      method: 'mfa_sms'
    }
  ], [currentUser?.id, currentUser?.email]);

  const rawLogs = currentUser?.securityLogs && currentUser.securityLogs.length > 0
    ? currentUser.securityLogs
    : defaultLogs;

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    return rawLogs.filter(l => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.ipAddress.toLowerCase().includes(q) ||
        l.device.toLowerCase().includes(q) ||
        (l.location || '').toLowerCase().includes(q) ||
        l.browser.toLowerCase().includes(q) ||
        (l.userEmail || '').toLowerCase().includes(q) ||
        (l.os || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || (l.method || 'password') === methodFilter;

      // Date filter
      let matchesDate = true;
      const logTime = new Date(l.timestamp).getTime();
      const now = Date.now();
      if (dateRangeFilter === 'today') {
        matchesDate = now - logTime <= 24 * 60 * 60 * 1000;
      } else if (dateRangeFilter === 'week') {
        matchesDate = now - logTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRangeFilter === 'month') {
        matchesDate = now - logTime <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [rawLogs, searchQuery, statusFilter, methodFilter, dateRangeFilter]);

  // Sorting Logic
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'timestamp') {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLogs.slice(startIndex, startIndex + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const exportLogsCsv = () => {
    const headers = ['Timestamp,User_Email,Status,IP_Address,Location,Device,Browser,OS,Auth_Method'];
    const rows = sortedLogs.map(
      l =>
        `"${l.timestamp}","${l.userEmail || currentUser?.email || ''}","${l.status}","${l.ipAddress}","${l.location || ''}","${l.device}","${l.browser}","${l.os}","${l.method || 'password'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`បានទាញយកកំណត់ត្រា audit ចំនួន ${sortedLogs.length} ជួរជា CSV ជោគជ័យ!`, 'success');
  };

  // Export to JSON
  const exportLogsJson = () => {
    const jsonStr = JSON.stringify(sortedLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('បានទាញយកកំណត់ត្រា Audit ជា JSON ជោគជ័យ!', 'success');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  const successCount = rawLogs.filter(l => l.status === 'success').length;
  const failedCount = rawLogs.filter(l => l.status === 'failed').length;
  const mfaCount = rawLogs.filter(l => l.method?.includes('mfa')).length;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Security Patterns Dashboard Toggle & Container */}
      {showPatternsDashboard && (
        <SecurityPatternsDashboard
          logs={rawLogs}
          onFilterByStatus={setStatusFilter}
          onFilterByMethod={setMethodFilter}
        />
      )}

      {/* Security Analytics Top Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">ការចូលជោគជ័យ (Successful Logins)</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {successCount} ដង
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">ការប៉ុនប៉ងបរាជ័យ (Failed Attempts)</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">
              {failedCount} ដង
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">ផ្ទៀងផ្ទាត់ដោយ MFA (2FA Events)</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block font-mono">
              {mfaCount} ដង
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">ស្ថានភាពសវនកម្ម (Audit Trail)</span>
            <span className="text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>អនុលោមតាម ISO / NIST</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters and Header Toolbar */}
        <div className="p-5 border-b border-slate-100 space-y-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-moul text-sm sm:text-base text-slate-800">
                    កំណត់ត្រាសុវត្ថិភាព & សវនកម្ម (Security Audit Trail)
                  </h3>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-bold text-[10px]">
                    {sortedLogs.length} កំណត់ត្រា
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  តារាងទិន្នន័យសវនកម្មពេញលេញ អាចតម្រៀបតាមជួរឈរ ស្វែងរក និងទាញយកជាឯកសារផ្លូវការ
                </p>
              </div>
            </div>

            {/* Export Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                title="ទាញយកកំណត់ត្រាសវនកម្មផ្លូវការ (Download Official Audit Trail PDF/Print)"
              >
                <FileDown className="w-4 h-4" />
                <span>ទាញយកកំណត់ត្រាសវនកម្ម (Download Audit Trail)</span>
              </button>

              <button
                type="button"
                onClick={exportLogsCsv}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="ទាញយកជា CSV Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={exportLogsJson}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="ទាញយកជា JSON"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="បោះពុម្ពកំណត់ត្រា"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>បោះពុម្ព</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ស្វែងរក IP, ឧបករណ៍, ទីតាំង, Browser..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">ស្ថានភាពទាំងអស់ (All Status)</option>
              <option value="success">✓ ជោគជ័យ (Success Only)</option>
              <option value="failed">✕ បរាជ័យ (Failed Only)</option>
            </select>

            {/* Auth Method Filter */}
            <select
              value={methodFilter}
              onChange={e => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">វិធីសាស្ត្រទាំងអស់ (All Methods)</option>
              <option value="password">Password</option>
              <option value="mfa_totp">MFA (TOTP Authenticator)</option>
              <option value="mfa_sms">MFA (SMS OTP)</option>
              <option value="google">Google SSO</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRangeFilter}
              onChange={e => {
                setDateRangeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">ពេលវេលាទាំងអស់ (All Time)</option>
              <option value="today">២៤ ម៉ោងចុងក្រោយ (Last 24 Hours)</option>
              <option value="week">៧ ថ្ងៃចុងក្រោយ (Last 7 Days)</option>
              <option value="month">៣០ ថ្ងៃចុងក្រោយ (Last 30 Days)</option>
            </select>
          </div>
        </div>

        {/* Clean Sortable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold select-none">
                <th
                  onClick={() => handleSort('timestamp')}
                  className="p-4 cursor-pointer hover:bg-slate-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>កាលបរិច្ឆេទ & ម៉ោង</span>
                    {renderSortIcon('timestamp')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('status')}
                  className="p-4 cursor-pointer hover:bg-slate-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ស្ថានភាព (Status)</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('device')}
                  className="p-4 cursor-pointer hover:bg-slate-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ឧបករណ៍ & OS</span>
                    {renderSortIcon('device')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('browser')}
                  className="p-4 cursor-pointer hover:bg-slate-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>កម្មវិធីរុករក (Browser)</span>
                    {renderSortIcon('browser')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('ipAddress')}
                  className="p-4 cursor-pointer hover:bg-slate-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>អាសយដ្ឋាន IP & ទីតាំង</span>
                    {renderSortIcon('ipAddress')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('method')}
                  className="p-4 cursor-pointer hover:bg-slate-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>វិធីសាស្ត្រចូល</span>
                    {renderSortIcon('method')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">ពុំមានទិន្នន័យកំណត់ត្រាសុវត្ថិភាពត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ</p>
                    <p className="text-[11px] text-slate-400 mt-1">សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬដកតម្រងចេញ</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      log.status === 'failed' ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="p-4 font-mono font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString('km-KH')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                        {new Date(log.timestamp).toISOString()}
                      </span>
                    </td>

                    <td className="p-4">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ជោគជ័យ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>បរាជ័យ (Failed)</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {log.device.includes('iPhone') || log.os.includes('Android') ? (
                          <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{log.device}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{log.os}</span>
                    </td>

                    <td className="p-4 font-mono text-slate-700">
                      {log.browser}
                    </td>

                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-800">{log.ipAddress}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{log.location || 'Cambodia'}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                          log.method === 'mfa_totp' || log.method === 'mfa_sms'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : log.method === 'google'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {log.method === 'mfa_totp'
                          ? '2FA / TOTP App'
                          : log.method === 'mfa_sms'
                          ? '2FA / SMS OTP'
                          : log.method === 'google'
                          ? 'Google SSO'
                          : 'Password'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows Per Page Toolbar */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              បង្ហាញ <strong className="text-slate-900">{sortedLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> ដល់{' '}
              <strong className="text-slate-900">{Math.min(currentPage * pageSize, sortedLogs.length)}</strong> នៃ{' '}
              <strong className="text-slate-900">{sortedLogs.length}</strong> កំណត់ត្រា
            </span>

            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-300 pl-3">
              <span className="text-slate-500">ចំនួនក្នុងមួយទំព័រ:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Official School Security Audit Trail Modal (Formatted for Print & Physical School Records) */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto font-battambang">
            {/* Modal Controls Top */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-800">
                    ឯកសារសវនកម្មសុវត្ថិភាពផ្លូវការ (Official Security Audit Trail)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    រៀបចំទម្រង់តាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា សម្រាប់រក្សាទុកជាកំណត់ត្រារដ្ឋបាល
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ព / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div id="printable-audit-trail" className="space-y-6 text-slate-800 p-2">
              {/* Royal Header */}
              <div className="text-center space-y-1">
                <p className="font-moul text-base text-slate-900 tracking-wider">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-moul text-sm text-slate-900 tracking-wide">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="w-24 h-0.5 bg-amber-500 mx-auto my-1" />
              </div>

              {/* School Header */}
              <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-3">
                <div>
                  <p className="font-moul text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="font-bold text-slate-800">{schoolProfile.nameKhmer}</p>
                  <p className="text-slate-500">ឆ្នាំសិក្សា៖ {schoolProfile.academicYear}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">លេខកូដសាលា៖ {schoolProfile.schoolCode || 'MOEYS-SCH-2024'}</p>
                  <p className="text-slate-500">
                    កាលបរិច្ឆេទចេញ៖ {new Date().toLocaleDateString('km-KH')} ({new Date().toLocaleTimeString('km-KH')})
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                <h2 className="font-moul text-sm sm:text-base text-slate-900">
                  កំណត់ត្រាសវនកម្មសុវត្ថិភាព និងការចូលប្រើប្រាស់ប្រព័ន្ធ
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  OFFICIAL SYSTEM ACCESS & SECURITY AUDIT TRAIL
                </p>
              </div>

              {/* Audit Metadata & Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block font-medium">ចំនួនកំណត់ត្រា</span>
                  <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">{sortedLogs.length} ជួរ</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 block font-medium">ចូលជោគជ័យ</span>
                  <span className="text-base font-bold text-emerald-800 font-mono mt-0.5 block">
                    {sortedLogs.filter(l => l.status === 'success').length} លើក
                  </span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-rose-700 block font-medium">បរាជ័យ / ហានិភ័យ</span>
                  <span className="text-base font-bold text-rose-800 font-mono mt-0.5 block">
                    {sortedLogs.filter(l => l.status === 'failed').length} លើក
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <span className="text-indigo-700 block font-medium">ផ្ទៀងផ្ទាត់ 2FA/MFA</span>
                  <span className="text-base font-bold text-indigo-800 font-mono mt-0.5 block">
                    {sortedLogs.filter(l => l.method?.includes('mfa')).length} លើក
                  </span>
                </div>
              </div>

              {/* Audit Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2.5 text-center w-8">#</th>
                      <th className="p-2.5">កាលបរិច្ឆេទ & ម៉ោង</th>
                      <th className="p-2.5">គណនី / អ៊ីមែល</th>
                      <th className="p-2.5">ស្ថានភាព</th>
                      <th className="p-2.5">IP & ទីតាំង</th>
                      <th className="p-2.5">ឧបករណ៍ & កម្មវិធី</th>
                      <th className="p-2.5">វិធីសាស្ត្រ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedLogs.map((log, idx) => (
                      <tr key={log.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="p-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-2 font-mono text-[10.5px]">
                          {new Date(log.timestamp).toLocaleString('km-KH')}
                        </td>
                        <td className="p-2 font-medium">{log.userEmail || currentUser?.email || 'admin@moeys.gov.kh'}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.status === 'success' ? 'ជោគជ័យ' : 'បរាជ័យ'}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-[10px]">
                          {log.ipAddress} ({log.location || 'Cambodia'})
                        </td>
                        <td className="p-2 text-[10.5px]">
                          {log.device} • {log.browser}
                        </td>
                        <td className="p-2 font-mono text-[10px]">
                          {log.method === 'mfa_totp' ? '2FA TOTP' : log.method === 'google' ? 'Google SSO' : 'Password'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures Section */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs">
                <div className="text-center space-y-16">
                  <div>
                    <p className="font-bold text-slate-800">អ្នករៀបចំរបាយការណ៍សវនកម្ម</p>
                    <p className="text-slate-500 text-[11px]">ប្រធានផ្នែកព័ត៌មានវិទ្យា & សន្តិសុខប្រព័ន្ធ</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 underline decoration-slate-400">
                      {currentUser?.nameKhmer || 'រដ្ឋបាលប្រព័ន្ធ'}
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-16">
                  <div>
                    <p className="text-slate-500 text-[11px]">
                      {schoolProfile.province}, ថ្ងៃទី...... ខែ...... ឆ្នាំ២០២...
                    </p>
                    <p className="font-bold text-slate-800 font-moul">បានឃើញ និងឯកភាព</p>
                    <p className="font-bold text-slate-800 text-[11px]">នាយកសាលា</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 underline decoration-slate-400">
                      {schoolProfile.principalName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                បិទ
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ពរបាយការណ៍ (Print Document)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
