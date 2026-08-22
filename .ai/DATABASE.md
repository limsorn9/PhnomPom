# DATABASE & SCHEMA SPECIFICATION
**Project:** PhnomPom Primary School Management System
**Primary Storage Engines:** LocalStorage State Store (`phnom_pom_primary_school_data_v2`), Firebase Firestore Integration Ready, Google Drive Snapshot Sync

---

## 1. Core Data Models & Collections

### 1.1 School Profile (`schoolProfile`)
```typescript
interface SchoolProfile {
  nameKhmer: string;          // ឧ. "សាលាបឋមសិក្សាភ្នំពុំ"
  nameLatin: string;          // "Phnom Pom Primary School"
  schoolCode: string;         // "020401015"
  province: string;           // "ខេត្តបាត់ដំបង"
  district: string;           // "ស្រុកភ្នំព្រឹក"
  commune: string;            // "ឃុំបារាំងធ្លាក់"
  village: string;            // "ភូមិអូរគល់សំយ៉ុង"
  principalName: string;      // "លោក លីម សន"
  principalPhone: string;     // "087 99 19 77"
  deputyPrincipalName: string;// "លោក ឈិន សុផល"
  academicYear: string;       // "២០២៤ - ២០២៥"
  establishedYear: string;    // "២០០៥"
  cluster: string;            // "កម្រងសាលាបឋមសិក្សាភ្នំព្រឹក"
  email: string;              // "phnompom.primary@moeys.gov.kh"
  logoUrl?: string;
  mapUrl?: string;
  facebookPage?: string;
  gradingScaleType?: 'khmer_term' | 'letter';
}
```

### 1.2 Students Collection (`students`)
```typescript
interface Student {
  id: string;                 // UUID e.g. "s-101"
  code: string;               // Student Code e.g. "STU-2024-001"
  nameKhmer: string;          // "សួន ពិសិដ្ឋ"
  nameLatin: string;          // "Suon Piseth"
  gender: 'M' | 'F';
  dob: string;                // YYYY-MM-DD
  pob: string;                // ទីកន្លែងកំណើត
  grade: number;              // 1 - 6
  section: string;            // "ក", "ខ", "គ"
  guardianName: string;
  guardianPhone: string;
  guardianOccupation: string;
  guardianRelationship: string;
  address: string;
  livingCondition?: string;   // "ក្រ១", "ក្រ២", "ទូទៅ"
  idPoorCardNumber?: string;  // ប័ណ្ណក្រីក្រ
  isOrphan?: string;
  isDisability?: boolean | string;
  hasScholarship?: boolean | string;
  academicHistory?: string;   // "ឡើងថ្នាក់", "ត្រួតថ្នាក់", "ផ្ទេរចូល"
  status: 'active' | 'transferred' | 'dropped' | 'graduated';
  health: HealthRecord;       // { heightCm, weightKg, bmi, nutritionStatus, vaccinated, bloodType }
  attendance: AttendanceSummary; // { present, absentWithPermission, absentWithoutPermission, totalDays }
}
```

### 1.3 Teachers Collection (`teachers`)
```typescript
interface Teacher {
  id: string;
  staffCode: string;          // "MOEYS-104921"
  nameKhmer: string;
  nameLatin: string;
  gender: 'M' | 'F';
  dob: string;
  phone: string;
  email: string;
  qualification: string;
  role: string;               // "នាយកសាលា", "គ្រូបន្ទុកថ្នាក់", "បណ្ណារក្ស", etc.
  assignedGrade?: number;
  assignedSection?: string;
  yearsOfService: number;
  startDate: string;
  status: 'active' | 'on_leave' | 'transferred';
  schedule: DutyScheduleItem[];
}
```

### 1.4 Assessment & Scores Collection (`scores`)
```typescript
interface StudentScoreRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  gender: 'M' | 'F';
  grade: number;
  section: string;
  monthOrSemester: string;    // "តុលា", "វិច្ឆិកា", "ធ្នូ", ..., "ឆមាសទី១", "ឆមាសទី២"
  academicYear: string;
  scores: MonthlySubjectScores; // { listening, writing, reading, speaking, numbers, measurement, geometry, science, socialStudies, moralCivics, lifeSkills, physicalHealth, ... }
  totalScore: number;
  averageScore: number;
  rank: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  resultStatus: 'ជាប់' | 'ធ្លាក់';
  remarks?: string;
}
```

### 1.5 Additional Core Collections
- `attendanceRecords`: Daily attendance with session (morning/afternoon) and status (present/permission/absent).
- `studentBadges`: Digital badge assignments (studentId, badgeId, badge definition, tier, points, date, reason).
- `badgeDefinitions`: 16+ predefined system badges with icons, tiers, points, and criteria.
- `atRiskStudents`: Struggling student intervention plans, baseline/current/target scores, progress logs.
- `dailyClassLogs`: Daily shift notes, atmosphere mood, incident reports.
- `lessonPlans`: 5-step MoEYS structured lesson plans.
- `parentMeetings`: Parent meeting records, agendas, attendee counts, resolutions, representative officers.
- `parentRequests`: Parent leaves, health notifications, and consultation requests.
- `classCouncils`: Student class officers (President, Study, Discipline, Hygiene, Sports).
- `officialCorrespondence`: Inward/outward official letters with log numbers and classification.
- `householdCensus`: Community census data with GPS coordinates, housing type, IDPoor cards, family rosters.
- `libraryBooks` & `libraryReadingLogs`: Library physical/digital inventory and student borrowing/reading logs.
- `budgetTransactions`: State budget (PB), SIG, and community cash flows.
- `schoolAssets`: Infrastructure, furniture, and IT equipment inventory.
- `modelSchoolStandards`: 5 Ministry Model School standards and 15+ evaluation criteria.
- `appUsers` & `notifications`: User authentication directory, system alerts, and notification dispatches.
