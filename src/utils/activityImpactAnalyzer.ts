import { ActivityLogItem, ActivityDomain, ActivityActionType } from '../types';

export interface OperationalImpactResult {
  summaryKhmer: string;
  impactLevel: 'high' | 'medium' | 'low';
  categoryKhmer: string;
  recommendedAction?: string;
  confidenceScore: number;
}

/**
 * AI-powered Operational Impact Summarizer for Primary School Administration
 * Synthesizes domain changes, financial magnitude, role permissions, and anomaly risks
 * into actionable, concise school governance insights.
 */
export function generateOperationalImpactSummary(log: ActivityLogItem): OperationalImpactResult {
  // If explicitly cached on the log
  if (log.aiImpactSummary && log.aiImpactLevel) {
    return {
      summaryKhmer: log.aiImpactSummary,
      impactLevel: log.aiImpactLevel,
      categoryKhmer: getCategoryKhmer(log.domain),
      confidenceScore: 0.95
    };
  }

  const { domain, actionType, financialAmountRiel, changes, anomalies, entityName, title, description } = log;

  // 1. ANOMALIES DETECTED -> Immediate High Impact
  if (anomalies && anomalies.length > 0) {
    const highAnomaly = anomalies.find(a => a.severity === 'high');
    if (highAnomaly) {
      return {
        summaryKhmer: `ហានិភ័យប្រតិបត្តិការខ្ពស់៖ ${highAnomaly.descriptionKhmer} — ទាមទារការផ្ទៀងផ្ទាត់ផ្ទាល់ពីនាយកសាលា។`,
        impactLevel: 'high',
        categoryKhmer: 'ហានិភ័យសវនកម្ម',
        recommendedAction: 'ទាក់ទងអ្នកកែប្រែទិន្នន័យដើម្បីបញ្ជាក់មូលហេតុ',
        confidenceScore: 0.98
      };
    }
  }

  // 2. FINANCIAL DOMAIN
  if (domain === 'finance' || actionType === 'income' || actionType === 'expense' || financialAmountRiel) {
    const amount = financialAmountRiel || 0;
    if (actionType === 'income') {
      const isLarge = amount >= 1000000;
      return {
        summaryKhmer: isLarge
          ? `បង្កើនមូលនិធិសាលាគួរឱ្យកត់សម្គាល់ (${amount.toLocaleString()} ៛) — គាំទ្រគម្រោងអភិវឌ្ឍន៍សាលា និងការទិញសម្ភារៈឧបទេស។`
          : `កត់ត្រាចំណូលប្រតិបត្តិការ (${amount.toLocaleString()} ៛) — ធ្វើបច្ចុប្បន្នភាពសមតុល្យសាច់ប្រាក់រលូន។`,
        impactLevel: isLarge ? 'high' : 'medium',
        categoryKhmer: 'សាច់ប្រាក់ & ថវិកា',
        recommendedAction: 'ពិនិត្យបង្កាន់ដៃបង់ប្រាក់ផ្លូវការ',
        confidenceScore: 0.96
      };
    }

    if (actionType === 'expense') {
      const isLarge = amount >= 500000;
      return {
        summaryKhmer: isLarge
          ? `ការចំណាយកម្រិតខ្ពស់ (${amount.toLocaleString()} ៛) — ប៉ះពាល់សមតុល្យបម្រុងសាលា និងតម្រូវឱ្យភ្ជាប់វិក្កយបត្របញ្ជាក់ច្បាស់លាស់។`
          : `ចំណាយប្រតិបត្តិការប្រចាំថ្ងៃ (${amount.toLocaleString()} ៛) — ត្រូវបានកាត់កងពីសៀវភៅចំណាយជាក់ស្តែង។`,
        impactLevel: isLarge ? 'high' : 'medium',
        categoryKhmer: 'ចំណាយថវិកា',
        recommendedAction: isLarge ? 'រក្សាទុកវិក្កយបត្រក្នុងសៀវភៅគណនេយ្យ' : undefined,
        confidenceScore: 0.94
      };
    }
  }

  // 3. STUDENT DOMAIN
  if (domain === 'student') {
    if (actionType === 'create') {
      return {
        summaryKhmer: `កើនស្ថិតិសិស្សថ្នាក់ — តម្រូវឱ្យរៀបចំលេខកូដសិស្ស បែងចែកតុអង្គុយ និងបញ្ចូលក្នុងសៀវភៅបញ្ជីវត្តមានថ្មី។`,
        impactLevel: 'medium',
        categoryKhmer: 'ស្ថិតិសិស្ស & ថ្នាក់រៀន',
        recommendedAction: 'បញ្ចូលក្នុងបញ្ជីឈ្មោះសិស្សផ្លូវការរបស់មន្ទីរ',
        confidenceScore: 0.93
      };
    }

    if (actionType === 'delete') {
      return {
        summaryKhmer: `លុបទិន្នន័យសិស្ស (${entityName}) — ប៉ះពាល់ស្ថិតិសិស្សផ្លូវការ និងប្រវត្តិសិក្សា។ គណៈគ្រប់គ្រងត្រូវផ្ទៀងផ្ទាត់ឡើងវិញ។`,
        impactLevel: 'high',
        categoryKhmer: 'ស្ថិតិ & ប្រវត្តិសិក្សា',
        recommendedAction: 'ពិនិត្យមូលហេតុនៃការលុបក្នុងកិច្ចប្រជុំរដ្ឋបាល',
        confidenceScore: 0.97
      };
    }

    if (actionType === 'transfer') {
      return {
        summaryKhmer: `ផ្ទេរបញ្ជីឈ្មោះសិស្សចេញ/ចូល — ធ្វើបច្ចុប្បន្នភាពស្ថិតិសិស្ស និងផ្ញើសំណុំលិខិតផ្ទេរទៅសាលាគោលដៅ។`,
        impactLevel: 'medium',
        categoryKhmer: 'ការផ្ទេរសិស្ស',
        recommendedAction: 'បោះពុម្ពលិខិតផ្ទេរផ្លូវការជូនអាណាព្យាបាល',
        confidenceScore: 0.95
      };
    }

    // Check specific changes
    if (changes && changes.length > 0) {
      const hasHealth = changes.some(c => c.fieldName.includes('health') || c.fieldLabelKhmer.includes('សុខភាព'));
      if (hasHealth) {
        return {
          summaryKhmer: `ធ្វើបច្ចុប្បន្នភាពទិន្នន័យសុខភាព — ជួយតាមដានការលូតលាស់សិស្ស និងចំណាត់ថ្នាក់អាហារូបត្ថម្ភសាលា។`,
          impactLevel: 'low',
          categoryKhmer: 'សុខភាពសិស្ស',
          confidenceScore: 0.91
        };
      }
      const hasPhone = changes.some(c => c.fieldName.includes('Phone') || c.fieldName.includes('guardian'));
      if (hasPhone) {
        return {
          summaryKhmer: `ធ្វើបច្ចុប្បន្នភាពទំនាក់ទំនងអាណាព្យាបាល — ធានាការទាក់ទងបន្ទាន់ និងផ្ញើសារដំណឹងសាលាបានរលូន។`,
          impactLevel: 'low',
          categoryKhmer: 'ទំនាក់ទំនងមាតាបិតា',
          confidenceScore: 0.92
        };
      }
    }

    return {
      summaryKhmer: `កែប្រែប្រវត្តិរូបសិស្ស (${entityName}) — ធានាភាពសុក្រឹតនៃទិន្នន័យស្របតាមសំបុត្រកំណើតផ្លូវការ។`,
      impactLevel: 'low',
      categoryKhmer: 'ប្រវត្តិរូបសិស្ស',
      confidenceScore: 0.90
    };
  }

  // 4. ACADEMIC & SCORES
  if (domain === 'academic' || actionType === 'score') {
    return {
      summaryKhmer: `ធ្វើបច្ចុប្បន្នភាពតារាងពិន្ទុ និងចំណាត់ថ្នាក់សិស្ស — ប៉ះពាល់ការគណនាមធ្យមភាគប្រចាំខែ និងសៀវភៅតាមដានការសិក្សា។`,
      impactLevel: 'medium',
      categoryKhmer: 'លទ្ធផលសិក្សា',
      recommendedAction: 'បោះពុម្ពតារាងចំណាត់ថ្នាក់សម្រាប់បិទប្រកាស',
      confidenceScore: 0.95
    };
  }

  // 5. ATTENDANCE
  if (actionType === 'attendance') {
    return {
      summaryKhmer: `កត់ត្រាវត្តមានប្រចាំថ្ងៃ — ជួយកំណត់អត្តសញ្ញាណសិស្សប្រឈមនឹងការបោះបង់ការសិក្សាទាន់ពេលវេលា។`,
      impactLevel: 'low',
      categoryKhmer: 'វត្តមាន & វិន័យ',
      confidenceScore: 0.92
    };
  }

  // 6. HEALTH CHECK
  if (domain === 'health' || actionType === 'health_check') {
    return {
      summaryKhmer: `ពិនិត្យសុខភាព និងអនាម័យសិស្ស — ជួយបង្ការការឆ្លងរោគរាតត្បាត និងជូនដំណឹងទាន់ពេលដល់ឪពុកម្តាយ។`,
      impactLevel: 'low',
      categoryKhmer: 'សុខភាពសិក្សា',
      confidenceScore: 0.93
    };
  }

  // 7. TEACHER & STAFF
  if (domain === 'teacher') {
    if (actionType === 'create') {
      return {
        summaryKhmer: `បន្ថែមគ្រូបង្រៀនថ្មី — ទាមទាររៀបចំកាលវិភាគ បែងចែកបន្ទុកថ្នាក់ និងផ្តល់សិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធ។`,
        impactLevel: 'high',
        categoryKhmer: 'ធនធានបុគ្គលិក',
        recommendedAction: 'បញ្ចូលក្នុងតារាងបែងចែកម៉ោងបង្រៀន',
        confidenceScore: 0.94
      };
    }
    return {
      summaryKhmer: `កែប្រែព័ត៌មានគ្រូបង្រៀន (${entityName}) — ប៉ះពាល់បន្ទុកម៉ោងបង្រៀន និងរបាយការណ៍ស្ថិតិបុគ្គលិកសាលា។`,
      impactLevel: 'medium',
      categoryKhmer: 'រដ្ឋបាលបុគ្គលិក',
      confidenceScore: 0.91
    };
  }

  // 8. ADMINISTRATIVE & CORRESPONDENCE
  if (domain === 'admin' || actionType === 'document' || actionType === 'approval') {
    return {
      summaryKhmer: `ចាត់ចែងលិខិតរដ្ឋបាលសាលា — ធានាលំហូរឯកសារផ្លូវការជាមួយមន្ទីរ/ការិយាល័យអប់រំ និងកំណត់កាលបរិច្ឆេទអនុវត្ត។`,
      impactLevel: 'medium',
      categoryKhmer: 'រដ្ឋបាលទូទៅ',
      confidenceScore: 0.90
    };
  }

  // Fallback Generic
  return {
    summaryKhmer: `កត់ត្រាសកម្មភាព «${title}» ក្នុងប្រព័ន្ធ — រក្សាប្រវត្តិ Audit Trail សម្រាប់សវនកម្មផ្ទៃក្នុងសាលា។`,
    impactLevel: 'low',
    categoryKhmer: 'សវនកម្មទូទៅ',
    confidenceScore: 0.85
  };
}

function getCategoryKhmer(domain: ActivityDomain): string {
  switch (domain) {
    case 'student': return 'កិច្ចការសិស្ស';
    case 'teacher': return 'បុគ្គលិក & គ្រូ';
    case 'finance': return 'ហិរញ្ញវត្ថុ';
    case 'academic': return 'ការសិក្សា';
    case 'health': return 'សុខភាព';
    case 'admin': return 'រដ្ឋបាលសាលា';
    default: return 'ទូទៅ';
  }
}
