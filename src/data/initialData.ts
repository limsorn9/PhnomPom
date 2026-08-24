import {
  Student,
  Teacher,
  Classroom,
  StudentScoreRecord,
  BudgetTransaction,
  SchoolProfile,
  DailyAttendanceRecord,
  AcademicCalendarEvent,
  StudentTransferRecord,
  ExamSubject,
  ProfileEditRequest,
  AppUser,
  SystemNotification,
  LessonPlan,
  ParentMeeting,
  ParentRequest,
  ClassCouncil,
  OfficialCorrespondence,
  StaffAdministrativeRecord,
  SchoolCommittee,
  SchoolStrategicPlanItem,
  ModelSchoolStandardGroup,
  SchoolAssetItem,
  AtRiskStudent,
  DailyClassLog,
  BadgeDefinition,
  StudentBadgeAssignment,
  SchoolEquipmentItem,
  EquipmentLoanRecord,
  TeacherDailyTask,
  TeacherMeetingRecord,
  TeachingResourceFile
} from '../types';

export const initialSchoolProfile: SchoolProfile = {
  nameKhmer: 'សាលាបឋមសិក្សាភ្នំពុំ',
  nameLatin: 'Phnom Pom Primary School',
  schoolCode: '020401015',
  province: 'ខេត្តបាត់ដំបង',
  district: 'ស្រុកភ្នំព្រឹក',
  commune: 'ឃុំបារាំងធ្លាក់',
  village: 'ភូមិអូរគល់សំយ៉ុង',
  principalName: 'លោក លីម សន',
  principalPhone: '087 99 19 77',
  deputyPrincipalName: 'លោក ឈិន សុផល',
  academicYear: '២០២៤ - ២០២៥',
  establishedYear: '២០០៥',
  cluster: 'កម្រងសាលាបឋមសិក្សាភ្នំព្រឹក',
  email: 'phnompom.primary@moeys.gov.kh',
  logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
  mapUrl: 'https://maps.app.goo.gl/ackTYSYsd7t54vGP6',
  facebookPage: 'https://web.facebook.com/%E1%9E%9F%E1%9E%B6%E1%9E%9B%E1%9E%B6%E1%9E%94%E1%9E%8B%E1%9E%98%E1%9E%9F%E1%9E%B7%E1%9E%80%E1%9F%92%E1%9E%9F%E1%9E%B6%E1%9E%97%E1%9F%92%E1%9E%93%E1%9F%86%E1%9E%96%E1%9E%BB%E1%9F%86-PhnomPom-Primary-School/61553220989324/'
};

export const initialTeachers: Teacher[] = [
  {
    id: 't-1',
    staffCode: 'MOEYS-104921',
    nameKhmer: 'លោក លីម សន',
    nameLatin: 'Lim Sorn',
    gender: 'M',
    dob: '1980-05-12',
    phone: '087 99 19 77',
    email: 'limsorn9@gmail.com',
    qualification: 'បរិញ្ញាបត្រជាន់ខ្ពស់ គ្រប់គ្រងអប់រំ',
    role: 'នាយកសាលា',
    yearsOfService: 20,
    startDate: '2004-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'ប្រជុំគណៈគ្រប់គ្រង & ផែនការសាលា', timeSlot: '07:30 - 08:30', gradeClass: 'រដ្ឋបាល' },
      { day: 'ព្រហស្បតិ៍', subject: 'ចុះពិនិត្យការបង្រៀន & ថ្នាក់រៀន', timeSlot: '08:30 - 10:00', gradeClass: 'ថ្នាក់ទី៦ក' }
    ]
  },
  {
    id: 't-2',
    staffCode: 'MOEYS-108234',
    nameKhmer: 'លោក ចាន់ វុទ្ធី',
    nameLatin: 'Chan Vuthy',
    gender: 'M',
    dob: '1982-08-20',
    phone: '017 890 123',
    email: 'vuthy.chan@moeys.gov.kh',
    qualification: 'បរិញ្ញាបត្រគរុកោសល្យ',
    role: 'នាយករង & គ្រូថ្នាក់ទី៦ក',
    assignedGrade: 6,
    assignedSection: 'ក',
    yearsOfService: 19,
    startDate: '2005-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'ភាសាខ្មែរ', timeSlot: '07:30 - 09:00', gradeClass: '៦ក' },
      { day: 'ចន្ទ', subject: 'គណិតវិទ្យា', timeSlot: '09:30 - 10:30', gradeClass: '៦ក' },
      { day: 'អង្គារ', subject: 'វិទ្យាសាស្ត្រ', timeSlot: '07:30 - 09:00', gradeClass: '៦ក' }
    ]
  },
  {
    id: 't-3',
    staffCode: 'MOEYS-112045',
    nameKhmer: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
    nameLatin: 'Sim Sreymom',
    gender: 'F',
    dob: '1988-11-12',
    phone: '092 445 566',
    email: 'sreymom.sim@moeys.gov.kh',
    qualification: 'គរុកោសល្យ ១២+២',
    role: 'គ្រូបន្ទុកថ្នាក់ទី១ក',
    assignedGrade: 1,
    assignedSection: 'ក',
    yearsOfService: 14,
    startDate: '2010-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'ភាសាខ្មែរ (អំណាន)', timeSlot: '07:30 - 08:30', gradeClass: '១ក' },
      { day: 'ចន្ទ', subject: 'គណិតវិទ្យា', timeSlot: '08:45 - 09:30', gradeClass: '១ក' },
      { day: 'ពុធ', subject: 'គំនូរ និងចម្រៀង', timeSlot: '09:30 - 10:30', gradeClass: '១ក' }
    ]
  },
  {
    id: 't-4',
    staffCode: 'MOEYS-115890',
    nameKhmer: 'អ្នកគ្រូ ហេង រចនា',
    nameLatin: 'Heng Rachana',
    gender: 'F',
    dob: '1990-03-25',
    phone: '089 778 899',
    email: 'rachana.heng@moeys.gov.kh',
    qualification: 'បរិញ្ញាបត្រអក្សរសាស្ត្រខ្មែរ',
    role: 'គ្រូបន្ទុកថ្នាក់ទី២ក',
    assignedGrade: 2,
    assignedSection: 'ក',
    yearsOfService: 11,
    startDate: '2013-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'ភាសាខ្មែរ', timeSlot: '07:30 - 09:00', gradeClass: '២ក' },
      { day: 'អង្គារ', subject: 'គណិតវិទ្យា', timeSlot: '07:30 - 08:30', gradeClass: '២ក' }
    ]
  },
  {
    id: 't-5',
    staffCode: 'MOEYS-117342',
    nameKhmer: 'លោក គង់ សម្បត្តិ',
    nameLatin: 'Kong Sambath',
    gender: 'M',
    dob: '1986-06-18',
    phone: '070 234 567',
    email: 'sambath.kong@moeys.gov.kh',
    qualification: 'គរុកោសល្យ ១២+២',
    role: 'គ្រូបន្ទុកថ្នាក់ទី៣ក',
    assignedGrade: 3,
    assignedSection: 'ក',
    yearsOfService: 15,
    startDate: '2009-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'ភាសាខ្មែរ', timeSlot: '07:30 - 09:00', gradeClass: '៣ក' },
      { day: 'ពុធ', subject: 'សិក្សាសង្គម', timeSlot: '08:30 - 09:30', gradeClass: '៣ក' }
    ]
  },
  {
    id: 't-6',
    staffCode: 'MOEYS-119420',
    nameKhmer: 'អ្នកគ្រូ កែវ សុគន្ធា',
    nameLatin: 'Keo Sokunthea',
    gender: 'F',
    dob: '1992-09-05',
    phone: '096 333 444',
    email: 'sokunthea.keo@moeys.gov.kh',
    qualification: 'បរិញ្ញាបត្រវិទ្យាសាស្ត្រអប់រំ',
    role: 'គ្រូបន្ទុកថ្នាក់ទី៤ក',
    assignedGrade: 4,
    assignedSection: 'ក',
    yearsOfService: 8,
    startDate: '2016-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'វិទ្យាសាស្ត្រ', timeSlot: '07:30 - 08:30', gradeClass: '៤ក' },
      { day: 'អង្គារ', subject: 'គណិតវិទ្យា', timeSlot: '08:30 - 09:30', gradeClass: '៤ក' }
    ]
  },
  {
    id: 't-7',
    staffCode: 'MOEYS-120551',
    nameKhmer: 'លោក ស៊ុន ដារ៉ា',
    nameLatin: 'Sun Dara',
    gender: 'M',
    dob: '1989-12-30',
    phone: '015 678 901',
    email: 'dara.sun@moeys.gov.kh',
    qualification: 'បរិញ្ញាបត្រគរុកោសល្យ',
    role: 'គ្រូបន្ទុកថ្នាក់ទី៥ក',
    assignedGrade: 5,
    assignedSection: 'ក',
    yearsOfService: 12,
    startDate: '2012-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'គណិតវិទ្យា', timeSlot: '07:30 - 09:00', gradeClass: '៥ក' },
      { day: 'ព្រហស្បតិ៍', subject: 'ភាសាខ្មែរ', timeSlot: '08:30 - 10:00', gradeClass: '៥ក' }
    ]
  },
  {
    id: 't-8',
    staffCode: 'MOEYS-122119',
    nameKhmer: 'អ្នកគ្រូ ពេជ្រ ធីតា',
    nameLatin: 'Pich Thida',
    gender: 'F',
    dob: '1995-02-14',
    phone: '088 990 011',
    email: 'thida.pich@moeys.gov.kh',
    qualification: 'បរិញ្ញាបត្រ បណ្ណារក្ស និងព័ត៌មានវិទ្យា',
    role: 'បណ្ណារក្ស & រដ្ឋបាល',
    yearsOfService: 6,
    startDate: '2018-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schedule: [
      { day: 'ចន្ទ', subject: 'គ្រប់គ្រងម៉ោងអានសៀវភៅ', timeSlot: '08:00 - 10:30', gradeClass: 'បណ្ណាល័យ' }
    ]
  }
];

export const initialClassrooms: Classroom[] = [
  { id: 'c-1', grade: 1, section: 'ក', roomNumber: 'A101', homeroomTeacherId: 't-3', homeroomTeacherName: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ', academicYear: '២០២៤ - ២០២៥', capacity: 35 },
  { id: 'c-2', grade: 2, section: 'ក', roomNumber: 'A102', homeroomTeacherId: 't-4', homeroomTeacherName: 'អ្នកគ្រូ ហេង រចនា', academicYear: '២០២៤ - ២០២៥', capacity: 35 },
  { id: 'c-3', grade: 3, section: 'ក', roomNumber: 'A103', homeroomTeacherId: 't-5', homeroomTeacherName: 'លោក គង់ សម្បត្តិ', academicYear: '២០២៤ - ២០២៥', capacity: 35 },
  { id: 'c-4', grade: 4, section: 'ក', roomNumber: 'B201', homeroomTeacherId: 't-6', homeroomTeacherName: 'អ្នកគ្រូ កែវ សុគន្ធា', academicYear: '២០២៤ - ២០២៥', capacity: 35 },
  { id: 'c-5', grade: 5, section: 'ក', roomNumber: 'B202', homeroomTeacherId: 't-7', homeroomTeacherName: 'លោក ស៊ុន ដារ៉ា', academicYear: '២០២៤ - ២០២៥', capacity: 35 },
  { id: 'c-6', grade: 6, section: 'ក', roomNumber: 'B203', homeroomTeacherId: 't-2', homeroomTeacherName: 'លោក ចាន់ វុទ្ធី', academicYear: '២០២៤ - ២០២៥', capacity: 35 }
];

export const initialStudents: Student[] = [
  {
    id: 's-1',
    code: 'STU-2024-001',
    nameKhmer: 'ចាន់ ពិសិដ្ឋ',
    nameLatin: 'Chan Piseth',
    gender: 'M',
    dob: '2012-05-14',
    pob: 'រាជធានីភ្នំពេញ',
    grade: 6,
    section: 'ក',
    guardianName: 'ចាន់ សុខុម',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '012 998 877',
    guardianOccupation: 'មន្ត្រីរាជការ',
    address: 'ផ្ទះលេខ ៤៥ ផ្លូវ ១៩ សង្កាត់វត្តភ្នំ ខណ្ឌដូនពេញ',
    admissionDate: '2018-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 142,
      weightKg: 35,
      bmi: 17.4,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'O+',
      notes: 'សុខភាពមាំមួនល្អ',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 96, absentWithPermission: 2, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-2',
    code: 'STU-2024-002',
    nameKhmer: 'សុខ ស្រីនិច',
    nameLatin: 'Sok Sreynich',
    gender: 'F',
    dob: '2012-09-22',
    pob: 'ខេត្តកណ្តាល',
    grade: 6,
    section: 'ក',
    guardianName: 'អ៊ុំ សុគន្ធ',
    guardianRelationship: 'ម្តាយ',
    guardianPhone: '098 765 432',
    guardianOccupation: 'អាជីវករ',
    address: 'ផ្ទះលេខ ១២ ផ្លូវព្រះនរោត្តម សង្កាត់ផ្សារចាស់',
    admissionDate: '2018-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 140,
      weightKg: 33,
      bmi: 16.8,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'B+',
      notes: 'ពាក់វ៉ែនតាមើលជិត',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 98, absentWithPermission: 0, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-3',
    code: 'STU-2024-003',
    nameKhmer: 'ហេង វណ្ណា',
    nameLatin: 'Heng Vanna',
    gender: 'M',
    dob: '2013-03-10',
    pob: 'ខេត្តកំពង់ចាម',
    grade: 5,
    section: 'ក',
    guardianName: 'ហេង គឹមសាន',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '088 123 456',
    guardianOccupation: 'បុគ្គលិកក្រុមហ៊ុន',
    address: 'ភូមិ ២ សង្កាត់ស្រះចក ខណ្ឌដូនពេញ',
    admissionDate: '2019-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 135,
      weightKg: 28,
      bmi: 15.4,
      nutritionStatus: 'underweight',
      vaccinated: true,
      bloodType: 'A+',
      notes: 'ត្រូវការបន្ថែមអាហារបំប៉នទឹកដោះគោ',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 92, absentWithPermission: 4, absentWithoutPermission: 2, totalDays: 98 }
  },
  {
    id: 's-4',
    code: 'STU-2024-004',
    nameKhmer: 'កែវ សុជាតា',
    nameLatin: 'Keo Socheata',
    gender: 'F',
    dob: '2013-08-18',
    pob: 'រាជធានីភ្នំពេញ',
    grade: 5,
    section: 'ក',
    guardianName: 'កែវ បូរី',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '077 554 433',
    guardianOccupation: 'វិស្វករ',
    address: 'ផ្ទះលេខ ៨៩ ផ្លូវ ១៣ សង្កាត់ជ័យជំនះ',
    admissionDate: '2019-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 138,
      weightKg: 32,
      bmi: 16.8,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'AB+',
      notes: 'សុខភាពល្អណាស់',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 97, absentWithPermission: 1, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-5',
    code: 'STU-2024-005',
    nameKhmer: 'លី រតនា',
    nameLatin: 'Ly Rothana',
    gender: 'M',
    dob: '2014-02-05',
    pob: 'ខេត្តសៀមរាប',
    grade: 4,
    section: 'ក',
    guardianName: 'លី សេងហុង',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '016 443 322',
    guardianOccupation: 'គ្រូបង្រៀន',
    address: 'សង្កាត់ចតុមុខ ខណ្ឌដូនពេញ',
    admissionDate: '2020-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 130,
      weightKg: 27,
      bmi: 16.0,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'O+',
      notes: 'កីឡាកររត់ប្រណាំងសាលា',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 95, absentWithPermission: 3, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-6',
    code: 'STU-2024-006',
    nameKhmer: 'ឈុន មុន្នីរ័ត្ន',
    nameLatin: 'Chhun Moniroth',
    gender: 'F',
    dob: '2014-11-30',
    pob: 'រាជធានីភ្នំពេញ',
    grade: 4,
    section: 'ក',
    guardianName: 'ម៉ែន គន្ធា',
    guardianRelationship: 'ម្តាយ',
    guardianPhone: '012 334 455',
    guardianOccupation: 'គណនេយ្យករ',
    address: 'ផ្ទះលេខ ៧៦ ផ្លូវ ២៤០ ខណ្ឌដូនពេញ',
    admissionDate: '2020-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 129,
      weightKg: 26,
      bmi: 15.6,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'B+',
      notes: 'សុខភាពប្រក្រតី',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 98, absentWithPermission: 0, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-7',
    code: 'STU-2024-007',
    nameKhmer: 'វ៉ាន់ សិរីវឌ្ឍន៍',
    nameLatin: 'Van Sereyvath',
    gender: 'M',
    dob: '2015-06-12',
    pob: 'ខេត្តបាត់ដំបង',
    grade: 3,
    section: 'ក',
    guardianName: 'វ៉ាន់ ពិសី',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '095 889 900',
    guardianOccupation: 'អ្នកបើកបរ',
    address: 'ផ្លូវ ៥១ សង្កាត់ផ្សារថ្មី ១',
    admissionDate: '2021-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 124,
      weightKg: 24,
      bmi: 15.6,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'O+',
      notes: 'ចាក់វ៉ាក់សាំងគ្រប់ដូស',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 94, absentWithPermission: 4, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-8',
    code: 'STU-2024-008',
    nameKhmer: 'ទិត្យ ស្រីពៅ',
    nameLatin: 'Tith Sreypov',
    gender: 'F',
    dob: '2015-10-08',
    pob: 'ខេត្តព្រៃវែង',
    grade: 3,
    section: 'ក',
    guardianName: 'ទិត្យ សំបូរ',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '092 112 233',
    guardianOccupation: 'កសិករ',
    address: 'ភូមិ ៤ សង្កាត់វត្តភ្នំ',
    admissionDate: '2021-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 122,
      weightKg: 22,
      bmi: 14.8,
      nutritionStatus: 'underweight',
      vaccinated: true,
      bloodType: 'A+',
      notes: 'ទទួលបានអាហាររូបករណ៍អាហារូបត្ថម្ភ',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 96, absentWithPermission: 2, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-9',
    code: 'STU-2024-009',
    nameKhmer: 'អ៊ុក សុវណ្ណារិទ្ធ',
    nameLatin: 'Ouk Sovannarith',
    gender: 'M',
    dob: '2016-04-14',
    pob: 'រាជធានីភ្នំពេញ',
    grade: 2,
    section: 'ក',
    guardianName: 'អ៊ុក ចំរើន',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '011 223 344',
    guardianOccupation: 'ជាងអគ្គិសនី',
    address: 'ផ្លូវ ១៣០ សង្កាត់ផ្សារចាស់',
    admissionDate: '2022-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 118,
      weightKg: 21,
      bmi: 15.1,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'B+',
      notes: 'សុខភាពរឹងមាំ',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 93, absentWithPermission: 5, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-10',
    code: 'STU-2024-010',
    nameKhmer: 'រស់ ទេវី',
    nameLatin: 'Ros Theavy',
    gender: 'F',
    dob: '2016-07-29',
    pob: 'ខេត្តតាកែវ',
    grade: 2,
    section: 'ក',
    guardianName: 'រស់ វិចិត្រ',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '097 887 766',
    guardianOccupation: 'បុគ្គលិករដ្ឋបាល',
    address: 'ផ្ទះលេខ ៣១ ផ្លូវ ១១០ ខណ្ឌដូនពេញ',
    admissionDate: '2022-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 119,
      weightKg: 22,
      bmi: 15.5,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'AB+',
      notes: 'សុខភាពប្រក្រតី',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 97, absentWithPermission: 1, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-11',
    code: 'STU-2024-011',
    nameKhmer: 'ព្រំ វិបុល',
    nameLatin: 'Prum Vibol',
    gender: 'M',
    dob: '2017-01-19',
    pob: 'រាជធានីភ្នំពេញ',
    grade: 1,
    section: 'ក',
    guardianName: 'ព្រំ វណ្ណឌី',
    guardianRelationship: 'ឪពុក',
    guardianPhone: '010 332 211',
    guardianOccupation: 'ពាណិជ្ជករ',
    address: 'ផ្លូវ ៨៤ សង្កាត់ស្រះចក',
    admissionDate: '2023-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 112,
      weightKg: 19,
      bmi: 15.1,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'O+',
      notes: 'សិស្សចូលរៀនថ្មី មានភាពស្វាហាប់',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 96, absentWithPermission: 2, absentWithoutPermission: 0, totalDays: 98 }
  },
  {
    id: 's-12',
    code: 'STU-2024-012',
    nameKhmer: 'យិន កល្យាណ',
    nameLatin: 'Yin Kalyan',
    gender: 'F',
    dob: '2017-09-03',
    pob: 'ខេត្តកំពង់ឆ្នាំង',
    grade: 1,
    section: 'ក',
    guardianName: 'យិន ផល្លា',
    guardianRelationship: 'ម្តាយ',
    guardianPhone: '089 665 544',
    guardianOccupation: 'គ្រូពេទ្យ',
    address: 'ផ្ទះលេខ ០៥ ផ្លូវ ៦៣ ខណ្ឌដូនពេញ',
    admissionDate: '2023-10-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    health: {
      heightCm: 110,
      weightKg: 18,
      bmi: 14.9,
      nutritionStatus: 'normal',
      vaccinated: true,
      bloodType: 'A+',
      notes: 'សុខភាពល្អ',
      lastCheckedDate: '2024-10-15'
    },
    attendance: { present: 98, absentWithPermission: 0, absentWithoutPermission: 0, totalDays: 98 }
  }
];

export const initialScores: StudentScoreRecord[] = [
  {
    id: 'sc-1',
    studentId: 's-1',
    studentCode: 'STU-2024-001',
    studentNameKhmer: 'ចាន់ ពិសិដ្ឋ',
    gender: 'M',
    grade: 6,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 9.5,
      khmerWriting: 9.0,
      mathematics: 9.5,
      scienceSocial: 9.0,
      moralCivics: 9.5,
      artsPhysical: 9.0
    },
    totalScore: 55.5,
    averageScore: 9.25,
    rank: 1,
    gradeLetter: 'A',
    resultStatus: 'ជាប់',
    remarks: 'សិស្សឆ្នើម ពូកែគណិតវិទ្យា និងភាសាខ្មែរ'
  },
  {
    id: 'sc-2',
    studentId: 's-2',
    studentCode: 'STU-2024-002',
    studentNameKhmer: 'សុខ ស្រីនិច',
    gender: 'F',
    grade: 6,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 9.5,
      khmerWriting: 9.5,
      mathematics: 8.5,
      scienceSocial: 9.5,
      moralCivics: 9.0,
      artsPhysical: 9.0
    },
    totalScore: 55.0,
    averageScore: 9.17,
    rank: 2,
    gradeLetter: 'A',
    resultStatus: 'ជាប់',
    remarks: 'អក្សរស្អាត សំណេរល្អ និងមានវិន័យខ្ពស់'
  },
  {
    id: 'sc-3',
    studentId: 's-3',
    studentCode: 'STU-2024-003',
    studentNameKhmer: 'ហេង វណ្ណា',
    gender: 'M',
    grade: 5,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 7.5,
      khmerWriting: 7.0,
      mathematics: 8.0,
      scienceSocial: 7.5,
      moralCivics: 8.5,
      artsPhysical: 8.0
    },
    totalScore: 46.5,
    averageScore: 7.75,
    rank: 2,
    gradeLetter: 'B',
    resultStatus: 'ជាប់',
    remarks: 'ខិតខំប្រឹងប្រែងបន្ថែមលើសំណេរ'
  },
  {
    id: 'sc-4',
    studentId: 's-4',
    studentCode: 'STU-2024-004',
    studentNameKhmer: 'កែវ សុជាតា',
    gender: 'F',
    grade: 5,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 9.0,
      khmerWriting: 8.5,
      mathematics: 9.0,
      scienceSocial: 9.0,
      moralCivics: 9.5,
      artsPhysical: 9.0
    },
    totalScore: 54.0,
    averageScore: 9.00,
    rank: 1,
    gradeLetter: 'A',
    resultStatus: 'ជាប់',
    remarks: 'ការសិក្សាល្អប្រសើរគ្រប់មុខវិជ្ជា'
  },
  {
    id: 'sc-5',
    studentId: 's-5',
    studentCode: 'STU-2024-005',
    studentNameKhmer: 'លី រតនា',
    gender: 'M',
    grade: 4,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 8.5,
      khmerWriting: 8.0,
      mathematics: 9.5,
      scienceSocial: 8.5,
      moralCivics: 9.0,
      artsPhysical: 9.5
    },
    totalScore: 53.0,
    averageScore: 8.83,
    rank: 1,
    gradeLetter: 'A',
    resultStatus: 'ជាប់',
    remarks: 'ឆ្លាតវៃ និងចូលរួមសកម្មភាពកីឡាបានល្អ'
  },
  {
    id: 'sc-6',
    studentId: 's-6',
    studentCode: 'STU-2024-006',
    studentNameKhmer: 'ឈុន មុន្នីរ័ត្ន',
    gender: 'F',
    grade: 4,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 9.0,
      khmerWriting: 8.5,
      mathematics: 8.0,
      scienceSocial: 8.5,
      moralCivics: 9.0,
      artsPhysical: 8.5
    },
    totalScore: 51.5,
    averageScore: 8.58,
    rank: 2,
    gradeLetter: 'A',
    resultStatus: 'ជាប់',
    remarks: 'រៀបរយ និងស្លូតបូត'
  },
  {
    id: 'sc-7',
    studentId: 's-7',
    studentCode: 'STU-2024-007',
    studentNameKhmer: 'វ៉ាន់ សិរីវឌ្ឍន៍',
    gender: 'M',
    grade: 3,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 8.0,
      khmerWriting: 7.5,
      mathematics: 8.5,
      scienceSocial: 8.0,
      moralCivics: 8.5,
      artsPhysical: 8.0
    },
    totalScore: 48.5,
    averageScore: 8.08,
    rank: 1,
    gradeLetter: 'B',
    resultStatus: 'ជាប់',
    remarks: 'មានការរីកចម្រើនលើការគិតលេខរហ័ស'
  },
  {
    id: 'sc-8',
    studentId: 's-8',
    studentCode: 'STU-2024-008',
    studentNameKhmer: 'ទិត្យ ស្រីពៅ',
    gender: 'F',
    grade: 3,
    section: 'ក',
    monthOrSemester: 'មករា',
    academicYear: '២០២៤ - ២០២៥',
    scores: {
      khmerReading: 7.5,
      khmerWriting: 8.0,
      mathematics: 7.0,
      scienceSocial: 7.5,
      moralCivics: 9.0,
      artsPhysical: 8.5
    },
    totalScore: 47.5,
    averageScore: 7.92,
    rank: 2,
    gradeLetter: 'B',
    resultStatus: 'ជាប់',
    remarks: 'ឧស្សាហ៍ព្យាយាម យកចិត្តទុកដាក់'
  }
];

export const initialBudgetTransactions: BudgetTransaction[] = [
  {
    id: 'tx-1',
    title: 'ថវិកាកម្មវិធីរដ្ឋ (PB) ឆមាសទី១ ឆ្នាំ២០២៤',
    type: 'income',
    source: 'ថវិការដ្ឋ (PB)',
    category: 'ថវិកាដំណើរការសាលារៀន',
    amountRiel: 45000000,
    amountUsd: 11000,
    date: '2024-01-10',
    referenceCode: 'MOEYS-PB-2024-01',
    recordedBy: 'អ្នកគ្រូ ពេជ្រ ធីតា (គណនេយ្យ)',
    description: 'ថវិកាគាំទ្រដំណើរការបង្រៀននិងរៀនប្រចាំឆមាសទី១',
    status: 'approved'
  },
  {
    id: 'tx-2',
    title: 'មូលនិធិកែលម្អសាលារៀន (SIG)',
    type: 'income',
    source: 'មូលនិធិកែលម្អសាលា (SIG)',
    category: 'អភិវឌ្ឍន៍ហេដ្ឋារចនាសម្ព័ន្ធ',
    amountRiel: 20000000,
    amountUsd: 4900,
    date: '2024-01-20',
    referenceCode: 'SIG-FUND-2024-A',
    recordedBy: 'លោក ចាន់ វុទ្ធី (នាយករង)',
    description: 'មូលនិធិសម្រាប់ជួសជុលបន្ទប់ទឹក និងលាបថ្នាំអគារ A',
    status: 'approved'
  },
  {
    id: 'tx-3',
    title: 'វិភាគទានសមាគមមាតាបិតា និងសហគមន៍',
    type: 'income',
    source: 'សហគមន៍/សមាគមមាតាបិតា',
    category: 'ជំនួយសហគមន៍',
    amountRiel: 8500000,
    amountUsd: 2073,
    date: '2024-02-05',
    referenceCode: 'PTA-DONATION-02',
    recordedBy: 'លោកស្រី ម៉ៅ សុផានី (នាយិកា)',
    description: 'ថវិកាបរិច្ចាគទិញកង្ហារ និងតុបតែងបណ្ណាល័យបៃតង',
    status: 'approved'
  },
  {
    id: 'tx-4',
    title: 'ទិញសម្ភារៈឧបទេស និងសៀវភៅពុម្ពបន្ថែម',
    type: 'expense',
    source: 'ថវិការដ្ឋ (PB)',
    category: 'សម្ភារៈឧបទេស',
    amountRiel: 6200000,
    amountUsd: 1512,
    date: '2024-02-12',
    referenceCode: 'EXP-PB-024',
    recordedBy: 'អ្នកគ្រូ ពេជ្រ ធីតា',
    description: 'ទិញសម្ភារៈបង្រៀនរូបភាព បន្ទះអក្សរ និងសៀវភៅគំនូរថ្នាក់ទី១-ទី៣',
    status: 'approved'
  },
  {
    id: 'tx-5',
    title: 'ជួសជុលដំបូល និងបន្ទប់អនាម័យសិស្ស',
    type: 'expense',
    source: 'មូលនិធិកែលម្អសាលា (SIG)',
    category: 'ជួសជុលអគារ',
    amountRiel: 8400000,
    amountUsd: 2048,
    date: '2024-02-28',
    referenceCode: 'EXP-SIG-088',
    recordedBy: 'លោក ចាន់ វុទ្ធី',
    description: 'ជួសជុលដំបូលធ្លាយ និងប្រព័ន្ធទឹកស្អាតលាងដៃសិស្ស',
    status: 'approved'
  },
  {
    id: 'tx-6',
    title: 'រៀបចំពិធីទិវាកុមារ និងប្រឡងសិស្សពូកែ',
    type: 'expense',
    source: 'សហគមន៍/សមាគមមាតាបិតា',
    category: 'សកម្មភាពសិស្ស',
    amountRiel: 2500000,
    amountUsd: 610,
    date: '2024-03-01',
    referenceCode: 'EXP-PTA-015',
    recordedBy: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
    description: 'ទិញរង្វាន់សៀវភៅ ប៊ិក និងប័ណ្ណសរសើរជូនសិស្សជ័យលាភី',
    status: 'approved'
  },
  {
    id: 'tx-7',
    title: 'ជំនួយបំពាក់កុំព្យូទ័រ និងបច្ចេកវិទ្យាពីអង្គការដៃគូ',
    type: 'income',
    source: 'ដៃគូអភិវឌ្ឍន៍/NGO',
    category: 'បច្ចេកវិទ្យាអប់រំ',
    amountRiel: 16000000,
    amountUsd: 3900,
    date: '2024-03-15',
    referenceCode: 'NGO-EDU-2024-K',
    recordedBy: 'អ្នកគ្រូ ពេជ្រ ធីតា',
    description: 'កុំព្យូទ័រ ៣ គ្រឿង និងម៉ាស៊ីនព្រីន Smart Classroom',
    status: 'approved'
  }
];

export const initialAttendanceRecords: DailyAttendanceRecord[] = [
  { id: 'att-1', date: '2024-03-20', grade: 6, section: 'ក', studentId: 's-1', studentNameKhmer: 'ចាន់ ពិសិដ្ឋ', status: 'present', session: 'morning' },
  { id: 'att-2', date: '2024-03-20', grade: 6, section: 'ក', studentId: 's-2', studentNameKhmer: 'សុខ ស្រីនិច', status: 'present', session: 'morning' },
  { id: 'att-3', date: '2024-03-20', grade: 5, section: 'ក', studentId: 's-3', studentNameKhmer: 'ហេង វណ្ណា', status: 'permission', session: 'morning', notes: 'ឈឺផ្តាសាយ' },
  { id: 'att-4', date: '2024-03-20', grade: 5, section: 'ក', studentId: 's-4', studentNameKhmer: 'កែវ សុជាតា', status: 'present', session: 'morning' },
  { id: 'att-5', date: '2024-03-20', grade: 4, section: 'ក', studentId: 's-5', studentNameKhmer: 'លី រតនា', status: 'present', session: 'morning' },
  { id: 'att-6', date: '2024-03-20', grade: 4, section: 'ក', studentId: 's-6', studentNameKhmer: 'ឈុន មុន្នីរ័ត្ន', status: 'present', session: 'morning' },
  { id: 'att-7', date: '2024-03-20', grade: 3, section: 'ក', studentId: 's-7', studentNameKhmer: 'វ៉ាន់ សិរីវឌ្ឍន៍', status: 'present', session: 'morning' },
  { id: 'att-8', date: '2024-03-20', grade: 3, section: 'ក', studentId: 's-8', studentNameKhmer: 'ទិត្យ ស្រីពៅ', status: 'present', session: 'morning' }
];

export const initialCalendarEvents: AcademicCalendarEvent[] = [
  {
    id: 'evt-1',
    titleKhmer: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មី',
    titleLatin: 'Academic Year Opening Day',
    startDate: '2024-11-01',
    endDate: '2024-11-01',
    type: 'academic',
    description: 'ពិធីជួបជុំលោកគ្រូអ្នកគ្រូ និងសិស្សានុសិស្សទាំងអស់ ដើម្បីបើកបវេសនកាលឆ្នាំសិក្សា ២០២៤-២០២៥ ក្រោមអធិបតីភាពគណៈគ្រប់គ្រងសាលា',
    targetGrades: 'សិស្សគ្រប់កម្រិតថ្នាក់ (១ ដល់ ៦)',
    isOfficialHoliday: false,
    location: 'ទីធ្លាសាលាបឋមសិក្សាភ្នំពុំ'
  },
  {
    id: 'evt-2',
    titleKhmer: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ',
    titleLatin: 'Pchum Ben Festival Holiday',
    startDate: '2024-10-01',
    endDate: '2024-10-03',
    type: 'holiday',
    description: 'ឈប់សម្រាកបុណ្យភ្ជុំបិណ្ឌប្រពៃណីជាតិខ្មែរ (៣ ថ្ងៃផ្លូវការ)',
    targetGrades: 'សាលារៀនទាំងមូល',
    isOfficialHoliday: true
  },
  {
    id: 'evt-3',
    titleKhmer: 'ទិវាបុណ្យឯករាជ្យជាតិ ៩ វិច្ឆិកា',
    titleLatin: 'National Independence Day',
    startDate: '2024-11-09',
    endDate: '2024-11-09',
    type: 'holiday',
    description: 'ទិវារំលឹកខួបបុណ្យឯករាជ្យជាតិ ព្រះរាជាណាចក្រកម្ពុជា',
    targetGrades: 'សាលារៀនទាំងមូល',
    isOfficialHoliday: true
  },
  {
    id: 'evt-4',
    titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក',
    titleLatin: 'Water Festival Holiday',
    startDate: '2024-11-14',
    endDate: '2024-11-16',
    type: 'holiday',
    description: 'ឈប់សម្រាកព្រះរាជពិធីបុណ្យអុំទូកជាតិ',
    targetGrades: 'សាលារៀនទាំងមូល',
    isOfficialHoliday: true
  },
  {
    id: 'evt-5',
    titleKhmer: 'ការប្រឡងឆមាសទី១ (Semester 1 Exams)',
    titleLatin: 'Semester 1 Final Examination',
    startDate: '2025-02-24',
    endDate: '2025-02-28',
    type: 'exam',
    description: 'សម័យប្រឡងឆមាសទី១ សម្រាប់សិស្សបឋមសិក្សាគ្រប់កម្រិតថ្នាក់ លើមុខវិជ្ជាស្នូលទាំង ៦ តាមគោលការណ៍ក្រសួងអប់រំ',
    targetGrades: 'ថ្នាក់ទី១ ដល់ ទី៦',
    isOfficialHoliday: false,
    location: 'បន្ទប់ប្រឡងសាលាបឋមសិក្សាភ្នំពុំ'
  },
  {
    id: 'evt-6',
    titleKhmer: 'វិស្សមកាលតូច (Small Semester Break)',
    titleLatin: 'Small Vacation (Mid-Year Break)',
    startDate: '2025-03-01',
    endDate: '2025-03-14',
    type: 'vacation',
    description: 'វិស្សមកាលតូចពាក់កណ្តាលឆ្នាំសិក្សា បន្ទាប់ពីការប្រឡងឆមាសទី១ ត្រូវបានបញ្ចប់',
    targetGrades: 'សិស្សានុសិស្សទាំងអស់',
    isOfficialHoliday: true
  },
  {
    id: 'evt-7',
    titleKhmer: 'ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិខ្មែរ',
    titleLatin: 'Khmer New Year Holiday',
    startDate: '2025-04-13',
    endDate: '2025-04-16',
    type: 'holiday',
    description: 'ឈប់សម្រាកពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ ឆ្នាំរោង/ម្សាញ់',
    targetGrades: 'សាលារៀនទាំងមូល',
    isOfficialHoliday: true
  },
  {
    id: 'evt-8',
    titleKhmer: 'ការប្រឡងឆមាសទី២ និងប្រឡងប្រចាំឆ្នាំ',
    titleLatin: 'Semester 2 & Annual Final Examination',
    startDate: '2025-06-23',
    endDate: '2025-06-27',
    type: 'exam',
    description: 'សម័យប្រឡងឆមាសទី២ ដើម្បីវាយតម្លៃលទ្ធផលសិក្សាប្រចាំឆ្នាំ និងកំណត់ចំណាត់ថ្នាក់ឡើងថ្នាក់',
    targetGrades: 'ថ្នាក់ទី១ ដល់ ទី៦',
    isOfficialHoliday: false,
    location: 'បន្ទប់ប្រឡងអគារ A & B'
  },
  {
    id: 'evt-9',
    titleKhmer: 'ការប្រឡងបញ្ចប់ភូមិសិក្សាបឋមសិក្សា (ថ្នាក់ទី៦)',
    titleLatin: 'Grade 6 Primary Graduation Exam',
    startDate: '2025-07-07',
    endDate: '2025-07-08',
    type: 'exam',
    description: 'សម័យប្រឡងបញ្ចប់ការសិក្សាបឋមសិក្សាថ្នាក់ជាតិ សម្រាប់សិស្សថ្នាក់ទី៦ ដើម្បីទទួលវិញ្ញាបនបត្របឋមសិក្សា',
    targetGrades: 'សិស្សថ្នាក់ទី៦ក (បេក្ខជនទាំងអស់)',
    isOfficialHoliday: false,
    location: 'មណ្ឌលប្រឡងសាលាបឋមសិក្សាភ្នំពុំ'
  },
  {
    id: 'evt-10',
    titleKhmer: 'ពិធីបិទបវេសនកាល & ចែករង្វាន់សិស្សឆ្នើម',
    titleLatin: 'Closing Ceremony & Honors Awards',
    startDate: '2025-07-31',
    endDate: '2025-07-31',
    type: 'ceremony',
    description: 'ពិធីសរុបលទ្ធផលការងារអប់រំប្រចាំឆ្នាំ បិទបវេសនកាល និងប្រគល់ប័ណ្ណសរសើរ រង្វាន់លើកទឹកចិត្តដល់សិស្សឆ្នើមទូទាំងសាលា',
    targetGrades: 'សិស្ស លោកគ្រូអ្នកគ្រូ និងមាតាបិតា',
    isOfficialHoliday: false,
    location: 'សាលប្រជុំធំ សាលាបឋមសិក្សាភ្នំពុំ'
  },
  {
    id: 'evt-11',
    titleKhmer: 'វិស្សមកាលធំ (Big School Vacation)',
    titleLatin: 'Big Vacation (Annual Summer Break)',
    startDate: '2025-08-01',
    endDate: '2025-10-31',
    type: 'vacation',
    description: 'វិស្សមកាលធំប្រចាំឆ្នាំ សម្រាប់សិស្សានុសិស្ស និងលោកគ្រូអ្នកគ្រូត្រៀមខ្លួនសម្រាប់ឆ្នាំសិក្សាថ្មី',
    targetGrades: 'សាលារៀនទាំងមូល',
    isOfficialHoliday: true
  },
  {
    id: 'evt-12',
    titleKhmer: 'កិច្ចប្រជុំគណៈគ្រប់គ្រង & សមាគមមាតាបិតា (PTA Meeting)',
    titleLatin: 'School Board & Parent Association Meeting',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    type: 'meeting',
    description: 'ប្រជុំត្រួតពិនិត្យដំណើរការអភិវឌ្ឍន៍សាលា ការប្រើប្រាស់ថវិកា PB/SIG និងវឌ្ឍនភាពសិក្សារបស់សិស្ស',
    targetGrades: 'គណៈគ្រប់គ្រង និងតំណាងមាតាបិតា',
    isOfficialHoliday: false,
    location: 'បន្ទប់ប្រជុំរដ្ឋបាល'
  }
];

export const initialUsers = [
  {
    id: 'u-1',
    username: 'limsorn',
    email: 'limsorn9@gmail.com',
    password: 'password123',
    nameKhmer: 'លោក លីម សន',
    nameLatin: 'Lim Sorn',
    role: 'director' as const,
    phone: '087 99 19 77',
    staffCode: 'MOEYS-104921',
    createdAt: '2024-01-01',
    status: 'active' as const
  },
  {
    id: 'u-2',
    username: 'secretary',
    email: 'secretary@moeys.gov.kh',
    password: 'password123',
    nameKhmer: 'កញ្ញា ម៉ៅ សុខា',
    nameLatin: 'Mao Sokha',
    role: 'secretary' as const,
    phone: '012 456 789',
    staffCode: 'MOEYS-109845',
    createdBy: 'u-1',
    createdAt: '2024-01-05',
    status: 'active' as const
  },
  {
    id: 'u-3',
    username: 'librarian',
    email: 'librarian@moeys.gov.kh',
    password: 'password123',
    nameKhmer: 'លោក គឹម សុជាតិ',
    nameLatin: 'Kim Socheat',
    role: 'librarian' as const,
    phone: '016 789 012',
    staffCode: 'MOEYS-109988',
    createdBy: 'u-1',
    createdAt: '2024-01-08',
    status: 'active' as const
  },
  {
    id: 'u-4',
    username: 'vuthy.chan',
    email: 'vuthy.chan@moeys.gov.kh',
    password: 'password123',
    nameKhmer: 'លោក ចាន់ វុទ្ធី',
    nameLatin: 'Chan Vuthy',
    role: 'teacher' as const,
    phone: '017 890 123',
    staffCode: 'MOEYS-108234',
    assignedGrade: 6,
    assignedSection: 'ក',
    createdAt: '2024-01-02',
    status: 'active' as const
  },
  {
    id: 'u-5',
    username: 'sophea.sim',
    email: 'sophea.sim@moeys.gov.kh',
    password: 'password123',
    nameKhmer: 'អ្នកគ្រូ ស៊ឹម សុភា',
    nameLatin: 'Sim Sophea',
    role: 'teacher' as const,
    phone: '012 345 678',
    staffCode: 'MOEYS-104922',
    assignedGrade: 1,
    assignedSection: 'ក',
    createdAt: '2024-01-03',
    status: 'active' as const
  },
  {
    id: 'u-6',
    username: 'STU-2024-001',
    email: 'sok.dara@student.moeys.gov.kh',
    password: 'password123',
    nameKhmer: 'សុខ តារា',
    nameLatin: 'Sok Dara',
    role: 'student' as const,
    studentId: 'stu-1',
    studentCode: 'STU-2024-001',
    assignedGrade: 6,
    assignedSection: 'ក',
    createdBy: 'u-4',
    createdAt: '2024-01-10',
    status: 'active' as const
  },
  {
    id: 'u-7',
    username: 'STU-2024-002',
    email: 'chan.bopha@student.moeys.gov.kh',
    password: 'password123',
    nameKhmer: 'ចាន់ បុប្ផា',
    nameLatin: 'Chan Bopha',
    role: 'student' as const,
    studentId: 'stu-2',
    studentCode: 'STU-2024-002',
    assignedGrade: 6,
    assignedSection: 'ក',
    createdBy: 'u-4',
    createdAt: '2024-01-10',
    status: 'active' as const
  }
];

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'ការកំណត់ពាក្យសម្ងាត់ឡើងវិញ',
    message: 'សិស្ស «សុខ តារា» (អត្តលេខ: STU-2024-001 ថ្នាក់ទី៦ក) បានកំណត់ពាក្យសម្ងាត់ថ្មីដោយជោគជ័យ។',
    timestamp: '2025-02-15 08:30',
    type: 'password_reset' as const,
    targetRole: 'teacher' as const,
    targetTeacherGrade: 6,
    targetTeacherSection: 'ក',
    read: false,
    meta: {
      studentId: 'stu-1',
      studentName: 'សុខ តារា',
      actionTime: '2025-02-15 08:30'
    }
  },
  {
    id: 'notif-2',
    title: 'ការប្រជុំគណៈគ្រប់គ្រងសាលា',
    message: 'សូមអញ្ជើញលោកគ្រូ-អ្នកគ្រូចូលរួមប្រជុំប្រចាំខែ នៅថ្ងៃទី១៥ ខែមីនា វេលាម៉ោង ០៨:០០ ព្រឹក។',
    timestamp: '2025-02-10 14:00',
    type: 'info' as const,
    targetRole: 'all' as const,
    read: false
  }
];

export const initialTransfers: StudentTransferRecord[] = [
  {
    id: 'tr-1',
    transferType: 'out',
    letterNumber: 'លខ.០២៤/២០២៤',
    transferDate: '2024-11-15',
    studentId: 's-1',
    studentCode: 'STU-2024-001',
    studentNameKhmer: 'ចាន់ ពិសិដ្ឋ',
    studentNameLatin: 'Chan Piseth',
    gender: 'M',
    dob: '2012-05-14',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    fromSchool: 'សាលាបឋមសិក្សាភ្នំពុំ',
    fromSchoolCode: '020401015',
    toSchool: 'សាលាបឋមសិក្សាព្រះនរោត្តម',
    toSchoolCode: '120101001',
    toDistrictProvince: 'ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
    reason: 'ផ្លាស់ប្តូរទីលំនៅតាមឪពុកម្តាយប្តូរទីកន្លែងបម្រើការងារ',
    guardianName: 'ចាន់ សុខុម',
    guardianPhone: '012 998 877',
    principalApprovalName: 'លោក លីម សន',
    officerName: 'លោក ឈិន សុផល',
    status: 'completed',
    notes: 'បានប្រគល់សៀវភៅតាមដានការសិក្សា និងព្រឹត្តិបត្រពិន្ទុរួចរាល់'
  },
  {
    id: 'tr-2',
    transferType: 'in',
    letterNumber: 'លខ.១០៨/២០២៤',
    transferDate: '2024-10-05',
    studentId: 's-3',
    studentCode: 'STU-2024-003',
    studentNameKhmer: 'ម៉ៅ វឌ្ឍនា',
    studentNameLatin: 'Mao Vattana',
    gender: 'M',
    dob: '2013-01-10',
    grade: 5,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    fromSchool: 'សាលាបឋមសិក្សាវត្តគរ',
    fromSchoolCode: '020301005',
    toSchool: 'សាលាបឋមសិក្សាភ្នំពុំ',
    toSchoolCode: '020401015',
    toDistrictProvince: 'ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង',
    reason: 'ផ្លាស់ប្តូរទីលំនៅថ្មីមករស់នៅជិតសាលារៀនភ្នំពុំ',
    guardianName: 'ម៉ៅ សារ៉េត',
    guardianPhone: '011 223 344',
    principalApprovalName: 'លោក លីម សន',
    officerName: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
    status: 'approved',
    notes: 'បានបញ្ចូលឈ្មោះក្នុងបញ្ជីថ្នាក់ទី៥ក ឆ្នាំសិក្សា២០២៤-២០២៥'
  },
  {
    id: 'tr-3',
    transferType: 'out',
    letterNumber: 'លខ.០៣៩/២០២៤',
    transferDate: '2024-12-01',
    studentId: 's-5',
    studentCode: 'STU-2024-005',
    studentNameKhmer: 'ជា សុភ័ក្រ',
    studentNameLatin: 'Chea Sopheak',
    gender: 'M',
    dob: '2015-08-15',
    grade: 3,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    fromSchool: 'សាលាបឋមសិក្សាភ្នំពុំ',
    fromSchoolCode: '020401015',
    toSchool: 'សាលាបឋមសិក្សាសំពៅលូន',
    toSchoolCode: '020501008',
    toDistrictProvince: 'ស្រុកសំពៅលូន ខេត្តបាត់ដំបង',
    reason: 'ផ្លាស់ប្តូរទីលំនៅទៅរស់នៅជាមួយជីដូន',
    guardianName: 'ជា វណ្ណា',
    guardianPhone: '097 555 667',
    principalApprovalName: 'លោក លីម សន',
    officerName: 'លោក គង់ សម្បត្តិ',
    status: 'approved',
    notes: 'លិខិតផ្ទេរផ្លូវការស្របតាមទម្រង់ក្រសួងអប់រំ យុវជន និងកីឡា'
  }
];

export const initialAcademicYears: string[] = [
  '២០២១ - ២០២២',
  '២០២២ - ២០២៣',
  '២០២៣ - ២០២៤',
  '២០២៤ - ២០២៥',
  '២០២៥ - ២០២៦'
];

export const initialExamSubjects: ExamSubject[] = [
  { id: 'sub-1', code: 'listening', nameKhmer: 'សមត្ថភាពស្តាប់', nameLatin: 'Listening Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-2', code: 'writing', nameKhmer: 'សមត្ថភាពសរសេរ', nameLatin: 'Writing Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-3', code: 'reading', nameKhmer: 'សមត្ថភាពអាន', nameLatin: 'Reading Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-4', code: 'speaking', nameKhmer: 'សមត្ថភាពនិយាយ', nameLatin: 'Speaking Ability', category: 'khmer', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-5', code: 'numbers', nameKhmer: 'ចំនួន', nameLatin: 'Numbers & Operations', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-6', code: 'measurement', nameKhmer: 'រង្វាស់រង្វាល់', nameLatin: 'Measurement', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-7', code: 'geometry', nameKhmer: 'ធរណីមាត្រ', nameLatin: 'Geometry', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-8', code: 'algebra', nameKhmer: 'ពីជគណិត', nameLatin: 'Algebra / Patterns', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-9', code: 'statistics', nameKhmer: 'ស្ថិតិ', nameLatin: 'Statistics & Probability', category: 'math', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-10', code: 'science', nameKhmer: 'វិទ្យាសាស្ត្រ', nameLatin: 'Science', category: 'science_social', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-11', code: 'socialStudies', nameKhmer: 'សិក្សាសង្គម', nameLatin: 'Social Studies', category: 'science_social', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-12', code: 'moralCivics', nameKhmer: 'សីលធម៌', nameLatin: 'Moral & Civics', category: 'science_social', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-13', code: 'homeEconomicsArts', nameKhmer: 'គេហកិច្ច-អប់រំសិល្បៈ', nameLatin: 'Home Economics & Arts', category: 'arts_pe', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-14', code: 'physicalHealth', nameKhmer: 'អប់រំកាយ-កីឡាសុខភាព-អនាម័យ', nameLatin: 'Physical Ed, Sports & Health', category: 'arts_pe', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-15', code: 'lifeSkills', nameKhmer: 'អប់រំបំណិនជីវិត', nameLatin: 'Life Skills Education', category: 'skills_language', maxScore: 10, weight: 1, isDefault: true },
  { id: 'sub-16', code: 'foreignLanguage', nameKhmer: 'ភាសាបរទេស', nameLatin: 'Foreign Language (English/French)', category: 'skills_language', maxScore: 10, weight: 1, isDefault: true }
];

export const initialCatchmentVillages: string[] = [
  'ភូមិអូរគល់សំយ៉ុង',
  'ភូមិទួលខ្វាវ',
  'ភូមិចំការស្រូវ',
  'ភូមិបារាំងធ្លាក់',
  'ភូមិអូរធំ',
  'ភូមិទួលកកោះ'
];

export const initialHouseholdRecords: any[] = [
  {
    id: 'hh-1',
    houseNumber: '០២៨',
    village: 'ភូមិអូរគល់សំយ៉ុង',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-15',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2415,
    lng: 102.3456,
    gpsAccuracy: 4,
    housePhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
    familyBookPhotoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
    equityCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    headName: 'សុខ ជា',
    headGender: 'M',
    headOccupation: 'កសិករ',
    headNationalId: '020488910',
    spouseName: 'កែវ សុខា',
    spouseGender: 'F',
    spouseOccupation: 'មេផ្ទះ / កសិករ',
    houseType: 'ផ្ទះឈើលើថ្មក្រោម ប្រក់ស័ង្កសី',
    currentAddress: 'ភូមិអូរគល់សំយ៉ុង ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង',
    familyStatus: 'ក្រ២',
    equityCardNumber: 'IDP-0204-78912',
    phoneNumber: '012 334 455',
    members: [
      {
        id: 'mem-1',
        name: 'សុខ ជា',
        gender: 'M',
        dob: '1982-04-10',
        age: 44,
        relationship: 'មេគ្រួសារ',
        occupation: 'កសិករ',
        nationalId: '020488910',
        civilStatusDoc: 'សំបុត្រអាពាហ៍ពិពាហ៍'
      },
      {
        id: 'mem-2',
        name: 'កែវ សុខា',
        gender: 'F',
        dob: '1985-09-18',
        age: 41,
        relationship: 'សហព័ទ្ធ',
        occupation: 'មេផ្ទះ',
        nationalId: '020488911',
        civilStatusDoc: 'សំបុត្រអាពាហ៍ពិពាហ៍'
      },
      {
        id: 'mem-3',
        name: 'សុខ វិបុល',
        gender: 'M',
        dob: '2013-05-15',
        age: 13,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        civilStatusDoc: 'សំបុត្រកំណើត',
        isStudentAtSchool: true,
        studentGrade: 6,
        studentSection: 'ក',
        studentCode: 'STU-2024-001'
      },
      {
        id: 'mem-4',
        name: 'សុខ ធីតា',
        gender: 'F',
        dob: '2016-10-22',
        age: 10,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        civilStatusDoc: 'សំបុត្រកំណើត',
        isStudentAtSchool: true,
        studentGrade: 3,
        studentSection: 'ក',
        studentCode: 'STU-2024-045'
      }
    ],
    remarks: 'គ្រួសារទទួលផលប័ណ្ណសមធម៌ក្រ២ មានកូន ២ នាក់កំពុងរៀននៅសាលាបឋមសិក្សាភ្នំពុំ',
    recordedBy: 'លោក លីម សន'
  },
  {
    id: 'hh-2',
    houseNumber: '០៤៥',
    village: 'ភូមិទួលខ្វាវ',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-16',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2392,
    lng: 102.3481,
    gpsAccuracy: 5,
    housePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    familyBookPhotoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
    headName: 'ចាន់ សុផល',
    headGender: 'M',
    headOccupation: 'អាជីវករលក់ដូរ',
    headNationalId: '020490123',
    spouseName: 'រស់ ស្រីពៅ',
    spouseGender: 'F',
    spouseOccupation: 'អាជីវករ',
    houseType: 'ផ្ទះថ្មជាន់ផ្ទាល់ដី ប្រក់ក្បឿង',
    currentAddress: 'ភូមិទួលខ្វាវ ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង',
    familyStatus: 'ទូទៅ',
    phoneNumber: '015 889 900',
    members: [
      {
        id: 'mem-5',
        name: 'ចាន់ សុផល',
        gender: 'M',
        dob: '1979-02-14',
        age: 47,
        relationship: 'មេគ្រួសារ',
        occupation: 'អាជីវករ',
        nationalId: '020490123',
        civilStatusDoc: 'សំបុត្រអាពាហ៍ពិពាហ៍'
      },
      {
        id: 'mem-6',
        name: 'រស់ ស្រីពៅ',
        gender: 'F',
        dob: '1983-07-29',
        age: 43,
        relationship: 'សហព័ទ្ធ',
        occupation: 'អាជីវករ',
        nationalId: '020490124',
        civilStatusDoc: 'សំបុត្រអាពាហ៍ពិពាហ៍'
      },
      {
        id: 'mem-7',
        name: 'ចាន់ រស្មី',
        gender: 'F',
        dob: '2013-09-20',
        age: 13,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        civilStatusDoc: 'សំបុត្រកំណើត',
        isStudentAtSchool: true,
        studentGrade: 6,
        studentSection: 'ក',
        studentCode: 'STU-2024-002'
      }
    ],
    remarks: 'ផ្ទះនៅជាប់ផ្លូវបេតុងភូមិ ចម្ងាយ ៧០០ ម៉ែត្រពីសាលារៀន',
    recordedBy: 'លោក ចាន់ វុទ្ធី'
  },
  {
    id: 'hh-3',
    houseNumber: '១០២',
    village: 'ភូមិចំការស្រូវ',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-18',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2458,
    lng: 102.3398,
    gpsAccuracy: 3,
    housePhotoUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&auto=format&fit=crop&q=80',
    familyBookPhotoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
    equityCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    headName: 'ម៉ៅ វណ្ណា',
    headGender: 'M',
    headOccupation: 'កម្មករសំណង់',
    headNationalId: '020455821',
    spouseName: 'ប៉ែន ណារី',
    spouseGender: 'F',
    spouseOccupation: 'មេផ្ទះ',
    houseType: 'ផ្ទះឈើប្រក់ស័ង្កសី',
    currentAddress: 'ភូមិចំការស្រូវ ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក ខេត្តបាត់ដំបង',
    familyStatus: 'ក្រ១',
    equityCardNumber: 'IDP-0204-11094',
    phoneNumber: '088 776 655',
    members: [
      {
        id: 'mem-8',
        name: 'ម៉ៅ វណ្ណា',
        gender: 'M',
        dob: '1981-12-05',
        age: 45,
        relationship: 'មេគ្រួសារ',
        occupation: 'កម្មករសំណង់',
        nationalId: '020455821',
        civilStatusDoc: 'សំបុត្រអាពាហ៍ពិពាហ៍'
      },
      {
        id: 'mem-9',
        name: 'ប៉ែន ណារី',
        gender: 'F',
        dob: '1986-03-12',
        age: 40,
        relationship: 'សហព័ទ្ធ',
        occupation: 'មេផ្ទះ',
        civilStatusDoc: 'សំបុត្រអាពាហ៍ពិពាហ៍'
      },
      {
        id: 'mem-10',
        name: 'ម៉ៅ វិច្ឆិកា',
        gender: 'F',
        dob: '2014-11-08',
        age: 12,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        civilStatusDoc: 'សំបុត្រកំណើត',
        isStudentAtSchool: true,
        studentGrade: 5,
        studentSection: 'ក',
        studentCode: 'STU-2024-019'
      },
      {
        id: 'mem-11',
        name: 'ម៉ៅ ដារ៉ា',
        gender: 'M',
        dob: '2018-02-14',
        age: 8,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        civilStatusDoc: 'សំបុត្រកំណើត',
        isStudentAtSchool: true,
        studentGrade: 2,
        studentSection: 'ក',
        studentCode: 'STU-2024-058'
      }
    ],
    remarks: 'ស្ថានភាពជីវភាពក្រីក្រកម្រិត១ ត្រូវការជំនួយអាហារូបករណ៍ និងសម្ភារៈសិក្សា',
    recordedBy: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ'
  },
  {
    id: 'hh-4',
    houseNumber: '០១៤',
    village: 'ភូមិអូរគល់សំយ៉ុង',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-19',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2432,
    lng: 102.3412,
    gpsAccuracy: 4,
    housePhotoUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&auto=format&fit=crop&q=80',
    familyBookPhotoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
    headName: 'គង់ វិចិត្រ',
    headGender: 'M',
    headOccupation: 'កសិករដាំស្វាយ',
    headNationalId: '020477123',
    spouseName: 'ស៊ឹម ចរិយា',
    spouseGender: 'F',
    spouseOccupation: 'កសិករ',
    houseType: 'ផ្ទះឈើលើថ្មក្រោម ប្រក់ក្បឿង',
    currentAddress: 'ភូមិអូរគល់សំយ៉ុង ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក',
    familyStatus: 'ងាយរងគ្រោះ',
    phoneNumber: '070 234 567',
    members: [
      {
        id: 'mem-12',
        name: 'គង់ វិចិត្រ',
        gender: 'M',
        dob: '1980-08-15',
        age: 46,
        relationship: 'មេគ្រួសារ',
        occupation: 'កសិករ',
        nationalId: '020477123'
      },
      {
        id: 'mem-13',
        name: 'ស៊ឹម ចរិយា',
        gender: 'F',
        dob: '1984-05-20',
        age: 42,
        relationship: 'សហព័ទ្ធ',
        occupation: 'កសិករ'
      },
      {
        id: 'mem-14',
        name: 'គង់ វិបុល',
        gender: 'M',
        dob: '2013-03-10',
        age: 13,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        isStudentAtSchool: true,
        studentGrade: 6,
        studentSection: 'ក',
        studentCode: 'STU-2024-003'
      }
    ],
    remarks: 'គ្រួសារជួបបញ្ហាទឹកជំនន់តាមរដូវ ងាយរងគ្រោះ',
    recordedBy: 'លោក លីម សន'
  },
  {
    id: 'hh-5',
    houseNumber: '០៨៩',
    village: 'ភូមិបារាំងធ្លាក់',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-20',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2378,
    lng: 102.3445,
    gpsAccuracy: 5,
    housePhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
    headName: 'ហេង សំអុល',
    headGender: 'M',
    headOccupation: 'មន្ត្រីរាជការ',
    headNationalId: '020466332',
    spouseName: 'អ៊ុក ផល្លា',
    spouseGender: 'F',
    spouseOccupation: 'គ្រូបង្រៀន',
    houseType: 'ផ្ទះថ្ម ២ជាន់',
    currentAddress: 'ភូមិបារាំងធ្លាក់ ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក',
    familyStatus: 'ទូទៅ',
    phoneNumber: '089 778 899',
    members: [
      {
        id: 'mem-15',
        name: 'ហេង សំអុល',
        gender: 'M',
        dob: '1978-11-22',
        age: 48,
        relationship: 'មេគ្រួសារ',
        occupation: 'មន្ត្រីរាជការ'
      },
      {
        id: 'mem-16',
        name: 'អ៊ុក ផល្លា',
        gender: 'F',
        dob: '1982-02-18',
        age: 44,
        relationship: 'សហព័ទ្ធ',
        occupation: 'គ្រូបង្រៀន'
      },
      {
        id: 'mem-17',
        name: 'ហេង ស្រីពៅ',
        gender: 'F',
        dob: '2014-06-12',
        age: 12,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        isStudentAtSchool: true,
        studentGrade: 5,
        studentSection: 'ក',
        studentCode: 'STU-2024-004'
      }
    ],
    remarks: 'ជីវភាពសមរម្យ ចូលរួមសកម្មភាពសាលាទៀងទាត់',
    recordedBy: 'លោក ចាន់ វុទ្ធី'
  },
  {
    id: 'hh-6',
    houseNumber: '០៦២',
    village: 'ភូមិអូរធំ',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-21',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2475,
    lng: 102.3495,
    gpsAccuracy: 4,
    housePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    equityCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    headName: 'ទេព វ៉ាន់នី',
    headGender: 'M',
    headOccupation: 'កសិករស៊ីឈ្នួល',
    headNationalId: '020411889',
    spouseName: 'យិន សាវ៉ាត',
    spouseGender: 'F',
    spouseOccupation: 'កសិករ',
    houseType: 'ផ្ទះឈើប្រក់ស័ង្កសី',
    currentAddress: 'ភូមិអូរធំ ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក',
    familyStatus: 'ក្រ២',
    equityCardNumber: 'IDP-0204-55441',
    phoneNumber: '097 554 433',
    members: [
      {
        id: 'mem-18',
        name: 'ទេព វ៉ាន់នី',
        gender: 'M',
        dob: '1983-04-05',
        age: 43,
        relationship: 'មេគ្រួសារ',
        occupation: 'កសិករ'
      },
      {
        id: 'mem-19',
        name: 'ទេព វ៉ាន់ដា',
        gender: 'M',
        dob: '2013-07-14',
        age: 13,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        isStudentAtSchool: true,
        studentGrade: 6,
        studentSection: 'ក',
        studentCode: 'STU-2024-005'
      }
    ],
    remarks: 'សិស្សត្រូវការការយកចិត្តទុកដាក់ និងបំប៉នការអានបន្ថែម',
    recordedBy: 'លោក ចាន់ វុទ្ធី'
  },
  {
    id: 'hh-7',
    houseNumber: '០៧៧',
    village: 'ភូមិទួលកកោះ',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-22',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2361,
    lng: 102.3385,
    gpsAccuracy: 3,
    housePhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
    equityCardPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    headName: 'អ៊ុំ សារ៉ាត់',
    headGender: 'M',
    headOccupation: 'កសិករ',
    headNationalId: '020499221',
    spouseName: 'ស៊ន ម៉ាលី',
    spouseGender: 'F',
    spouseOccupation: 'មេផ្ទះ',
    houseType: 'ផ្ទះឈើតូចប្រក់ស័ង្កសី',
    currentAddress: 'ភូមិទួលកកោះ ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក',
    familyStatus: 'ក្រ១',
    equityCardNumber: 'IDP-0204-99881',
    phoneNumber: '088 998 877',
    members: [
      {
        id: 'mem-20',
        name: 'អ៊ុំ សារ៉ាត់',
        gender: 'M',
        dob: '1976-09-12',
        age: 50,
        relationship: 'មេគ្រួសារ',
        occupation: 'កសិករ'
      },
      {
        id: 'mem-21',
        name: 'អ៊ុំ រតនៈ',
        gender: 'M',
        dob: '2013-11-30',
        age: 13,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        isStudentAtSchool: true,
        studentGrade: 6,
        studentSection: 'ក',
        studentCode: 'STU-2024-011'
      }
    ],
    remarks: 'គ្រួសារក្រីក្រកម្រិត១ ទទួលបានជំនួយអាហារូបករណ៍សាលា',
    recordedBy: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ'
  },
  {
    id: 'hh-8',
    houseNumber: '០៣៣',
    village: 'ភូមិអូរគល់សំយ៉ុង',
    commune: 'ឃុំបារាំងធ្លាក់',
    district: 'ស្រុកភ្នំព្រឹក',
    province: 'ខេត្តបាត់ដំបង',
    censusDate: '2026-08-22',
    academicYear: '២០២៤ - ២០២៥',
    lat: 13.2440,
    lng: 102.3468,
    gpsAccuracy: 3,
    housePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
    headName: 'ឈន ប៊ុនថា',
    headGender: 'M',
    headOccupation: 'អាជីវករ',
    headNationalId: '020433118',
    spouseName: 'តាំង គីមឡាង',
    spouseGender: 'F',
    spouseOccupation: 'អាជីវករ',
    houseType: 'ផ្ទះថ្មលើឈើក្រោម',
    currentAddress: 'ភូមិអូរគល់សំយ៉ុង ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក',
    familyStatus: 'ទូទៅ',
    phoneNumber: '012 998 877',
    members: [
      {
        id: 'mem-22',
        name: 'ឈន ប៊ុនថា',
        gender: 'M',
        dob: '1981-01-15',
        age: 45,
        relationship: 'មេគ្រួសារ',
        occupation: 'អាជីវករ'
      },
      {
        id: 'mem-23',
        name: 'ឈន ចាន់ដារ៉ា',
        gender: 'M',
        dob: '2013-04-18',
        age: 13,
        relationship: 'កូន',
        occupation: 'សិស្ស',
        isStudentAtSchool: true,
        studentGrade: 6,
        studentSection: 'ក',
        studentCode: 'STU-2024-001'
      }
    ],
    remarks: 'សិស្សឆ្នើមប្រចាំថ្នាក់ទី៦ក គ្រួសារគាំទ្រការសិក្សាល្អ',
    recordedBy: 'លោក ចាន់ វុទ្ធី'
  }
];

export const initialLibraryBooks: any[] = [
  {
    id: 'bk-1',
    code: 'LIB-ST-001',
    titleKhmer: 'រឿង ទន្សាយនិងអណ្តើក',
    titleLatin: 'The Tortoise and the Hare',
    category: 'storybook',
    format: 'physical',
    author: 'រឿងព្រេងបុរាណខ្មែរ',
    publisher: 'គ្រឹះស្ថានបោះពុម្ពអប់រំ MoEYS',
    publishedYear: '2022',
    targetGrade: 2,
    totalCopies: 25,
    availableCopies: 18,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'ទូ A-01 (រឿងនិទានកុមារ)',
    notes: 'សៀវភៅរឿងរូបភាពពណ៌ធម្មជាតិ មានអក្សរធំៗងាយស្រួលអាន'
  },
  {
    id: 'bk-2',
    code: 'LIB-LIT-002',
    titleKhmer: 'ប្រជុំរឿងព្រេងប្រជាប្រិយខ្មែរ (ភាគទី ១)',
    titleLatin: 'Khmer Folktales Collection Vol. 1',
    category: 'literature',
    format: 'physical',
    author: 'គណៈកម្មសាបពុទ្ធសាសនបណ្ឌិត្យ',
    publisher: 'គ្រឹះស្ថានបោះពុម្ព និងចែកផ្សាយ',
    publishedYear: '2023',
    targetGrade: 5,
    totalCopies: 30,
    availableCopies: 22,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd5?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'ទូ A-02 (ផ្នែកអក្សរសាស្ត្រ)',
    notes: 'សៀវភៅអក្សរសាស្ត្របុរាណ បណ្តុះស្មារតីស្រលាញ់វប្បធម៌ជាតិ'
  },
  {
    id: 'bk-3',
    code: 'LIB-SCI-001',
    titleKhmer: 'វិទ្យាសាស្ត្រធម្មជាតិ & បរិស្ថានថ្នាក់បឋម',
    titleLatin: 'Elementary Natural Science & Environment',
    category: 'science',
    format: 'digital',
    digitalFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    author: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    publisher: 'នាយកដ្ឋានបច្ចេកវិទ្យាអប់រំ',
    publishedYear: '2024',
    targetGrade: 4,
    totalCopies: 50,
    availableCopies: 50,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'បណ្ណាល័យឌីជីថល (Cloud E-Book)',
    notes: 'សៀវភៅឌីជីថល PDF សម្រាប់សិស្សអានតាមថ្នាក់រៀនឆ្លាតវៃ'
  },
  {
    id: 'bk-4',
    code: 'LIB-HIS-001',
    titleKhmer: 'ប្រវត្តិសាស្ត្រអង្គរវត្ត និងអរិយធម៌ខ្មែរ',
    titleLatin: 'History of Angkor Wat & Khmer Civilization',
    category: 'history',
    format: 'physical',
    author: 'បណ្ឌិត អាំង ទុយ',
    publisher: 'គ្រឹះស្ថានបោះពុម្ពអប្សរា',
    publishedYear: '2023',
    targetGrade: 6,
    totalCopies: 20,
    availableCopies: 15,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1599811210002-3c87f374e2a6?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'ទូ C-01 (ផ្នែកប្រវត្តិសាស្ត្រ)',
    notes: 'ស្វែងយល់ពីប្រវត្តិសាស្ត្រមហានគរ និងប្រាសាទបុរាណ'
  },
  {
    id: 'bk-5',
    code: 'LIB-MAT-001',
    titleKhmer: 'លំហាត់គណិតវិទ្យាអភិវឌ្ឍន៍ខួរក្បាល ថ្នាក់ទី៦',
    titleLatin: 'Advanced Math Practice Grade 6',
    category: 'mathematics',
    format: 'physical',
    author: 'ក្រុមប្រឹក្សាគរុកោសល្យគណិតវិទ្យា',
    publisher: 'MoEYS',
    publishedYear: '2024',
    targetGrade: 6,
    totalCopies: 40,
    availableCopies: 32,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'ទូ B-03 (ផ្នែកគណិតវិទ្យា)',
    notes: 'รวมលំហាត់ប្រកួតប្រជែងសិស្សពូកែគណិតវិទ្យាថ្នាក់បឋមសិក្សា'
  },
  {
    id: 'bk-6',
    code: 'LIB-GEO-001',
    titleKhmer: 'ភូមិវិទ្យាប្រទេសកម្ពុជា & សង្គមពិភពលោក',
    titleLatin: 'Geography of Cambodia & World Society',
    category: 'geography',
    format: 'digital',
    digitalFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    author: 'នាយកដ្ឋានកម្មវិធីសិក្សា ក្រសួងអប់រំ',
    publisher: 'MoEYS',
    publishedYear: '2024',
    targetGrade: 5,
    totalCopies: 35,
    availableCopies: 35,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'បណ្ណាល័យឌីជីថល (Cloud E-Book)',
    notes: 'ផែនទីឌីជីថល និងសៀវភៅភូមិវិទ្យាស្រុកទេស'
  },
  {
    id: 'bk-7',
    code: 'LIB-REF-001',
    titleKhmer: 'វចនានុក្រមខ្មែរ សម្តេចព្រះសង្ឃរាជ ជួន ណាត',
    titleLatin: 'Chuon Nath Khmer Dictionary',
    category: 'reference',
    format: 'physical',
    author: 'សម្តេចព្រះសង្ឃរាជ ជួន ណាត',
    publisher: 'ពុទ្ធសាសនបណ្ឌិត្យ',
    publishedYear: '2020',
    totalCopies: 10,
    availableCopies: 8,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
    shelfLocation: 'ទូ R-01 (វចនានុក្រម និងឯកសារយោង)',
    notes: 'សម្រាប់សិស្ស និងលោកគ្រូ-អ្នកគ្រូ ស្រាវជ្រាវក្នុងបណ្ណាល័យ'
  }
];

export const initialReadingLogs: any[] = [
  {
    id: 'rl-1',
    studentId: 's-1',
    studentCode: 'STU-2024-001',
    studentNameKhmer: 'សុខ វិបុល',
    grade: 6,
    section: 'ក',
    bookId: 'bk-2',
    bookTitle: 'រឿង ធនញ្ជ័យ និងស្តេចចិន',
    bookCategory: 'storybook',
    borrowDate: '2026-08-10',
    dueDate: '2026-08-17',
    returnDate: '2026-08-16',
    status: 'returned',
    pagesRead: 45,
    readingSummary: 'បានយល់ដឹងពីភាពឆ្លាតវៃរបស់ធនញ្ជ័យក្នុងការការពារកិត្តិយសជាតិ',
    teacherLibrarianSign: 'អ្នកគ្រូ បណ្ណារក្ស'
  },
  {
    id: 'rl-2',
    studentId: 's-2',
    studentCode: 'STU-2024-002',
    studentNameKhmer: 'ចាន់ រស្មី',
    grade: 6,
    section: 'ក',
    bookId: 'bk-1',
    bookTitle: 'រឿង ទន្សាយនិងអណ្តើក',
    bookCategory: 'storybook',
    borrowDate: '2026-08-14',
    dueDate: '2026-08-21',
    status: 'borrowed',
    pagesRead: 20,
    readingSummary: 'អានដល់វគ្គទន្សាយគេងលង់លក់ក្រោមដើមឈើ',
    teacherLibrarianSign: 'អ្នកគ្រូ បណ្ណារក្ស'
  }
];

export const initialProfileEditRequests: ProfileEditRequest[] = [
  {
    id: 'req-1',
    userId: 'u-3',
    userName: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
    userRole: 'teacher',
    targetType: 'teacher',
    targetId: 't-3',
    requestedFields: {
      phone: '092 445 577',
      bankAccountNumber: '001-998877-66 (ACLEDA)',
      currentAddress: 'ភូមិអូរគល់សំយ៉ុង ឃុំបារាំងធ្លាក់ ស្រុកភ្នំព្រឹក'
    },
    reason: 'ផ្លាស់ប្តូរលេខទូរស័ព្ទទាក់ទង និងកែសម្រួលលេខគណនីបៀវត្សរ៍ធនាគារថ្មី',
    status: 'pending',
    createdAt: '2026-08-20'
  },
  {
    id: 'req-2',
    userId: 'u-5',
    userName: 'សុខ វិបុល',
    userRole: 'student',
    targetType: 'student',
    targetId: 's-1',
    requestedFields: {
      guardianPhone: '012 334 455',
      address: 'ភូមិអូរគល់សំយ៉ុង'
    },
    reason: 'ផ្លាស់ប្តូរលេខទូរស័ព្ទអាណាព្យាបាល (ឪពុក)',
    status: 'approved',
    createdAt: '2026-08-18',
    reviewedBy: 'លោក លីម សន (នាយកសាលា)',
    reviewedAt: '2026-08-19',
    reviewNotes: 'អនុញ្ញាតឱ្យធ្វើបច្ចុប្បន្នភាពទិន្នន័យទំនាក់ទំនងអាណាព្យាបាល'
  }
];

export const initialLessonPlans: LessonPlan[] = [
  {
    id: 'lp-1',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    subject: 'ភាសាខ្មែរ',
    lessonNumber: 'មេរៀនទី៥',
    lessonTitle: 'ការតែងសេចក្តីពណ៌នាអំពីរូបរាងមនុស្ស (សេចក្តីផ្តើម និងតួសេចក្តី)',
    teachingDate: '2026-08-25',
    durationMinutes: 60,
    objectives: {
      knowledge: 'សិស្សកំណត់បាននូវទម្រង់ និងគន្លឹះសំខាន់ៗនៃការពណ៌នារូបរាងមនុស្សបានត្រឹមត្រូវតាមលំដាប់លំដោយ។',
      skills: 'សិស្សអាចសរសេរប្រយោគ និងកថាខណ្ឌពណ៌នាពីកាយវិការ សំលៀកបំពាក់ និងទឹកមុខបានយ៉ាងក្បោះក្បាយ។',
      attitude: 'បណ្តុះស្មារតីសង្កេត ស្រឡាញ់អក្សរសាស្ត្រជាតិ និងមានទំនុកចិត្តក្នុងការសរសេរតែងសេចក្តី។'
    },
    teachingAids: 'សៀវភៅពុម្ពភាសាខ្មែរថ្នាក់ទី៦, រូបភាពគំរូតួអង្គ, ក្តារខៀនតូច, ប័ណ្ណពាក្យគន្លឹះ',
    steps: {
      step1ClassManagement: 'ពិនិត្យអនាម័យថ្នាក់រៀន ឯកសណ្ឋាន ស្រង់វត្តមានសិស្ស និងពង្រឹងវិន័យ (៣នាទី)',
      step2ReviewOldLesson: 'សួរសំណួររំលឹកកាលពីម៉ោងមុន៖ តើការពណ៌នាមានប៉ុន្មានប្រភេទ? ពិនិត្យកិច្ចការផ្ទះ (៧នាទី)',
      step3NewLesson: 'បង្ហាញរូបភាពគំរូតួអង្គ។ គ្រូពន្យល់ពីទម្រង់សេចក្តីផ្តើម និងការរៀបចំគំនិតក្នុងតួសេចក្តី។ ដាក់សិស្សឱ្យធ្វើការពិភាក្សាជាក្រុម ៤នាក់ សរសេរព្រាងកថាខណ្ឌ (៣០នាទី)',
      step4Consolidation: 'តំណាងក្រុមឡើងអានកថាខណ្ឌដែលបានតែង។ គ្រូ និងសិស្សចូលរួមផ្តល់មតិកែលម្អ និងសង្ខេបចំណុចគន្លឹះ (១៥នាទី)',
      step5HomeworkAndAdvice: 'ដាក់កិច្ចការផ្ទះ៖ សរសេរតែងសេចក្តីពេញលេញពណ៌នាអំពីមនុស្សជាទីស្រឡាញ់ម្នាក់។ ដាស់តឿនសិស្សជួយការងារឪពុកម្តាយនៅផ្ទះ (៥នាទី)'
    },
    teacherReflection: 'សិស្សានុសិស្សភាគច្រើនយល់ច្បាស់ពីរបៀបប្រើគុណនាមពណ៌នា។ សិស្សមួយចំនួនត្រូវការការណែនាំបន្ថែមលើការភ្ជាប់ប្រយោគ។',
    status: 'approved',
    approvedBy: 'លោក ចាន់ វុទ្ធី (នាយករង & គ្រូទទួលបន្ទុក)',
    createdAt: '2026-08-22'
  },
  {
    id: 'lp-2',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    subject: 'គណិតវិទ្យា',
    lessonNumber: 'មេរៀនទី១២',
    lessonTitle: 'ការគណនាផ្ទៃក្រឡា និងបរិមាត្រត្រីកោណ',
    teachingDate: '2026-08-26',
    durationMinutes: 60,
    objectives: {
      knowledge: 'សិស្សយល់ច្បាស់ពីរូបមន្តគណនាផ្ទៃក្រឡាត្រីកោណ S = (បាត x កម្ពស់) / 2។',
      skills: 'សិស្សអាចអនុវត្តគណនាផ្ទៃក្រឡា និងដោះស្រាយចំណោទជាក់ស្តែងបានត្រឹមត្រូវ។',
      attitude: 'បណ្តុះទម្លាប់គិតបែបឡូជីខល ភាពហ្មត់ចត់ និងចូលចិត្តដោះស្រាយលំហាត់។'
    },
    teachingAids: 'បន្ទាត់ត្រីកោណ, បន្ទាត់វែង, ក្រដាសក្រឡាចត្រង្គ, រូបធរណីមាត្រកាត់គំរូ',
    steps: {
      step1ClassManagement: 'រៀបចំរបៀបរៀបរយ ត្រួតពិនិត្យវត្តមាន និងឧបករណ៍សិក្សា (៣នាទី)',
      step2ReviewOldLesson: 'រំលឹកការគណនាផ្ទៃក្រឡាចតុកោណកែង និងកែសំណួរលំហាត់ចាស់ (៧នាទី)',
      step3NewLesson: 'កាត់ចតុកោណកែងជាពីរដើម្បីបង្ហាញរូបមន្តត្រីកោណ។ គ្រូបង្ហាញឧទាហរណ៍គំរូលើក្តារខៀន។ សិស្សអនុវត្តលំហាត់លើក្តារឆ្នួន (៣០នាទី)',
      step4Consolidation: 'សិស្ស ២នាក់ឡើងដោះស្រាយលំហាត់ចំណោទលើក្តារខៀន។ គ្រូវាយតម្លៃ និងកែតម្រូវ (១៥នាទី)',
      step5HomeworkAndAdvice: 'កិច្ចការផ្ទះ៖ លំហាត់ទំព័រ ៦៨ លេខ ១, ២, ៣។ ណែនាំឱ្យជិះកង់ប្រុងប្រយ័ត្នពេលត្រឡប់ទៅផ្ទះ (៥នាទី)'
    },
    teacherReflection: 'សិស្សអនុវត្តបានលឿន និងសកម្មក្នុងការធ្វើការជាក្រុម។',
    status: 'approved',
    approvedBy: 'លោក ចាន់ វុទ្ធី',
    createdAt: '2026-08-21'
  },
  {
    id: 'lp-3',
    grade: 1,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    subject: 'ភាសាខ្មែរ (អំណាន)',
    lessonNumber: 'មេរៀនទី១៨',
    lessonTitle: 'ព្យញ្ជនៈផ្សំស្រៈ «កា កិ កី កឹ កឺ កុ កូ»',
    teachingDate: '2026-08-25',
    durationMinutes: 45,
    objectives: {
      knowledge: 'សិស្សស្គាល់ និងបញ្ចេញសំឡេងព្យញ្ជនៈ «ក» ផ្សំស្រៈនិស្ស័យបានច្បាស់លាស់។',
      skills: 'សិស្សអាចអាន និងសរសេរពាក្យផ្សំស្រៈបានត្រឹមត្រូវតាមលំដាប់តួអក្សរ។',
      attitude: 'សប្បាយរីករាយក្នុងការរៀនអាន និងមានវិន័យស្ងប់ស្ងាត់ក្នុងថ្នាក់។'
    },
    teachingAids: 'ប័ណ្ណអក្សររូបភាព, ក្តារឆ្នួន, សៀវភៅអំណានដំបូង',
    steps: {
      step1ClassManagement: 'ច្រៀងចម្រៀងអក្សរខ្មែររួមគ្នា និងរៀបចំកន្លែងអង្គុយ (៥នាទី)',
      step2ReviewOldLesson: 'លើកប័ណ្ណព្យញ្ជនៈ «ក ខ គ» ឱ្យសិស្សអានរួមគ្នា (៥នាទី)',
      step3NewLesson: 'គ្រូបិទប័ណ្ណផ្សំស្រៈ «កា កិ កី» អានធ្វើគំរូ។ សិស្សអានតាមគ្រូ អានជាក្រុម និងអានម្នាក់ៗ (២០នាទី)',
      step4Consolidation: 'ល្បែងផ្គូផ្គងរូបភាព និងពាក្យ។ សរសេរលើក្តារឆ្នួន (១០នាទី)',
      step5HomeworkAndAdvice: 'ហាត់អានជាមួយឪពុកម្តាយនៅផ្ទះទំព័រ ២២ (៥នាទី)'
    },
    teacherReflection: 'កុមារចូលចិត្តល្បែងផ្គូផ្គងណាស់។',
    status: 'approved',
    approvedBy: 'អ្នកគ្រូ ស៊ឹម ស្រីមុំ',
    createdAt: '2026-08-22'
  }
];

export const initialParentMeetings: ParentMeeting[] = [
  {
    id: 'pm-1',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    meetingTitle: 'កិច្ចប្រជុំមាតាបិតាដើមឆ្នាំសិក្សា និងបង្កើតគណៈកម្មការទ្រទ្រង់ថ្នាក់រៀន (គ.គ.ថ.)',
    meetingType: 'beginning_year',
    meetingDate: '2024-10-20',
    meetingTime: '08:00 - 10:30 ព្រឹក',
    location: 'បន្ទប់រៀនថ្នាក់ទី៦ក សាលាបឋមសិក្សាភ្នំពុំ',
    agenda: [
      '១. បទបង្ហាញអំពីបទបញ្ជាផ្ទៃក្នុងសាលា និងវិន័យសិស្ស',
      '២. ការត្រៀមរៀបចំការប្រឡងបញ្ចប់ភូមិសិក្សា (ឌីប្លូមបឋម)',
      '៣. ការបោះឆ្នោតជ្រើសរើសគណៈកម្មការទ្រទ្រង់ថ្នាក់រៀន (គ.គ.ថ.)',
      '៤. កិច្ចព្រមព្រៀងរួមគ្នារវាងគ្រូ និងមាតាបិតាក្នុងការតាមដានវត្តមាន និងកិច្ចការផ្ទះ',
      '៥. មតិសំណេះសំណាល និងសំណូមពរផ្សេងៗ'
    ],
    objectives: 'ផ្សារភ្ជាប់ទំនាក់ទំនងជិតស្និទ្ធរវាងសាលារៀន គ្រូ និងអាណាព្យាបាលសិស្ស ដើម្បីធានាអត្រាបញ្ចប់ការសិក្សា ១០០% និងទប់ស្កាត់ការបោះបង់ការសិក្សា។',
    totalParentsInvited: 32,
    totalParentsAttended: 30,
    minutes: 'កិច្ចប្រជុំបានប្រព្រឹត្តទៅក្រោមបរិយាកាសរីករាយ និងស្និទ្ធស្នាល។ លោកគ្រូបន្ទុកថ្នាក់បានរាយការណ៍អំពីផែនការសិក្សា ម៉ោងបង្រៀនបន្ថែម និងវិធីសាស្ត្រតាមដានពិន្ទុតាមប្រព័ន្ធឌីជីថល។ មាតាបិតាបានសម្តែងការពេញចិត្ត និងប្តេជ្ញាជួយជំរុញកូនៗរៀនសូត្រនៅផ្ទះ។',
    resolutions: [
      'ឯកភាពបង្កើតក្រុម Telegram សម្រាប់ទំនាក់ទំនងព័ត៌មានបន្ទាន់',
      'មាតាបិតាធានាពិនិត្យសៀវភៅតាមដាន និងកិច្ចការផ្ទះកូនជារៀងរាល់ល្ងាច',
      'ជ្រើសរើសលោក សុខ សារ៉េត ជាប្រធាន គ.គ.ថ. ថ្នាក់ទី៦ក'
    ],
    parentRepresentatives: [
      {
        role: 'president',
        roleTitleKhmer: 'ប្រធាន គ.គ.ថ. ថ្នាក់',
        name: 'លោក សុខ សារ៉េត',
        phone: '012 334 455',
        occupation: 'អាជីវករ',
        studentName: 'សុខ វិបុល'
      },
      {
        role: 'vice_president',
        roleTitleKhmer: 'អនុប្រធាន គ.គ.ថ.',
        name: 'អ្នកស្រី ម៉ែន គន្ធា',
        phone: '012 334 455',
        occupation: 'មន្ត្រីរាជការ',
        studentName: 'ឈុន មុន្នីរ័ត្ន'
      },
      {
        role: 'treasurer',
        roleTitleKhmer: 'ហិរញ្ញឹក',
        name: 'លោក ចាន់ សុភា',
        phone: '011 223 344',
        occupation: 'កសិករ',
        studentName: 'ចាន់ រស្មី'
      }
    ],
    status: 'completed',
    createdAt: '2024-10-20'
  },
  {
    id: 'pm-2',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    meetingTitle: 'កិច្ចប្រជុំពិភាក្សាលទ្ធផលឆមាសទី១ និងពង្រឹងសិស្សរៀនយឺត',
    meetingType: 'mid_year',
    meetingDate: '2025-03-15',
    meetingTime: '08:30 - 10:30 ព្រឹក',
    location: 'បន្ទប់រៀនថ្នាក់ទី៦ក',
    agenda: [
      '១. សង្ខេបលទ្ធផលប្រឡងឆមាសទី១ និងការស្រង់ពិន្ទុ',
      '២. ពិភាក្សាលើសិស្សមានពិន្ទុមធ្យម ឬប្រឈម និងវិធានការជួយបន្ថែម',
      '៣. ផែនការបំប៉នមុខវិជ្ជា គណិតវិទ្យា និងភាសាខ្មែរ',
      '៤. ការត្រៀមលក្ខណៈមុនថ្ងៃឈប់សម្រាកចូលឆ្នាំខ្មែរ'
    ],
    objectives: 'ជម្រាបជូនមាតាបិតាពីការវិវត្តនៃការសិក្សារបស់កូនៗ និងរួមគ្នាលើកកម្ពស់លទ្ធផលសិក្សាឆមាសទី២។',
    totalParentsInvited: 32,
    totalParentsAttended: 29,
    minutes: 'លោកគ្រូបានបង្ហាញតារាងចំណាត់ថ្នាក់ និងកោតសរសើរសិស្សឆ្នើម។ ចំពោះសិស្សរៀនយឺត ៣រូប គ្រូបានជួបផ្ទាល់ជាមួយឪពុកម្តាយដើម្បីរៀបចំកាលវិភាគស្វ័យសិក្សានៅផ្ទះ។',
    resolutions: [
      'រៀបចំម៉ោងបំប៉នសិស្សរៀនយឺតរៀងរាល់រសៀលថ្ងៃព្រហស្បតិ៍',
      'មាតាបិតាកាត់បន្ថយការប្រើប្រាស់ទូរស័ព្ទលេងហ្គេមរបស់កូននៅផ្ទះ'
    ],
    status: 'completed',
    createdAt: '2025-03-15'
  },
  {
    id: 'pm-3',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    meetingTitle: 'កិច្ចប្រជុំមាតាបិតាត្រៀមការប្រឡងបញ្ចប់ភូមិសិក្សា និងបំប៉នសិស្សពូកែ',
    meetingType: 'end_year',
    meetingDate: '2026-08-25',
    meetingTime: '08:00 - 10:00 ព្រឹក',
    location: 'បន្ទប់រៀនថ្នាក់ទី៦ក',
    agenda: [
      '១. បទបង្ហាញអំពីកាលវិភាគប្រឡង និងវិញ្ញាសាត្រៀមឌីប្លូមបឋម',
      '២. របៀបរៀបចំម៉ោងស្វ័យសិក្សា និងការលើកទឹកចិត្តកូនៗនៅផ្ទះ',
      '៣. ពិភាក្សាអំពីអាហារូបករណ៍ និងការបន្តការសិក្សានៅអនុវិទ្យាល័យ'
    ],
    objectives: 'ត្រៀមលក្ខណៈ និងសហការជាមួយមាតាបិតា ដើម្បីឱ្យសិស្សថ្នាក់ទី៦ ទទួលបានលទ្ធផលប្រឡងល្អ ១០០%។',
    totalParentsInvited: 32,
    totalParentsAttended: 0,
    minutes: 'មិនទាន់ដល់ថ្ងៃប្រជុំ',
    resolutions: [],
    status: 'upcoming',
    createdAt: '2026-08-20'
  },
  {
    id: 'pm-4',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    meetingTitle: 'កិច្ចប្រជុំបន្ទាន់គណៈកម្មការទ្រទ្រង់ថ្នាក់រៀន (គ.គ.ថ.) ស្តីពីសួនកុមារមេត្រី',
    meetingType: 'emergency',
    meetingDate: '2026-08-28',
    meetingTime: '02:00 - 04:00 រសៀល',
    location: 'សាលប្រជុំតូច សាលាបឋមសិក្សាភ្នំពុំ',
    agenda: [
      '១. ពិភាក្សាការរៀបចំសម្ភារៈតុបតែងបន្ទប់រៀន និងសួនជីវចម្រុះថ្នាក់',
      '២. កៀរគរការចូលរួមជួយសម្អាតបរិស្ថានថ្នាក់ពីមាតាបិតាស្ម័គ្រចិត្ត'
    ],
    objectives: 'ពង្រឹងស្ដង់ដាបរិស្ថានថ្នាក់រៀនកុមារមេត្រី និងការចូលរួមរបស់សហគមន៍។',
    totalParentsInvited: 12,
    totalParentsAttended: 0,
    minutes: 'មិនទាន់ដល់ថ្ងៃប្រជុំ',
    resolutions: [],
    status: 'upcoming',
    createdAt: '2026-08-21'
  }
];

export const initialParentRequests: ParentRequest[] = [
  {
    id: 'pr-1',
    studentId: 's-1',
    studentName: 'សុខ វិបុល',
    grade: 6,
    section: 'ក',
    parentName: 'លោក សុខ សារ៉េត (ឪពុក)',
    parentPhone: '012 334 455',
    parentRelationship: 'ឪពុក',
    requestType: 'leave_request',
    title: 'សុំច្បាប់ឈប់សម្រាក ២ ថ្ងៃដោយសារជំងឺគ្រុនក្តៅ',
    details: 'កូនប្រុស វិបុល មានអាការៈក្តៅខ្លួនខ្លាំង និងក្អក គ្រូពេទ្យនៅមណ្ឌលសុខភាពបានចេញវេជ្ជបញ្ជាឱ្យសម្រាកព្យាបាលនៅផ្ទះចំនួន ២ថ្ងៃ (ថ្ងៃទី២៣ និង ២៤ សីហា)។ ខ្ញុំបាទនឹងជួយបង្រៀនមេរៀន និងកិច្ចការផ្ទះកូនបន្ថែមពេលធូរស្បើយ។',
    urgency: 'immediate',
    targetDate: '2026-08-23',
    durationDays: 2,
    status: 'pending',
    createdAt: '2026-08-22'
  },
  {
    id: 'pr-2',
    studentId: 's-3',
    studentName: 'មាស សុវណ្ណ',
    grade: 6,
    section: 'ក',
    parentName: 'អ្នកស្រី គង់ សុភាព (ម្តាយ)',
    parentPhone: '097 889 911',
    parentRelationship: 'ម្តាយ',
    requestType: 'consultation',
    title: 'សុំណាត់ជួបផ្ទាល់ពិគ្រោះយោបល់លើមុខវិជ្ជាគណិតវិទ្យា',
    details: 'នាងខ្ញុំសង្កេតឃើញកូន សុវណ្ណ ពិបាកយល់លើមេរៀនប្រភាគ និងធរណីមាត្រ នាងខ្ញុំចង់សុំជួបលោកគ្រូបន្ទុកថ្នាក់នៅម៉ោងចេញលេងថ្ងៃចន្ទ ដើម្បីសុំការណែនាំពីវិធីសាស្ត្របង្រៀនកូននៅផ្ទះ។',
    urgency: 'urgent',
    targetDate: '2026-08-24',
    status: 'pending',
    createdAt: '2026-08-21'
  },
  {
    id: 'pr-3',
    studentId: 's-2',
    studentName: 'ចាន់ រស្មី',
    grade: 6,
    section: 'ក',
    parentName: 'លោក ចាន់ សុភា (ឪពុក)',
    parentPhone: '011 223 344',
    parentRelationship: 'ឪពុក',
    requestType: 'health_alert',
    title: 'ដំណឹងបន្ទាន់៖ សិស្សមានអាឡែកហ្ស៊ីនឹងធូលី និងលម្អងផ្កា',
    details: 'ជម្រាបលោកគ្រូ រស្មី មានប្រតិកម្មអាឡែកហ្ស៊ីផ្លូវដង្ហើម ពេលបោសសម្អាតថ្នាក់ សូមលោកគ្រូជួយចាត់ចែងឱ្យកូនពាក់ម៉ាស ឬបំពេញកិច្ចការរៀបចំតុជំនួសវិញ។ សូមអរគុណលោកគ្រូ។',
    urgency: 'urgent',
    status: 'acknowledged',
    teacherReply: 'លោកគ្រូបានកត់ត្រា និងប្តូរវេនការងារសម្អាតឱ្យ រស្មី ទទួលបន្ទុកជូតក្តារខៀន និងរៀបចំសៀវភៅជំនួសវិញហើយ។',
    resolvedAt: '2026-08-21',
    createdAt: '2026-08-20'
  },
  {
    id: 'pr-4',
    studentId: 's-4',
    studentName: 'កែវ សុជាតា',
    grade: 6,
    section: 'ក',
    parentName: 'អ្នកស្រី ហែម ម៉ាលី (ម្តាយ)',
    parentPhone: '088 776 655',
    parentRelationship: 'ម្តាយ',
    requestType: 'profile_update',
    title: 'ស្នើសុំកែប្រែលេខទូរស័ព្ទអាណាព្យាបាលថ្មី',
    details: 'នាងខ្ញុំបានប្តូរមកប្រើលេខទូរស័ព្ទ 088 776 655 និងភ្ជាប់ Telegram លើលេខនេះ។ សូមលោកគ្រូជួយកែសម្រួលក្នុងបញ្ជីទាក់ទងថ្នាក់។',
    urgency: 'normal',
    status: 'approved',
    teacherReply: 'បានធ្វើបច្ចុប្បន្នភាពលេខទូរស័ព្ទក្នុងប្រព័ន្ធរួចរាល់។',
    resolvedAt: '2026-08-19',
    createdAt: '2026-08-18'
  },
  {
    id: 'pr-5',
    studentId: 's-5',
    studentName: 'ស៊ន វណ្ណដា',
    grade: 1,
    section: 'ក',
    parentName: 'លោក ស៊ន សុខ (ឪពុក)',
    parentPhone: '092 112 233',
    parentRelationship: 'ឪពុក',
    requestType: 'leave_request',
    title: 'សុំច្បាប់ឈប់ ១ ថ្ងៃ ទៅចូលរួមពិធីបុណ្យគ្រួសារ',
    details: 'សុំច្បាប់កូន វណ្ណដា ឈប់សម្រាកថ្ងៃចន្ទ ១ថ្ងៃ ដើម្បីទៅស្រុកកំណើតជាមួយឪពុកម្តាយ។',
    urgency: 'normal',
    targetDate: '2026-08-25',
    durationDays: 1,
    status: 'pending',
    createdAt: '2026-08-22'
  }
];

export const initialClassCouncils: ClassCouncil[] = [
  {
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    motto: 'សាមគ្គីភាព វិន័យ សិក្សាពូកែ និងអនាម័យស្អាត',
    officers: [
      {
        role: 'president',
        roleTitleKhmer: 'ប្រធានថ្នាក់',
        studentId: 's-1',
        studentName: 'សុខ វិបុល',
        gender: 'M',
        phone: '012 334 455',
        notes: 'ដឹកនាំជួរគោរពទង់ជាតិ និងជួយគ្រប់គ្រងសណ្តាប់ធ្នាប់ថ្នាក់'
      },
      {
        role: 'vice_president',
        roleTitleKhmer: 'អនុប្រធានថ្នាក់',
        studentId: 's-2',
        studentName: 'ចាន់ រស្មី',
        gender: 'F',
        phone: '011 223 344',
        notes: 'ជួយកិច្ចការរដ្ឋបាល និងត្រួតពិនិត្យវត្តមាន'
      },
      {
        role: 'study_officer',
        roleTitleKhmer: 'ប្រធានផ្នែកសិក្សា',
        studentId: 's-4',
        studentName: 'កែវ សុជាតា',
        gender: 'F',
        notes: 'ប្រមូលសៀវភៅកិច្ចការផ្ទះ និងជួយមិត្តរៀនយឺត'
      },
      {
        role: 'discipline_officer',
        roleTitleKhmer: 'ប្រធានផ្នែកវិន័យ',
        studentId: 's-3',
        studentName: 'មាស សុវណ្ណ',
        gender: 'M',
        notes: 'ពិនិត្យឯកសណ្ឋាន និងការគោរពបទបញ្ជាផ្ទៃក្នុង'
      },
      {
        role: 'hygiene_officer',
        roleTitleKhmer: 'ប្រធានផ្នែកអនាម័យ',
        studentId: 's-6',
        studentName: 'ឈុន មុន្នីរ័ត្ន',
        gender: 'F',
        notes: 'រៀបចំកាលវិភាគបោសសម្អាត និងថែសួនផ្កាថ្នាក់'
      }
    ]
  }
];

// ----------------------------------------------------
// INITIAL SCHOOL ADMINISTRATION & CORRESPONDENCE
// ----------------------------------------------------
export const initialCorrespondences: OfficialCorrespondence[] = [
  {
    id: 'cor-1',
    type: 'inward',
    logNumber: '០២៤/២៤ លខ.អយក',
    referenceNumber: 'លិខិតលេខ ៥៨៩ អយក.បឋ',
    docDate: '2024-10-10',
    receivedOrSentDate: '2024-10-12',
    subject: 'សេចក្តីណែនាំស្តីពីការពង្រឹងការអនុវត្តស្ដង់ដាសាលារៀនគំរូ សម្រាប់ឆ្នាំសិក្សា ២០២៤-២០២៥',
    senderOrRecipient: 'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង',
    urgency: 'urgent',
    classification: 'ministerial_directive',
    responsibleStaffName: 'លោក លីម សន (នាយក)',
    status: 'in_progress',
    academicYear: '២០២៤ - ២០២៥',
    notes: 'បានចាត់ចែងផ្សព្វផ្សាយដល់លោកគ្រូ-អ្នកគ្រូក្នុងកិច្ចប្រជុំប្រចាំខែ'
  },
  {
    id: 'cor-2',
    type: 'inward',
    logNumber: '០២៨/២៤ លខ.អយក',
    referenceNumber: 'លិខិតលេខ ០១២ ការិ.អយក',
    docDate: '2024-10-25',
    receivedOrSentDate: '2024-10-27',
    subject: 'ការត្រួតពិនិត្យ និងវាយតម្លៃការអាន-សរសើរភាសាខ្មែរ និងគណិតវិទ្យាថ្នាក់ដំបូង (EGRA/EGMA)',
    senderOrRecipient: 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកភ្នំព្រឹក',
    urgency: 'normal',
    classification: 'official_letter',
    responsibleStaffName: 'អ្នកគ្រូ កែវ មុន្នី (គ្រូទី១)',
    status: 'completed',
    academicYear: '២០២៤ - ២០២៥',
    notes: 'បានរៀបចំសំណុំលទ្ធផលតេស្តសិស្សថ្នាក់ទី១ និងទី២ រួចរាល់'
  },
  {
    id: 'cor-3',
    type: 'outward',
    logNumber: '០១៥/២៤ រប.សបក',
    referenceNumber: 'របាយការណ៍លេខ ០១៥ សបក',
    docDate: '2024-11-05',
    receivedOrSentDate: '2024-11-06',
    subject: 'របាយការណ៍ស្ថិតិដើមឆ្នាំសិក្សា ២០២៤-២០២៥ និងតម្រូវការសៀវភៅពុម្ពគោល',
    senderOrRecipient: 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកភ្នំព្រឹក',
    urgency: 'normal',
    classification: 'report_document',
    responsibleStaffName: 'លោក ឈិន សុផល (នាយករង)',
    status: 'completed',
    academicYear: '២០២៤ - ២០២៥',
    notes: 'បានផ្ញើតាមប្រព័ន្ធ EMIS និងច្បាប់ចម្លងក្រដាស'
  },
  {
    id: 'cor-4',
    type: 'outward',
    logNumber: '០១៨/២៤ លប.សបក',
    referenceNumber: 'លិខិតលេខ ០១៨ សបក',
    docDate: '2024-11-20',
    receivedOrSentDate: '2024-11-20',
    subject: 'លិខិតបញ្ជាបេសកកម្មចូលរួមវគ្គបណ្តុះបណ្តាលវិធីសាស្ត្របង្រៀនវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា',
    senderOrRecipient: 'សាលាគរុកោសល្យ និងវិក្រឹតការខេត្តបាត់ដំបង',
    urgency: 'urgent',
    classification: 'mission_order',
    responsibleStaffName: 'លោក ស៊ុន ដារ៉ា (គ្រូទី៦)',
    status: 'completed',
    academicYear: '២០២៤ - ២០២៥',
    notes: 'រយៈពេល ៣ថ្ងៃ (២២-២៤ វិច្ឆិកា ២០២៤)'
  },
  {
    id: 'cor-5',
    type: 'inward',
    logNumber: '០៣៥/២៤ លខ.អយក',
    referenceNumber: 'សេចក្តីជូនដំណឹងលេខ ៨៨២',
    docDate: '2024-12-01',
    receivedOrSentDate: '2024-12-03',
    subject: 'ការរៀបចំយុទ្ធនាការកុមារមេត្រី អនាម័យ និងទឹកស្អាតក្នុងគ្រឹះស្ថានបឋមសិក្សា',
    senderOrRecipient: 'អង្គការដៃគូអភិវឌ្ឍន៍ និងមន្ទីរអប់រំខេត្ត',
    urgency: 'normal',
    classification: 'ministerial_directive',
    responsibleStaffName: 'អ្នកគ្រូ ហេង ធីតា (គ្រូទី៤)',
    status: 'in_progress',
    academicYear: '២០២៤ - ២០២៥'
  }
];

export const initialStaffAdministrativeRecords: StaffAdministrativeRecord[] = [
  {
    id: 'sar-1',
    type: 'mission_order',
    staffId: 't-1',
    staffName: 'លោក ស៊ុន ដារ៉ា',
    staffRole: 'គ្រូបង្រៀនថ្នាក់ទី៦',
    title: 'ចូលរួមវគ្គបណ្តុះបណ្តាលវិធីសាស្ត្របង្រៀន STEM កម្រិតបឋមសិក្សា',
    startDate: '2024-11-22',
    endDate: '2024-11-24',
    durationDays: 3,
    reasonOrMission: 'បេសកកម្មចូលរួមវគ្គបណ្តុះបណ្តាលគរុកោសល្យថ្នាក់ខេត្ត តាមការកោះអញ្ជើញរបស់មន្ទីរអប់រំ',
    destinationOrLocation: 'សាលាគរុកោសល្យខេត្តបាត់ដំបង',
    status: 'approved',
    approvedBy: 'លោក លីម សន (នាយកសាលា)',
    approvedDate: '2024-11-20',
    documentRefNumber: 'បក-២០២៤-០១៨',
    createdAt: '2024-11-19'
  },
  {
    id: 'sar-2',
    type: 'leave_request',
    staffId: 't-2',
    staffName: 'អ្នកគ្រូ កែវ មុន្នី',
    staffRole: 'គ្រូបង្រៀនថ្នាក់ទី១',
    title: 'សុំច្បាប់ឈប់សម្រាកព្យាបាលជំងឺគ្រុនផ្តាសាយ',
    startDate: '2024-12-05',
    endDate: '2024-12-07',
    durationDays: 3,
    reasonOrMission: 'មានជំងឺគ្រុនក្តៅ និងឈឺបំពង់ក មានវេជ្ជបញ្ជាពីមណ្ឌលសុខភាពភ្នំព្រឹក',
    status: 'approved',
    approvedBy: 'លោក លីម សន (នាយកសាលា)',
    approvedDate: '2024-12-04',
    documentRefNumber: 'ច្ប-២០២៤-០០៩',
    createdAt: '2024-12-04'
  },
  {
    id: 'sar-3',
    type: 'commendation',
    staffId: 't-3',
    staffName: 'លោក ឈិន សុផល',
    staffRole: 'នាយករង & គ្រូបង្រៀន',
    title: 'ប័ណ្ណសរសើរការបំពេញការងារឆ្នើមក្នុងការដឹកនាំអនាម័យបរិស្ថានសាលារៀន',
    startDate: '2024-09-01',
    endDate: '2024-10-31',
    durationDays: 60,
    reasonOrMission: 'សម្រេចបានលទ្ធផលសាលារៀនស្អាត គ្មានសំរាមប្លាស្ទិក និងលើកកម្ពស់សួនជីវចម្រុះគំរូ',
    status: 'approved',
    approvedBy: 'ប្រធានការិយាល័យអប់រំស្រុកភ្នំព្រឹក',
    approvedDate: '2024-11-01',
    documentRefNumber: 'បស-២០២៤-០៤',
    createdAt: '2024-11-01'
  }
];

export const initialSchoolCommittees: SchoolCommittee[] = [
  {
    id: 'sc-comm-1',
    committeeName: 'គណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.ក.ស. / School Management Committee)',
    decisionNumber: 'សេចក្តីសម្រេចលេខ ០៤/២៤ សបក',
    establishedDate: '2024-10-05',
    mandateYears: '២០២៤ - ២០២៦ (អាណត្តិ ២ឆ្នាំ)',
    members: [
      { id: 'cm-1', name: 'លោក លីម សន', roleInCommittee: 'ប្រធានគណៈកម្មការ', organizationOrPosition: 'នាយកសាលាបឋមសិក្សាភ្នំពុំ', phone: '087 99 19 77' },
      { id: 'cm-2', name: 'លោក ហេង វណ្ណា', roleInCommittee: 'អនុប្រធានគណៈកម្មការ', organizationOrPosition: 'មេឃុំបារាំងធ្លាក់', phone: '012 889 900' },
      { id: 'cm-3', name: 'លោក ឈិន សុផល', roleInCommittee: 'លេខាធិការអចិន្ត្រៃយ៍', organizationOrPosition: 'នាយករងសាលា', phone: '017 445 566' },
      { id: 'cm-4', name: 'លោក ស៊ុន ដារ៉ា', roleInCommittee: 'សមាជិក (តំណាងគ្រូ)', organizationOrPosition: 'តំណាងលោកគ្រូ-អ្នកគ្រូ', phone: '012 334 455' },
      { id: 'cm-5', name: 'លោក សំ សុវណ្ណ', roleInCommittee: 'សមាជិក (តំណាងមាតាបិតា)', organizationOrPosition: 'ប្រធានសមាគមមាតាបិតា', phone: '098 776 655' },
      { id: 'cm-6', name: 'លោក មាស សំបូរ', roleInCommittee: 'សមាជិក (តំណាងសហគមន៍)', organizationOrPosition: 'មេភូមិអូរគល់សំយ៉ុង', phone: '077 112 233' }
    ],
    mainResponsibilities: [
      'អនុម័តផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលារៀន (SDSP) និងផែនការប្រតិបត្តិការប្រចាំឆ្នាំ (AOP)',
      'ត្រួតពិនិត្យ និងតាមដានការប្រើប្រាស់ថវិកាដំណើរការសាលារៀន (PB & SIG)',
      'កៀរគរធនធាន និងការចូលរួមពីសហគមន៍ដើម្បីជួសជុលកែលម្អហេដ្ឋារចនាសម្ព័ន្ធ',
      'ធានាឱ្យសិស្សានុសិស្សទាំងអស់ក្នុងវ័យសិក្សាបានចូលរៀន និងកាត់បន្ថយអត្រាបោះបង់'
    ]
  },
  {
    id: 'sc-comm-2',
    committeeName: 'គណៈកម្មការអភិវឌ្ឍន៍សាលារៀន & សមាគមទ្រទ្រង់ការអប់រំ (គ.អ.ស.)',
    decisionNumber: 'សេចក្តីសម្រេចលេខ ០៧/២៤ សបក',
    establishedDate: '2024-10-18',
    mandateYears: '២០២៤ - ២០២៥',
    members: [
      { id: 'cm-7', name: 'លោក សំ សុវណ្ណ', roleInCommittee: 'ប្រធានសមាគម', organizationOrPosition: 'តំណាងមាតាបិតាសិស្ស', phone: '098 776 655' },
      { id: 'cm-8', name: 'អ្នកស្រី នូ សុខា', roleInCommittee: 'ហេរញ្ញិកសមាគម', organizationOrPosition: 'អាណាព្យាបាលសិស្ស', phone: '097 554 433' },
      { id: 'cm-9', name: 'អ្នកគ្រូ ហេង ធីតា', roleInCommittee: 'សមាជិកកត់ត្រា', organizationOrPosition: 'គ្រូបង្រៀន', phone: '010 667 788' }
    ],
    mainResponsibilities: [
      'រៀបចំពិធីបុណ្យផ្កាប្រាក់មហាសាមគ្គីកសាងរបងសាលា និងសួនកុមារ',
      'ជួយឧបត្ថម្ភអាហារូបករណ៍ដល់សិស្សក្រីក្រ និងកុមារកំព្រា',
      'សហការជាមួយសាលាក្នុងការថែរក្សាសន្តិសុខ សណ្តាប់ធ្នាប់ និងអនាម័យបរិស្ថាន'
    ]
  }
];

// ----------------------------------------------------
// INITIAL SCHOOL STRATEGIC PLANS (ផែនការយុទ្ធសាស្ត្រអភិវឌ្ឍន៍សាលា)
// ----------------------------------------------------
export const initialSchoolStrategicPlans: SchoolStrategicPlanItem[] = [
  {
    id: 'ssp-1',
    programArea: 'គុណភាពអប់រំ',
    objective: 'លើកកម្ពស់អត្រាសិស្សចេះអាន សរសេរ និងគណិតវិទ្យាថ្នាក់ដំបូងឱ្យបាន ៩៥% ឡើងទៅ',
    keyActivity: 'បណ្តុះបណ្តាលគ្រូលើវិធីសាស្ត្រ EGRA/EGMA និងបង្កើតក្លឹបស្វ័យសិក្សាបន្ថែមម៉ោងសម្រាប់សិស្សរៀនយឺត',
    kpiTarget: 'អត្រាជាប់មធ្យមភាគ ៩៥% និងគ្មានសិស្សមិនចេះអក្សរនៅថ្នាក់ទី៣',
    targetYear: '២០២៤ - ២០២៥',
    estimatedBudgetRiel: 4800000,
    budgetSource: 'មូលនិធិកែលម្អសាលា (SIG)',
    responsibleLead: 'អ្នកគ្រូ កែវ មុន្នី & លោក ស៊ុន ដារ៉ា',
    progressPercent: 75,
    status: 'in_progress',
    notes: 'បានរៀបចំតេស្តប្រចាំខែ និងកំពុងបំប៉នសិស្ស ៨ នាក់'
  },
  {
    id: 'ssp-2',
    programArea: 'ហេដ្ឋារចនាសម្ព័ន្ធ&បរិស្ថាន',
    objective: 'កសាងប្រព័ន្ធចម្រោះទឹកស្អាត និងបង្គន់អនាម័យមេត្រីបរិស្ថានបៃតង',
    keyActivity: 'ដំឡើងធុងចម្រោះទឹកស្អាតកម្រិត UV និងកែលម្អសួនជីវចម្រុះបរិស្ថានបៃតង',
    kpiTarget: '១០០% នៃសិស្សមានទឹកស្អាតបរិភោគ និងបង្គន់អនាម័យស្រី-ប្រុសដាច់ដោយឡែក',
    targetYear: '២០២៤ - ២០២៥',
    estimatedBudgetRiel: 8500000,
    budgetSource: 'ដៃគូអភិវឌ្ឍន៍/NGO',
    responsibleLead: 'លោក ឈិន សុផល (នាយករង)',
    progressPercent: 85,
    status: 'in_progress',
    notes: 'ដំឡើងធុងទឹកស្អាតរួចរាល់ កំពុងរៀបចំប្រព័ន្ធបង្ហូរទឹកកខ្វក់'
  },
  {
    id: 'ssp-3',
    programArea: 'បណ្ណាល័យ&បច្ចេកវិទ្យា',
    objective: 'ប្រែក្លាយបណ្ណាល័យសាលាជាបណ្ណាល័យឌីជីថលកុមារមេត្រី និងកុំព្យូទ័រស្រាវជ្រាវ',
    keyActivity: 'បំពាក់កុំព្យូទ័រស្រាវជ្រាវ ៤ គ្រឿង ថេប្លេតអានសៀវភៅ និងសៀវភៅថ្មី ២៥០ ក្បាល',
    kpiTarget: 'សិស្សានុសិស្ស ៩០% ចូលអានសៀវភៅយ៉ាងតិច ៣ ដងក្នុងមួយសប្តាហ៍',
    targetYear: '២០២៤ - ២០២៥',
    estimatedBudgetRiel: 6200000,
    budgetSource: 'សហគមន៍/សមាគមមាតាបិតា',
    responsibleLead: 'បណ្ណារក្សសាលា & លោក ឡុង រដ្ឋា',
    progressPercent: 60,
    status: 'in_progress',
    notes: 'បានបញ្ចូលសៀវភៅថ្មី ១២០ ក្បាល និងតម្លើងបណ្តាញ Wifi ស្រាវជ្រាវ'
  },
  {
    id: 'ssp-4',
    programArea: 'ការចូលរួមសហគមន៍',
    objective: 'ពង្រឹងការចូលរួមរបស់មាតាបិតាក្នុងការតាមដានការរៀនសូត្ររបស់កូនតាម App/Telegram',
    keyActivity: 'រៀបចំកិច្ចប្រជុំមាតាបិតា ៣ ដងក្នុងមួយឆ្នាំ និងផ្ញើរបាយការណ៍ពិន្ទុប្រចាំខែតាមប្រព័ន្ធឌីជីថល',
    kpiTarget: 'មាតាបិតា ៨៥% ចូលរួមប្រជុំ និងដឹងពីលទ្ធផលសិក្សារបស់កូនទៀងទាត់',
    targetYear: '២០២៤ - ២០២៥',
    estimatedBudgetRiel: 1500000,
    budgetSource: 'ថវិការដ្ឋ (PB)',
    responsibleLead: 'គណៈកម្មការ គ.ក.ស. & គ្រូបន្ទុកថ្នាក់ទាំងអស់',
    progressPercent: 90,
    status: 'in_progress',
    notes: 'បានរៀបចំកិច្ចប្រជុំដើមឆ្នាំ និងឆមាសទី១ ជោគជ័យ'
  },
  {
    id: 'ssp-5',
    programArea: 'អភិបាលកិច្ច&រដ្ឋបាល',
    objective: 'គ្រប់គ្រងទិន្នន័យសាលាទាំងមូលតាមប្រព័ន្ធឌីជីថលកម្រិតស្តង់ដាគំរូ MoEYS',
    keyActivity: 'ប្រើប្រាស់ប្រព័ន្ធ School Management System ភ្នំពុំ រួមបញ្ចូលស្ថិតិ សៀវភៅលិខិត ពិន្ទុ និងវត្តមាន',
    kpiTarget: 'កាត់បន្ថយការប្រើប្រាស់ក្រដាស ៦០% និងបញ្ជូនទិន្នន័យទៅក្រសួងទាន់ពេលវេលា ១០០%',
    targetYear: '២០២៤ - ២០២៥',
    estimatedBudgetRiel: 2000000,
    budgetSource: 'ថវិការដ្ឋ (PB)',
    responsibleLead: 'លោក លីម សន (នាយកសាលា)',
    progressPercent: 95,
    status: 'completed',
    notes: 'ប្រព័ន្ធគ្រប់គ្រងសាលាដំណើរការរលូន និងមានការបម្រុងទុកទិន្នន័យ Google Cloud'
  }
];

// ----------------------------------------------------
// INITIAL MODEL SCHOOL STANDARDS AUDIT (ស្ដង់ដាសាលារៀនគំរូ ៥ ស្តង់ដា MoEYS)
// ----------------------------------------------------
export const initialModelSchoolStandards: ModelSchoolStandardGroup[] = [
  {
    standardNumber: 1,
    standardTitleKhmer: 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស (Student Learning Outcomes)',
    description: 'ការវាយតម្លៃលើលទ្ធផលនៃការរៀនសូត្រ ចំណេះដឹង បំណិន និងឥរិយាបថសីលធម៌របស់សិស្សានុសិស្ស',
    criteria: [
      { id: 'crit-1-1', criterionNumber: '១.១', nameKhmer: 'អត្រាឡើងថ្នាក់ និងអត្រាបញ្ចប់ការសិក្សា', description: 'សិស្សឡើងថ្នាក់ខ្ពស់ជាង ៩០% និងអត្រាបោះបង់តិចជាង ៣%', maxScore: 5, currentScore: 4.8, status: 'excellent', evidenceDocument: 'តារាងស្ថិតិប្រឡងឆមាស និងរបាយការណ៍បូកសរុបប្រចាំឆ្នាំ' },
      { id: 'crit-1-2', criterionNumber: '១.២', nameKhmer: 'សមត្ថភាពអាន-សរសេរ និងគណិតវិទ្យាថ្នាក់ដំបូង', description: 'លទ្ធផលតេស្ត EGRA/EGMA ស្របតាមស្តង់ដាកំណត់របស់ MoEYS', maxScore: 5, currentScore: 4.5, status: 'excellent', evidenceDocument: 'សំណុំទិន្នន័យពិន្ទុតេស្តប្រចាំខែ និងសៀវភៅតាមដាន' },
      { id: 'crit-1-3', criterionNumber: '១.៣', nameKhmer: 'ការអប់រំសីលធម៌ គុណធម៌ និងវិន័យសិស្ស', description: 'សិស្សមានសុជីវធម៌ គោរពទង់ជាតិ ស្រឡាញ់មិត្តភក្តិ និងចេះជួយគ្នា', maxScore: 5, currentScore: 4.6, status: 'excellent', evidenceDocument: 'បទបញ្ជាផ្ទៃក្នុងសាលា និងកំណត់ហេតុវិន័យសិស្ស' }
    ]
  },
  {
    standardNumber: 2,
    standardTitleKhmer: 'ស្តង់ដាទី២៖ ដំណើរការបង្រៀន និងរៀន (Teaching and Learning Process)',
    description: 'ការអនុវត្តវិធីសាស្ត្របង្រៀនបែបសកម្ម ការប្រើប្រាស់កិច្ចតែងការ និងសម្ភារៈឧបទេសបង្រៀន',
    criteria: [
      { id: 'crit-2-1', criterionNumber: '២.១', nameKhmer: 'ការរៀបចំកិច្ចតែងការបង្រៀន ៥ ជំហាន', description: 'គ្រូមានកិច្ចតែងការទៀងទាត់ និងត្រឹមត្រូវតាមកម្រិតថ្នាក់', maxScore: 5, currentScore: 4.7, status: 'excellent', evidenceDocument: 'សៀវភៅកិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍របស់គ្រូ' },
      { id: 'crit-2-2', criterionNumber: '២.២', nameKhmer: 'ការប្រើប្រាស់សម្ភារៈឧបទេស និងបច្ចេកវិទ្យា', description: 'មានសម្ភារៈរូបវន្ត និងបច្ចេកវិទ្យាឌីជីថលជំនួយដល់ការយល់ដឹង', maxScore: 5, currentScore: 4.2, status: 'good', evidenceDocument: 'បញ្ជីសារពើភ័ណ្ឌសម្ភារៈឧបទេស និងរូបថតសកម្មភាពក្នុងថ្នាក់' },
      { id: 'crit-2-3', criterionNumber: '២.៣', nameKhmer: 'ការជួយគាំទ្រសិស្សរៀនយឺត និងសិស្សមានតម្រូវការពិសេស', description: 'មានកម្មវិធីបំប៉នបន្ថែម និងការយកចិត្តទុកដាក់លើសិស្សពិការ', maxScore: 5, currentScore: 4.3, status: 'good', evidenceDocument: 'តារាងតាមដានសិស្សរៀនយឺត និងម៉ោងបង្រៀនបំប៉ន' }
    ]
  },
  {
    standardNumber: 3,
    standardTitleKhmer: 'ស្តង់ដាទី៣៖ ការចូលរួមរបស់សហគមន៍ (Community & Parent Engagement)',
    description: 'កិច្ចសហការជិតស្និទ្ធរវាងសាលារៀន អាជ្ញាធរដែនដី មាតាបិតាសិស្ស និងអង្គការដៃគូ',
    criteria: [
      { id: 'crit-3-1', criterionNumber: '៣.១', nameKhmer: 'ដំណើរការគណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.ក.ស.)', description: 'មានកិច្ចប្រជុំទៀងទាត់ និងមានសេចក្តីសម្រេចគាំទ្រជាក់ស្តែង', maxScore: 5, currentScore: 4.9, status: 'excellent', evidenceDocument: 'កំណត់ហេតុកិច្ចប្រជុំ គ.ក.ស. និងសេចក្តីសម្រេចបង្កើត' },
      { id: 'crit-3-2', criterionNumber: '៣.២', nameKhmer: 'ការចូលរួមរបស់មាតាបិតាសិស្ស', description: 'មាតាបិតាចូលរួមប្រជុំ គាំទ្រសម្ភារៈ និងតាមដានកូននៅផ្ទះ', maxScore: 5, currentScore: 4.4, status: 'good', evidenceDocument: 'បញ្ជីវត្តមានមាតាបិតា និងកំណត់ហេតុកិច្ចប្រជុំ' },
      { id: 'crit-3-3', criterionNumber: '៣.៣', nameKhmer: 'ការកៀរគរធនធានសង្គមដើម្បីអភិវឌ្ឍន៍សាលា', description: 'ទទួលបានការឧបត្ថម្ភពីសប្បុរសជន និងអាជ្ញាធរឃុំ-ស្រុក', maxScore: 5, currentScore: 4.6, status: 'excellent', evidenceDocument: 'សៀវភៅកត់ត្រាចំណូល-ចំណាយសហគមន៍' }
    ]
  },
  {
    standardNumber: 4,
    standardTitleKhmer: 'ស្តង់ដាទី៤៖ ប្រតិបត្តិការ និងអភិបាលកិច្ចសាលារៀន (School Operations & Management)',
    description: 'បរិស្ថានសាលារៀនស្អាត បៃតង សុវត្ថិភាព ហេដ្ឋារចនាសម្ព័ន្ធ និងការគ្រប់គ្រងធនធានមនុស្ស',
    criteria: [
      { id: 'crit-4-1', criterionNumber: '៤.១', nameKhmer: 'បរិស្ថានសាលារៀនបៃតង ស្អាត និងគ្មានសំរាម', description: 'មានសួនផ្កា ដើមឈើម្លប់ ធុងសំរាមបែងចែក និងគ្មានថង់ប្លាស្ទិក', maxScore: 5, currentScore: 4.8, status: 'excellent', evidenceDocument: 'រូបថតបរិវេណសាលា និងសកម្មភាពពលកម្មអនាម័យ' },
      { id: 'crit-4-2', criterionNumber: '៤.២', nameKhmer: 'ប្រព័ន្ធទឹកស្អាត និងបង្គន់អនាម័យ', description: 'មានទឹកស្អាតពិសារគ្រប់គ្រាន់ និងបង្គន់អនាម័យមានអនាម័យល្អ', maxScore: 5, currentScore: 4.7, status: 'excellent', evidenceDocument: 'លទ្ធផលតេស្តគុណភាពទឹក និងកាលវិភាគសម្អាតបង្គន់' },
      { id: 'crit-4-3', criterionNumber: '៤.៣', nameKhmer: 'ការគ្រប់គ្រងរដ្ឋបាល និងប្រព័ន្ធព័ត៌មានវិទ្យា', description: 'មានសៀវភៅលិខិតចូល-ចេញ បញ្ជីស្ថិតិ និងការប្រើប្រាស់ Software', maxScore: 5, currentScore: 4.9, status: 'excellent', evidenceDocument: 'ប្រព័ន្ធគ្រប់គ្រងសាលាភ្នំពុំ និងសៀវភៅរដ្ឋបាល' }
    ]
  },
  {
    standardNumber: 5,
    standardTitleKhmer: 'ស្តង់ដាទី៥៖ គណនេយ្យភាព និងតម្លាភាពសាលារៀន (Accountability & Transparency)',
    description: 'ការបើកចំហព័ត៌មានថវិកា ការវាយតម្លៃលទ្ធផលការងារ និងការឆ្លើយតបចំពោះសហគមន៍',
    criteria: [
      { id: 'crit-5-1', criterionNumber: '៥.១', nameKhmer: 'តម្លាភាពនៃការប្រើប្រាស់ថវិកាដំណើរការសាលា (PB/SIG)', description: 'មានបិទផ្សាយតារាងចំណូល-ចំណាយជាសាធារណៈលើក្តារព័ត៌មាន', maxScore: 5, currentScore: 5.0, status: 'excellent', evidenceDocument: 'ក្តារព័ត៌មានថវិកាសាលា និងរបាយការណ៍ហិរញ្ញវត្ថុ' },
      { id: 'crit-5-2', criterionNumber: '៥.២', nameKhmer: 'ការឆ្លើយតបនឹងមតិយោបល់របស់មាតាបិតា និងសិស្ស', description: 'មានប្រអប់សំបុត្រ ឬប្រព័ន្ធផ្តល់មតិយោបល់ត្រឡប់ទៀងទាត់', maxScore: 5, currentScore: 4.5, status: 'excellent', evidenceDocument: 'កំណត់ត្រាឆ្លើយតបមតិយោបល់មាតាបិតា' }
    ]
  }
];

// ----------------------------------------------------
// INITIAL SCHOOL ASSETS & INVENTORY (សារពើភ័ណ្ឌ & ទ្រព្យសម្បត្តិសាលា)
// ----------------------------------------------------
export const initialSchoolAssets: SchoolAssetItem[] = [
  {
    id: 'ast-1',
    assetCode: 'AST-BLD-01',
    assetNameKhmer: 'អគារសិក្សា ព្រះរាជទាន (១ខ្នង ៥បន្ទប់)',
    category: 'អគារ&ហេដ្ឋារចនាសម្ព័ន្ធ',
    quantity: 1,
    unit: 'ខ្នង',
    locationRoom: 'បរិវេណកណ្តាលសាលា',
    condition: 'good',
    sourceOfFunding: 'អំណោយសម្តេចតេជោ / ក្រសួងអប់រំ',
    acquiredYear: '២០១៥',
    estimatedValueRiel: 120000000,
    notes: 'រៀបចំបន្ទប់រៀនថ្នាក់ទី១ ដល់ ទី៥ និងការិយាល័យ'
  },
  {
    id: 'ast-2',
    assetCode: 'AST-BLD-02',
    assetNameKhmer: 'អគារបណ្ណាល័យកុមារមេត្រី & បន្ទប់កុំព្យូទ័រ',
    category: 'អគារ&ហេដ្ឋារចនាសម្ព័ន្ធ',
    quantity: 1,
    unit: 'ខ្នង',
    locationRoom: 'ប៉ែកខាងកើតសាលា',
    condition: 'good',
    sourceOfFunding: 'សហគមន៍ & អង្គការដៃគូ',
    acquiredYear: '២០២០',
    estimatedValueRiel: 45000000,
    notes: 'មានបំពាក់កង្ហារ អំពូលភ្លើង និងធ្នើសៀវភៅទំនើប'
  },
  {
    id: 'ast-3',
    assetCode: 'AST-DSK-01',
    assetNameKhmer: 'តុ-កៅអីសិស្សឈើប្រណិត (២កៅអី/តុ)',
    category: 'តុ-កៅអី&គ្រឿងសង្ហារិម',
    quantity: 120,
    unit: 'ឈុត',
    locationRoom: 'គ្រប់បន្ទប់រៀន (ទី១ ដល់ ទី៦)',
    condition: 'good',
    sourceOfFunding: 'ថវិការដ្ឋ (PB)',
    acquiredYear: '២០២២',
    estimatedValueRiel: 18000000,
    notes: 'បានជួសជុល និងលាបថ្នាំថ្មីដើមឆ្នាំសិក្សា'
  },
  {
    id: 'ast-4',
    assetCode: 'AST-DSK-02',
    assetNameKhmer: 'តុ-កៅអីគ្រូបង្រៀន',
    category: 'តុ-កៅអី&គ្រឿងសង្ហារិម',
    quantity: 8,
    unit: 'ឈុត',
    locationRoom: 'បន្ទប់រៀន និងការិយាល័យ',
    condition: 'good',
    sourceOfFunding: 'ថវិការដ្ឋ (PB)',
    acquiredYear: '២០២១',
    estimatedValueRiel: 2400000,
    notes: 'មានសោ និងថតឯកសារសុវត្ថិភាព'
  },
  {
    id: 'ast-5',
    assetCode: 'AST-SOL-01',
    assetNameKhmer: 'ប្រព័ន្ធបន្ទះសូឡាថាមពលព្រះអាទិត្យ 3KW + អាគុយផ្ទុក',
    category: 'អគារ&ហេដ្ឋារចនាសម្ព័ន្ធ',
    quantity: 1,
    unit: 'កំប្លេ',
    locationRoom: 'ដំបូលអគារសិក្សា & បន្ទប់បច្ចេកវិទ្យា',
    condition: 'good',
    sourceOfFunding: 'អំណោយដៃគូអភិវឌ្ឍន៍',
    acquiredYear: '២០២៣',
    estimatedValueRiel: 14000000,
    notes: 'ផ្គត់ផ្គង់អគ្គិសនីដល់បន្ទប់កុំព្យូទ័រ និងបូមទឹកស្អាត'
  },
  {
    id: 'ast-6',
    assetCode: 'AST-IT-01',
    assetNameKhmer: 'កុំព្យូទ័រលើតុ Desktop Core i5 សម្រាប់រៀន និងស្រាវជ្រាវ',
    category: 'បរិក្ខារបច្ចេកវិទ្យា/IT',
    quantity: 6,
    unit: 'គ្រឿង',
    locationRoom: 'បន្ទប់បណ្ណាល័យឌីជីថល',
    condition: 'good',
    sourceOfFunding: 'សប្បុរសជនសហគមន៍',
    acquiredYear: '២០២៣',
    estimatedValueRiel: 9600000,
    notes: 'ភ្ជាប់ប្រព័ន្ធអ៊ីនធឺណិត និងកម្មវិធីសិក្សាភាសាខ្មែរ'
  },
  {
    id: 'ast-7',
    assetCode: 'AST-WTR-01',
    assetNameKhmer: 'ប្រព័ន្ធចម្រោះទឹកស្អាត UV និងកន្លែងលាងដៃសិស្ស ៨ក្បាលរ៉ូប៊ីណេ',
    category: 'បរិក្ខារទឹកស្អាត&អនាម័យ',
    quantity: 1,
    unit: 'កំប្លេ',
    locationRoom: 'មុខអគារសិក្សាទី១',
    condition: 'good',
    sourceOfFunding: 'មូលនិធិ SIG / អង្គការ UNICEF',
    acquiredYear: '២០២៣',
    estimatedValueRiel: 7500000,
    notes: 'មានតេស្តគុណភាពទឹកស្អាតឆ្លងកាត់ស្តង់ដា'
  }
];

export const initialAtRiskStudents: AtRiskStudent[] = [
  {
    id: 'risk-1',
    studentId: 's-5',
    studentName: 'ទេព វ៉ាន់ដា',
    gender: 'M',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    enrolledDate: '2024-10-15',
    categories: ['reading_difficulty', 'academic_slow'],
    subjectsNeedingHelp: ['ភាសាខ្មែរ', 'គណិតវិទ្យា'],
    baselineScore: 3.8,
    currentScore: 5.6,
    targetScore: 7.0,
    assignedBuddyId: 's-1',
    assignedBuddyName: 'ចាន់ ពិសិដ្ឋ',
    interventionStrategies: ['peer_tutoring', 'after_class_remedial', 'special_seat'],
    teacherNotes: 'សិស្សជួបការលំបាកក្នុងការអានពាក្យគន្លឹះ និងការសរសេរតាមអាន ប៉ុន្តែមានឆន្ទៈរៀនសូត្រខ្ពស់ពេលមានមិត្តភក្តិជួយពន្យល់។',
    progressLogs: [
      {
        id: 'log-1-1',
        date: '2024-10-25',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'ចាប់ផ្តើមរៀនបំប៉នព្យញ្ជនៈ និងស្រៈផ្សំ។ អានពាក្យបានយឺតៗ',
        testScore: 4.0,
        readingSpeedWPM: 25,
        mathAccuracyPercent: 45,
        status: 'critical'
      },
      {
        id: 'log-1-2',
        date: '2024-11-15',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'មានការរីកចម្រើនលើការប្រកបពាក្យ ២ ព្យាង្គ និងការបូកដកលេខ ២ ខ្ទង់',
        testScore: 5.0,
        readingSpeedWPM: 38,
        mathAccuracyPercent: 60,
        status: 'improving'
      },
      {
        id: 'log-1-3',
        date: '2024-12-05',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'អានអត្ថបទខ្លីបានស្ទាត់ជាងមុន និងចេះដោះស្រាយចំណោទសាមញ្ញ',
        testScore: 5.6,
        readingSpeedWPM: 48,
        mathAccuracyPercent: 70,
        status: 'improving'
      }
    ],
    overallStatus: 'improving',
    updatedAt: '2024-12-05'
  },
  {
    id: 'risk-2',
    studentId: 's-7',
    studentName: 'ម៉ៅ សុភ័ក្ត្រ',
    gender: 'M',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    enrolledDate: '2024-10-20',
    categories: ['attendance_risk', 'family_hardship'],
    subjectsNeedingHelp: ['គណិតវិទ្យា', 'វិទ្យាសាស្ត្រ'],
    baselineScore: 3.2,
    currentScore: 4.5,
    targetScore: 6.5,
    assignedBuddyId: 's-2',
    assignedBuddyName: 'ស៊ន ម៉ាលីកា',
    interventionStrategies: ['parent_home_tracking', 'custom_worksheet', 'counseling_support'],
    teacherNotes: 'សិស្សឈប់សម្រាកញឹកញាប់ដោយសារជួយការងារឪពុកម្តាយនៅចម្ការ។ គ្រូបានទាក់ទងមាតាបិតា និងផ្តល់សន្លឹកកិច្ចការធ្វើនៅផ្ទះ។',
    progressLogs: [
      {
        id: 'log-2-1',
        date: '2024-11-02',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'បានជួបមាតាបិតាផ្ទាល់ និងបង្កើតកាលវិភាគរៀនសូត្រនៅផ្ទះ',
        testScore: 3.5,
        readingSpeedWPM: 30,
        mathAccuracyPercent: 40,
        status: 'critical'
      },
      {
        id: 'log-2-2',
        date: '2024-11-28',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'វត្តមានបានទៀងទាត់ឡើងវិញ បានបំពេញសន្លឹកកិច្ចការស្ទើរគ្រប់ចំនួន',
        testScore: 4.5,
        readingSpeedWPM: 42,
        mathAccuracyPercent: 55,
        status: 'improving'
      }
    ],
    overallStatus: 'improving',
    updatedAt: '2024-11-28'
  },
  {
    id: 'risk-3',
    studentId: 's-11',
    studentName: 'អ៊ុំ រតនៈ',
    gender: 'M',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    enrolledDate: '2024-11-01',
    categories: ['math_difficulty'],
    subjectsNeedingHelp: ['គណិតវិទ្យា'],
    baselineScore: 4.0,
    currentScore: 6.8,
    targetScore: 7.0,
    assignedBuddyId: 's-3',
    assignedBuddyName: 'គង់ វិបុល',
    interventionStrategies: ['peer_tutoring', 'custom_worksheet'],
    teacherNotes: 'ខ្សោយការគិតលេខប្រភាគ និងធរណីមាត្រ។ ក្រោយការជួយពីមិត្តភក្តិ គាត់យល់ក្បួនគិតបានលឿន។',
    progressLogs: [
      {
        id: 'log-3-1',
        date: '2024-11-10',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'ហាត់គិតលេខប្រភាគកម្រិតមូលដ្ឋាន',
        testScore: 5.2,
        mathAccuracyPercent: 60,
        status: 'improving'
      },
      {
        id: 'log-3-2',
        date: '2024-12-02',
        evaluatedBy: 'លោក ចាន់ វុទ្ធី',
        assessmentNote: 'អាចគិតផលបូក និងផលគុណប្រភាគបានយ៉ាងត្រឹមត្រូវ ជិតសម្រេចគោលដៅ',
        testScore: 6.8,
        mathAccuracyPercent: 85,
        status: 'on_track'
      }
    ],
    overallStatus: 'on_track',
    updatedAt: '2024-12-02'
  }
];

export const initialDailyClassLogs: DailyClassLog[] = [
  {
    id: 'log-cls-1',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    date: '2024-12-16',
    shift: 'morning',
    title: 'ការរៀបចំតុបតែងបន្ទប់រៀន និងការធ្វើតេស្តរហ័សគណិតវិទ្យា',
    category: 'academic',
    atmosphere: 'excellent',
    notes: 'សិស្សានុសិស្សទាំងអស់បានចូលរៀនទាន់ពេលវេលា។ ក្នុងម៉ោងទី១ បានធ្វើតេស្តសាកល្បងលំហាត់ប្រភាគ និងធរណីមាត្រ ឃើញថាសិស្សយល់បាន ៨៥%។ ម៉ោងទី២ បានបែងចែកក្រុមសិស្សជួយគ្នា (Peer Buddy) យ៉ាងសកម្ម។',
    highlights: ['តេស្តរហ័សគណិតវិទ្យា ៨៥% ជាប់', 'ការរៀបចំកន្លែងអានសៀវភៅជ្រុងបន្ទប់'],
    absentCount: 0,
    recordedBy: 'លោក ចាន់ វុទ្ធី',
    isArchived: false,
    createdAt: '2024-12-16',
    updatedAt: '2024-12-16'
  },
  {
    id: 'log-cls-2',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    date: '2024-12-13',
    shift: 'full_day',
    title: 'ពលកម្មសម្អាតបរិស្ថានថ្នាក់រៀន និងដាំផ្កាមុខថ្នាក់',
    category: 'hygiene_cleaning',
    atmosphere: 'energetic',
    notes: 'បន្ទាប់ពីម៉ោងសិក្សា សិស្សានុសិស្សទាំងអស់ រួមជាមួយគណៈកម្មការសិស្សថ្នាក់ បានចូលរួមបោសសម្អាត បាញ់ទឹកលាងកម្រាល និងរៀបចំដាំកូនផ្កានៅមុខបន្ទប់រៀន ដើម្បីត្រៀមការវាយតម្លៃសាលារៀនគំរូ។',
    highlights: ['ដាំផ្កាបាន ៨ ផើង', 'បែងចែកធុងសំរាម ៣ ប្រភេទក្នុងថ្នាក់'],
    absentCount: 1,
    recordedBy: 'លោក ចាន់ វុទ្ធី',
    isArchived: false,
    createdAt: '2024-12-13',
    updatedAt: '2024-12-13'
  },
  {
    id: 'log-cls-3',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    date: '2024-12-09',
    shift: 'morning',
    title: 'ការគោរពទង់ជាតិដើមសប្តាហ៍ និងការណែនាំវិន័យសណ្តាប់ធ្នាប់',
    category: 'discipline',
    atmosphere: 'calm_focused',
    notes: 'សិស្សបានចូលរួមគោរពទង់ជាតិយ៉ាងស្ងប់ស្ងៀម និងមានរបៀបរៀបរយល្អ។ គ្រូបន្ទុកថ្នាក់បានរំលឹកពីការស្លៀកពាក់ឯកសណ្ឋានឱ្យបានត្រឹមត្រូវ និងការហាមឃាត់ការប្រើប្រាស់ទូរស័ព្ទក្នុងម៉ោងសិក្សា។',
    highlights: ['វត្តមានពេញលេញ ១០០%', 'សរសើរក្រុមទី២ ដែលបានរៀបចំជួរបន្ទាត់ល្អ'],
    absentCount: 0,
    recordedBy: 'លោក ចាន់ វុទ្ធី',
    isArchived: false,
    createdAt: '2024-12-09',
    updatedAt: '2024-12-09'
  },
  {
    id: 'log-cls-4',
    grade: 6,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    date: '2024-11-28',
    shift: 'afternoon',
    title: 'ការចុះពិនិត្យសុខភាពបឋម និងចែកថ្នាំទម្លាក់ព្រូន',
    category: 'health_incident',
    atmosphere: 'calm_focused',
    notes: 'ក្រុមគ្រូពេទ្យមណ្ឌលសុខភាពឃុំបារាំងធ្លាក់ បានចុះមកពិនិត្យសុខភាពភ្នែក ធ្មេញ និងបានផ្តល់ថ្នាំទម្លាក់ព្រូនដល់សិស្សទាំងអស់ក្នុងថ្នាក់។ មានសិស្សម្នាក់មានអាការៈវិលមុខស្រាល ត្រូវបានសម្រាកនៅបន្ទប់សុខភាព ១៥ នាទី និងបានធូរស្រាលឡើងវិញ។',
    highlights: ['សិស្សទាំងអស់ទទួលបានថ្នាំទម្លាក់ព្រូន', 'ពិនិត្យសុខភាពធ្មេញ'],
    absentCount: 1,
    recordedBy: 'លោក ចាន់ វុទ្ធី',
    isArchived: false,
    createdAt: '2024-11-28',
    updatedAt: '2024-11-28'
  },
  {
    id: 'log-cls-5',
    grade: 5,
    section: 'ក',
    academicYear: '២០២៤ - ២០២៥',
    date: '2024-12-15',
    shift: 'morning',
    title: 'ការអនុវត្តការពិសោធន៍វិទ្យាសាស្ត្រ៖ ការដុះពន្លកនៃគ្រាប់រុក្ខជាតិ',
    category: 'academic',
    atmosphere: 'energetic',
    notes: 'សិស្សបានធ្វើការពិសោធន៍ជាក្រុមលើការបណ្តុះគ្រាប់សណ្តែកបាយ ដោយកត់ត្រាការលូតលាស់ជារៀងរាល់ថ្ងៃ។ សិស្សមានការចាប់អារម្មណ៍ខ្លាំង និងសួរសំណួរច្រើន។',
    highlights: ['ពិសោធន៍វិទ្យាសាស្ត្រជាក់ស្តែង', 'កិច្ចការស្រាវជ្រាវជាក្រុម'],
    absentCount: 0,
    recordedBy: 'អ្នកគ្រូ កែវ ផល្លា',
    isArchived: false,
    createdAt: '2024-12-15',
    updatedAt: '2024-12-15'
  }
];

// ----------------------------------------------------
// INITIAL DIGITAL BADGE DEFINITIONS (បញ្ជីផ្លាកសញ្ញា និងមេដាយកិត្តិយស)
// ----------------------------------------------------
export const initialBadgeDefinitions: BadgeDefinition[] = [
  {
    id: 'bdg-acad-01',
    code: 'BDG-ACAD-01',
    titleKhmer: 'សិស្សឆ្នើមប្រចាំខែ',
    titleEnglish: 'Star Student of the Month',
    description: 'ផ្តល់ជូនសិស្សដែលមានលទ្ធផលសិក្សាខ្ពស់ និងគំរូល្អពេញមួយខែសិក្សា',
    category: 'academic',
    tier: 'gold',
    points: 50,
    iconName: 'Trophy',
    criteria: 'ទទួលបានចំណាត់ថ្នាក់លេខ១ ឬពិន្ទុមធ្យមភាគចាប់ពី ៨.៥ ឡើងទៅក្នុងខែ',
    colorScheme: {
      bgLight: 'bg-amber-50',
      bgBadge: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      ringColor: 'ring-amber-400',
      gradient: 'from-amber-400 via-amber-500 to-yellow-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-acad-02',
    code: 'BDG-ACAD-02',
    titleKhmer: 'ជើងឯកគណិតវិទ្យា',
    titleEnglish: 'Math Wizard',
    description: 'មានភាពប៉ិនប្រសប់ក្នុងការគិតលេខលឿន និងដោះស្រាយលំហាត់គណិតវិទ្យាស្មុគស្មាញ',
    category: 'academic',
    tier: 'platinum',
    points: 60,
    iconName: 'Sparkles',
    criteria: 'ទទួលបានពិន្ទុគណិតវិទ្យា ៩.៥ - ១០ ឬឈ្នះការប្រកួតគិតលេខរហ័ស',
    colorScheme: {
      bgLight: 'bg-indigo-50',
      bgBadge: 'bg-indigo-600',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-300',
      ringColor: 'ring-indigo-400',
      gradient: 'from-blue-500 via-indigo-500 to-purple-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-acad-03',
    code: 'BDG-ACAD-03',
    titleKhmer: 'សិស្សអក្សរផ្ចង់ល្អឯក',
    titleEnglish: 'Calligraphy Master',
    description: 'សរសេរអក្សរខ្មែរបានស្អាត ត្រឹមត្រូវតាមក្បួនខ្នាត និងគ្មានកំហុសអក្ខរាវិរុទ្ធ',
    category: 'academic',
    tier: 'silver',
    points: 35,
    iconName: 'Award',
    criteria: 'សរសេរសៀវភៅស្អាតគ្មានស្នាមលុប និងជាប់ជយលាភីអក្សរផ្ចង់ប្រចាំថ្នាក់',
    colorScheme: {
      bgLight: 'bg-blue-50',
      bgBadge: 'bg-blue-600',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      ringColor: 'ring-blue-400',
      gradient: 'from-slate-400 via-blue-500 to-cyan-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-att-01',
    code: 'BDG-ATT-01',
    titleKhmer: 'វត្តមានពេញលេញ ១០០%',
    titleEnglish: '100% Attendance Hero',
    description: 'មិនដែលអវត្តមាន និងមិនដែលមកយឺតក្នុងអំឡុងពេលមួយខែ ឬមួយឆមាស',
    category: 'attendance',
    tier: 'gold',
    points: 50,
    iconName: 'ShieldCheck',
    criteria: 'មានអត្រាវត្តមាន ១០០% គ្មានច្បាប់ និងគ្មានអវត្តមានឥតច្បាប់',
    colorScheme: {
      bgLight: 'bg-emerald-50',
      bgBadge: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
      ringColor: 'ring-emerald-400',
      gradient: 'from-emerald-400 via-teal-500 to-green-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-att-02',
    code: 'BDG-ATT-02',
    titleKhmer: 'ទៀងទាត់ពេលវេលា',
    titleEnglish: 'Punctuality Champion',
    description: 'មកដល់សាលាមុនម៉ោង និងត្រៀមសម្ភារៈសិក្សាបានរួចរាល់ជានិច្ច',
    category: 'attendance',
    tier: 'silver',
    points: 25,
    iconName: 'Zap',
    criteria: 'មកដល់ថ្នាក់រៀនមុនម៉ោងកណ្តឹងបន្លឺយ៉ាងហោច ១៥នាទីជាប់ៗគ្នា',
    colorScheme: {
      bgLight: 'bg-teal-50',
      bgBadge: 'bg-teal-600',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-300',
      ringColor: 'ring-teal-400',
      gradient: 'from-teal-400 to-cyan-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-read-01',
    code: 'BDG-READ-01',
    titleKhmer: 'អ្នកអានឆ្នើមបណ្ណាល័យ',
    titleEnglish: 'Star Bookworm',
    description: 'សិស្សដែលចូលចិត្តអានសៀវភៅ និងបានខ្ចីសៀវភៅអានច្រើនជាងគេ',
    category: 'reading_literacy',
    tier: 'platinum',
    points: 60,
    iconName: 'BookOpen',
    criteria: 'អានសៀវភៅយ៉ាងតិច ១០ ក្បាល និងកត់ត្រាក្នុងសៀវភៅតាមដានអំណាន',
    colorScheme: {
      bgLight: 'bg-purple-50',
      bgBadge: 'bg-purple-600',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
      ringColor: 'ring-purple-400',
      gradient: 'from-purple-500 via-fuchsia-500 to-indigo-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-disc-01',
    code: 'BDG-DISC-01',
    titleKhmer: 'គំរូសីលធម៌ និងវិន័យ',
    titleEnglish: 'Model Citizen & Virtue',
    description: 'មានសុជីវធម៌ល្អ សុភាពរាបសា គោរពលោកគ្រូអ្នកគ្រូ និងចេះសំពះគំនាប់',
    category: 'behavior_discipline',
    tier: 'gold',
    points: 45,
    iconName: 'Heart',
    criteria: 'គ្មានកំណត់ហេតុអវិជ្ជមាន និងត្រូវបានសរសើរដោយគ្រូគ្រប់មុខវិជ្ជា',
    colorScheme: {
      bgLight: 'bg-rose-50',
      bgBadge: 'bg-rose-600',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-300',
      ringColor: 'ring-rose-400',
      gradient: 'from-rose-400 via-pink-500 to-red-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-lead-01',
    code: 'BDG-LEAD-01',
    titleKhmer: 'ក្មេងជួយក្មេង (Peer Helper)',
    titleEnglish: 'Outstanding Peer Helper',
    description: 'ស្ម័គ្រចិត្តជួយបង្រៀនមិត្តភក្តិដែលរៀនយឺត និងចែករំលែកសម្ភារៈសិក្សា',
    category: 'leadership_cooperation',
    tier: 'gold',
    points: 45,
    iconName: 'Users',
    criteria: 'ជាដៃគូជំនួយការសិក្សា (Study Buddy) និងជួយមិត្តឱ្យមានវឌ្ឍនភាព',
    colorScheme: {
      bgLight: 'bg-cyan-50',
      bgBadge: 'bg-cyan-600',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-300',
      ringColor: 'ring-cyan-400',
      gradient: 'from-cyan-400 via-blue-500 to-sky-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-env-01',
    code: 'BDG-ENV-01',
    titleKhmer: 'វីរបុរសបៃតងសាលារៀន',
    titleEnglish: 'Green Eco Hero',
    description: 'ចូលរួមយ៉ាងសកម្មក្នុងការថែសួនបៃតង ដាំដើមឈើ និងបែងចែកសំរាម',
    category: 'environmental_hygiene',
    tier: 'gold',
    points: 40,
    iconName: 'TreePine',
    criteria: 'ដឹកនាំក្រុមសម្អាត និងថែទាំរុក្ខជាតិក្នុងសាលាបានស្រស់បំព្រង',
    colorScheme: {
      bgLight: 'bg-lime-50',
      bgBadge: 'bg-lime-600',
      textColor: 'text-lime-700',
      borderColor: 'border-lime-300',
      ringColor: 'ring-lime-400',
      gradient: 'from-lime-400 via-emerald-500 to-green-600'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-prog-01',
    code: 'BDG-PROG-01',
    titleKhmer: 'វឌ្ឍនភាពលេចធ្លោ (Breakthrough)',
    titleEnglish: 'Breakthrough Star',
    description: 'មានការរីកចម្រើនពិន្ទុ និងការអានយ៉ាងខ្លាំងបើប្រៀបធៀបនឹងដើមគ្រា',
    category: 'improvement_progress',
    tier: 'diamond',
    points: 80,
    iconName: 'Flame',
    criteria: 'ពិន្ទុកើនឡើងចាប់ពី ២.០ ពិន្ទុ ឬឆ្លងផុតកម្រិតហានិភ័យដោយជោគជ័យ',
    colorScheme: {
      bgLight: 'bg-amber-50',
      bgBadge: 'bg-amber-600',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-400',
      ringColor: 'ring-amber-500',
      gradient: 'from-orange-500 via-amber-500 to-yellow-400'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-sport-01',
    code: 'BDG-SPORT-01',
    titleKhmer: 'ឆ្នើមកីឡា និងសុខភាព',
    titleEnglish: 'Sports & Athletics Champion',
    description: 'មានទេពកោសល្យខ្ពស់ផ្នែកកីឡា រត់ប្រណាំង បាល់ទាត់ ឬល្បែងប្រជាប្រិយ',
    category: 'sports_arts',
    tier: 'silver',
    points: 35,
    iconName: 'Medal',
    criteria: 'តំណាងថ្នាក់ក្នុងការប្រកួតកីឡាសាលា និងមានស្មារតីកីឡាល្អ',
    colorScheme: {
      bgLight: 'bg-orange-50',
      bgBadge: 'bg-orange-500',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
      ringColor: 'ring-orange-400',
      gradient: 'from-orange-400 via-amber-500 to-rose-500'
    },
    isSystemDefault: true
  },
  {
    id: 'bdg-art-01',
    code: 'BDG-ART-01',
    titleKhmer: 'សិល្បករគំនូរវ័យក្មេង',
    titleEnglish: 'Creative Artist',
    description: 'មានគំនិតច្នៃប្រឌិត និងស្នាដៃគំនូរឆ្នើមតាំងបង្ហាញក្នុងបន្ទប់រៀន',
    category: 'sports_arts',
    tier: 'bronze',
    points: 25,
    iconName: 'Target',
    criteria: 'មានស្នាដៃគំនូរ ឬសិប្បកម្មកែច្នៃឆ្នើមប្រចាំខែ',
    colorScheme: {
      bgLight: 'bg-pink-50',
      bgBadge: 'bg-pink-500',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-300',
      ringColor: 'ring-pink-400',
      gradient: 'from-pink-400 to-rose-500'
    },
    isSystemDefault: true
  }
];

// ----------------------------------------------------
// INITIAL STUDENT BADGE ASSIGNMENTS (សមិទ្ធផលដែលបានប្រគល់ជូនសិស្ស)
// ----------------------------------------------------
export const initialStudentBadgeAssignments: StudentBadgeAssignment[] = [
  {
    id: 'badge-asgn-1',
    studentId: 's-1',
    studentName: 'ឈន ចាន់ដារ៉ា',
    studentGender: 'M',
    studentCode: 'STU-2024-001',
    grade: 6,
    section: 'ក',
    badgeId: 'bdg-acad-01',
    badge: initialBadgeDefinitions[0],
    awardedDate: '2024-11-30',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'លោក ចាន់ វុទ្ធី',
    reasonOrEvidence: 'ទទួលបានចំណាត់ថ្នាក់លេខ១ ប្រចាំខែវិច្ឆិកា ដោយមានមធ្យមភាគពិន្ទុ ៩.២',
    progressMetricSnapshot: {
      scoreAvg: 9.2,
      attendanceRate: 100
    },
    certificateNumber: 'CERT-2024-001',
    createdAt: '2024-11-30'
  },
  {
    id: 'badge-asgn-2',
    studentId: 's-1',
    studentName: 'ឈន ចាន់ដារ៉ា',
    studentGender: 'M',
    studentCode: 'STU-2024-001',
    grade: 6,
    section: 'ក',
    badgeId: 'bdg-acad-02',
    badge: initialBadgeDefinitions[1],
    awardedDate: '2024-12-05',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'លោក ចាន់ វុទ្ធី',
    reasonOrEvidence: 'ដោះស្រាយលំហាត់គណិតវិទ្យាស្មុគស្មាញ និងទទួលបានពិន្ទុ ១០/១០ ក្នុងតេស្តប្រចាំខែ',
    progressMetricSnapshot: {
      scoreAvg: 10
    },
    certificateNumber: 'CERT-2024-002',
    createdAt: '2024-12-05'
  },
  {
    id: 'badge-asgn-3',
    studentId: 's-2',
    studentName: 'សុខ រ៉ាវី',
    studentGender: 'F',
    studentCode: 'STU-2024-002',
    grade: 6,
    section: 'ក',
    badgeId: 'bdg-att-01',
    badge: initialBadgeDefinitions[3],
    awardedDate: '2024-11-30',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'លោក ចាន់ វុទ្ធី',
    reasonOrEvidence: 'មានវត្តមាន ១០០% ពេញលេញរយៈពេល ៣ខែជាប់ៗគ្នា គ្មានការយឺតយ៉ាវ',
    progressMetricSnapshot: {
      attendanceRate: 100
    },
    certificateNumber: 'CERT-2024-003',
    createdAt: '2024-11-30'
  },
  {
    id: 'badge-asgn-4',
    studentId: 's-2',
    studentName: 'សុខ រ៉ាវី',
    studentGender: 'F',
    studentCode: 'STU-2024-002',
    grade: 6,
    section: 'ក',
    badgeId: 'bdg-read-01',
    badge: initialBadgeDefinitions[5],
    awardedDate: '2024-12-10',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'អ្នកគ្រូ កែវ ផល្លា',
    reasonOrEvidence: 'បានខ្ចី និងអានសៀវភៅពីបណ្ណាល័យសរុប ១៤ ក្បាល និងបានសរសេរសង្ខេបសាច់រឿងយ៉ាងក្បោះក្បាយ',
    progressMetricSnapshot: {
      readingBooksCount: 14
    },
    certificateNumber: 'CERT-2024-004',
    createdAt: '2024-12-10'
  },
  {
    id: 'badge-asgn-5',
    studentId: 's-3',
    studentName: 'កែវ មករា',
    studentGender: 'M',
    studentCode: 'STU-2024-003',
    grade: 6,
    section: 'ក',
    badgeId: 'bdg-prog-01',
    badge: initialBadgeDefinitions[9],
    awardedDate: '2024-12-12',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'លោក ចាន់ វុទ្ធី',
    reasonOrEvidence: 'មានការរីកចម្រើនខ្លាំងលើការអាន និងគណិតវិទ្យា ដោយពិន្ទុកើនពី ៣.៥ ដល់ ៦.៥ (+៣.០ ពិន្ទុ)',
    progressMetricSnapshot: {
      improvedPoints: 3.0,
      scoreAvg: 6.5
    },
    certificateNumber: 'CERT-2024-005',
    createdAt: '2024-12-12'
  },
  {
    id: 'badge-asgn-6',
    studentId: 's-4',
    studentName: 'ហេង ស្រីពៅ',
    studentGender: 'F',
    studentCode: 'STU-2024-004',
    grade: 5,
    section: 'ក',
    badgeId: 'bdg-env-01',
    badge: initialBadgeDefinitions[8],
    awardedDate: '2024-12-08',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'អ្នកគ្រូ កែវ ផល្លា',
    reasonOrEvidence: 'ដឹកនាំសកម្មភាពបៃតងសាលារៀន ថែទាំសួនបន្លែ និងកាត់បន្ថយការប្រើប្រាស់ថង់ប្លាស្ទិក',
    certificateNumber: 'CERT-2024-006',
    createdAt: '2024-12-08'
  },
  {
    id: 'badge-asgn-7',
    studentId: 's-5',
    studentName: 'វ៉ាន់ សុវណ្ណ',
    studentGender: 'M',
    studentCode: 'STU-2024-005',
    grade: 5,
    section: 'ក',
    badgeId: 'bdg-lead-01',
    badge: initialBadgeDefinitions[7],
    awardedDate: '2024-12-01',
    academicYear: '២០២៤ - ២០២៥',
    term: 'ឆមាសទី១',
    awardedBy: 'អ្នកគ្រូ កែវ ផល្លា',
    reasonOrEvidence: 'ជាជំនួយការសិក្សាគំរូ (Peer Tutor) ជួយបង្រៀនមិត្តភក្តិ ៣នាក់ឱ្យចេះអានបានយ៉ាងស្ទាត់',
    certificateNumber: 'CERT-2024-007',
    createdAt: '2024-12-01'
  }
];

// =========================================================================
// 1. INITIAL SCHOOL EQUIPMENT CATALOG & LOAN RECORDS (បញ្ជីឧបករណ៍ និងការខ្ចី)
// =========================================================================
export const initialSchoolEquipment: SchoolEquipmentItem[] = [
  {
    id: 'eq-1',
    code: 'TECH-PRJ-01',
    nameKhmer: 'ម៉ាស៊ីនបញ្ចាំងស្លាយ Epson EB-X06 (Projector)',
    category: 'projector',
    brandModel: 'Epson EB-X06 3600 Lumens',
    serialNumber: 'X06-KHM-2023-01',
    locationRoom: 'បន្ទប់កុំព្យូទ័រ & ធនធាន',
    condition: 'good',
    totalQuantity: 2,
    availableQuantity: 1,
    statusNotes: 'រូបភាពច្បាស់ ភ្ជាប់ខ្សែ HDMI/VGA បានល្អ'
  },
  {
    id: 'eq-2',
    code: 'TECH-PRJ-02',
    nameKhmer: 'ម៉ាស៊ីនបញ្ចាំងចល័ត ViewSonic M1+ (Portable Projector)',
    category: 'projector',
    brandModel: 'ViewSonic M1+ LED with Battery',
    serialNumber: 'VS-M1-2023-08',
    locationRoom: 'បន្ទប់បណ្ណាល័យ',
    condition: 'good',
    totalQuantity: 1,
    availableQuantity: 1,
    statusNotes: 'មានថ្មក្នុងខ្លួន ងាយស្រួលយកបញ្ចាំងតាមថ្នាក់រៀន'
  },
  {
    id: 'eq-3',
    code: 'TECH-LAP-01',
    nameKhmer: 'កុំព្យូទ័រយួរដៃ Dell Latitude 3420 (Laptop គ្រូបង្រៀន)',
    category: 'laptop',
    brandModel: 'Dell Latitude 3420 Core i5 / 8GB / 256GB SSD',
    serialNumber: 'DELL-3420-001',
    locationRoom: 'បន្ទប់កុំព្យូទ័រ',
    condition: 'good',
    totalQuantity: 3,
    availableQuantity: 2,
    statusNotes: 'ដំឡើង Windows 11 & Khmer Unicode & កម្មវិធីបង្រៀន MoEYS រួចរាល់'
  },
  {
    id: 'eq-4',
    code: 'TECH-TAB-01',
    nameKhmer: 'កញ្ចប់ថេប្លេតបង្រៀន Samsung Galaxy Tab A8 (កញ្ចប់ ១០ គ្រឿង)',
    category: 'tablet',
    brandModel: 'Samsung Galaxy Tab A8 10.5"',
    serialNumber: 'TAB-A8-SET-01',
    locationRoom: 'បន្ទប់បច្ចេកវិទ្យា ICT',
    condition: 'good',
    totalQuantity: 10,
    availableQuantity: 10,
    statusNotes: 'សម្រាប់សិស្សរៀនកម្មវិធី Komar Rien Komar Chhlat និង PLP'
  },
  {
    id: 'eq-5',
    code: 'TECH-SPK-01',
    nameKhmer: 'ធុងបាសចល័ត + មីក្រូហ្វូនឥតខ្សែ ២ (Wireless PA Speaker & Mic)',
    category: 'speaker_mic',
    brandModel: 'Temeisheng 12" Bluetooth + 2 Wireless Mics',
    serialNumber: 'TMS-12-MIC-01',
    locationRoom: 'សាលប្រជុំ / ការិយាល័យរដ្ឋបាល',
    condition: 'good',
    totalQuantity: 2,
    availableQuantity: 1,
    statusNotes: 'សម្រាប់គោរពទង់ជាតិ កម្មវិធីសាលា និងបង្រៀនភាសាអង់គ្លេស'
  },
  {
    id: 'eq-6',
    code: 'TECH-TV-01',
    nameKhmer: 'ទូរទស្សន៍ឆ្លាតវៃ Smart TV LG 55" 4K',
    category: 'smart_tv',
    brandModel: 'LG 55UQ7550 Smart WebOS',
    serialNumber: 'LG-55-2022-09',
    locationRoom: 'បន្ទប់កុមារមេត្រី / ថ្នាក់ទី១',
    condition: 'good',
    totalQuantity: 1,
    availableQuantity: 1,
    statusNotes: 'បំពាក់ជាប់ជញ្ជាំងថ្នាក់រៀនសម្រាប់ចាក់វីដេអូអប់រំក្រសួង'
  },
  {
    id: 'eq-7',
    code: 'TECH-SOLAR-01',
    nameKhmer: 'ប្រព័ន្ធផ្ទាំងសូឡា និងអាគុយបម្រុងអគ្គិសនី (Solar Hybrid Inverter)',
    category: 'solar_power',
    brandModel: 'Growatt 3kW Hybrid + Lithium Battery 48V',
    serialNumber: 'GW-3KW-SOLAR-01',
    locationRoom: 'អគារសិក្សាធំ',
    condition: 'good',
    totalQuantity: 1,
    availableQuantity: 1,
    statusNotes: 'ផ្គត់ផ្គង់ភ្លើងអគ្គិសនីសម្រាប់កុំព្យូទ័រ និងម៉ាស៊ីនបញ្ចាំងពេលដាច់ភ្លើង'
  }
];

export const initialEquipmentLoans: EquipmentLoanRecord[] = [
  {
    id: 'loan-1',
    loanNumber: 'LN-2024-001',
    equipmentId: 'eq-1',
    equipmentCode: 'TECH-PRJ-01',
    equipmentName: 'ម៉ាស៊ីនបញ្ចាំងស្លាយ Epson EB-X06 (Projector)',
    equipmentCategory: 'projector',
    teacherId: 't-1',
    teacherName: 'អ្នកគ្រូ កែវ ផល្លា',
    teacherPhone: '012 34 56 78',
    gradeSection: 'ថ្នាក់ទី៥ក',
    purposeOfUse: 'បញ្ចាំងស្លាយមេរៀនវិទ្យាសាស្ត្រស្ដីពី «វដ្តជីវិតរបស់រុក្ខជាតិ»',
    borrowDate: '2024-10-14',
    borrowTime: '08:00',
    expectedReturnDate: '2024-10-14',
    expectedReturnTime: '11:00',
    actualReturnDate: '2024-10-14',
    status: 'returned',
    conditionBefore: 'ដំណើរការល្អ កម្រិតពន្លឺច្បាស់',
    conditionAfter: 'ប្រគល់គ្រប់គ្រឿង ខ្សែ HDMI និងតេឡេពេញលេញ',
    recordedBy: 'លោក សុខ ពិសិដ្ឋ (បណ្ណារក្ស)',
    syncedToGoogleSheets: true,
    createdAt: '2024-10-14T08:00:00Z'
  },
  {
    id: 'loan-2',
    loanNumber: 'LN-2024-002',
    equipmentId: 'eq-3',
    equipmentCode: 'TECH-LAP-01',
    equipmentName: 'កុំព្យូទ័រយួរដៃ Dell Latitude 3420 (Laptop គ្រូបង្រៀន)',
    equipmentCategory: 'laptop',
    teacherId: 't-2',
    teacherName: 'លោកគ្រូ ចាន់ សុភាព',
    teacherPhone: '098 76 54 32',
    gradeSection: 'ថ្នាក់ទី៦ក',
    purposeOfUse: 'បញ្ចូលទិន្នន័យពិន្ទុសិស្សប្រចាំខែ និងរៀបចំកិច្ចតែងការបង្រៀនគណិតវិទ្យា',
    borrowDate: new Date().toISOString().split('T')[0],
    borrowTime: '07:30',
    expectedReturnDate: new Date().toISOString().split('T')[0],
    expectedReturnTime: '17:00',
    status: 'borrowed',
    conditionBefore: 'ដំណើរការល្អ ថ្មពេញ ១០០%',
    recordedBy: 'អ្នកគ្រូ ពេជ្រ ធីតា (លេខាធិការ)',
    syncedToGoogleSheets: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'loan-3',
    loanNumber: 'LN-2024-003',
    equipmentId: 'eq-5',
    equipmentCode: 'TECH-SPK-01',
    equipmentName: 'ធុងបាសចល័ត + មីក្រូហ្វូនឥតខ្សែ ២ (Wireless PA Speaker & Mic)',
    equipmentCategory: 'speaker_mic',
    teacherId: 't-3',
    teacherName: 'អ្នកគ្រូ ស៊ុន ម៉ាលី',
    teacherPhone: '088 12 34 56',
    gradeSection: 'ទីធ្លាសាលារៀន',
    purposeOfUse: 'ហាត់សមរបាំប្រពៃណី និងអប់រំកាយសម្រាប់ទិវាកុមារអន្តរជាតិ',
    borrowDate: new Date().toISOString().split('T')[0],
    borrowTime: '13:30',
    expectedReturnDate: new Date().toISOString().split('T')[0],
    expectedReturnTime: '16:30',
    status: 'borrowed',
    conditionBefore: 'មីក្រូហ្វូន ២ ដំណើរការល្អ ថ្មសាកពេញ',
    recordedBy: 'លោក សុខ ពិសិដ្ឋ (បណ្ណារក្ស)',
    syncedToGoogleSheets: false,
    createdAt: new Date().toISOString()
  }
];

// =========================================================================
// 2. INITIAL TEACHER DAILY AGENDA TASKS (របៀបវារៈប្រចាំថ្ងៃរបស់គ្រូ)
// =========================================================================
export const initialTeacherDailyTasks: TeacherDailyTask[] = [
  {
    id: 'task-1',
    title: 'បញ្ចូលពិន្ទុប្រឡងប្រចាំខែតុលា មុខវិជ្ជាគណិតវិទ្យា និងភាសាខ្មែរ',
    description: 'ផ្ទៀងផ្ទាត់សន្លឹកកិច្ចការសិស្ស ៣២ នាក់ និងស្រង់ចូលប្រព័ន្ធ',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:00',
    category: 'exam_grading',
    priority: 'urgent',
    isCompleted: false,
    assignedTeacherName: 'អ្នកគ្រូ កែវ ផល្លា',
    gradeSection: 'ថ្នាក់ទី៥ក',
    isSyncedToGoogleCalendar: true,
    createdAt: '2024-10-15T01:00:00Z'
  },
  {
    id: 'task-2',
    title: 'ត្រួតពិនិត្យវត្តមានសិស្ស និងសុខភាព BMI ប្រចាំត្រីមាស',
    description: 'កត់ត្រាសិស្សអវត្តមាន និងថ្លឹងទម្ងន់ វាស់កម្ពស់សិស្សជួរទី២',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    endTime: '07:30',
    category: 'attendance',
    priority: 'high',
    isCompleted: true,
    completedAt: '2024-10-15T07:25:00Z',
    assignedTeacherName: 'លោកគ្រូ ចាន់ សុភាព',
    gradeSection: 'ថ្នាក់ទី៦ក',
    isSyncedToGoogleCalendar: true,
    createdAt: '2024-10-15T01:00:00Z'
  },
  {
    id: 'task-3',
    title: 'កិច្ចប្រជុំក្រុមបច្ចេកទេសគរុកោសល្យ កម្រងសាលាភ្នំព្រឹក',
    description: 'ពិភាក្សាវិធីសាស្ត្របង្រៀនអំណានដំបូង និងការប្រើប្រាស់កញ្ចប់សម្ភារៈ PLP',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    category: 'meeting',
    priority: 'high',
    isCompleted: false,
    assignedTeacherName: 'លោកគ្រូ ឈិន សុផល (នាយករង)',
    gradeSection: 'បន្ទប់ប្រជុំធំ',
    isSyncedToGoogleCalendar: true,
    createdAt: '2024-10-15T01:00:00Z'
  },
  {
    id: 'task-4',
    title: 'រៀបចំកិច្ចតែងការបង្រៀនសប្តាហ៍ទី ៤ មុខវិជ្ជាវិទ្យាសាស្ត្រ',
    description: 'ទាញយកឯកសារជំនួយពី Google Drive និងរៀបចំសម្ភារៈពិសោធន៍ស្លឹកឈើ',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // ថ្ងៃស្អែក
    startTime: '10:30',
    endTime: '11:30',
    category: 'teaching',
    priority: 'normal',
    isCompleted: false,
    assignedTeacherName: 'អ្នកគ្រូ ស៊ុន ម៉ាលី',
    gradeSection: 'ថ្នាក់ទី៤ក',
    isSyncedToGoogleCalendar: false,
    createdAt: '2024-10-15T01:00:00Z'
  }
];

// =========================================================================
// 3. INITIAL TEACHER MEETING MINUTES & DECISIONS (កំណត់ត្រាការប្រជុំគ្រូ)
// =========================================================================
export const initialTeacherMeetings: TeacherMeetingRecord[] = [
  {
    id: 'mtg-1',
    meetingCode: 'MT-2024-10',
    title: 'កិច្ចប្រជុំប្រចាំខែតុលា បូកសរុបលទ្ធផលបង្រៀន និងផែនការត្រៀមប្រឡងឆមាសទី១',
    meetingType: 'monthly',
    academicYear: '២០២៤ - ២០២៥',
    meetingDate: '2024-10-10',
    meetingTime: '08:30 - 11:30 ព្រឹក',
    location: 'បន្ទប់ប្រជុំធំ សាលាបឋមសិក្សាភ្នំពុំ',
    chairpersonName: 'លោក លីម សន (នាយកសាលា)',
    secretaryName: 'អ្នកគ្រូ ពេជ្រ ធីតា (លេខាធិការ)',
    totalInvited: 12,
    totalPresent: 11,
    attendees: [
      { id: 'att-1', name: 'លោក លីម សន', role: 'នាយកសាលា', present: true },
      { id: 'att-2', name: 'លោក ឈិន សុផល', role: 'នាយករង', present: true },
      { id: 'att-3', name: 'អ្នកគ្រូ កែវ ផល្លា', role: 'ប្រធានក្រុមបច្ចេកទេសថ្នាក់ទី៥', present: true },
      { id: 'att-4', name: 'លោកគ្រូ ចាន់ សុភាព', role: 'គ្រូបន្ទុកថ្នាក់ទី៦', present: true },
      { id: 'att-5', name: 'អ្នកគ្រូ ស៊ុន ម៉ាលី', role: 'គ្រូបន្ទុកថ្នាក់ទី៤', present: true },
      { id: 'att-6', name: 'លោកគ្រូ ហុង វណ្ណា', role: 'គ្រូបន្ទុកថ្នាក់ទី៣', present: true },
      { id: 'att-7', name: 'អ្នកគ្រូ ម៉ី សុខុម', role: 'គ្រូបន្ទុកថ្នាក់ទី២', present: true },
      { id: 'att-8', name: 'អ្នកគ្រូ អ៊ឹម សារ៉េត', role: 'គ្រូបន្ទុកថ្នាក់ទី១', present: true },
      { id: 'att-9', name: 'លោក សុខ ពិសិដ្ឋ', role: 'បណ្ណារក្ស & ICT', present: true },
      { id: 'att-10', name: 'អ្នកគ្រូ ពេជ្រ ធីតា', role: 'លេខាធិការ & គណនេយ្យ', present: true },
      { id: 'att-11', name: 'លោក អ៊ុក វ៉ាន់នី', role: 'តំណាងគណៈកម្មការទ្រទ្រង់សាលា', present: true },
      { id: 'att-12', name: 'អ្នកគ្រូ ឡុង ចរិយា', role: 'គ្រូជំនួយការ', present: false, permissionReason: 'សុំច្បាប់ព្យាបាលជំងឺ' }
    ],
    agendas: [
      '១. បូកសរុបលទ្ធផលនៃការបង្រៀន និងវត្តមានសិស្សប្រចាំខែកញ្ញា-តុលា',
      '២. ត្រួតពិនិត្យការអនុវត្តវិធីសាស្ត្របង្រៀនអំណានដំបូង និងគណិតវិទ្យាថ្នាក់ដំបូង (PLP/MoEYS)',
      '៣. ការគ្រប់គ្រង និងថែរក្សាឧបករណ៍បច្ចេកវិទ្យា (Projector, Laptop, Tablet)',
      '៤. ផែនការរៀបចំការប្រឡងប្រចាំខែវិច្ឆិកា និងការផ្ទៀងផ្ទាត់ស្រង់ពិន្ទុ'
    ],
    discussionSummary: 'អង្គប្រជុំបានពិភាក្សាយ៉ាងផុសផុលលើបញ្ហាសិស្សរៀនយឺតមួយចំនួននៅថ្នាក់ទី១ និងទី២។ លោកនាយកបានកោតសរសើរចំពោះការខិតខំប្រឹងប្រែងរបស់លោកគ្រូ-អ្នកគ្រូទាំងអស់ក្នុងការអនុវត្តវិធីសាស្ត្របង្រៀនសកម្ម និងការប្រើប្រាស់បច្ចេកវិទ្យាព័ត៌មានវិទ្យា។ បណ្ណារក្សបានរាយការណ៍អំពីការខ្ចី Projector និង Laptop កើនឡើងខ្ពស់ដែលជំរុញឱ្យការបង្រៀនកាន់តែមានភាពរស់រវើក។',
    resolutions: [
      '១. ឯកភាពរៀបចំកម្មវិធីបង្រៀនបំប៉នបន្ថែម (Remedial Class) សម្រាប់សិស្សរៀនយឺត ២ ម៉ោងក្នុងមួយសប្តាហ៍ (រៀងរាល់ថ្ងៃអង្គារ និងព្រហស្បតិ៍)',
      '២. កំណត់ឱ្យគ្រូបង្រៀនទាំងអស់ត្រូវកត់ត្រាការខ្ចី-ប្រើប្រាស់ឧបករណ៍បច្ចេកវិទ្យាក្នុងប្រព័ន្ធ និង sync ទៅ Google Sheets ជាប្រចាំដើម្បីងាយស្រួលគ្រប់គ្រង',
      '៣. ផ្ទៀងផ្ទាត់ពិន្ទុសិស្ស និងបញ្ជូនលទ្ធផលឱ្យបានមុនថ្ងៃទី ២៥ នៃខែនីមួយៗ',
      '៤. បង្កើនការសម្អាតបរិស្ថានសាលារៀន និងការដាំកូនឈើបន្ថែមនៅមុខអគារសិក្សា'
    ],
    actionItems: [
      {
        id: 'act-1',
        taskTitle: 'រៀបចំកាលវិភាគបង្រៀនបំប៉នសិស្សរៀនយឺតថ្នាក់ទី១ ដល់ទី៣',
        responsiblePerson: 'លោក ឈិន សុផល (នាយករង)',
        deadlineDate: '2024-10-20',
        status: 'completed'
      },
      {
        id: 'act-2',
        taskTitle: 'ត្រួតពិនិត្យស្តុកឧបករណ៍បច្ចេកវិទ្យា និងខ្សែតភ្ជាប់ HDMI/Projector ទាំងអស់',
        responsiblePerson: 'លោក សុខ ពិសិដ្ឋ (បណ្ណារក្ស)',
        deadlineDate: '2024-10-18',
        status: 'completed'
      },
      {
        id: 'act-3',
        taskTitle: 'បូកសរុបរបាយការណ៍ហិរញ្ញវត្ថុចំណូល-ចំណាយ SIG ប្រចាំខែតុលា ដាក់ជូនគណៈកម្មការពិនិត្យ',
        responsiblePerson: 'អ្នកគ្រូ ពេជ្រ ធីតា (គណនេយ្យ)',
        deadlineDate: '2024-10-31',
        status: 'in_progress'
      }
    ],
    googleCalendarEventId: 'mtg-cal-001',
    isSyncedToGoogleCalendar: true,
    syncedAt: '2024-10-10T12:00:00Z',
    status: 'approved',
    createdAt: '2024-10-10T11:45:00Z',
    updatedAt: '2024-10-10T12:00:00Z'
  }
];

// =========================================================================
// 4. INITIAL TEACHING RESOURCE CENTER (មជ្ឈមណ្ឌលធនធានបង្រៀន Google Drive)
// =========================================================================
export const initialTeachingResources: TeachingResourceFile[] = [
  {
    id: 'res-1',
    titleKhmer: 'កិច្ចតែងការបង្រៀនគំរូ ភាសាខ្មែរថ្នាក់ទី១ មេរៀនព្យញ្ជនៈ ៣៣ តួ',
    description: 'កិច្ចតែងការលម្អិតតាមក្បួនវិធីសាស្ត្រអំណានដំបូង MoEYS ដំណាក់កាលទី១ ដល់ទី៤',
    gradeLevel: 1,
    subject: 'khmer',
    fileType: 'doc',
    fileSizeBytes: 2450000,
    fileSizeFormatted: '2.4 MB',
    originalFileName: 'Lesson_Plan_G1_Khmer_Consonants_MoEYS.docx',
    authorTeacherName: 'អ្នកគ្រូ អ៊ឹម សារ៉េត',
    isSharedWithAllTeachers: true,
    tags: ['ភាសាខ្មែរ', 'ថ្នាក់ទី១', 'កិច្ចតែងការ', 'អំណានដំបូង'],
    viewsCount: 48,
    downloadsCount: 35,
    syncedToGoogleDrive: true,
    driveWebViewLink: 'https://drive.google.com/drive/folders/1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g',
    createdAt: '2024-10-05T08:00:00Z'
  },
  {
    id: 'res-2',
    titleKhmer: 'ស្លាយបទបង្ហាញបង្រៀន (PowerPoint) គណិតវិទ្យាថ្នាក់ទី៥ «ប្រភាគ និងទសភាគ»',
    description: 'ស្លាយមានគំនូរជីវចល និងលំហាត់អនុវត្តអន្តរកម្ម ស័ក្តិសមសម្រាប់បញ្ចាំង Projector',
    gradeLevel: 5,
    subject: 'math',
    fileType: 'slide',
    fileSizeBytes: 8900000,
    fileSizeFormatted: '8.9 MB',
    originalFileName: 'Slide_Math_G5_Fractions_Interactive.pptx',
    authorTeacherName: 'អ្នកគ្រូ កែវ ផល្លា',
    isSharedWithAllTeachers: true,
    tags: ['គណិតវិទ្យា', 'ថ្នាក់ទី៥', 'ស្លាយបញ្ចាំង', 'ប្រភាគ'],
    viewsCount: 72,
    downloadsCount: 54,
    syncedToGoogleDrive: true,
    driveWebViewLink: 'https://drive.google.com/drive/folders/1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g',
    createdAt: '2024-10-08T09:30:00Z'
  },
  {
    id: 'res-3',
    titleKhmer: 'សន្លឹកកិច្ចការ និងលំហាត់ពិសោធន៍ វិទ្យាសាស្ត្រថ្នាក់ទី៦ «ប្រព័ន្ធរំលាយអាហារ»',
    description: 'សន្លឹកកិច្ចការ PDF សម្រាប់ចែកសិស្សបំពេញ និងគំនូសបំព្រួញសរីរាង្គមនុស្ស',
    gradeLevel: 6,
    subject: 'science',
    fileType: 'pdf',
    fileSizeBytes: 1800000,
    fileSizeFormatted: '1.8 MB',
    originalFileName: 'Worksheet_G6_Science_Digestion_System.pdf',
    authorTeacherName: 'លោកគ្រូ ចាន់ សុភាព',
    isSharedWithAllTeachers: true,
    tags: ['វិទ្យាសាស្ត្រ', 'ថ្នាក់ទី៦', 'សន្លឹកកិច្ចការ', 'PDF'],
    viewsCount: 65,
    downloadsCount: 42,
    syncedToGoogleDrive: true,
    driveWebViewLink: 'https://drive.google.com/drive/folders/1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g',
    createdAt: '2024-10-12T14:15:00Z'
  },
  {
    id: 'res-4',
    titleKhmer: 'កញ្ចប់សន្លឹកបណ្ណពាក្យ និងរូបភាព Flashcards ភាសាអង់គ្លេសបឋមសិក្សា (English Alphabet & Phonics)',
    description: 'ឯកសាររូបភាព Flashcards សម្រាប់បោះពុម្ពពណ៌ ឬបញ្ចាំងលើ Smart TV',
    gradeLevel: 4,
    subject: 'english',
    fileType: 'image',
    fileSizeBytes: 12400000,
    fileSizeFormatted: '12.4 MB',
    originalFileName: 'Flashcards_English_Phonics_Primary.zip',
    authorTeacherName: 'អ្នកគ្រូ ស៊ុន ម៉ាលី',
    isSharedWithAllTeachers: true,
    tags: ['អង់គ្លេស', 'Flashcards', 'រូបភាពបង្រៀន'],
    viewsCount: 39,
    downloadsCount: 28,
    syncedToGoogleDrive: true,
    driveWebViewLink: 'https://drive.google.com/drive/folders/1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g',
    createdAt: '2024-10-14T10:00:00Z'
  }
];









