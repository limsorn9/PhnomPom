import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  SchoolStrategicPlanItem,
  SchoolAssetItem,
  ModelSchoolStandardGroup,
  ModelSchoolStandardCriterion,
  BudgetSource
} from '../types';
import {
  Building2,
  Award,
  Target,
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
  User,
  MapPin,
  Check,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sliders,
  DollarSign
} from 'lucide-react';

export const SchoolManagement: React.FC = () => {
  const {
    modelSchoolStandards,
    updateModelSchoolCriterion,
    schoolStrategicPlans,
    addSchoolStrategicPlan,
    updateSchoolStrategicPlan,
    deleteSchoolStrategicPlan,
    schoolAssets,
    addSchoolAsset,
    updateSchoolAsset,
    deleteSchoolAsset,
    schoolProfile,
    showToast,
    selectedAcademicYear,
    students,
    teachers,
    classrooms,
    scores,
    budgetTransactions,
    attendanceRecords,
    appUsers
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'standards' | 'strategic_plan' | 'assets' | 'backup'>('standards');

  // Export & Backup Handlers
  const handleDownloadJsonBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      schoolProfile,
      students,
      teachers,
      classrooms,
      scores,
      budgetTransactions,
      attendanceRecords,
      schoolAssets,
      schoolStrategicPlans,
      modelSchoolStandards,
      appUsers
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `school_complete_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('បានទាញយកទិន្នន័យបម្រុងទុក (JSON Backup) ជោគជ័យ!');
  };

  const handleExportStudentsCsv = () => {
    const headers = ['ID', 'Student Code', 'Name (Khmer)', 'Gender', 'Grade', 'Section', 'Guardian Phone', 'Address'];
    const rows = students.map(s => [
      s.id,
      s.studentCode || '',
      `"${s.nameKhmer || ''}"`,
      s.gender || '',
      s.grade || '',
      s.section || '',
      `"${s.guardianPhone || ''}"`,
      `"${s.address || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('បានទាញយកបញ្ជីសិស្សជា CSV ជោគជ័យ!');
  };

  const handleExportTeachersCsv = () => {
    const headers = ['ID', 'Staff Code', 'Name (Khmer)', 'Name (Latin)', 'Gender', 'Phone', 'Email', 'Assigned Grade', 'Assigned Section'];
    const rows = teachers.map(t => [
      t.id,
      t.staffCode || '',
      `"${t.nameKhmer || ''}"`,
      `"${t.nameLatin || ''}"`,
      t.gender || '',
      `"${t.phone || ''}"`,
      t.email || '',
      t.assignedGrade || '',
      t.assignedSection || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teachers_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('បានទាញយកបញ្ជីគ្រូបង្រៀនជា CSV ជោគជ័យ!');
  };

  const handleExportBudgetCsv = () => {
    const headers = ['ID', 'Title', 'Type', 'Source', 'Category', 'Amount (Riel)', 'Amount (USD)', 'Date', 'Reference Code', 'Status'];
    const rows = budgetTransactions.map(tx => [
      tx.id,
      `"${tx.title || ''}"`,
      tx.type,
      `"${tx.source || ''}"`,
      `"${tx.category || ''}"`,
      tx.amountRiel || 0,
      tx.amountUsd || 0,
      tx.date || '',
      tx.referenceCode || '',
      tx.status || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `budget_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('បានទាញយកបញ្ជីថវិកាជា CSV ជោគជ័យ!');
  };

  // Standards State
  const [expandedStandard, setExpandedStandard] = useState<number | null>(1);

  // Strategic Plan State & Modal
  const [planSearch, setPlanSearch] = useState('');
  const [planProgFilter, setPlanProgFilter] = useState<string>('all');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SchoolStrategicPlanItem | null>(null);

  const [planForm, setPlanForm] = useState<Omit<SchoolStrategicPlanItem, 'id'>>({
    programArea: 'គុណភាពអប់រំ',
    objective: '',
    keyActivity: '',
    kpiTarget: '',
    targetYear: selectedAcademicYear,
    estimatedBudgetRiel: 1000000,
    budgetSource: 'ថវិការដ្ឋ (PB)',
    responsibleLead: schoolProfile.directorNameKhmer || 'នាយកសាលា',
    progressPercent: 50,
    status: 'in_progress',
    notes: ''
  });

  // Assets State & Modal
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<SchoolAssetItem | null>(null);

  const [assetForm, setAssetForm] = useState<Omit<SchoolAssetItem, 'id'>>({
    assetCode: '',
    assetNameKhmer: '',
    category: 'តុ-កៅអី&គ្រឿងសង្ហារិម',
    quantity: 1,
    unit: 'គ្រឿង',
    locationRoom: 'បន្ទប់ទីចាត់ការ',
    condition: 'good',
    sourceOfFunding: 'ថវិការដ្ឋ (PB)',
    acquiredYear: new Date().getFullYear().toString(),
    estimatedValueRiel: 500000,
    notes: ''
  });

  // Calculate Overall Model School Score
  const standardsSummary = useMemo(() => {
    let totalCriteria = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;

    modelSchoolStandards.forEach(group => {
      group.criteria.forEach(c => {
        totalCriteria++;
        totalScore += c.currentScore;
        maxPossibleScore += c.maxScore;
      });
    });

    const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    return {
      totalCriteria,
      totalScore: Math.round(totalScore * 10) / 10,
      maxPossibleScore,
      scorePercentage
    };
  }, [modelSchoolStandards]);

  // Filter Strategic Plans
  const filteredPlans = useMemo(() => {
    return schoolStrategicPlans.filter(p => {
      const matchSearch =
        p.objective.toLowerCase().includes(planSearch.toLowerCase()) ||
        p.kpiTarget.toLowerCase().includes(planSearch.toLowerCase()) ||
        p.programArea.toLowerCase().includes(planSearch.toLowerCase()) ||
        (p.keyActivity && p.keyActivity.toLowerCase().includes(planSearch.toLowerCase()));
      const matchProg = planProgFilter === 'all' || p.status === planProgFilter;
      return matchSearch && matchProg;
    });
  }, [schoolStrategicPlans, planSearch, planProgFilter]);

  // Filter Assets
  const filteredAssets = useMemo(() => {
    return schoolAssets.filter(a => {
      const matchSearch =
        a.assetNameKhmer.toLowerCase().includes(assetSearch.toLowerCase()) ||
        a.assetCode.toLowerCase().includes(assetSearch.toLowerCase()) ||
        a.locationRoom.toLowerCase().includes(assetSearch.toLowerCase());
      const matchCat = assetCategoryFilter === 'all' || a.category === assetCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [schoolAssets, assetSearch, assetCategoryFilter]);

  // Total Assets Count & Value
  const totalAssetsCount = useMemo(() => {
    return schoolAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);
  }, [schoolAssets]);

  const totalAssetsValue = useMemo(() => {
    return schoolAssets.reduce((sum, a) => sum + (a.estimatedValueRiel || 0), 0);
  }, [schoolAssets]);

  // Plan Handlers
  const handleOpenPlanModal = (plan?: SchoolStrategicPlanItem) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        programArea: plan.programArea,
        objective: plan.objective,
        keyActivity: plan.keyActivity || '',
        kpiTarget: plan.kpiTarget,
        targetYear: plan.targetYear,
        estimatedBudgetRiel: plan.estimatedBudgetRiel || 0,
        budgetSource: plan.budgetSource || 'ថវិការដ្ឋ (PB)',
        responsibleLead: plan.responsibleLead || '',
        progressPercent: plan.progressPercent || 0,
        status: plan.status,
        notes: plan.notes || ''
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        programArea: 'គុណភាពអប់រំ',
        objective: '',
        keyActivity: '',
        kpiTarget: '',
        targetYear: selectedAcademicYear,
        estimatedBudgetRiel: 1000000,
        budgetSource: 'ថវិការដ្ឋ (PB)',
        responsibleLead: schoolProfile.directorNameKhmer || 'នាយកសាលា',
        progressPercent: 50,
        status: 'in_progress',
        notes: ''
      });
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.objective || !planForm.kpiTarget) {
      showToast('សូមបំពេញគោលបំណង និងសូចនាករ KPI!', 'error');
      return;
    }
    if (editingPlan) {
      updateSchoolStrategicPlan(editingPlan.id, planForm);
    } else {
      addSchoolStrategicPlan(planForm);
    }
    setIsPlanModalOpen(false);
  };

  // Asset Handlers
  const handleOpenAssetModal = (asset?: SchoolAssetItem) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        assetCode: asset.assetCode,
        assetNameKhmer: asset.assetNameKhmer,
        category: asset.category,
        quantity: asset.quantity,
        unit: asset.unit,
        locationRoom: asset.locationRoom,
        condition: asset.condition,
        sourceOfFunding: asset.sourceOfFunding || 'ថវិការដ្ឋ (PB)',
        acquiredYear: asset.acquiredYear || new Date().getFullYear().toString(),
        estimatedValueRiel: asset.estimatedValueRiel || 0,
        notes: asset.notes || ''
      });
    } else {
      setEditingAsset(null);
      const nextCode = `AST-${String(schoolAssets.length + 1).padStart(3, '0')}`;
      setAssetForm({
        assetCode: nextCode,
        assetNameKhmer: '',
        category: 'តុ-កៅអី&គ្រឿងសង្ហារិម',
        quantity: 1,
        unit: 'គ្រឿង',
        locationRoom: 'បន្ទប់ទីចាត់ការ',
        condition: 'good',
        sourceOfFunding: 'ថវិការដ្ឋ (PB)',
        acquiredYear: new Date().getFullYear().toString(),
        estimatedValueRiel: 500000,
        notes: ''
      });
    }
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.assetCode || !assetForm.assetNameKhmer) {
      showToast('សូមបំពេញលេខកូដ និងឈ្មោះសារពើភ័ណ្ឌ!', 'error');
      return;
    }
    if (editingAsset) {
      updateSchoolAsset(editingAsset.id, assetForm);
    } else {
      addSchoolAsset(assetForm);
    }
    setIsAssetModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-moul text-blue-950 flex items-center gap-2">
                ការគ្រប់គ្រង & ស្តង់ដាសាលារៀន
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                ស្ដង់ដាសាលារៀនគំរូ ៥ ស្តង់ដា MoEYS • ផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលា (SDSP) • សារពើភ័ណ្ឌ
              </p>
            </div>
          </div>

          {/* Model School Badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block">ពិន្ទុសាលាគំរូ</span>
              <span className="text-base font-bold text-amber-700">{standardsSummary.scorePercentage}% ជោគជ័យ</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block">សារពើភ័ណ្ឌ</span>
              <span className="text-base font-bold text-blue-900">{totalAssetsCount} ឯកតា</span>
            </div>
          </div>
        </div>

        {/* Sub Nav */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('standards')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'standards'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ស្ដង់ដាសាលារៀនគំរូ ៥ ស្តង់ដា ({standardsSummary.scorePercentage}%)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('strategic_plan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'strategic_plan'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>ផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលា ({schoolStrategicPlans.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('assets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'assets'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>សារពើភ័ណ្ឌ & ទ្រព្យសម្បត្តិសាលា ({schoolAssets.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'backup'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ទិន្នន័យបម្រុងទុក និងសុវត្ថិភាព (Data Export & Safety)</span>
          </button>
        </div>
      </div>

      {/* TAB 4: DATA EXPORT & SAFETY */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 bg-emerald-500 text-white font-bold rounded-full text-xs uppercase tracking-wider flex items-center gap-1 inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Data Export & Safety Hub</span>
                </span>
                <h2 className="text-xl font-bold font-moul mt-2">
                  ការគ្រប់គ្រងទិន្នន័យបម្រុងទុក និងសុវត្ថិភាពសាលារៀន
                </h2>
                <p className="text-slate-300 text-xs mt-1 max-w-2xl">
                  អនុញ្ញាតឱ្យនាយកសាលាទាញយកទិន្នន័យបម្រុងទុកពេញលេញ (JSON Backup) និងរបាយការណ៍ជាឯកសារ CSV សម្រាប់រក្សាទុកដោយសុវត្ថិភាព។
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[200px]">
                <div className="text-2xl font-extrabold text-amber-300">{students.length} សិស្ស | {teachers.length} គ្រូ</div>
                <div className="text-xs text-slate-200 mt-0.5">ទិន្នន័យសរុបក្នុងប្រព័ន្ធ</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Complete JSON Backup Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-moul">ទាញយកទិន្នន័យបម្រុងទុកពេញលេញ (Complete JSON Backup)</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  ទាញយកទិន្នន័យទាំងមូលរបស់សាលា រួមមាន ព័ត៌មានសាលា បញ្ជីសិស្ស គ្រូបង្រៀន បន្ទប់រៀន ពិន្ទុ ថវិកា វត្តមាន និងផែនការយុទ្ធសាស្ត្រក្នុងឯកសារ JSON តែមួយ។
                </p>
              </div>
              <button
                onClick={handleDownloadJsonBackup}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ទាញយក JSON Backup ពេញលេញ</span>
              </button>
            </div>

            {/* CSV Data Exports Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-moul">ទាញយកទិន្នន័យឯកសារ CSV (Spreadsheet Export)</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  ទាញយកបញ្ជីជាក់លាក់ជាទម្រង់ CSV ដើម្បីបើកមើល និងកែច្នៃក្នុង Microsoft Excel ឬ Google Sheets។
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <button
                  onClick={handleExportStudentsCsv}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>សិស្ស ({students.length})</span>
                </button>
                <button
                  onClick={handleExportTeachersCsv}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>គ្រូ ({teachers.length})</span>
                </button>
                <button
                  onClick={handleExportBudgetCsv}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>ថវិកា ({budgetTransactions.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: 5 STANDARDS OF MODEL PRIMARY SCHOOL (MoEYS) */}
      {activeSubTab === 'standards' && (
        <div className="space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-full text-xs uppercase tracking-wider">
                  MoEYS Model School Assessment Framework
                </span>
                <h2 className="text-xl font-bold font-moul mt-2">
                  ការវាយតម្លៃស្ដង់ដាសាលារៀនគំរូកម្រិតបឋមសិក្សា (៥ ស្តង់ដា)
                </h2>
                <p className="text-slate-300 text-xs mt-1 max-w-2xl">
                  ក្របខ័ណ្ឌវាយតម្លៃគុណភាពអប់រំ និងអភិបាលកិច្ចសាលារៀនគំរូ យោងតាមសេចក្ដីណែនាំរបស់ក្រសួងអប់រំ យុវជន និងកីឡា
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 min-w-[180px]">
                <div className="text-3xl font-extrabold text-amber-300">{standardsSummary.scorePercentage}%</div>
                <div className="text-xs text-slate-200 mt-0.5">កម្រិតអនុវត្តសម្រេចសរុប</div>
                <div className="mt-2 text-[11px] text-slate-300 flex justify-center gap-2">
                  <span className="text-emerald-300 font-semibold">{standardsSummary.totalScore} / {standardsSummary.maxPossibleScore} ពិន្ទុ</span>
                </div>
              </div>
            </div>

            <div className="mt-5 w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${standardsSummary.scorePercentage}%` }}
              />
            </div>
          </div>

          {/* 5 Standards Accordion */}
          <div className="space-y-4">
            {modelSchoolStandards.map(group => {
              const isExpanded = expandedStandard === group.standardNumber;
              const groupScore = group.criteria.reduce((s, c) => s + c.currentScore, 0);
              const groupMax = group.criteria.reduce((s, c) => s + c.maxScore, 0);
              const groupPercentage = groupMax > 0 ? Math.round((groupScore / groupMax) * 100) : 0;

              return (
                <div key={group.standardNumber} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  {/* Accordion Header */}
                  <div
                    onClick={() => setExpandedStandard(isExpanded ? null : group.standardNumber)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold font-moul text-sm border border-amber-200">
                        {group.standardNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                          <span>{group.standardTitleKhmer}</span>
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{group.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${groupPercentage}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{groupPercentage}%</span>
                      </div>

                      <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Body (Criteria List) */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <div className="space-y-3 mt-3">
                        {group.criteria.map((criterion) => (
                          <div key={criterion.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                                  {criterion.criterionNumber}
                                </span>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900">{criterion.nameKhmer}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">{criterion.description}</p>
                                  {criterion.evidenceDocument && (
                                    <p className="text-xs text-blue-700 bg-blue-50/80 p-2 rounded-lg mt-2 border border-blue-100">
                                      <span className="font-semibold">ឯកសារសំអាង/ភស្តុតាង: </span>
                                      {criterion.evidenceDocument}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Status & Score Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                                <button
                                  type="button"
                                  onClick={() => updateModelSchoolCriterion(group.standardNumber, criterion.id, { currentScore: 5, status: 'excellent' })}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    criterion.status === 'excellent'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ល្អប្រសើរ (៥)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateModelSchoolCriterion(group.standardNumber, criterion.id, { currentScore: 4, status: 'good' })}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    criterion.status === 'good'
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>ល្អ (៤)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateModelSchoolCriterion(group.standardNumber, criterion.id, { currentScore: 3, status: 'average' })}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                    criterion.status === 'average'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>មធ្យម (៣)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL STRATEGIC DEVELOPMENT PLAN */}
      {activeSubTab === 'strategic_plan' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកគោលបំណង ឬសូចនាករ..."
                  value={planSearch}
                  onChange={e => setPlanSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={planProgFilter}
                onChange={e => setPlanProgFilter(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">គ្រប់ស្ថានភាពផែនការ</option>
                <option value="in_progress">កំពុងអនុវត្ត (In Progress)</option>
                <option value="completed">សម្រេចបានជោគជ័យ (Completed)</option>
                <option value="not_started">មិនទាន់ចាប់ផ្ដើម</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenPlanModal()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 shadow-sm shadow-amber-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមផែនការយុទ្ធសាស្ត្រ</span>
            </button>
          </div>

          {/* Strategic Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                មិនមានទិន្នន័យផែនការយុទ្ធសាស្ត្រនៅឡើយទេ
              </div>
            ) : (
              filteredPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                        {plan.programArea}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        plan.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : plan.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {plan.status === 'completed' && 'សម្រេចបាន ១០០%'}
                        {plan.status === 'in_progress' && `កំពុងអនុវត្ត (${plan.progressPercent}%)`}
                        {plan.status === 'not_started' && 'មិនទាន់ចាប់ផ្ដើម'}
                        {plan.status === 'on_hold' && 'ផ្អាក'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mb-2">{plan.objective}</h3>

                    {plan.keyActivity && (
                      <p className="text-xs text-slate-600 mb-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">សកម្មភាពគន្លឹះ: </span>
                        {plan.keyActivity}
                      </p>
                    )}

                    {/* KPI & Target */}
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 mb-3 space-y-1.5 text-xs">
                      <div>
                        <span className="font-bold text-blue-900">សូចនាករវាស់វែង KPI: </span>
                        <span className="text-slate-700">{plan.kpiTarget}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-200/50">
                        <span className="text-slate-600">ឆ្នាំគោលដៅ: <b className="text-blue-950">{plan.targetYear}</b></span>
                        <span className="text-slate-600">ប្រភពថវិកា: <b className="text-emerald-700">{plan.budgetSource}</b></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>ដឹកនាំដោយ: {plan.responsibleLead}</span>
                      </span>
                      {plan.estimatedBudgetRiel ? (
                        <span className="font-bold text-emerald-800">
                          {plan.estimatedBudgetRiel.toLocaleString()} រៀល
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>កែប្រែ</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបផែនការ «${plan.objective}» មែនទេ?`)) {
                          deleteSchoolStrategicPlan(plan.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>លុប</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL ASSETS & INVENTORY */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមលេខកូដ, ឈ្មោះ ឬទីតាំង..."
                  value={assetSearch}
                  onChange={e => setAssetSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={assetCategoryFilter}
                onChange={e => setAssetCategoryFilter(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">គ្រប់ប្រភេទសារពើភ័ណ្ឌ</option>
                <option value="អគារ&ហេដ្ឋារចនាសម្ព័ន្ធ">អគារ & ហេដ្ឋារចនាសម្ព័ន្ធ</option>
                <option value="តុ-កៅអី&គ្រឿងសង្ហារិម">តុ-កៅអី & គ្រឿងសង្ហារិម</option>
                <option value="បរិក្ខារបច្ចេកវិទ្យា/IT">បរិក្ខារបច្ចេកវិទ្យា / IT</option>
                <option value="សម្ភារៈពិសោធន៍&ឧបទេស">សម្ភារៈពិសោធន៍ & ឧបទេស</option>
                <option value="បរិក្ខារទឹកស្អាត&អនាម័យ">បរិក្ខារទឹកស្អាត & អនាម័យ</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenAssetModal()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 shadow-sm shadow-amber-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>បញ្ចូលសារពើភ័ណ្ឌថ្មី</span>
            </button>
          </div>

          {/* Assets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">កូដសារពើភ័ណ្ឌ</th>
                    <th className="py-3 px-4 min-w-[200px]">ឈ្មោះសម្ភារៈ/ទ្រព្យសម្បត្តិ</th>
                    <th className="py-3 px-4">ប្រភេទ</th>
                    <th className="py-3 px-4">ទីតាំង / បន្ទប់</th>
                    <th className="py-3 px-4 text-center">បរិមាណ</th>
                    <th className="py-3 px-4">ស្ថានភាព</th>
                    <th className="py-3 px-4">ប្រភពថវិកា</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        មិនមានទិន្នន័យសារពើភ័ណ្ឌស្របតាមការស្វែងរកនេះទេ
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {asset.assetCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {asset.assetNameKhmer}
                          {asset.notes && (
                            <span className="block text-xs text-slate-400 font-normal">{asset.notes}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {asset.category}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {asset.locationRoom}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-blue-900">
                          {asset.quantity} {asset.unit}
                        </td>
                        <td className="py-3 px-4">
                          {asset.condition === 'good' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              ល្អ / ប្រើប្រាស់បាន
                            </span>
                          )}
                          {asset.condition === 'fair' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              មធ្យម
                            </span>
                          )}
                          {asset.condition === 'damaged' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              ខូចខាត
                            </span>
                          )}
                          {asset.condition === 'unusable' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              ប្រើលែងកើត
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {asset.sourceOfFunding || '—'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenAssetModal(asset)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="កែប្រែ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបសារពើភ័ណ្ឌ «${asset.assetNameKhmer}» មែនទេ?`)) {
                                  deleteSchoolAsset(asset.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="លុប"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT STRATEGIC PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <h2 className="text-lg font-bold font-moul text-amber-950 mb-4">
              {editingPlan ? 'កែប្រែផែនការយុទ្ធសាស្ត្រ' : 'បញ្ចូលផែនការយុទ្ធសាស្ត្រថ្មី'}
            </h2>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">កម្មវិធីស្នូល / ផ្នែក *</label>
                <select
                  value={planForm.programArea}
                  onChange={e => setPlanForm({ ...planForm, programArea: e.target.value as any })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="គុណភាពអប់រំ">គុណភាពអប់រំ</option>
                  <option value="ហេដ្ឋារចនាសម្ព័ន្ធ&បរិស្ថាន">ហេដ្ឋារចនាសម្ព័ន្ធ & បរិស្ថាន</option>
                  <option value="ការចូលរួមសហគមន៍">ការចូលរួមសហគមន៍</option>
                  <option value="អភិបាលកិច្ច&រដ្ឋបាល">អភិបាលកិច្ច & រដ្ឋបាល</option>
                  <option value="បណ្ណាល័យ&បច្ចេកវិទ្យា">បណ្ណាល័យ & បច្ចេកវិទ្យា</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">គោលបំណងយុទ្ធសាស្ត្រ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. លើកកម្ពស់អត្រាសិស្សចេះអាន សរសេរ និងគណិតវិទ្យាថ្នាក់ដំបូង"
                  value={planForm.objective}
                  onChange={e => setPlanForm({ ...planForm, objective: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">សកម្មភាពគន្លឹះ</label>
                <input
                  type="text"
                  placeholder="ឧ. បណ្តុះបណ្តាលគ្រូលើវិធីសាស្ត្រ EGRA/EGMA"
                  value={planForm.keyActivity}
                  onChange={e => setPlanForm({ ...planForm, keyActivity: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">សូចនាករវាស់វែង KPI *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. អត្រាជាប់មធ្យមភាគ ៩៥% និងគ្មានសិស្សមិនចេះអក្សរ"
                  value={planForm.kpiTarget}
                  onChange={e => setPlanForm({ ...planForm, kpiTarget: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ឆ្នាំគោលដៅ</label>
                  <input
                    type="text"
                    value={planForm.targetYear}
                    onChange={e => setPlanForm({ ...planForm, targetYear: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">វឌ្ឍនភាពសម្រេច (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={planForm.progressPercent}
                    onChange={e => setPlanForm({ ...planForm, progressPercent: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ថវិកាគ្រោង (រៀល)</label>
                  <input
                    type="number"
                    value={planForm.estimatedBudgetRiel}
                    onChange={e => setPlanForm({ ...planForm, estimatedBudgetRiel: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ស្ថានភាព</label>
                  <select
                    value={planForm.status}
                    onChange={e => setPlanForm({ ...planForm, status: e.target.value as any })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="in_progress">កំពុងអនុវត្ត</option>
                    <option value="completed">សម្រេចបាន</option>
                    <option value="not_started">មិនទាន់ចាប់ផ្ដើម</option>
                    <option value="on_hold">ផ្អាក</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អ្នកទទួលបន្ទុកដឹកនាំ</label>
                <input
                  type="text"
                  value={planForm.responsibleLead}
                  onChange={e => setPlanForm({ ...planForm, responsibleLead: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-sm transition-colors"
                >
                  {editingPlan ? 'រក្សាទុក' : 'បន្ថែមផែនការ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT ASSET */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <h2 className="text-lg font-bold font-moul text-amber-950 mb-4">
              {editingAsset ? 'កែប្រែទិន្នន័យសារពើភ័ណ្ឌ' : 'បញ្ចូលសារពើភ័ណ្ឌថ្មី'}
            </h2>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">លេខកូដសម្ភារៈ *</label>
                  <input
                    type="text"
                    required
                    value={assetForm.assetCode}
                    onChange={e => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភេទ *</label>
                  <select
                    value={assetForm.category}
                    onChange={e => setAssetForm({ ...assetForm, category: e.target.value as any })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="អគារ&ហេដ្ឋារចនាសម្ព័ន្ធ">អគារ & ហេដ្ឋារចនាសម្ព័ន្ធ</option>
                    <option value="តុ-កៅអី&គ្រឿងសង្ហារិម">តុ-កៅអី & គ្រឿងសង្ហារិម</option>
                    <option value="បរិក្ខារបច្ចេកវិទ្យា/IT">បរិក្ខារបច្ចេកវិទ្យា / IT</option>
                    <option value="សម្ភារៈពិសោធន៍&ឧបទេស">សម្ភារៈពិសោធន៍ & ឧបទេស</option>
                    <option value="បរិក្ខារទឹកស្អាត&អនាម័យ">បរិក្ខារទឹកស្អាត & អនាម័យ</option>
                    <option value="បរិក្ខារកីឡា">បរិក្ខារកីឡា</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះសម្ភារៈ / ទ្រព្យសម្បត្តិ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. តុបង្រៀនគ្រូធ្វើពីឈើប្រណិត"
                  value={assetForm.assetNameKhmer}
                  onChange={e => setAssetForm({ ...assetForm, assetNameKhmer: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">បរិមាណ</label>
                  <input
                    type="number"
                    min={1}
                    value={assetForm.quantity}
                    onChange={e => setAssetForm({ ...assetForm, quantity: Number(e.target.value) })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ឯកតា</label>
                  <input
                    type="text"
                    value={assetForm.unit}
                    onChange={e => setAssetForm({ ...assetForm, unit: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ស្ថានភាព</label>
                  <select
                    value={assetForm.condition}
                    onChange={e => setAssetForm({ ...assetForm, condition: e.target.value as any })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="good">ល្អ</option>
                    <option value="fair">មធ្យម</option>
                    <option value="damaged">ខូចខាត</option>
                    <option value="unusable">ប្រើលែងកើត</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ទីតាំង / បន្ទប់ដាក់</label>
                  <input
                    type="text"
                    value={assetForm.locationRoom}
                    onChange={e => setAssetForm({ ...assetForm, locationRoom: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ប្រភពថវិកា</label>
                  <input
                    type="text"
                    value={assetForm.sourceOfFunding}
                    onChange={e => setAssetForm({ ...assetForm, sourceOfFunding: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">កំណត់សម្គាល់បន្ថែម</label>
                <input
                  type="text"
                  placeholder="ព័ត៌មានបន្ថែម..."
                  value={assetForm.notes}
                  onChange={e => setAssetForm({ ...assetForm, notes: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-sm transition-colors"
                >
                  {editingAsset ? 'រក្សាទុក' : 'បញ្ចូលសារពើភ័ណ្ឌ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
