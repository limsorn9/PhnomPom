import React, { useState } from 'react';
import { ActivitySavedView, ActivityDomain, ActivityActionType } from '../../types';
import {
  Bookmark,
  Plus,
  Trash2,
  Check,
  X,
  Layers,
  ShieldAlert,
  CircleDollarSign,
  GraduationCap,
  AlertTriangle,
  Archive,
  Star,
  Settings,
  Sparkles
} from 'lucide-react';
import { saveCustomView, deleteSavedView } from '../../utils/activitySavedViews';

interface ActivitySavedViewsBarProps {
  savedViews: ActivitySavedView[];
  activeViewId: string | null;
  currentFilters: {
    searchQuery: string;
    selectedDomain: ActivityDomain | 'all';
    selectedAction: ActivityActionType | 'all';
    selectedRole: string;
    selectedActor: string;
    dateFilter: any;
    customStartDate?: string;
    customEndDate?: string;
    showAnomaliesOnly: boolean;
    showHighRiskOnly: boolean;
    archiveFilter: 'active' | 'archived' | 'all';
    viewMode: 'table' | 'list';
  };
  onSelectView: (view: ActivitySavedView) => void;
  onRefreshViews: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ActivitySavedViewsBar: React.FC<ActivitySavedViewsBarProps> = ({
  savedViews,
  activeViewId,
  currentFilters,
  onSelectView,
  onRefreshViews,
  showToast
}) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDesc, setNewViewDesc] = useState('');
  const [newViewBadgeColor, setNewViewBadgeColor] = useState('bg-blue-100 text-blue-800 border-blue-300');

  const handleSaveViewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;

    const created = saveCustomView(
      newViewName.trim(),
      currentFilters,
      newViewDesc.trim() || undefined,
      newViewBadgeColor
    );

    onRefreshViews();
    setIsSaveModalOpen(false);
    setNewViewName('');
    setNewViewDesc('');
    showToast(`បានរក្សាទុក View «${created.name}» ដោយជោគជ័យ!`, 'success');
  };

  const handleDeleteCustomView = (id: string, name: string) => {
    const success = deleteSavedView(id);
    if (success) {
      onRefreshViews();
      showToast(`បានលុប View «${name}» រួចរាល់`, 'info');
    }
  };

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'CircleDollarSign':
        return <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Trash2':
        return <Trash2 className="w-3.5 h-3.5 text-red-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'Archive':
        return <Archive className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Title and views scrollable area */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 whitespace-nowrap pr-1 border-r border-slate-200">
            <Bookmark className="w-4 h-4 text-blue-600" />
            <span>Saved Views (តម្រងដែលបានរក្សាទុក)៖</span>
          </div>

          <div className="flex items-center gap-1.5 flex-nowrap">
            {savedViews.map(view => {
              const isActive = activeViewId === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => onSelectView(view)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-300/60 font-bold scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title={view.description}
                >
                  {getIconComponent(view.icon)}
                  <span>{view.name}</span>
                  {!view.isSystem && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Custom View" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Save New View & Manage */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="រក្សាទុកការរួមបញ្ចូលគ្នានៃតម្រងបច្ចុប្បន្នជា View ថ្មី"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>រក្សាទុកជា View ថ្មី</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManageModalOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="គ្រប់គ្រង Saved Views ផ្ទាល់ខ្លួន"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Custom View Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-300" />
                <h3 className="text-sm font-bold font-moul text-white">
                  រក្សាទុកការរួមបញ្ចូលគ្នានៃតម្រង (Save View)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveViewSubmit} className="p-5 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                កំណត់ត្រាតម្រងដែលកំពុងជ្រើសរើស (Search, Domain, Action, កាលបរិច្ឆេទ) នឹងត្រូវបានរក្សាទុកដើម្បីងាយស្រួលចូលប្រើម្តងទៀត។
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ឈ្មោះ View <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newViewName}
                  onChange={e => setNewViewName(e.target.value)}
                  placeholder="ឧ. សវនកម្មប្រាក់ខែគ្រូ, កំណត់ត្រាខែមករា, លុបទិន្នន័យ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ការពិពណ៌នាសង្ខេប
                </label>
                <input
                  type="text"
                  value={newViewDesc}
                  onChange={e => setNewViewDesc(e.target.value)}
                  placeholder="ឧ. ពិនិត្យតាមដានសកម្មភាពកែប្រែដោយលោកគ្រូ-អ្នកគ្រូ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ពណ៌ស្លាកសម្គាល់
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'ខៀវ', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
                    { label: 'បៃតង', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    { label: 'ស្វាយ', cls: 'bg-purple-100 text-purple-800 border-purple-300' },
                    { label: 'ក្រហម', cls: 'bg-rose-100 text-rose-800 border-rose-300' },
                    { label: 'លឿង', cls: 'bg-amber-100 text-amber-900 border-amber-300' }
                  ].map((colorOpt, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setNewViewBadgeColor(colorOpt.cls)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${colorOpt.cls} ${
                        newViewBadgeColor === colorOpt.cls ? 'ring-2 ring-slate-800 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {colorOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">សង្ខេបតម្រងដែលនឹងត្រូវរក្សាទុក៖</span>
                <ul className="list-disc list-inside text-[10.5px] space-y-0.5 text-slate-500">
                  <li>ផ្នែក (Domain): <strong>{currentFilters.selectedDomain}</strong></li>
                  <li>សកម្មភាព (Action): <strong>{currentFilters.selectedAction}</strong></li>
                  <li>កាលបរិច្ឆេទ: <strong>{currentFilters.dateFilter}</strong></li>
                  {currentFilters.searchQuery && <li>ពាក្យគន្លឹះ: "{currentFilters.searchQuery}"</li>}
                  {currentFilters.showHighRiskOnly && <li className="text-rose-600 font-bold">ហានិភ័យខ្ពស់តែប៉ុណ្ណោះ</li>}
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុក View</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Custom Views Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold font-moul text-white">
                  គ្រប់គ្រង Saved Views ទាំងអស់
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                {savedViews.map(view => (
                  <div
                    key={view.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {getIconComponent(view.icon)}
                        <span className="font-bold text-xs text-slate-800">{view.name}</span>
                        {view.isSystem ? (
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                            ប្រព័ន្ធ
                          </span>
                        ) : (
                          <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                            ផ្ទាល់ខ្លួន
                          </span>
                        )}
                      </div>
                      {view.description && (
                        <p className="text-[10.5px] text-slate-500 line-clamp-1">{view.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectView(view);
                          setIsManageModalOpen(false);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        ជ្រើសរើស
                      </button>
                      {!view.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomView(view.id, view.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="លុប Custom View នេះចោល"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
