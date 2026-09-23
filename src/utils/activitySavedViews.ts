import { ActivitySavedView } from '../types';

const SAVED_VIEWS_STORAGE_KEY = 'phnom_pom_activity_saved_views';

export const SYSTEM_PRESET_VIEWS: ActivitySavedView[] = [
  {
    id: 'sys_all',
    name: 'សកម្មភាពទាំងអស់',
    description: 'បង្ហាញគ្រប់កំណត់ត្រាសកម្មភាពទាំងអស់ក្នុងប្រព័ន្ធ',
    icon: 'Layers',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'all',
      selectedAction: 'all',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: false,
      showHighRiskOnly: false,
      archiveFilter: 'active',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sys_high_risk',
    name: '🚨 ហានិភ័យខ្ពស់ & សវនកម្មបន្ទាន់',
    description: 'តម្រងស្វែងរកសកម្មភាពដែលមានហានិភ័យខ្ពស់ លុបទិន្នន័យ ឬក្រៅម៉ោង',
    icon: 'ShieldAlert',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'all',
      selectedAction: 'all',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: false,
      showHighRiskOnly: true,
      archiveFilter: 'all',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sys_finance',
    name: '💰 ប្រតិបត្តិការហិរញ្ញវត្ថុ',
    description: 'តាមដានចំណូល ចំណាយ ថវិការដ្ឋ PB និងមូលនិធិសាលា',
    icon: 'CircleDollarSign',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'finance',
      selectedAction: 'all',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: false,
      showHighRiskOnly: false,
      archiveFilter: 'active',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sys_deletions',
    name: '🗑️ កំណត់ត្រាលុប & សម្អាតទិន្នន័យ',
    description: 'សវនកម្មលើការលុបចោលសិស្ស គ្រូ ពិន្ទុ ឬឯកសាររដ្ឋបាល',
    icon: 'Trash2',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'all',
      selectedAction: 'delete',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: false,
      showHighRiskOnly: false,
      archiveFilter: 'all',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sys_scores',
    name: '📊 ពិន្ទុ & លទ្ធផលប្រឡង',
    description: 'តាមដានការបញ្ចូល និងកែប្រែពិន្ទុសិស្សប្រចាំខែ និងឆមាស',
    icon: 'GraduationCap',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'academic',
      selectedAction: 'all',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: false,
      showHighRiskOnly: false,
      archiveFilter: 'active',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sys_anomalies',
    name: '⚠️ ភាពមិនប្រក្រតី (Anomalies)',
    description: 'បង្ហាញតែសកម្មភាពដែលមានសញ្ញាភាពមិនប្រក្រតីតាមដានដោយ AI',
    icon: 'AlertTriangle',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'all',
      selectedAction: 'all',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: true,
      showHighRiskOnly: false,
      archiveFilter: 'active',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'sys_archived',
    name: '📦 បណ្ណសារចាស់ៗ (Archive)',
    description: 'កំណត់ត្រាសកម្មភាពដែលបានដាក់ក្នុងបណ្ណសារទុក',
    icon: 'Archive',
    badgeColor: 'bg-slate-200 text-slate-800 border-slate-400',
    isSystem: true,
    filters: {
      searchQuery: '',
      selectedDomain: 'all',
      selectedAction: 'all',
      selectedRole: 'all',
      selectedActor: 'all',
      dateFilter: 'all',
      showAnomaliesOnly: false,
      showHighRiskOnly: false,
      archiveFilter: 'archived',
      viewMode: 'table'
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export function getSavedViews(): ActivitySavedView[] {
  try {
    const saved = localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
    if (saved) {
      const customViews = JSON.parse(saved);
      if (Array.isArray(customViews)) {
        return [...SYSTEM_PRESET_VIEWS, ...customViews];
      }
    }
  } catch (e) {
    console.error('Failed to parse saved views from storage', e);
  }
  return SYSTEM_PRESET_VIEWS;
}

export function saveCustomView(
  name: string,
  filters: ActivitySavedView['filters'],
  description?: string,
  badgeColor?: string
): ActivitySavedView {
  const newView: ActivitySavedView = {
    id: `view-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    description: description || 'ទិដ្ឋភាពតម្រងផ្ទាល់ខ្លួនរបស់រដ្ឋបាល',
    badgeColor: badgeColor || 'bg-blue-100 text-blue-800 border-blue-300',
    isSystem: false,
    filters,
    createdAt: new Date().toISOString()
  };

  try {
    const saved = localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
    const existingCustom: ActivitySavedView[] = saved ? JSON.parse(saved) : [];
    const updated = [newView, ...existingCustom];
    localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom view to storage', e);
  }

  return newView;
}

export function deleteSavedView(id: string): boolean {
  try {
    const saved = localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
    if (saved) {
      const existingCustom: ActivitySavedView[] = JSON.parse(saved);
      const filtered = existingCustom.filter(v => v.id !== id);
      localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }
  } catch (e) {
    console.error('Failed to delete saved view from storage', e);
  }
  return false;
}
