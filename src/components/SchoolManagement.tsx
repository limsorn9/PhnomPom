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
  DollarSign,
  Database,
  Archive,
  RefreshCw,
  HardDrive,
  Download,
  AlertTriangle,
  FileArchive,
  Layers
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
    academicYears,
    scores,
    attendanceRecords,
    lessonPlans,
    dailyClassLogs,
    transfers,
    budgetTransactions,
    currentUser,
    archiveAcademicYearRecords,
    purgeAcademicYearRecords,
    vacuumDatabase
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'standards' | 'strategic_plan' | 'assets' | 'data_maintenance'>('standards');

  // Data Maintenance State
  const [selectedMaintenanceYear, setSelectedMaintenanceYear] = useState<string>(selectedAcademicYear);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastArchivedInfo, setLastArchivedInfo] = useState<{ count: number; filename: string } | null>(null);
  const [lastVacuumInfo, setLastVacuumInfo] = useState<{ cleanedCount: number } | null>(null);

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

  // Maintenance calculations & handlers
  const maintenanceStats = useMemo(() => {
    const scoresCount = scores.filter(s => s.academicYear === selectedMaintenanceYear).length;
    const attendanceCount = attendanceRecords.filter(a => a.academicYear === selectedMaintenanceYear).length;
    const lessonPlansCount = lessonPlans.filter(l => l.academicYear === selectedMaintenanceYear).length;
    const classLogsCount = dailyClassLogs.filter(d => d.academicYear === selectedMaintenanceYear).length;
    const transfersCount = transfers.filter(t => t.academicYear === selectedMaintenanceYear).length;
    const budgetCount = budgetTransactions.filter(b => b.academicYear === selectedMaintenanceYear).length;
    const total = scoresCount + attendanceCount + lessonPlansCount + classLogsCount + transfersCount + budgetCount;

    return {
      scoresCount,
      attendanceCount,
      lessonPlansCount,
      classLogsCount,
      transfersCount,
      budgetCount,
      total
    };
  }, [scores, attendanceRecords, lessonPlans, dailyClassLogs, transfers, budgetTransactions, selectedMaintenanceYear]);

  const allSystemStats = useMemo(() => {
    return {
      totalScores: scores.length,
      totalAttendance: attendanceRecords.length,
      totalLessonPlans: lessonPlans.length,
      totalClassLogs: dailyClassLogs.length,
      totalTransfers: transfers.length,
      totalBudget: budgetTransactions.length,
      grandTotal: scores.length + attendanceRecords.length + lessonPlans.length + dailyClassLogs.length + transfers.length + budgetTransactions.length
    };
  }, [scores, attendanceRecords, lessonPlans, dailyClassLogs, transfers, budgetTransactions]);

  const handleDownloadArchive = () => {
    setIsArchiving(true);
    setTimeout(() => {
      const res = archiveAcademicYearRecords(selectedMaintenanceYear);
      if (res.success && res.exportJson && res.filename) {
        const blob = new Blob([res.exportJson], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLastArchivedInfo({ count: res.count, filename: res.filename });
      }
      setIsArchiving(false);
    }, 450);
  };

  const handlePurgeRecords = () => {
    if (purgeConfirmText.trim() !== selectedMaintenanceYear) {
      showToast(`សូមវាយពាក្យ «${selectedMaintenanceYear}» ឱ្យបានត្រឹមត្រូវដើម្បីបញ្ជាក់ការសម្អាត!`, 'error');
      return;
    }
    setIsPurging(true);
    setTimeout(() => {
      purgeAcademicYearRecords(selectedMaintenanceYear);
      setIsPurgeModalOpen(false);
      setPurgeConfirmText('');
      setIsPurging(false);
    }, 400);
  };

  const handleRunVacuum = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const res = vacuumDatabase();
      setLastVacuumInfo({ cleanedCount: res.cleanedCount });
      setIsOptimizing(false);
    }, 500);
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
            onClick={() => setActiveSubTab('data_maintenance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeSubTab === 'data_maintenance'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>ការថែទាំទិន្នន័យ & បណ្ណសារ (Data Maintenance)</span>
          </button>
        </div>
      </div>

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

      {/* TAB 4: DATA MAINTENANCE & ARCHIVE */}
      {activeSubTab === 'data_maintenance' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Database Performance & Maintenance
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ស្ថានភាពល្អប្រសើរ (Healthy)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-moul">
                  ការថែទាំទិន្នន័យ & បណ្ណសារសុវត្ថិភាព
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                  គ្រប់គ្រងបណ្ណសារតាមឆ្នាំសិក្សា (Archive) សម្អាតកំណត់ត្រាចាស់ៗ (Purge) និងដំណើរការបង្កើនល្បឿនប្រព័ន្ធ (Vacuum DB) ដើម្បីធានាថាទិន្នន័យដំណើរការរលូន និងមានសុវត្ថិភាពខ្ពស់។
                </p>
              </div>

              {/* Quick DB Health Widget */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px]">
                <span className="text-xs text-slate-300 block font-medium">កំណត់ត្រាសរុបក្នុងប្រព័ន្ធ</span>
                <span className="text-2xl font-extrabold text-amber-300">{allSystemStats.grandTotal.toLocaleString()}</span>
                <span className="text-[11px] text-slate-300 block mt-1">
                  ពិន្ទុ {allSystemStats.totalScores} • វត្តមាន {allSystemStats.totalAttendance}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Year Selection & Record Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-amber-600" />
                  ជ្រើសរើសឆ្នាំសិក្សាសម្រាប់គ្រប់គ្រងបណ្ណសារ & សម្អាត
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ជ្រើសរើសឆ្នាំសិក្សាដែលចង់បម្រុងទុកបណ្ណសារ ឬចង់សម្អាតចេញពីមូលដ្ឋានទិន្នន័យ
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">ឆ្នាំសិក្សា៖</label>
                <select
                  value={selectedMaintenanceYear}
                  onChange={e => setSelectedMaintenanceYear(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-blue-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {academicYears.map(year => (
                    <option key={year} value={year}>
                      {year} {year === selectedAcademicYear ? '(បច្ចុប្បន្ន)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Year Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                <span className="text-[11px] font-semibold text-blue-700 block">ពិន្ទុ & លទ្ធផល</span>
                <span className="text-lg font-bold text-blue-950">{maintenanceStats.scoresCount}</span>
                <span className="text-[10px] text-blue-600 block">កំណត់ត្រា</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                <span className="text-[11px] font-semibold text-emerald-700 block">វត្តមានសិស្ស</span>
                <span className="text-lg font-bold text-emerald-950">{maintenanceStats.attendanceCount}</span>
                <span className="text-[10px] text-emerald-600 block">កំណត់ត្រា</span>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
                <span className="text-[11px] font-semibold text-purple-700 block">កិច្ចតែងការ</span>
                <span className="text-lg font-bold text-purple-950">{maintenanceStats.lessonPlansCount}</span>
                <span className="text-[10px] text-purple-600 block">មេរៀន</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
                <span className="text-[11px] font-semibold text-amber-800 block">កំណត់ហេតុថ្នាក់</span>
                <span className="text-lg font-bold text-amber-950">{maintenanceStats.classLogsCount}</span>
                <span className="text-[10px] text-amber-700 block">ថ្ងៃ</span>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                <span className="text-[11px] font-semibold text-indigo-700 block">ការផ្ទេរសិស្ស</span>
                <span className="text-lg font-bold text-indigo-950">{maintenanceStats.transfersCount}</span>
                <span className="text-[10px] text-indigo-600 block">ករណី</span>
              </div>
              <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 text-center">
                <span className="text-[11px] font-semibold text-cyan-800 block">ថវិកា & ចំណូល-ចំណាយ</span>
                <span className="text-lg font-bold text-cyan-950">{maintenanceStats.budgetCount}</span>
                <span className="text-[10px] text-cyan-700 block">ប្រតិបត្តិការ</span>
              </div>
            </div>
          </div>

          {/* 3 Core Maintenance Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Action 1: Safe Archive */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    ១. បម្រុងទុកបណ្ណសារ (Archive)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ទាញយកកញ្ចប់បណ្ណសារសុវត្ថិភាពពេញលេញនៃឆ្នាំសិក្សា <strong className="text-blue-900">{selectedMaintenanceYear}</strong> (ពិន្ទុ, វត្តមាន, កិច្ចតែងការ, កំណត់ហេតុ) ជាឯកសារ JSON រក្សាទុកក្នុងកុំព្យូទ័រ ឬ Drive។
                  </p>
                </div>

                {lastArchivedInfo && (
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">បានទាញយក {lastArchivedInfo.count} កំណត់ត្រារួចរាល់</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleDownloadArchive}
                disabled={isArchiving || maintenanceStats.total === 0}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isArchiving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងបង្កើតបណ្ណសារ...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>ទាញយកបណ្ណសារឆ្នាំ {selectedMaintenanceYear} ({maintenanceStats.total})</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Safe Purge */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-rose-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    ២. សម្អាតទិន្នន័យចាស់ (Purge Old Year)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    លុបកំណត់ត្រាប្រចាំថ្ងៃ និងពិន្ទុនៃឆ្នាំ <strong className="text-rose-900">{selectedMaintenanceYear}</strong> ចេញពីប្រព័ន្ធ ដើម្បីសន្សំសំចៃទំហំផ្ទុក និងបង្កើនល្បឿន។ (រក្សាទុកបញ្ជីសិស្ស និងគ្រូជាធម្មតា)។
                  </p>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>សូមប្រាកដថាបានទាញយក Archive រួចរាល់មុននឹង Purge!</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPurgeConfirmText('');
                  setIsPurgeModalOpen(true);
                }}
                disabled={maintenanceStats.total === 0 || currentUser?.role !== 'director'}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>សម្អាតទិន្នន័យឆ្នាំ {selectedMaintenanceYear}</span>
              </button>
            </div>

            {/* Action 3: Vacuum & DB Cache Optimization */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    ៣. បង្កើនប្រសិទ្ធភាព (Vacuum & Optimize)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ស្កេនសម្អាតកំណត់ត្រាកំហុសដែលមិនមានម្ចាស់ (Orphan/Ghost records), សម្អាត Storage Cache និងរៀបចំ Index របស់ប្រព័ន្ធឱ្យដំណើរការលឿនដូចដើម។
                  </p>
                </div>

                {lastVacuumInfo && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>បានសម្អាត និងបង្កើនប្រសិទ្ធភាពរួចរាល់ ({lastVacuumInfo.cleanedCount} កំណត់ត្រា)</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleRunVacuum}
                disabled={isOptimizing}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងដំណើរការ Vacuum...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>ដំណើរការ Vacuum & Optimize DB</span>
                  </>
                )}
              </button>
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

      {/* MODAL 3: PURGE CONFIRMATION MODAL */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-100 my-8 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold font-moul text-rose-950">បញ្ជាក់ការសម្អាតទិន្នន័យចាស់</h3>
                <p className="text-xs text-rose-600 font-medium">សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ!</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-2 leading-relaxed">
              <p>
                តើលោក/លោកស្រីពិតជាចង់សម្អាតកំណត់ត្រាទាំងអស់ក្នុងឆ្នាំសិក្សា <strong className="font-bold text-rose-950">{selectedMaintenanceYear}</strong> មែនទេ?
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>ពិន្ទុ & លទ្ធផលសិក្សា៖ <strong>{maintenanceStats.scoresCount}</strong> កំណត់ត្រា</li>
                <li>វត្តមានសិស្សប្រចាំថ្ងៃ៖ <strong>{maintenanceStats.attendanceCount}</strong> កំណត់ត្រា</li>
                <li>កិច្ចតែងការបង្រៀន៖ <strong>{maintenanceStats.lessonPlansCount}</strong> កំណត់ត្រា</li>
                <li>កំណត់ហេតុថ្នាក់៖ <strong>{maintenanceStats.classLogsCount}</strong> កំណត់ត្រា</li>
              </ul>
              <p className="font-semibold text-rose-950 pt-1">
                * បញ្ជីឈ្មោះសិស្ស និងលោកគ្រូ-អ្នកគ្រូ នឹងនៅតែរក្សាទុកជាធម្មតា។
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                សូមវាយអក្សរ <span className="text-rose-600 font-mono font-bold select-all bg-rose-100 px-1.5 py-0.5 rounded">{selectedMaintenanceYear}</span> ដើម្បីបញ្ជាក់៖
              </label>
              <input
                type="text"
                placeholder={selectedMaintenanceYear}
                value={purgeConfirmText}
                onChange={e => setPurgeConfirmText(e.target.value)}
                className="w-full text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsPurgeModalOpen(false);
                  setPurgeConfirmText('');
                }}
                disabled={isPurging}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handlePurgeRecords}
                disabled={purgeConfirmText.trim() !== selectedMaintenanceYear || isPurging}
                className="px-5 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងសម្អាត...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>បញ្ជាក់ការសម្អាត</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
