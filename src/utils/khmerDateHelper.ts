// src/utils/khmerDateHelper.ts

export const toKhmerNumber = (num: number | string): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/[0-9]/g, (w) => khmerDigits[+w]);
};

export const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

export const KHMER_DAYS_OF_WEEK = [
  'ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'
];

export const KHMER_LUNAR_MONTHS = [
  'មិគសិរ', 'បុស្ស', 'មាឃ', 'ផល្គុន', 'ចេត្រ', 'ពិសាខ',
  'ជេស្ឋ', 'អាសាឍ', 'ស្រាពណ៍', 'ភទ្របទ', 'អស្សុជ', 'កត្តិក'
];

export const KHMER_ANIMAL_YEARS = [
  'ជូត', 'ឆ្លូវ', 'ខាល', 'ថោះ', 'រោង', 'ម្សាញ់',
  'មមី', 'មមែ', 'វក', 'រកា', 'ចរ', 'កុរ'
];

export const KHMER_SAK = [
  'ឯកស័ក', 'ទោស័ក', 'ត្រីស័ក', 'ចត្វាស័ក', 'បញ្ចស័ក',
  'ឆស័ក', 'សប្តស័ក', 'អដ្ឋស័ក', 'នព្វស័ក', 'សំរឹទ្ធិស័ក'
];

export interface KhmerDateResult {
  solarDate: string;
  lunarDate: string;
  dayKhmer: string;
  dayOfWeek: string;
  monthKhmer: string;
  yearKhmer: string;
  beYearKhmer: string;
}

export const getKhmerFullDate = (dateString?: string): KhmerDateResult => {
  const date = dateString ? new Date(dateString) : new Date();
  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear();
  const dayOfWeekIdx = date.getDay();

  // ពុទ្ធសករាជ (BE Year): គ.ស + 543 ឬ 544
  // តាមប្រតិទិនកម្ពុជា ក្រោយបុណ្យវិសាខបូជា (ប្រហែលខែឧសភា) បូក 544, មុននោះបូក 543
  const beYear = monthIdx >= 4 ? year + 544 : year + 543;

  // សត្វឆ្នាំ
  const animalYearIdx = (year - 4) % 12;
  const animalYear = KHMER_ANIMAL_YEARS[(animalYearIdx + 12) % 12];

  // ស័ក
  const sakIdx = (year - 4) % 10;
  const sak = KHMER_SAK[(sakIdx + 10) % 10];

  const dayOfWeek = KHMER_DAYS_OF_WEEK[dayOfWeekIdx];
  const monthKhmer = KHMER_MONTHS[monthIdx];
  const dayKhmer = toKhmerNumber(day);
  const yearKhmer = toKhmerNumber(year);
  const beYearKhmer = toKhmerNumber(beYear);

  // សុរិយគតិផ្លូវការ
  const solarDate = `ថ្ងៃទី${dayKhmer} ខែ${monthKhmer} ឆ្នាំ${yearKhmer}`;

  // ចន្ទគតិ (ការប៉ាន់ប្រមាណថ្ងៃកើត/រោច និងខែចន្ទគតិ)
  const lunarDayInCycle = ((day + (monthIdx * 2)) % 30) + 1;
  let lunarPhase = '';
  if (lunarDayInCycle <= 15) {
    lunarPhase = `${toKhmerNumber(lunarDayInCycle)}កើត`;
  } else {
    lunarPhase = `${toKhmerNumber(lunarDayInCycle - 15)}រោច`;
  }

  const lunarMonth = KHMER_LUNAR_MONTHS[monthIdx % 12];
  const lunarDate = `${dayOfWeek} ${lunarPhase} ខែ${lunarMonth} ឆ្នាំ${animalYear} ${sak} ពុទ្ធសករាជ ${beYearKhmer}`;

  return {
    solarDate,
    lunarDate,
    dayKhmer,
    dayOfWeek,
    monthKhmer,
    yearKhmer,
    beYearKhmer
  };
};
