import {
  ActivityLogItem,
  ActivityDomain,
  ActivityActionType,
  Student,
  Teacher,
  BudgetTransaction,
  StudentTransferRecord,
  StudentScoreRecord
} from '../types';

const ACTIVITY_STORAGE_KEY = 'phnom_pom_activity_audit_logs';

/**
 * Format timestamp into conversational and respectful Khmer relative time
 * (ឧ. «មុននេះ ៥ នាទី», «មុននេះ ២ ម៉ោង», «ថ្ងៃនេះ ម៉ោង ០៨:៣០», «ម្សិលមិញ ម៉ោង ១៤:១៥», «ថ្ងៃទី ១៥ មករា ២០២៦»)
 */
export function formatKhmerRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) {
      return 'មុននេះបន្តិច';
    }
    if (diffMin < 60) {
      return `មុននេះ ${diffMin} នាទី`;
    }
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      const timeStr = date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
      return `ថ្ងៃនេះ ម៉ោង ${timeStr}`;
    }
    if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) {
      const timeStr = date.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
      return `ម្សិលមិញ ម៉ោង ${timeStr}`;
    }
    if (diffDays < 7) {
      return `${diffDays} ថ្ងៃមុន`;
    }

    return date.toLocaleDateString('km-KH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

/**
 * Format full exact Khmer date and time
 */
export function formatKhmerFullDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return isoString;
  }
}

/**
 * Get stored logs from LocalStorage
 */
export function getStoredActivities(): ActivityLogItem[] {
  try {
    const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load activities from storage', e);
  }
  return [];
}

/**
 * Save logs to LocalStorage
 */
export function saveActivitiesToStorage(activities: ActivityLogItem[]): void {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities.slice(0, 200)));
  } catch (e) {
    console.error('Failed to save activities to storage', e);
  }
}

/**
 * Log a new activity dynamically
 */
export function logNewActivity(
  activity: Omit<ActivityLogItem, 'id' | 'timestamp'> & { timestamp?: string }
): ActivityLogItem {
  const newItem: ActivityLogItem = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: activity.timestamp || new Date().toISOString()
  };

  const existing = getStoredActivities();
  const updated = [newItem, ...existing].slice(0, 200);
  saveActivitiesToStorage(updated);
  return newItem;
}

/**
 * Generate initial realistic seed activities from current state so admin sees rich data changes immediately
 */
export function generateSeedActivities(
  students: Student[],
  teachers: Teacher[],
  budget: BudgetTransaction[],
  transfers: StudentTransferRecord[] = [],
  scores: StudentScoreRecord[] = []
): ActivityLogItem[] {
  const seeds: ActivityLogItem[] = [];
  const baseTime = Date.now();

  // 1. Recent Financial Logs
  budget.slice(0, 4).forEach((tx, idx) => {
    seeds.push({
      id: `act-seed-fin-${tx.id}`,
      domain: 'finance',
      actionType: tx.type === 'income' ? 'income' : 'expense',
      title: tx.type === 'income' ? `បានកត់ត្រាចំណូលថវិកា៖ ${tx.title}` : `បានកត់ត្រាចំណាយថវិកា៖ ${tx.title}`,
      description: `${tx.source} • ប្រភេទ «${tx.category}» ចំនួន ${(tx.amountRiel).toLocaleString()} ៛ ($${tx.amountUsd})`,
      entityId: tx.id,
      entityCode: tx.referenceCode,
      entityName: tx.title,
      actorName: tx.recordedBy || 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា / គណនេយ្យករ',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 4 + 1800000)).toISOString(),
      financialAmountRiel: tx.amountRiel,
      financialAmountUsd: tx.amountUsd,
      financialCategory: tx.category,
      targetTab: 'finance',
      tags: [tx.type === 'income' ? 'ចំណូល' : 'ចំណាយ', tx.source],
      changes: [
        { fieldName: 'amountRiel', fieldLabelKhmer: 'ទឹកប្រាក់រៀល', newValue: `${(tx.amountRiel).toLocaleString()} ៛` },
        { fieldName: 'source', fieldLabelKhmer: 'ប្រភពថវិកា', newValue: tx.source },
        { fieldName: 'referenceCode', fieldLabelKhmer: 'លេខបង្កាន់ដៃ', newValue: tx.referenceCode }
      ]
    });
  });

  // 2. Recent Student Record Updates / Creations
  students.slice(0, 5).forEach((stu, idx) => {
    const isNew = idx % 2 === 0;
    seeds.push({
      id: `act-seed-stu-${stu.id}`,
      domain: 'student',
      actionType: isNew ? 'create' : 'update',
      title: isNew ? `បានចុះឈ្មោះសិស្សថ្មី៖ ${stu.nameKhmer}` : `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានសិស្ស៖ ${stu.nameKhmer}`,
      description: `ថ្នាក់ទី ${stu.grade}${stu.section} • អត្តលេខ ${stu.code} • អាណាព្យាបាល ${stu.guardianName} (${stu.guardianPhone})`,
      entityId: stu.id,
      entityCode: stu.code,
      entityName: stu.nameKhmer,
      actorName: 'លោកគ្រូ ចាន់ វុទ្ធី',
      actorRole: 'គ្រូបន្ទុកថ្នាក់',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 2.5 + 900000)).toISOString(),
      targetTab: 'students',
      tags: [`ថ្នាក់ទី ${stu.grade}${stu.section}`, stu.livingCondition || 'ទូទៅ'],
      changes: isNew
        ? [
            { fieldName: 'code', fieldLabelKhmer: 'អត្តលេខសិស្ស', newValue: stu.code },
            { fieldName: 'nameKhmer', fieldLabelKhmer: 'គោត្តនាម-នាម', newValue: stu.nameKhmer },
            { fieldName: 'grade', fieldLabelKhmer: 'កម្រិតថ្នាក់', newValue: `ថ្នាក់ទី ${stu.grade}${stu.section}` },
            { fieldName: 'guardianPhone', fieldLabelKhmer: 'លេខទូរស័ព្ទអាណាព្យាបាល', newValue: stu.guardianPhone }
          ]
        : [
            { fieldName: 'livingCondition', fieldLabelKhmer: 'ស្ថានភាពជីវភាព', oldValue: 'ទូទៅ', newValue: stu.livingCondition || 'សមរម្យ' },
            { fieldName: 'guardianPhone', fieldLabelKhmer: 'លេខទូរស័ព្ទ', oldValue: '012 xxx xxx', newValue: stu.guardianPhone },
            { fieldName: 'healthChecked', fieldLabelKhmer: 'ពិនិត្យសុខភាព (BMI)', newValue: `${stu.health?.heightCm}cm / ${stu.health?.weightKg}kg` }
          ]
    });
  });

  // 3. Teacher Records changes
  teachers.slice(0, 3).forEach((tea, idx) => {
    seeds.push({
      id: `act-seed-tea-${tea.id}`,
      domain: 'teacher',
      actionType: 'update',
      title: `បានកែសម្រួលព័ត៌មានមន្ត្រី/គ្រូបង្រៀន៖ ${tea.nameKhmer}`,
      description: `${tea.role} • ក្របខ័ណ្ឌ «${tea.framework || 'គ្រូបង្រៀនកម្រិតមូលដ្ឋាន'}» • អត្តលេខ ${tea.staffCode}`,
      entityId: tea.id,
      entityCode: tea.staffCode,
      entityName: tea.nameKhmer,
      actorName: 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 7 + 7200000)).toISOString(),
      targetTab: 'teachers',
      tags: [tea.role, tea.staffCode],
      changes: [
        { fieldName: 'qualification', fieldLabelKhmer: 'កម្រិតសញ្ញាបត្រ', newValue: tea.qualification },
        { fieldName: 'phone', fieldLabelKhmer: 'លេខទូរស័ព្ទទំនាក់ទំនង', newValue: tea.phone },
        { fieldName: 'assignedClass', fieldLabelKhmer: 'បន្ទុកថ្នាក់', newValue: tea.assignedGrade ? `ថ្នាក់ទី ${tea.assignedGrade}${tea.assignedSection || 'ក'}` : 'រដ្ឋបាល' }
      ]
    });
  });

  // 4. Student Transfers if any
  transfers.slice(0, 2).forEach((tr, idx) => {
    seeds.push({
      id: `act-seed-tr-${tr.id}`,
      domain: 'student',
      actionType: 'transfer',
      title: tr.transferType === 'out' ? `បានអនុម័តលិខិតផ្ទេរសិស្សចេញ៖ ${tr.studentNameKhmer}` : `បានទទួលសិស្សផ្ទេរចូល៖ ${tr.studentNameKhmer}`,
      description: `លិខិតលេខ ${tr.letterNumber} • ថ្នាក់ទី ${tr.grade}${tr.section} • ទៅកាន់ ${tr.toSchool}`,
      entityId: tr.id,
      entityCode: tr.letterNumber,
      entityName: tr.studentNameKhmer,
      actorName: 'លោក លីម សន (នាយកសាលា)',
      actorRole: 'នាយកសាលា',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 12 + 14400000)).toISOString(),
      targetTab: 'transfers',
      tags: [tr.transferType === 'out' ? 'ផ្ទេរចេញ' : 'ផ្ទេរចូល', tr.letterNumber]
    });
  });

  // 5. Score Records
  scores.slice(0, 2).forEach((sc, idx) => {
    seeds.push({
      id: `act-seed-score-${sc.id}`,
      domain: 'academic',
      actionType: 'score',
      title: `បានបញ្ចូលពិន្ទុប្រចាំខែ ${sc.monthOrSemester}៖ ${sc.studentNameKhmer}`,
      description: `ថ្នាក់ទី ${sc.grade}${sc.section} • មធ្យមភាគ ${sc.averageScore} • និទ្ទេស ${sc.gradeLetter} (ចំណាត់ថ្នាក់ទី ${sc.rank})`,
      entityId: sc.id,
      entityCode: sc.studentCode,
      entityName: sc.studentNameKhmer,
      actorName: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
      actorRole: 'គ្រូបន្ទុកថ្នាក់',
      timestamp: new Date(baseTime - (idx * 3600 * 1000 * 5 + 3600000)).toISOString(),
      targetTab: 'scores',
      tags: [`ខែ ${sc.monthOrSemester}`, `និទ្ទេស ${sc.gradeLetter}`]
    });
  });

  // Sort descending by timestamp
  return seeds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
