import { Student } from '../types';

/**
 * Split a full name into Last Name (Surname) and First Name (Given Name)
 */
export function splitName(fullName: string = ''): { lastName: string; firstName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return { lastName: '', firstName: '' };
  if (parts.length === 1) return { lastName: parts[0], firstName: '' };
  return {
    lastName: parts[0],
    firstName: parts.slice(1).join(' ')
  };
}

/**
 * Calculate age based on Date of Birth (YYYY-MM-DD)
 */
export function calculateStudentAge(dob: string = ''): number | string {
  if (!dob) return '-';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '-';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : '-';
}

/**
 * Get structured MoEYS Student Record Row conforming strictly to the official table
 */
export interface MoEYSStudentRecordRow {
  index: number;
  id: string;
  code: string;
  // 1. ភាសាខ្មែរ
  khmerLastName: string;
  khmerFirstName: string;
  khmerFullName: string;
  // 2. អក្សរឡាតាំង
  latinLastName: string;
  latinFirstName: string;
  latinFullName: string;
  // 3. ភេទ
  gender: 'M' | 'F';
  genderLabel: 'ប្រុស' | 'ស្រី';
  // 4. ថ្ងៃខែឆ្នាំកំណើត
  dob: string;
  // 5. អាយុ
  age: number | string;
  // 6. ទីកន្លែងកំណើត
  pobVillage: string;
  pobCommune: string;
  pobDistrict: string;
  pobProvince: string;
  // 7. ឈ្មោះឪពុក
  fatherLastName: string;
  fatherFirstName: string;
  fatherFullName: string;
  fatherOccupation: string;
  fatherAlive: boolean;
  // 8. ឈ្មោះម្តាយ
  motherLastName: string;
  motherFirstName: string;
  motherFullName: string;
  motherOccupation: string;
  motherAlive: boolean;
  // 9. ឈ្មោះអាណាព្យាបាល
  guardianLastName: string;
  guardianFirstName: string;
  guardianFullName: string;
  guardianOccupation: string;
  guardianRelationship: string;
  // 10. អាសយដ្ឋានបច្ចុប្បន្ន
  currentVillage: string;
  currentCommune: string;
  currentDistrict: string;
  currentProvince: string;
  // 11. ប្រវត្តិសិក្សា & សមធម៌
  academicHistory: string; // ឡើងថ្នាក់ / ត្រួតថ្នាក់ / ចូលរៀនឡើងវិញ / ផ្ទេរចូល
  livingCondition: string; // ទូទៅ / ក្រ១ / ក្រ២
  isOrphan: string; // មិនកំព្រា / កំព្រាឪពុក / កំព្រាម្តាយ / កំព្រាទាំងពីរ
  disability: string; // មិនពិការ / ពិការ...
  scholarship: string; // មិនមាន / អាហារូបករណ៍រដ្ឋ...
  // 12. ស្ថានភាពសិស្ស
  ethnicMinority: string; // ខ្មែរ / ព្នង / គួយ...
  specialCharacteristics: string; // លក្ខណៈពិសេស
  phone: string; // លេខទូរស័ព្ទ
  photoUrl: string; // រូបថត
  isDroppedOut: boolean; // បោះបង់
  dropoutLabel: string;
  remarks: string; // ផ្សេងៗ
  gradeSection: string;
}

export function formatStudentToMoEYSRow(student: Student, index: number = 1): MoEYSStudentRecordRow {
  const khmerSplit = student.lastNameKhmer && student.firstNameKhmer
    ? { lastName: student.lastNameKhmer, firstName: student.firstNameKhmer }
    : splitName(student.nameKhmer);

  const latinSplit = student.lastNameLatin && student.firstNameLatin
    ? { lastName: student.lastNameLatin, firstName: student.firstNameLatin }
    : splitName(student.nameLatin);

  const fatherSplit = student.fatherLastName && student.fatherFirstName
    ? { lastName: student.fatherLastName, firstName: student.fatherFirstName }
    : splitName(student.fatherName);

  const motherSplit = student.motherLastName && student.motherFirstName
    ? { lastName: student.motherLastName, firstName: student.motherFirstName }
    : splitName(student.motherName);

  const guardianSplit = student.guardianLastName && student.guardianFirstName
    ? { lastName: student.guardianLastName, firstName: student.guardianFirstName }
    : splitName(student.guardianName || student.fatherName || student.motherName);

  const isDropped = student.status === 'dropped' || Boolean((student as any).isDroppedOut);

  return {
    index,
    id: student.id,
    code: student.code,
    // 1. ភាសាខ្មែរ
    khmerLastName: khmerSplit.lastName,
    khmerFirstName: khmerSplit.firstName,
    khmerFullName: student.nameKhmer || `${khmerSplit.lastName} ${khmerSplit.firstName}`.trim(),
    // 2. អក្សរឡាតាំង
    latinLastName: latinSplit.lastName,
    latinFirstName: latinSplit.firstName,
    latinFullName: student.nameLatin || `${latinSplit.lastName} ${latinSplit.firstName}`.trim(),
    // 3. ភេទ
    gender: student.gender,
    genderLabel: student.gender === 'F' ? 'ស្រី' : 'ប្រុស',
    // 4. ថ្ងៃខែឆ្នាំកំណើត
    dob: student.dob || '',
    // 5. អាយុ
    age: student.age || calculateStudentAge(student.dob),
    // 6. ទីកន្លែងកំណើត
    pobVillage: student.pobVillage || '',
    pobCommune: student.pobCommune || '',
    pobDistrict: student.pobDistrict || '',
    pobProvince: student.pobProvince || '',
    // 7. ឈ្មោះឪពុក
    fatherLastName: fatherSplit.lastName,
    fatherFirstName: fatherSplit.firstName,
    fatherFullName: student.fatherName || `${fatherSplit.lastName} ${fatherSplit.firstName}`.trim(),
    fatherOccupation: student.fatherOccupation || '',
    fatherAlive: student.fatherAlive !== false,
    // 8. ឈ្មោះម្តាយ
    motherLastName: motherSplit.lastName,
    motherFirstName: motherSplit.firstName,
    motherFullName: student.motherName || `${motherSplit.lastName} ${motherSplit.firstName}`.trim(),
    motherOccupation: student.motherOccupation || '',
    motherAlive: student.motherAlive !== false,
    // 9. ឈ្មោះអាណាព្យាបាល
    guardianLastName: guardianSplit.lastName,
    guardianFirstName: guardianSplit.firstName,
    guardianFullName: student.guardianName || `${guardianSplit.lastName} ${guardianSplit.firstName}`.trim(),
    guardianOccupation: student.guardianOccupation || '',
    guardianRelationship: student.guardianRelationship || 'ឪពុក/ម្តាយ',
    // 10. អាសយដ្ឋានបច្ចុប្បន្ន
    currentVillage: student.currentVillage || '',
    currentCommune: student.currentCommune || '',
    currentDistrict: student.currentDistrict || '',
    currentProvince: student.currentProvince || '',
    // 11. ប្រវត្តិសិក្សា
    academicHistory: student.academicHistory || 'ឡើងថ្នាក់',
    livingCondition: student.livingCondition || 'ទូទៅ',
    isOrphan: student.orphanStatus || student.isOrphan || 'មិនកំព្រា',
    disability: student.disability && student.disability !== 'មិនពិការ' ? student.disability : 'មិនពិការ',
    scholarship: student.scholarship && student.scholarship !== 'មិនមាន' ? student.scholarship : 'មិនមាន',
    // 12. ស្ថានភាពសិស្ស
    ethnicMinority: student.ethnicMinority || 'ខ្មែរ',
    specialCharacteristics: student.specialCharacteristics || '',
    phone: student.phone || student.guardianPhone || '',
    photoUrl: student.avatarUrl || '',
    isDroppedOut: isDropped,
    dropoutLabel: isDropped ? 'បោះបង់' : 'កំពុងរៀន',
    remarks: student.remarks || (student as any).otherNotes || '',
    gradeSection: `ថ្នាក់ទី ${student.grade}${student.section}`
  };
}
