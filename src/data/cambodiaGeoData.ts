export interface GeoLevel {
  id: string;
  name: string;
  children?: GeoLevel[];
}

export const cambodiaGeoData: GeoLevel[] = [
  {
    id: 'P02',
    name: 'ខេត្តបាត់ដំបង',
    children: [
      {
        id: 'D0208',
        name: 'មោងឫស្សី',
        children: [
          {
            id: 'C020801',
            name: 'មោង',
            children: [
              { id: 'V02080101', name: 'កន្សៃបន្ទាយ' },
              { id: 'V02080102', name: 'រាគី' },
            ],
          },
          // Can add more if needed
        ],
      },
      {
        id: 'D0210',
        name: 'ភ្នំព្រឹក',
        children: [
          {
            id: 'C021001',
            name: 'ភ្នំព្រឹក',
            children: [
              { id: 'V02100101', name: 'ស្រឡៅ' },
              { id: 'V02100102', name: 'អូរ' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'P01',
    name: 'ខេត្តបន្ទាយមានជ័យ',
    children: [
      {
        id: 'D0106',
        name: 'សិរីសោភ័ណ',
        children: [
          {
            id: 'C010601',
            name: 'អូរអំបិល',
            children: [
              { id: 'V01060101', name: 'សែសិន' },
              { id: 'V01060102', name: 'អូរអំបិល' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'P12',
    name: 'រាជធានីភ្នំពេញ',
    children: [
      {
        id: 'D1201',
        name: 'ចំការមន',
        children: [
          {
            id: 'C120101',
            name: 'ទន្លេបាសាក់',
            children: [
              { id: 'V12010101', name: 'ភូមិ១' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'P03',
    name: 'ខេត្តកំពង់ចាម',
    children: [],
  },
  {
    id: 'P04',
    name: 'ខេត្តកំពង់ឆ្នាំង',
    children: [],
  }
];
