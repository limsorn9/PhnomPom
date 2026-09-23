import {
  ActivityLogItem,
  ActivityHealthMetric
} from '../types';

/**
 * Evaluates risk score and factors for an individual activity log item
 * based on multi-dimensional thresholds.
 */
export function evaluateLogRisk(
  item: ActivityLogItem,
  allLogs: ActivityLogItem[] = []
): {
  isHighRisk: boolean;
  riskScore: number; // 0 - 100
  riskReasons: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
} {
  let score = 0;
  const reasons: string[] = [];

  const logDate = new Date(item.timestamp);
  const logHour = isNaN(logDate.getTime()) ? 12 : logDate.getHours();

  // 1. Off-Hours Administrative Changes (ម៉ោង ២២:០០ ដល់ ០៥:០០)
  if (logHour >= 22 || logHour < 5) {
    score += 30;
    reasons.push('សកម្មភាពរដ្ឋបាលក្រៅម៉ោងធ្វើការ (ចន្លោះម៉ោង ១០ យប់ ដល់ ៥ ភ្លឺ)');
  }

  // 2. High Financial Impact (> 1,000,000 ៛ ឬ > $250)
  const amountRiel = item.financialAmountRiel || 0;
  const amountUsd = item.financialAmountUsd || (amountRiel / 4000);
  if (amountRiel >= 2000000 || amountUsd >= 500) {
    score += 45;
    reasons.push(`ប្រតិបត្តិការហិរញ្ញវត្ថុទំហំធំខ្ពស់ (${amountRiel.toLocaleString()} ៛ / ~$${Math.round(amountUsd)})`);
  } else if (amountRiel >= 1000000 || amountUsd >= 250) {
    score += 30;
    reasons.push(`ប្រតិបត្តិការហិរញ្ញវត្ថុលើសកម្រិតស្តង់ដារ (${amountRiel.toLocaleString()} ៛)`);
  }

  // 3. Bulk Deletion & High Destructive Actions
  const isDeletion = item.actionType === 'delete';
  const descLower = (item.description || '').toLowerCase();
  const titleLower = (item.title || '').toLowerCase();
  const isBulkKeywords =
    descLower.includes('bulk') ||
    descLower.includes('batch') ||
    descLower.includes('ច្រើន') ||
    descLower.includes('ទាំងអស់') ||
    titleLower.includes('សម្អាត') ||
    titleLower.includes('លុបចោល');

  if (isDeletion && isBulkKeywords) {
    score += 55;
    reasons.push('ការលុបទិន្នន័យជាដុំ ឬសម្អាតទិន្នន័យច្រើនក្នុងពេលតែមួយ');
  } else if (isDeletion) {
    score += 35;
    reasons.push('ការលុបកំណត់ត្រាចេញពីប្រព័ន្ធ');
  }

  // 4. Unusual Frequency / Rapid Action Burst
  if (allLogs.length > 1 && !isNaN(logDate.getTime())) {
    const windowStart = logDate.getTime() - 10 * 60 * 1000; // 10 minutes before
    const windowEnd = logDate.getTime() + 10 * 60 * 1000; // 10 minutes after

    const sameActorBurst = allLogs.filter(l => {
      const d = new Date(l.timestamp).getTime();
      return (
        l.id !== item.id &&
        l.actorName === item.actorName &&
        !isNaN(d) &&
        d >= windowStart &&
        d <= windowEnd
      );
    });

    if (sameActorBurst.length >= 4) {
      score += 35;
      reasons.push(`ប្រេកង់សកម្មភាពញឹកញាប់ខុសប្រក្រតី (${sameActorBurst.length + 1} សកម្មភាព ក្នុងរយៈពេល ១០ នាទី)`);
    } else if (sameActorBurst.length >= 2 && isDeletion) {
      score += 30;
      reasons.push(`ការលុបទិន្នន័យបន្តបន្ទាប់ដោយបុគ្គលដដែល (${sameActorBurst.length + 1} ដង)`);
    }
  }

  // 5. Critical Score & Academic Changes (កែពិន្ទុឆមាស/ប្រឡងធំ)
  if (
    item.domain === 'academic' &&
    (item.actionType === 'score' || item.actionType === 'update') &&
    (titleLower.includes('ឆមាស') || titleLower.includes('ប្រឡង') || descLower.includes('កែសម្រួលពិន្ទុ'))
  ) {
    score += 25;
    reasons.push('ការកែប្រែពិន្ទុវាយតម្លៃ ឬលទ្ធផលប្រឡងផ្លូវការ');
  }

  // 6. Sensitive Admin & Security Actions (គណនី និងសិទ្ធិ)
  if (
    item.domain === 'admin' &&
    (descLower.includes('password') ||
      descLower.includes('role') ||
      descLower.includes('permission') ||
      descLower.includes('តួនាទី') ||
      descLower.includes('ផ្អាក'))
  ) {
    score += 35;
    reasons.push('ការកែសម្រួលតួនាទី ឬសិទ្ធិប្រើប្រាស់ប្រព័ន្ធរដ្ឋបាល');
  }

  // Cap score at 100
  const finalScore = Math.min(score, 100);
  const isHighRisk = finalScore >= 50;

  let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (finalScore >= 75) riskLevel = 'critical';
  else if (finalScore >= 50) riskLevel = 'high';
  else if (finalScore >= 25) riskLevel = 'medium';

  return {
    isHighRisk,
    riskScore: finalScore,
    riskReasons: reasons,
    riskLevel
  };
}

/**
 * Enriches activity logs with automated health monitor risk scores and reasons
 */
export function enrichLogsWithHealthAndRisk(logs: ActivityLogItem[]): ActivityLogItem[] {
  return logs.map(item => {
    const evalResult = evaluateLogRisk(item, logs);
    return {
      ...item,
      isHighRisk: evalResult.isHighRisk,
      riskScore: evalResult.riskScore,
      riskReasons: evalResult.riskReasons,
      riskLevel: evalResult.riskLevel
    };
  });
}

/**
 * Calculates school-wide activity audit health score and metric breakdown
 */
export function calculateSchoolActivityHealth(logs: ActivityLogItem[]): ActivityHealthMetric {
  if (!logs || logs.length === 0) {
    return {
      totalLogs: 0,
      healthScore: 100,
      healthStatus: 'excellent',
      healthStatusKhmer: 'សុវត្ថិភាពល្អឥតខ្ចោះ',
      highRiskCount: 0,
      bulkDeletionsCount: 0,
      offHoursCount: 0,
      rapidActionCount: 0,
      highFinanceCount: 0,
      unusualFrequencyCount: 0,
      systemHealthAssessment: 'មិនទាន់មានកំណត់ត្រាសកម្មភាពណាមួយបង្កជាហានិភ័យនៅឡើយ។ ប្រព័ន្ធមានសុវត្ថិភាពខ្ពស់។',
      recommendationsKhmer: ['រក្សាការតាមដានសកម្មភាពជាប្រចាំ ដើម្បីធានាសុវត្ថិភាពទិន្នន័យសាលា។']
    };
  }

  const enriched = enrichLogsWithHealthAndRisk(logs);

  let highRiskCount = 0;
  let bulkDeletionsCount = 0;
  let offHoursCount = 0;
  let rapidActionCount = 0;
  let highFinanceCount = 0;
  let unusualFrequencyCount = 0;

  enriched.forEach(log => {
    if (log.isHighRisk) highRiskCount++;

    const logDate = new Date(log.timestamp);
    const hour = isNaN(logDate.getTime()) ? 12 : logDate.getHours();
    if (hour >= 22 || hour < 5) offHoursCount++;

    if (log.actionType === 'delete') bulkDeletionsCount++;

    if ((log.financialAmountRiel || 0) >= 1000000 || (log.financialAmountUsd || 0) >= 250) {
      highFinanceCount++;
    }

    if (log.riskReasons?.some(r => r.includes('ប្រេកង់សកម្មភាពញឹកញាប់'))) {
      unusualFrequencyCount++;
      rapidActionCount++;
    }
  });

  // Calculate Health Score (Base 100 minus weighted penalties)
  let penalty = 0;
  penalty += highRiskCount * 8;
  penalty += bulkDeletionsCount * 4;
  penalty += offHoursCount * 3;
  penalty += unusualFrequencyCount * 5;
  penalty += highFinanceCount * 3;

  // Percentage normalization
  const total = logs.length;
  const riskRatio = highRiskCount / Math.max(total, 1);
  const healthScore = Math.max(Math.min(Math.round(100 - (penalty * (20 / Math.max(total, 10)) + riskRatio * 40)), 100), 20);

  let healthStatus: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
  let healthStatusKhmer = 'សុវត្ថិភាពល្អឥតខ្ចោះ';

  if (healthScore < 50 || highRiskCount >= 5) {
    healthStatus = 'critical';
    healthStatusKhmer = 'ហានិភ័យធ្ងន់ធ្ងរ';
  } else if (healthScore < 75 || highRiskCount >= 2) {
    healthStatus = 'warning';
    healthStatusKhmer = 'គួរប្រុងប្រយ័ត្ន & ពិនិត្យឡើងវិញ';
  } else if (healthScore < 90) {
    healthStatus = 'good';
    healthStatusKhmer = 'សុវត្ថិភាពល្អប្រសើរ';
  }

  const recommendationsKhmer: string[] = [];
  if (highRiskCount > 0) {
    recommendationsKhmer.push(`ពិនិត្យផ្ទៀងផ្ទាត់លើកំណត់ត្រាហានិភ័យខ្ពស់ចំនួន ${highRiskCount} ករណី ដើម្បីបញ្ជាក់ភាពត្រឹមត្រូវ។`);
  }
  if (offHoursCount > 0) {
    recommendationsKhmer.push(`មានសកម្មភាពក្រៅម៉ោងចំនួន ${offHoursCount} ករណី — សូមបញ្ជាក់អត្តសញ្ញាណអ្នកកែប្រែដើម្បីជៀសវាងការជ្រៀតចូល។`);
  }
  if (bulkDeletionsCount > 0) {
    recommendationsKhmer.push(`ពិនិត្យឯកសារយោង និងមូលហេតុនៃការលុបទិន្នន័យចំនួន ${bulkDeletionsCount} ករណី។`);
  }
  if (highFinanceCount > 0) {
    recommendationsKhmer.push(`ផ្ទៀងផ្ទាត់ប័ណ្ណទូទាត់ និងបង្កាន់ដៃចំណាយ/ចំណូលធំៗជាមួយគណៈកម្មការហិរញ្ញវត្ថុសាលា។`);
  }
  if (recommendationsKhmer.length === 0) {
    recommendationsKhmer.push('ប្រព័ន្ធសវនកម្មដំណើរការល្អឥតខ្ចោះ គ្មានសកម្មភាពគួរឱ្យសង្ស័យឡើយ។');
  }

  let systemHealthAssessment = '';
  if (healthStatus === 'excellent') {
    systemHealthAssessment = `ស្ថានភាពសវនកម្មសាលារៀនស្ថិតក្នុងកម្រិតល្អឥតខ្ចោះ (${healthScore}/100)។ មិនមានប្រតិបត្តិការខុសប្រក្រតី ឬហានិភ័យគួរឱ្យកត់សម្គាល់ទេ។`;
  } else if (healthStatus === 'good') {
    systemHealthAssessment = `ស្ថានភាពសវនកម្មស្ថិតក្នុងកម្រិតល្អប្រសើរ (${healthScore}/100) ជាមួយប្រតិបត្តិការរដ្ឋបាលស្របតាមច្បាប់ទូទៅ។`;
  } else if (healthStatus === 'warning') {
    systemHealthAssessment = `ប្រព័ន្ធបានរកឃើញកំណត់ត្រាគួរឱ្យសង្ស័យ (${highRiskCount} ហានិភ័យ) ដែលទាមទារឱ្យនាយក ឬរដ្ឋបាលពិនិត្យឡើងវិញ (${healthScore}/100)។`;
  } else {
    systemHealthAssessment = `ការព្រមានកម្រិតខ្ពស់! រកឃើញប្រតិបត្តិការលុបទិន្នន័យ ឬកែប្រែហិរញ្ញវត្ថុ/ពិន្ទុក្រៅម៉ោងញឹកញាប់ (${healthScore}/100)។`;
  }

  return {
    totalLogs: total,
    healthScore,
    healthStatus,
    healthStatusKhmer,
    highRiskCount,
    bulkDeletionsCount,
    offHoursCount,
    rapidActionCount,
    highFinanceCount,
    unusualFrequencyCount,
    systemHealthAssessment,
    recommendationsKhmer
  };
}
