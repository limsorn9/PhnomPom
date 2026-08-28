import Fuse, { IFuseOptions } from 'fuse.js';
import { Student, Teacher } from '../types';

/**
 * Normalizes Khmer & Latin text for fuzzy search:
 * - Converts Khmer numerals (០-៩) to Arabic numerals (0-9)
 * - Strips zero-width characters (ZWSP, ZWNJ, ZWJ)
 * - Trims and lowercases
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return '';

  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  let normalized = text.toString();

  // Convert Khmer digits to Arabic digits for numerical search compatibility
  khmerDigits.forEach((kd, idx) => {
    normalized = normalized.replaceAll(kd, idx.toString());
  });

  // Remove zero-width spaces and formatting artifacts
  normalized = normalized
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();

  return normalized;
}

export interface FuzzySearchResult<T> {
  item: T;
  score?: number;
  refIndex: number;
  matchedFields?: string[];
}

export interface UnifiedSearchResult {
  type: 'student' | 'teacher';
  id: string;
  code: string;
  nameKhmer: string;
  nameLatin?: string;
  gender: string;
  subtext: string;
  avatarUrl?: string;
  score?: number;
  raw: Student | Teacher;
}

/**
 * Student Fuzzy Search Index
 */
export class StudentSearchIndex {
  private fuse: Fuse<Student> | null = null;
  private studentList: Student[] = [];

  constructor(students: Student[] = []) {
    this.updateIndex(students);
  }

  public updateIndex(students: Student[]) {
    this.studentList = students;

    const options: IFuseOptions<Student> = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.38, // Balance between typo tolerance and accuracy
      ignoreLocation: true, // Search everywhere in the string
      minMatchCharLength: 1,
      keys: [
        { name: 'nameKhmer', weight: 2.5 },
        { name: 'code', weight: 3.0 },
        { name: 'nameLatin', weight: 2.0 },
        { name: 'phone', weight: 1.5 },
        { name: 'guardianPhone', weight: 1.4 },
        { name: 'guardianName', weight: 1.2 },
        { name: 'idPoorCardNumber', weight: 1.5 },
        { name: 'pobVillage', weight: 0.8 },
        { name: 'pobProvince', weight: 0.8 },
        { name: 'currentVillage', weight: 0.8 },
        { name: 'remarks', weight: 0.6 }
      ]
    };

    this.fuse = new Fuse(students, options);
  }

  public search(query: string): FuzzySearchResult<Student>[] {
    const rawQuery = query.trim();
    if (!rawQuery) {
      return this.studentList.map((item, index) => ({
        item,
        refIndex: index,
        score: 0
      }));
    }

    if (!this.fuse) {
      this.updateIndex(this.studentList);
    }

    const normalizedQuery = normalizeSearchText(rawQuery);
    
    // 1. First priority: Exact substring / ID match
    const exactMatches: FuzzySearchResult<Student>[] = [];
    const matchedIds = new Set<string>();

    this.studentList.forEach((s, index) => {
      const codeNorm = normalizeSearchText(s.code);
      const nameKhmerNorm = normalizeSearchText(s.nameKhmer);
      const nameLatinNorm = normalizeSearchText(s.nameLatin);
      const phoneNorm = normalizeSearchText(s.phone);
      const guardianPhoneNorm = normalizeSearchText(s.guardianPhone);
      const idPoorNorm = normalizeSearchText(s.idPoorCardNumber);

      if (
        codeNorm.includes(normalizedQuery) ||
        nameKhmerNorm.includes(normalizedQuery) ||
        nameLatinNorm.includes(normalizedQuery) ||
        phoneNorm.includes(normalizedQuery) ||
        guardianPhoneNorm.includes(normalizedQuery) ||
        idPoorNorm.includes(normalizedQuery)
      ) {
        exactMatches.push({
          item: s,
          refIndex: index,
          score: 0.01 // Top score
        });
        matchedIds.add(s.id);
      }
    });

    // 2. Fuse.js Fuzzy search for typo tolerance & phonetics
    const fuseResults = this.fuse?.search(rawQuery) || [];
    const fuzzyMatches: FuzzySearchResult<Student>[] = [];

    fuseResults.forEach(res => {
      if (res?.item?.id && !matchedIds.has(res.item.id)) {
        fuzzyMatches.push({
          item: res.item,
          refIndex: res.refIndex,
          score: res.score,
          matchedFields: res.matches?.map(m => m.key).filter(Boolean) as string[]
        });
        matchedIds.add(res.item.id);
      }
    });

    return [...exactMatches, ...fuzzyMatches];
  }
}

/**
 * Teacher Fuzzy Search Index
 */
export class TeacherSearchIndex {
  private fuse: Fuse<Teacher> | null = null;
  private teacherList: Teacher[] = [];

  constructor(teachers: Teacher[] = []) {
    this.updateIndex(teachers);
  }

  public updateIndex(teachers: Teacher[]) {
    this.teacherList = teachers;

    const options: IFuseOptions<Teacher> = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.38,
      ignoreLocation: true,
      minMatchCharLength: 1,
      keys: [
        { name: 'nameKhmer', weight: 2.5 },
        { name: 'staffCode', weight: 3.0 },
        { name: 'nationalId', weight: 2.2 },
        { name: 'nameLatin', weight: 2.0 },
        { name: 'phone', weight: 1.8 },
        { name: 'email', weight: 1.2 },
        { name: 'role', weight: 1.5 },
        { name: 'teachingSubject', weight: 1.4 },
        { name: 'specialization', weight: 1.0 },
        { name: 'qualification', weight: 0.8 },
        { name: 'framework', weight: 0.8 }
      ]
    };

    this.fuse = new Fuse(teachers, options);
  }

  public search(query: string): FuzzySearchResult<Teacher>[] {
    const rawQuery = query.trim();
    if (!rawQuery) {
      return this.teacherList.map((item, index) => ({
        item,
        refIndex: index,
        score: 0
      }));
    }

    if (!this.fuse) {
      this.updateIndex(this.teacherList);
    }

    const normalizedQuery = normalizeSearchText(rawQuery);

    // 1. Exact substring matching for instant high-confidence result
    const exactMatches: FuzzySearchResult<Teacher>[] = [];
    const matchedIds = new Set<string>();

    this.teacherList.forEach((t, index) => {
      const codeNorm = normalizeSearchText(t.staffCode);
      const nameKhmerNorm = normalizeSearchText(t.nameKhmer);
      const nameLatinNorm = normalizeSearchText(t.nameLatin);
      const nationalIdNorm = normalizeSearchText(t.nationalId);
      const phoneNorm = normalizeSearchText(t.phone);
      const roleNorm = normalizeSearchText(t.role);
      const subjectNorm = normalizeSearchText(t.teachingSubject);

      if (
        codeNorm.includes(normalizedQuery) ||
        nameKhmerNorm.includes(normalizedQuery) ||
        nameLatinNorm.includes(normalizedQuery) ||
        nationalIdNorm.includes(normalizedQuery) ||
        phoneNorm.includes(normalizedQuery) ||
        roleNorm.includes(normalizedQuery) ||
        subjectNorm.includes(normalizedQuery)
      ) {
        exactMatches.push({
          item: t,
          refIndex: index,
          score: 0.01
        });
        matchedIds.add(t.id);
      }
    });

    // 2. Fuse.js Fuzzy match
    const fuseResults = this.fuse?.search(rawQuery) || [];
    const fuzzyMatches: FuzzySearchResult<Teacher>[] = [];

    fuseResults.forEach(res => {
      if (res?.item?.id && !matchedIds.has(res.item.id)) {
        fuzzyMatches.push({
          item: res.item,
          refIndex: res.refIndex,
          score: res.score,
          matchedFields: res.matches?.map(m => m.key).filter(Boolean) as string[]
        });
        matchedIds.add(res.item.id);
      }
    });

    return [...exactMatches, ...fuzzyMatches];
  }
}

/**
 * Unified Search across both Students and Teachers
 */
export function searchUnified(
  students: Student[],
  teachers: Teacher[],
  query: string,
  limit: number = 20
): UnifiedSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const studentIndex = new StudentSearchIndex(students);
  const teacherIndex = new TeacherSearchIndex(teachers);

  const studentResults = studentIndex.search(q);
  const teacherResults = teacherIndex.search(q);

  const unified: UnifiedSearchResult[] = [];

  studentResults.forEach(res => {
    const s = res.item;
    unified.push({
      type: 'student',
      id: s.id,
      code: s.code,
      nameKhmer: s.nameKhmer,
      nameLatin: s.nameLatin,
      gender: s.gender,
      subtext: `ថ្នាក់ទី ${s.grade}${s.section} • អត្តលេខ: ${s.code} • អាណាព្យាបាល: ${s.guardianName || 'មិនបញ្ជាក់'}`,
      avatarUrl: s.avatarUrl,
      score: res.score,
      raw: s
    });
  });

  teacherResults.forEach(res => {
    const t = res.item;
    unified.push({
      type: 'teacher',
      id: t.id,
      code: t.staffCode,
      nameKhmer: t.nameKhmer,
      nameLatin: t.nameLatin,
      gender: t.gender,
      subtext: `${t.role} • ឯកទេស: ${t.teachingSubject || t.specialization || 'ទូទៅ'} • អត្តលេខមន្ត្រី: ${t.staffCode}`,
      avatarUrl: t.avatarUrl,
      score: res.score,
      raw: t
    });
  });

  // Sort by score (lower score = higher relevance in Fuse.js)
  unified.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));

  return unified.slice(0, limit);
}
