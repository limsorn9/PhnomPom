import { Student, StudentScoreRecord, DailyAttendanceRecord, StudentRiskAlert } from '../types';

const MONTH_ORDER = [
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

export function getStudentRiskAlert(
  student: Student,
  allScores: StudentScoreRecord[],
  allAttendance: DailyAttendanceRecord[]
): StudentRiskAlert {
  // 1. Calculate Consecutive Absences
  const studentAttendance = allAttendance
    .filter(r => r.studentId === student.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  let maxStreak = 0;
  let currentStreak = 0;
  let currentDates: string[] = [];
  let maxDates: string[] = [];

  studentAttendance.forEach(record => {
    if (record.status === 'absent') {
      currentStreak++;
      currentDates.push(record.date);
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxDates = [...currentDates];
      }
    } else {
      currentStreak = 0;
      currentDates = [];
    }
  });

  // Check if either the overall max streak is >= 3 or recent current streak is >= 3
  const hasConsecutiveAbsenceAlert = maxStreak >= 3 || (studentAttendance.length >= 3 && studentAttendance.slice(-3).every(r => r.status === 'absent'));
  const consecutiveAbsenceCount = maxStreak >= 3 ? maxStreak : (studentAttendance.slice(-3).every(r => r.status === 'absent') ? 3 : maxStreak);
  const consecutiveAbsenceDates = maxDates.length >= 3 ? maxDates : currentDates;

  // 2. Calculate Score Drop compared to previous grading period
  const studentScores = allScores
    .filter(s => s.studentId === student.id)
    .sort((a, b) => {
      const idxA = MONTH_ORDER.indexOf(a.monthOrSemester);
      const idxB = MONTH_ORDER.indexOf(b.monthOrSemester);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.monthOrSemester.localeCompare(b.monthOrSemester);
    });

  let hasScoreDropAlert = false;
  let scoreDropAmount = 0;
  let previousPeriodScore: { period: string; average: number } | null = null;
  let latestPeriodScore: { period: string; average: number } | null = null;

  if (studentScores.length >= 2) {
    const latest = studentScores[studentScores.length - 1];
    const previous = studentScores[studentScores.length - 2];

    const prevAvg = previous.averageScore;
    const latestAvg = latest.averageScore;

    if (latestAvg < prevAvg) {
      const drop = Number((prevAvg - latestAvg).toFixed(2));
      if (drop >= 0.2) { // Meaningful drop of 0.2 or more
        hasScoreDropAlert = true;
        scoreDropAmount = drop;
        previousPeriodScore = {
          period: previous.monthOrSemester,
          average: prevAvg
        };
        latestPeriodScore = {
          period: latest.monthOrSemester,
          average: latestAvg
        };
      }
    }
  }

  // 3. Formulate readable Khmer summary
  const summaryParts: string[] = [];
  if (hasConsecutiveAbsenceAlert) {
    summaryParts.push(`អវត្តមាន ${consecutiveAbsenceCount} ថ្ងៃជាប់គ្នា`);
  }
  if (hasScoreDropAlert && previousPeriodScore && latestPeriodScore) {
    summaryParts.push(`ពិន្ទុមធ្យមភាគធ្លាក់ចុះ -${scoreDropAmount} ពិន្ទុ (ពី ${previousPeriodScore.period} ${previousPeriodScore.average} មក ${latestPeriodScore.period} ${latestPeriodScore.average})`);
  }

  return {
    studentId: student.id,
    hasConsecutiveAbsenceAlert,
    consecutiveAbsenceCount,
    consecutiveAbsenceDates,
    hasScoreDropAlert,
    scoreDropAmount,
    previousPeriodScore,
    latestPeriodScore,
    alertSummary: summaryParts.join(' និង ')
  };
}

export function getAllStudentRiskAlerts(
  students: Student[],
  scores: StudentScoreRecord[],
  attendance: DailyAttendanceRecord[]
): Map<string, StudentRiskAlert> {
  const map = new Map<string, StudentRiskAlert>();
  students.forEach(st => {
    map.set(st.id, getStudentRiskAlert(st, scores, attendance));
  });
  return map;
}
