import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  SchoolEquipmentItem,
  EquipmentLoanRecord,
  EquipmentCategory,
  LoanStatus
} from '../types';
import { exportEquipmentLoansToGoogleSheets } from '../services/googleSheets';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import {
  Tv,
  Laptop,
  Projector,
  Volume2,
  Tablet,
  SunMedium,
  Camera,
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink,
  Calendar,
  User,
  MapPin,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Printer,
  Trash2,
  Edit,
  X
} from 'lucide-react';

interface SchoolEquipmentLoanManagerProps {
  onClose?: () => void;
}

export const SchoolEquipmentLoanManager: React.FC<SchoolEquipmentLoanManagerProps> = ({ onClose }) => {
  const {
    schoolProfile,
    equipmentItems,
    equipmentLoans,
    addEquipmentLoan,
    updateEquipmentLoan,
    deleteEquipmentLoan,
    teachers,
    currentUser,
    showToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'loans' | 'inventory'>('loans');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [lastSheetUrl, setLastSheetUrl] = useState<string | null>(null);

  // Form State
  const initialForm = {
    equipmentId: equipmentItems[0]?.id || '',
    teacherName: currentUser?.name || teachers[0]?.nameKhmer || 'អ្នកគ្រូ កែវ ផល្លា',
    teacherPhone: currentUser?.phone || '012 34 56 78',
    gradeSection: 'ថ្នាក់ទី៥ក',
    purposeOfUse: '',
    borrowDate: new Date().toISOString().split('T')[0],
    borrowTime: '08:00',
    expectedReturnDate: new Date().toISOString().split('T')[0],
    expectedReturnTime: '11:00',
    conditionBefore: 'ដំណើរការល្អ គ្រឿងបន្លាស់ពេញលេញ',
    recordedBy: currentUser?.name || 'លោក សុខ ពិសិដ្ឋ (បណ្ណារក្ស)'
  };

  const [formData, setFormData] = useState(initialForm);

  // Return modal state
  const [returnModalItem, setReturnModalItem] = useState<EquipmentLoanRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState('ដំណើរការល្អ ប្រគល់គ្រប់គ្រឿង');

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'projector':
        return <Projector className="w-5 h-5 text-indigo-600" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-emerald-600" />;
      case 'speaker_mic':
        return <Volume2 className="w-5 h-5 text-amber-600" />;
      case 'smart_tv':
        return <Tv className="w-5 h-5 text-purple-600" />;
      case 'solar_power':
        return <SunMedium className="w-5 h-5 text-amber-500" />;
      case 'document_camera':
        return <Camera className="w-5 h-5 text-teal-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCategoryName = (category: EquipmentCategory) => {
    switch (category) {
      case 'projector':
        return 'ម៉ាស៊ីនបញ្ចាំង (Projector)';
      case 'laptop':
        return 'កុំព្យូទ័រយួរដៃ (Laptop)';
      case 'tablet':
        return 'ថេប្លេត (Tablet)';
      case 'speaker_mic':
        return 'ធុងបាស និងមីក្រូហ្វូន';
      case 'smart_tv':
        return 'ទូរទស្សន៍ឆ្លាតវៃ (Smart TV)';
      case 'solar_power':
        return 'ប្រព័ន្ធសូឡា/អាគុយ';
      case 'document_camera':
        return 'ម៉ាស៊ីនស្កេនបង្រៀន';
      default:
        return 'ឧបករណ៍ផ្សេងៗ';
    }
  };

  // Filtered Loans
  const filteredLoans = equipmentLoans.filter(loan => {
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || loan.equipmentCategory === filterCategory;
    const matchesSearch =
      searchTerm === '' ||
      loan.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.gradeSection.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEq = equipmentItems.find(item => item.id === formData.equipmentId);
    if (!selectedEq) {
      showToast('សូមជ្រើសរើសឧបករណ៍ដែលត្រូវខ្ចី!', 'error');
      return;
    }

    if (!formData.purposeOfUse.trim()) {
      showToast('សូមបញ្ជាក់គោលបំណងនៃការប្រើប្រាស់!', 'error');
      return;
    }

    const loanNumber = `LN-${new Date().getFullYear()}-${String(equipmentLoans.length + 1).padStart(3, '0')}`;

    addEquipmentLoan({
      loanNumber,
      equipmentId: selectedEq.id,
      equipmentCode: selectedEq.code,
      equipmentName: selectedEq.nameKhmer,
      equipmentCategory: selectedEq.category,
      teacherName: formData.teacherName,
      teacherPhone: formData.teacherPhone,
      gradeSection: formData.gradeSection,
      purposeOfUse: formData.purposeOfUse,
      borrowDate: formData.borrowDate,
      borrowTime: formData.borrowTime,
      expectedReturnDate: formData.expectedReturnDate,
      expectedReturnTime: formData.expectedReturnTime,
      status: 'borrowed',
      conditionBefore: formData.conditionBefore,
      recordedBy: formData.recordedBy,
      syncedToGoogleSheets: false
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  const handleConfirmReturn = () => {
    if (!returnModalItem) return;

    const todayStr = new Date().toISOString().split('T')[0];
    updateEquipmentLoan(returnModalItem.id, {
      status: 'returned',
      actualReturnDate: todayStr,
      conditionAfter: returnCondition
    });

    setReturnModalItem(null);
    showToast(`បានកត់ត្រាការប្រគល់ឧបករណ៍ «${returnModalItem.equipmentName}» រួចរាល់!`, 'success');
  };

  // Sync to Google Sheets
  const handleSyncToGoogleSheets = async () => {
    setIsSyncingSheets(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) {
          token = authRes.accessToken;
        }
      }

      if (!token) {
        showToast('សូមចូលប្រើគណនី Google ជាមុនសិន!', 'error');
        setIsSyncingSheets(false);
        return;
      }

      const result = await exportEquipmentLoansToGoogleSheets(schoolProfile, equipmentLoans);
      setLastSheetUrl(result.spreadsheetUrl);

      // Mark loans as synced
      equipmentLoans.forEach(loan => {
        if (!loan.syncedToGoogleSheets) {
          updateEquipmentLoan(loan.id, { syncedToGoogleSheets: true });
        }
      });

      showToast('បាន sync បញ្ជីខ្ចីឧបករណ៍ទៅ Google Sheets ជោគជ័យ!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'មានបញ្ហាក្នុងការ sync ទៅ Google Sheets', 'error');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Summary counts
  const totalBorrowed = equipmentLoans.filter(l => l.status === 'borrowed').length;
  const totalReturned = equipmentLoans.filter(l => l.status === 'returned').length;
  const totalOverdue = equipmentLoans.filter(l => {
    if (l.status !== 'borrowed') return false;
    const expDate = new Date(l.expectedReturnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expDate < today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ប្រព័ន្ធគ្រប់គ្រង និងកត់ត្រាឧបករណ៍បច្ចេកវិទ្យាសាលារៀន</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-moul text-amber-300">
            បញ្ជីត្រួតពិនិត្យ និងកត់ត្រាការខ្ចីឧបករណ៍សាលា
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            អនុញ្ញាតឱ្យលោកគ្រូ-អ្នកគ្រូចុះឈ្មោះខ្ចី និងប្រើប្រាស់ Projector, Laptop, Tablet សម្រាប់បង្រៀន ព្រមទាំងធ្វើសមកាលកម្ម (Sync) ទៅកាន់ Google Sheets ដោយស្វ័យប្រវត្តិ។
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncToGoogleSheets}
            disabled={isSyncingSheets}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50 text-sm"
          >
            {isSyncingSheets ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Sync ទៅ Google Sheets</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ចុះឈ្មោះខ្ចីថ្មី</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Live Link Notification */}
      {lastSheetUrl && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 text-emerald-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">បញ្ជីខ្ចីឧបករណ៍ត្រូវបានរក្សាទុកក្នុង Google Sheets រួចរាល់!</p>
              <p className="text-xs text-emerald-600">អ្នកអាចបើកមើល ឬចែករំលែកជាមួយនាយកសាលា និងគណៈគ្រប់គ្រងបានគ្រប់ពេលវេលា។</p>
            </div>
          </div>
          <a
            href={lastSheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          >
            <span>បើកមើល Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Projector className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ឧបករណ៍សរុប</p>
            <h3 className="text-xl font-bold text-slate-800">
              {equipmentItems.reduce((sum, item) => sum + item.totalQuantity, 0)} <span className="text-xs text-slate-500 font-normal">គ្រឿង</span>
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">កំពុងខ្ចី</p>
            <h3 className="text-xl font-bold text-amber-600">
              {totalBorrowed} <span className="text-xs text-slate-500 font-normal">ករណី</span>
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">បានប្រគល់រួច</p>
            <h3 className="text-xl font-bold text-emerald-600">
              {totalReturned} <span className="text-xs text-slate-500 font-normal">ករណី</span>
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ហួសកំណត់សង</p>
            <h3 className="text-xl font-bold text-rose-600">
              {totalOverdue} <span className="text-xs text-slate-500 font-normal">ករណី</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Tabs & Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation sub-tabs */}
        <div className="flex border-b border-slate-200 px-4 pt-3 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'loans'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>បញ្ជីកត់ត្រាការខ្ចី-សង ({equipmentLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'inventory'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>កាតាឡុកឧបករណ៍បច្ចេកវិទ្យា ({equipmentItems.length})</span>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកឈ្មោះគ្រូ ឧបករណ៍ ឬថ្នាក់..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === 'loans' && (
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ស្ថានភាពទាំងអស់</option>
                <option value="borrowed">កំពុងខ្ចី</option>
                <option value="returned">បានប្រគល់រួច</option>
                <option value="overdue">ហួសកំណត់</option>
              </select>
            )}

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ប្រភេទឧបករណ៍ទាំងអស់</option>
              <option value="projector">Projector</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
              <option value="speaker_mic">Speaker/Mic</option>
              <option value="smart_tv">Smart TV</option>
              <option value="solar_power">សូឡា/អាគុយ</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Equipment Loans List */}
        {activeTab === 'loans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">លេខកូដខ្ចី</th>
                  <th className="px-4 py-3">ឈ្មោះគ្រូខ្ចី</th>
                  <th className="px-4 py-3">ឧបករណ៍</th>
                  <th className="px-4 py-3">ថ្នាក់ / គោលបំណង</th>
                  <th className="px-4 py-3">ថ្ងៃខ្ចី & ម៉ោង</th>
                  <th className="px-4 py-3">ថ្ងៃសងរំពឹងទុក</th>
                  <th className="px-4 py-3">ស្ថានភាព</th>
                  <th className="px-4 py-3">Sheets Sync</th>
                  <th className="px-4 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      មិនមានកំណត់ត្រាខ្ចីឧបករណ៍ស្របតាមការស្វែងរកទេ
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map(loan => {
                    const isOverdue =
                      loan.status === 'borrowed' &&
                      new Date(loan.expectedReturnDate) < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-xs text-blue-600">
                          {loan.loanNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{loan.teacherName}</div>
                          {loan.teacherPhone && (
                            <div className="text-xs text-slate-400">{loan.teacherPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(loan.equipmentCategory)}
                            <div>
                              <div className="font-medium text-slate-800 line-clamp-1">{loan.equipmentName}</div>
                              <div className="text-xs text-slate-400">{loan.equipmentCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 mb-1">
                            {loan.gradeSection}
                          </span>
                          <p className="text-xs text-slate-600 line-clamp-1">{loan.purposeOfUse}</p>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>{loan.borrowDate}</div>
                          <div className="text-slate-400">{loan.borrowTime || '--:--'}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>{loan.expectedReturnDate}</div>
                          <div className="text-slate-400">{loan.expectedReturnTime || '--:--'}</div>
                        </td>
                        <td className="px-4 py-3">
                          {loan.status === 'returned' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>បានប្រគល់</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>ហួសកំណត់</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              <span>កំពុងខ្ចី</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {loan.syncedToGoogleSheets ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Synced</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {loan.status === 'borrowed' && (
                              <button
                                onClick={() => {
                                  setReturnModalItem(loan);
                                  setReturnCondition('ដំណើរការល្អ ប្រគល់គ្រប់គ្រឿង');
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>កត់ត្រាការសង</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteEquipmentLoan(loan.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Inventory Catalog */}
        {activeTab === 'inventory' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentItems.map(item => (
              <div
                key={item.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <span className="font-mono text-xs text-blue-600 font-semibold">{item.code}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{item.nameKhmer}</h4>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    item.availableQuantity > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    នៅសល់ {item.availableQuantity}/{item.totalQuantity}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ម៉ូដែល/Brand:</span>
                    <span className="font-medium">{item.brandModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ទីតាំងរក្សាទុក:</span>
                    <span className="font-medium">{item.locationRoom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ស្ថានភាពបច្ចេកទេស:</span>
                    <span className="font-medium text-emerald-600">ដំណើរការល្អ</span>
                  </div>
                </div>

                {item.statusNotes && (
                  <p className="text-[11px] text-slate-500 italic">
                    ចំណាំ៖ {item.statusNotes}
                  </p>
                )}

                <button
                  onClick={() => {
                    setFormData({ ...formData, equipmentId: item.id });
                    setIsAddModalOpen(true);
                  }}
                  disabled={item.availableQuantity <= 0}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ខ្ចីឧបករណ៍នេះ</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Loan Registration */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ចុះឈ្មោះខ្ចីឧបករណ៍បច្ចេកវិទ្យា</h3>
                  <p className="text-xs text-slate-500">កត់ត្រាព័ត៌មានលម្អិតមុនពេលប្រគល់ឧបករណ៍ជូនគ្រូ</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Select Equipment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ជ្រើសរើសឧបករណ៍បច្ចេកវិទ្យា *
                </label>
                <select
                  value={formData.equipmentId}
                  onChange={e => setFormData({ ...formData, equipmentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {equipmentItems.map(item => (
                    <option key={item.id} value={item.id} disabled={item.availableQuantity <= 0}>
                      {item.nameKhmer} ({item.code}) - នៅសល់ {item.availableQuantity}/{item.totalQuantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ឈ្មោះគ្រូខ្ចី *
                  </label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ឈ្មោះគ្រូបង្រៀន..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    លេខទូរស័ព្ទ
                  </label>
                  <input
                    type="text"
                    value={formData.teacherPhone}
                    onChange={e => setFormData({ ...formData, teacherPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="012 xxx xxx"
                  />
                </div>
              </div>

              {/* Grade & Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ថ្នាក់រៀន / ទីតាំងប្រើប្រាស់ *
                </label>
                <input
                  type="text"
                  value={formData.gradeSection}
                  onChange={e => setFormData({ ...formData, gradeSection: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ឧ. ថ្នាក់ទី៥ក, បន្ទប់កុំព្យូទ័រ, សាលប្រជុំ"
                  required
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  គោលបំណងនៃការប្រើប្រាស់ *
                </label>
                <textarea
                  value={formData.purposeOfUse}
                  onChange={e => setFormData({ ...formData, purposeOfUse: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ឧ. បញ្ចាំងស្លាយមេរៀនវិទ្យាសាស្ត្រ, បង្ហាញវីដេអូអប់រំ, កិច្ចប្រជុំគ្រូ..."
                  required
                />
              </div>

              {/* Borrow Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កាលបរិច្ឆេទខ្ចី
                  </label>
                  <input
                    type="date"
                    value={formData.borrowDate}
                    onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ម៉ោងខ្ចី
                  </label>
                  <input
                    type="time"
                    value={formData.borrowTime}
                    onChange={e => setFormData({ ...formData, borrowTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Return Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កាលបរិច្ឆេទសងរំពឹងទុក
                  </label>
                  <input
                    type="date"
                    value={formData.expectedReturnDate}
                    onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ម៉ោងសងរំពឹងទុក
                  </label>
                  <input
                    type="time"
                    value={formData.expectedReturnTime}
                    onChange={e => setFormData({ ...formData, expectedReturnTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Condition Before */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ស្ថានភាពឧបករណ៍មុនពេលខ្ចី
                </label>
                <input
                  type="text"
                  value={formData.conditionBefore}
                  onChange={e => setFormData({ ...formData, conditionBefore: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recorded By */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  អ្នកកត់ត្រា/បណ្ណារក្ស
                </label>
                <input
                  type="text"
                  value={formData.recordedBy}
                  onChange={e => setFormData({ ...formData, recordedBy: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>យល់ព្រមខ្ចី</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Return */}
      {returnModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-emerald-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">កត់ត្រាការប្រគល់ឧបករណ៍មកវិញ</h3>
              </div>
              <button
                onClick={() => setReturnModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">លេខកូដខ្ចី៖</span>
                  <span className="font-mono font-bold text-blue-600">{returnModalItem.loanNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ឈ្មោះគ្រូ៖</span>
                  <span className="font-semibold text-slate-800">{returnModalItem.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ឧបករណ៍៖</span>
                  <span className="font-semibold text-slate-800">{returnModalItem.equipmentName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ស្ថានភាពឧបករណ៍ក្រោយការប្រគល់ *
                </label>
                <input
                  type="text"
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ឧ. ដំណើរការល្អ ប្រគល់គ្រប់គ្រឿង..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReturnModalItem(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>បញ្ជាក់ការទទួល</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
