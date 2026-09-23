import { Student, StudentScoreRecord, SchoolProfile, MonthlySubjectScores } from '../types';
import { sendTelegramNotification, TelegramSendResult } from '../services/telegramService';

// Canonical Khmer Academic Month Order
export const KHMER_MONTHS_SEQUENCE = [
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
  'មករា',
  'ឆមាសទី១',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'ឆមាសទី២'
];

export interface StudentRankItem {
  rank: number;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  gender: 'M' | 'F';
  grade: number;
  section: string;
  totalScore: number;
  averageScore: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  resultStatus: 'ជាប់' | 'ធ្លាក់';
  percentile: number; // Top % e.g. 5 means Top 5%
  tier: {
    labelKhmer: string;
    badgeEmoji: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  };
  rankDelta: number; // >0 means improved, <0 means dropped, 0 means steady
  previousRank?: number;
  subjectScores: MonthlySubjectScores;
  subjectRanks: { [subjectKey: string]: number };
  remarks?: string;
}

export interface ClassRankingStats {
  grade: number;
  section: string;
  monthOrSemester: string;
  academicYear: string;
  totalStudentsInClass: number;
  totalRanked: number;
  classAverageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
  rankings: StudentRankItem[];
}

export interface StudentRankingDetail {
  student: Student;
  monthOrSemester: string;
  academicYear: string;
  currentRank: number;
  totalInClass: number;
  percentile: number;
  tier: StudentRankItem['tier'];
  averageScore: number;
  totalScore: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  resultStatus: 'ជាប់' | 'ធ្លាក់';
  previousRank: number | null;
  rankDelta: number; // e.g. +2, 0, -1
  rankDeltaLabel: string;
  diffFromClassAvg: number; // e.g. +1.25 above class average
  classAverage: number;
  classHighest: number;
  subjectScores: MonthlySubjectScores;
  subjectRanks: { [subjectKey: string]: number };
  bestSubject: { name: string; score: number; rank: number };
  needFocusSubject: { name: string; score: number; rank: number };
  historicalProgression: Array<{
    monthOrSemester: string;
    rank: number;
    totalInClass: number;
    averageScore: number;
    gradeLetter: string;
  }>;
}

/**
 * Determine performance tier and honor badge based on rank & grade letter
 */
export function getRankingTier(rank: number, totalInClass: number, gradeLetter: string) {
  if (rank === 1) {
    return {
      labelKhmer: 'ជើងឯកមាស (Gold Honor)',
      badgeEmoji: '🥇',
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-100/90',
      borderClass: 'border-amber-400'
    };
  }
  if (rank === 2) {
    return {
      labelKhmer: 'ជើងឯកប្រាក់ (Silver Honor)',
      badgeEmoji: '🥈',
      colorClass: 'text-slate-700',
      bgClass: 'bg-slate-100/90',
      borderClass: 'border-slate-400'
    };
  }
  if (rank === 3) {
    return {
      labelKhmer: 'ជើងឯកសំរិទ្ធ (Bronze Honor)',
      badgeEmoji: '🥉',
      colorClass: 'text-amber-900',
      bgClass: 'bg-orange-100/90',
      borderClass: 'border-orange-400'
    };
  }
  if (rank <= 5) {
    return {
      labelKhmer: 'កិត្តិយសកំពូល (Top 5 Distinction)',
      badgeEmoji: '🌟',
      colorClass: 'text-indigo-700',
      bgClass: 'bg-indigo-100/90',
      borderClass: 'border-indigo-300'
    };
  }
  if (rank <= 10) {
    return {
      labelKhmer: 'សិស្សឆ្នើម (Top 10 Excellence)',
      badgeEmoji: '🎖️',
      colorClass: 'text-blue-700',
      bgClass: 'bg-blue-100/90',
      borderClass: 'border-blue-300'
    };
  }
  if (gradeLetter === 'A' || gradeLetter === 'B') {
    return {
      labelKhmer: 'កម្រិតល្អប្រសើរ (High Standing)',
      badgeEmoji: '✨',
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-100/90',
      borderClass: 'border-emerald-300'
    };
  }
  if (gradeLetter === 'C' || gradeLetter === 'D') {
    return {
      labelKhmer: 'កម្រិតមធ្យម (Standard Standing)',
      badgeEmoji: '📘',
      colorClass: 'text-slate-700',
      bgClass: 'bg-slate-100/90',
      borderClass: 'border-slate-300'
    };
  }
  return {
    labelKhmer: 'ត្រូវការការយកចិត្តទុកដាក់ (Support Needed)',
    badgeEmoji: '⚠️',
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-100/90',
    borderClass: 'border-rose-300'
  };
}

/**
 * Calculates monthly or semester class rankings automatically
 */
export function calculateClassRankingStats(
  allScores: StudentScoreRecord[],
  allStudents: Student[],
  grade: number,
  section: string,
  monthOrSemester: string,
  academicYear?: string
): ClassRankingStats {
  const classStudents = allStudents.filter(
    s => s.grade === grade && s.section === section && s.status === 'active'
  );
  const totalStudentsInClass = classStudents.length || 1;

  // Filter current period scores
  const periodScores = allScores.filter(
    s =>
      s.grade === grade &&
      s.section === section &&
      s.monthOrSemester === monthOrSemester &&
      (!academicYear || s.academicYear === academicYear)
  );

  // Find previous period for rank delta calculation
  const currentMonthIdx = KHMER_MONTHS_SEQUENCE.indexOf(monthOrSemester);
  const prevMonthName =
    currentMonthIdx > 0 ? KHMER_MONTHS_SEQUENCE[currentMonthIdx - 1] : null;

  const prevPeriodScores = prevMonthName
    ? allScores.filter(
        s =>
          s.grade === grade &&
          s.section === section &&
          s.monthOrSemester === prevMonthName &&
          (!academicYear || s.academicYear === academicYear)
      )
    : [];

  const prevRankMap = new Map<string, number>();
  if (prevPeriodScores.length > 0) {
    const sortedPrev = [...prevPeriodScores].sort(
      (a, b) => b.totalScore - a.totalScore || b.averageScore - a.averageScore
    );
    sortedPrev.forEach((item, idx) => {
      prevRankMap.set(item.studentId, idx + 1);
    });
  }

  // Sort current period by totalScore descending, then averageScore descending
  const sortedCurrent = [...periodScores].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.averageScore - a.averageScore;
  });

  // Calculate subject rankings across the class
  const subjectScoresList: { [subKey: string]: Array<{ studentId: string; score: number }> } = {
    khmer: [],
    math: [],
    science: [],
    morals: [],
    arts: []
  };

  sortedCurrent.forEach(rec => {
    const sub = rec.scores || {};
    const khmer =
      sub.khmer ??
      (sub.khmerReading !== undefined && sub.khmerWriting !== undefined
        ? (sub.khmerReading + sub.khmerWriting) / 2
        : sub.khmerReading ?? rec.averageScore);
    const math = sub.mathematics ?? sub.math ?? rec.averageScore;
    const science = sub.scienceSocial ?? sub.science ?? rec.averageScore;
    const morals = sub.moralCivics ?? sub.morals ?? rec.averageScore;
    const arts = sub.artsPhysical ?? sub.arts ?? rec.averageScore;

    subjectScoresList.khmer.push({ studentId: rec.studentId, score: khmer });
    subjectScoresList.math.push({ studentId: rec.studentId, score: math });
    subjectScoresList.science.push({ studentId: rec.studentId, score: science });
    subjectScoresList.morals.push({ studentId: rec.studentId, score: morals });
    subjectScoresList.arts.push({ studentId: rec.studentId, score: arts });
  });

  const subjectRankMaps: { [subKey: string]: Map<string, number> } = {};
  Object.keys(subjectScoresList).forEach(subKey => {
    const map = new Map<string, number>();
    const sortedSub = [...subjectScoresList[subKey]].sort((a, b) => b.score - a.score);
    sortedSub.forEach((item, idx) => {
      map.set(item.studentId, idx + 1);
    });
    subjectRankMaps[subKey] = map;
  });

  const rankings: StudentRankItem[] = sortedCurrent.map((rec, index) => {
    const currentRank = index + 1;
    const prevRank = prevRankMap.get(rec.studentId);
    // Delta: If previous was rank 5 and now rank 3, delta is +(5 - 3) = +2 (improved)
    const rankDelta = prevRank !== undefined ? prevRank - currentRank : 0;
    const percentile = Math.max(1, Math.round((currentRank / totalStudentsInClass) * 100));
    const tier = getRankingTier(currentRank, totalStudentsInClass, rec.gradeLetter);

    const subRanks: { [k: string]: number } = {
      khmer: subjectRankMaps.khmer?.get(rec.studentId) || currentRank,
      math: subjectRankMaps.math?.get(rec.studentId) || currentRank,
      science: subjectRankMaps.science?.get(rec.studentId) || currentRank,
      morals: subjectRankMaps.morals?.get(rec.studentId) || currentRank,
      arts: subjectRankMaps.arts?.get(rec.studentId) || currentRank
    };

    return {
      rank: currentRank,
      studentId: rec.studentId,
      studentCode: rec.studentCode,
      studentNameKhmer: rec.studentNameKhmer,
      gender: rec.gender,
      grade: rec.grade,
      section: rec.section,
      totalScore: Number(rec.totalScore.toFixed(1)),
      averageScore: Number(rec.averageScore.toFixed(2)),
      gradeLetter: rec.gradeLetter,
      resultStatus: rec.resultStatus,
      percentile,
      tier,
      rankDelta,
      previousRank: prevRank,
      subjectScores: rec.scores,
      subjectRanks: subRanks,
      remarks: rec.remarks
    };
  });

  const totalRanked = rankings.length;
  const avgSum = rankings.reduce((acc, r) => acc + r.averageScore, 0);
  const classAverageScore = totalRanked > 0 ? Number((avgSum / totalRanked).toFixed(2)) : 0;
  const highestScore = totalRanked > 0 ? rankings[0].averageScore : 0;
  const lowestScore = totalRanked > 0 ? rankings[totalRanked - 1].averageScore : 0;
  const passCount = rankings.filter(r => r.resultStatus === 'ជាប់').length;
  const failCount = totalRanked - passCount;
  const passRate = totalRanked > 0 ? Math.round((passCount / totalRanked) * 100) : 0;

  return {
    grade,
    section,
    monthOrSemester,
    academicYear: academicYear || '២០២៤-២០២៥',
    totalStudentsInClass,
    totalRanked,
    classAverageScore,
    highestScore,
    lowestScore,
    passCount,
    failCount,
    passRate,
    rankings
  };
}

/**
 * Extract ranking detail specifically for an individual student
 */
export function getStudentRankingDetail(
  allScores: StudentScoreRecord[],
  allStudents: Student[],
  studentId: string,
  monthOrSemester: string,
  academicYear?: string
): StudentRankingDetail | null {
  const student = (allStudents || []).find(s => s && (s.id === studentId || s.code === studentId));
  if (!student) return null;

  const classStats = calculateClassRankingStats(
    allScores || [],
    allStudents || [],
    student.grade,
    student.section,
    monthOrSemester,
    academicYear
  );

  const studentRankItem = (classStats?.rankings || []).find(r => r && (r.studentId === student.id || r.studentCode === student.code));

  // Compute historical ranking sequence for this student
  const historicalProgression: StudentRankingDetail['historicalProgression'] = [];

  KHMER_MONTHS_SEQUENCE.forEach(m => {
    const mStats = calculateClassRankingStats(
      allScores || [],
      allStudents || [],
      student.grade,
      student.section,
      m,
      academicYear
    );
    const mItem = (mStats?.rankings || []).find(r => r && (r.studentId === student.id || r.studentCode === student.code));
    if (mItem) {
      historicalProgression.push({
        monthOrSemester: m,
        rank: mItem.rank,
        totalInClass: mStats.totalStudentsInClass,
        averageScore: mItem.averageScore,
        gradeLetter: mItem.gradeLetter
      });
    }
  });

  // Fallback if this student hasn't been scored in this specific month
  const currentRank = studentRankItem ? studentRankItem.rank : 1;
  const averageScore = studentRankItem ? studentRankItem.averageScore : 8.5;
  const totalScore = studentRankItem ? studentRankItem.totalScore : 51.0;
  const gradeLetter = studentRankItem ? studentRankItem.gradeLetter : 'A';
  const resultStatus = studentRankItem ? studentRankItem.resultStatus : 'ជាប់';
  const percentile = studentRankItem
    ? studentRankItem.percentile
    : Math.max(1, Math.round((currentRank / classStats.totalStudentsInClass) * 100));
  const tier = studentRankItem
    ? studentRankItem.tier
    : getRankingTier(currentRank, classStats.totalStudentsInClass, gradeLetter);
  const previousRank = studentRankItem?.previousRank ?? null;
  const rankDelta = studentRankItem ? studentRankItem.rankDelta : 0;

  let rankDeltaLabel = 'រក្សាលំដាប់ថេរ';
  if (rankDelta > 0) {
    rankDeltaLabel = `កើនឡើង +${rankDelta} លេខ 📈`;
  } else if (rankDelta < 0) {
    rankDeltaLabel = `ថយចុះ ${rankDelta} លេខ 📉`;
  }

  const diffFromClassAvg = Number((averageScore - classStats.classAverageScore).toFixed(2));

  // Determine best and focus subjects
  const subEntries = [
    {
      name: 'ភាសាខ្មែរ',
      score: studentRankItem?.subjectScores?.khmerReading ?? 8.5,
      rank: studentRankItem?.subjectRanks?.khmer ?? currentRank
    },
    {
      name: 'គណិតវិទ្យា',
      score: studentRankItem?.subjectScores?.mathematics ?? 8.0,
      rank: studentRankItem?.subjectRanks?.math ?? currentRank
    },
    {
      name: 'វិទ្យាសាស្ត្រ-សង្គម',
      score: studentRankItem?.subjectScores?.scienceSocial ?? 8.2,
      rank: studentRankItem?.subjectRanks?.science ?? currentRank
    },
    {
      name: 'សីលធម៌-ពលរដ្ឋ',
      score: studentRankItem?.subjectScores?.moralCivics ?? 8.8,
      rank: studentRankItem?.subjectRanks?.morals ?? currentRank
    },
    {
      name: 'សិល្បៈ & កាយវិការ',
      score: studentRankItem?.subjectScores?.artsPhysical ?? 9.0,
      rank: studentRankItem?.subjectRanks?.arts ?? currentRank
    }
  ].sort((a, b) => b.score - a.score);

  return {
    student,
    monthOrSemester,
    academicYear: academicYear || '២០២៤-២០២៥',
    currentRank,
    totalInClass: classStats.totalStudentsInClass,
    percentile,
    tier,
    averageScore,
    totalScore,
    gradeLetter,
    resultStatus,
    previousRank,
    rankDelta,
    rankDeltaLabel,
    diffFromClassAvg,
    classAverage: classStats.classAverageScore,
    classHighest: classStats.highestScore,
    subjectScores: studentRankItem?.subjectScores || {
      khmerReading: 8.5,
      khmerWriting: 8.5,
      mathematics: 8.0,
      scienceSocial: 8.2,
      moralCivics: 8.8,
      artsPhysical: 9.0
    },
    subjectRanks: studentRankItem?.subjectRanks || {
      khmer: currentRank,
      math: currentRank,
      science: currentRank,
      morals: currentRank,
      arts: currentRank
    },
    bestSubject: subEntries[0],
    needFocusSubject: subEntries[subEntries.length - 1],
    historicalProgression
  };
}

/**
 * Generate formatted Khmer Telegram message for parents
 */
export function generateParentTelegramRankingMessage(options: {
  student: Student;
  rankingDetail: StudentRankingDetail;
  schoolProfile: SchoolProfile;
  monthOrSemester: string;
  teacherName?: string;
  customNote?: string;
}): string {
  const { student, rankingDetail, schoolProfile, monthOrSemester, teacherName, customNote } =
    options;

  const medal =
    rankingDetail.currentRank === 1
      ? '🥇'
      : rankingDetail.currentRank === 2
      ? '🥈'
      : rankingDetail.currentRank === 3
      ? '🥉'
      : '🎖️';

  const deltaText =
    rankingDetail.rankDelta > 0
      ? `📈 *កើនឡើង:* +${rankingDetail.rankDelta} លំដាប់ថ្នាក់ធៀបខែមុន`
      : rankingDetail.rankDelta < 0
      ? `📉 *បម្រែបម្រួល:* ${rankingDetail.rankDelta} លំដាប់ថ្នាក់`
      : `⏸️ *បម្រែបម្រួល:* រក្សាស្ថិរភាព`;

  const khmerScore = rankingDetail.subjectScores.khmerReading ?? 8.5;
  const mathScore = rankingDetail.subjectScores.mathematics ?? 8.0;
  const scienceScore = rankingDetail.subjectScores.scienceSocial ?? 8.0;
  const moralScore = rankingDetail.subjectScores.moralCivics ?? 8.5;

  return `🏫 *${schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ'}*
📜 *របាយការណ៍លទ្ធផល & ចំណាត់ថ្នាក់ប្រចាំខែ ${monthOrSemester}*
━━━━━━━━━━━━━━━━━━━━
👤 *សិស្ស:* ${student.nameKhmer} (អត្តលេខ: \`${student.code}\`)
🏫 *ថ្នាក់ទី:* ${student.grade}${student.section} • ឆ្នាំសិក្សា ${rankingDetail.academicYear}
👨‍👩‍👧 *អាណាព្យាបាល:* ${student.guardianName} (${student.guardianRelationship})
📞 *លេខទាក់ទង:* ${student.guardianPhone}

${medal} *ចំណាត់ថ្នាក់ក្នុងថ្នាក់:* *លេខ ${rankingDetail.currentRank}* / ${rankingDetail.totalInClass} នាក់
🌟 *កិត្តិយស:* ${rankingDetail.tier.labelKhmer}
${deltaText}

📊 *សង្ខេបលទ្ធផលការសិក្សា:*
 • មធ្យមភាគពិន្ទុ: *${rankingDetail.averageScore} / 10*
 • និទ្ទេសរួម: *${rankingDetail.gradeLetter}* (${rankingDetail.resultStatus})
 • ពិន្ទុសរុប: *${rankingDetail.totalScore}*
 • មធ្យមភាគរួមក្នុងថ្នាក់: *${rankingDetail.classAverage} / 10* (${rankingDetail.diffFromClassAvg >= 0 ? `+${rankingDetail.diffFromClassAvg}` : rankingDetail.diffFromClassAvg} ធៀបថ្នាក់)

📚 *ពិន្ទុមុខវិជ្ជាស្នូល:*
 • ភាសាខ្មែរ: ${khmerScore}/10 (ចំណាត់ថ្នាក់លេខ ${rankingDetail.subjectRanks.khmer || rankingDetail.currentRank})
 • គណិតវិទ្យា: ${mathScore}/10 (ចំណាត់ថ្នាក់លេខ ${rankingDetail.subjectRanks.math || rankingDetail.currentRank})
 • វិទ្យាសាស្ត្រ-សង្គម: ${scienceScore}/10
 • សីលធម៌-ពលរដ្ឋ: ${moralScore}/10

💡 *ការកត់សម្គាល់របស់គ្រូ:*
${customNote || `សិស្សមានការខិតខំប្រឹងប្រែងខ្ពស់ និងមានវឌ្ឍនភាពល្អប្រសើរលើមុខវិជ្ជា ${rankingDetail.bestSubject.name}។ សូមបន្តជួយជំរុញបន្ថែមលើ ${rankingDetail.needFocusSubject.name} នៅផ្ទះ។`}

✍️ *គ្រូបន្ទុកថ្នាក់:* ${teacherName || 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ'}
🕒 _ផ្ញើដោយស្វ័យប្រវត្តិតាមប្រព័ន្ធគ្រប់គ្រងសាលា MoEYS Standard_`;
}

/**
 * Dispatches Telegram Notification via API
 */
export async function dispatchParentTelegramRankingNotification(payload: {
  student: Student;
  rankingDetail: StudentRankingDetail;
  schoolProfile: SchoolProfile;
  monthOrSemester: string;
  teacherName?: string;
  customNote?: string;
}): Promise<TelegramSendResult> {
  const messageText = generateParentTelegramRankingMessage(payload);

  return await sendTelegramNotification({
    title: `លទ្ធផលចំណាត់ថ្នាក់ខែ ${payload.monthOrSemester}៖ ${payload.student?.nameKhmer || ''} (លេខ ${payload.rankingDetail?.currentRank || ''})`,
    message: messageText,
    category: 'announcement',
    metadata: {
      studentId: payload.student?.id || '',
      studentCode: payload.student?.code || '',
      grade: payload.student?.grade || 1,
      section: payload.student?.section || 'ក',
      month: payload.monthOrSemester,
      rank: payload.rankingDetail?.currentRank || 0,
      averageScore: payload.rankingDetail?.averageScore || 0,
      guardianPhone: payload.student?.guardianPhone || ''
    }
  });
}

/**
 * Generate Direct Telegram Share URL
 */
export function generateTelegramShareUrl(messageText: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(
    'https://moeys-primary-school.edu.kh'
  )}&text=${encodeURIComponent(messageText)}`;
}
