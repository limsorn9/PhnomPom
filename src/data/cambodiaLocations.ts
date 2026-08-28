export interface CambodiaLocation {
  province: string;
  districts: {
    name: string;
    communes: {
      name: string;
      villages: string[];
      primarySchools: string[];
    }[];
  }[];
}

export const CAMBODIA_LOCATIONS: CambodiaLocation[] = [
  {
    province: "ខេត្តបាត់ដំបង",
    districts: [
      {
        name: "ស្រុកភ្នំព្រឹក",
        communes: [
          {
            name: "ឃុំភ្នំព្រឹក",
            villages: ["ភូមិភ្នំព្រឹក", "ភូមិអូរដា", "ភូមិទួលតាសែន", "ភូមិបឹងរាំង"],
            primarySchools: ["សាលាបឋមសិក្សាភ្នំព្រឹក", "សាលាបឋមសិក្សាអូរដា", "សាលាបឋមសិក្សាទួលតាសែន"]
          },
          {
            name: "ឃុំបួរ",
            villages: ["ភូមិបួរកណ្តាល", "ភូមិអណ្តូងប្រាក់", "ភូមិស្រែសង្កែ"],
            primarySchools: ["សាលាបឋមសិក្សាបួរ", "សាលាបឋមសិក្សាអណ្តូងប្រាក់"]
          },
          {
            name: "ឃុំបារាំងធ្លាក់",
            villages: ["ភូមំបារាំងធ្លាក់", "ភូមិក្បាលទន្សោង", "ភូមិអូរអណ្តូង"],
            primarySchools: ["សាលាបឋមសិក្សាបារាំងធ្លាក់", "សាលាបឋមសិក្សាក្បាលទន្សោង"]
          },
          {
            name: "ឃុំពេជ្រាដា",
            villages: ["ភូមិពេជ្រ១", "ភូមិពេជ្រ២", "ភូមិអូរតាសោម"],
            primarySchools: ["សាលាបឋមសិក្សាពេជ្រាដា"]
          }
        ]
      },
      {
        name: "ស្រុកសង្កែ",
        communes: [
          {
            name: "ឃុំអន្លង់វិไล",
            villages: ["ភូមិអន្លង់វិไลជើង", "ភូមិអន្លង់វិไลត្បូង", "ភូមិអូរស្ដៅ"],
            primarySchools: ["សាលាបឋមសិក្សាអន្លង់វិไล", "សាលាបឋមសិក្សាអូរស្ដៅ"]
          },
          {
            name: "ឃុំរកា",
            villages: ["ភូមិរកាផ្សារ", "ភូមិរកាក្នុង", "ភូមិបឹងព្រិច"],
            primarySchools: ["សាលាបឋមសិក្សារកា", "សាលាបឋមសិក្សាបឹងព្រិច"]
          },
          {
            name: "ឃុំវត្តចམ་ប៉ា",
            villages: ["ភូមិវត្តចམ་ប៉ា", "ភូមិទួលតាឯក", "ភូមិសាមគ្គី"],
            primarySchools: ["សាលាបឋមសិក្សាវត្តចམ་ប៉ា", "សាលាបឋមសិក្សាសាមគ្គី"]
          }
        ]
      },
      {
        name: "ស្រុកបវេល",
        communes: [
          {
            name: "ឃុំបវេល",
            villages: ["ភូមិបវេល", "ភូមិឈើទាល", "ភូមិបឹងរាំង"],
            primarySchools: ["សាលាបឋមសិក្សាបវេល", "សាលាបឋមសិក្សាឈើទាល"]
          },
          {
            name: "ឃុំព្រៃចាស់",
            villages: ["ភូមិព្រៃចាស់កើត", "ភូមិព្រៃចាស់លិច", "ភូមិអូរតាសុខ"],
            primarySchools: ["សាលាបឋមសិក្សាព្រៃចាស់"]
          }
        ]
      }
    ]
  },
  {
    province: "ខេត្តសៀមរាប",
    districts: [
      {
        name: "ស្រុកប្រាសាទបាក់กอง",
        communes: [
          {
            name: "ឃុំបាក់ខែង",
            villages: ["ភូមិបាក់ខែងកើត", "ភូមិបាក់ខែងលិច", "ភូមិថ្នល់កែង"],
            primarySchools: ["សាលាបឋមសិក្សាបាក់ខែង", "សាលាបឋមសិក្សាថ្នល់កែង"]
          },
          {
            name: "ឃុំរុនតាឯក",
            villages: ["ភូមិរុនតាឯកទី១", "ភូមិរុនតាឯកទី២", "ភូមិបល្ល័ង្ក"],
            primarySchools: ["សាលាបឋមសិក្សារុនតាឯក", "សាលាបឋមសិក្សាបល្ល័ង្ក"]
          }
        ]
      },
      {
        name: "ស្រុកពួក",
        communes: [
          {
            name: "ឃុំពួក",
            villages: ["ភូមិពួកទី១", "ភូមិពួកទី២", "ភូមិសសរកុម្ភៈ"],
            primarySchools: ["សាលាបឋមសិក្សាពួក", "សាលាបឋមសិក្សាសសរកុម្ភៈ"]
          }
        ]
      }
    ]
  },
  {
    province: "រាជធានីភ្នំពេញ",
    districts: [
      {
        name: "ខណ្ឌដូនពេញ",
        communes: [
          {
            name: "សង្កាត់ផ្សារកណ្តាលទី១",
            villages: ["ភូមិទី១", "ភូមិទី២", "ភូមិទី៣"],
            primarySchools: ["សាលាបឋមសិក្សាព្រះស៊ីសុវត្ថិ", "សាលាបឋមសិក្សាវាលវង់"]
          },
          {
            name: "សង្កាត់ស្រះចក",
            villages: ["ភូមិ១", "ភូមិ២", "ភូមិ៣", "ភូមិបឹងកក់"],
            primarySchools: ["សាលាបឋមសិក្សាស្តាតចាស់", "សាលាបឋមសិក្សាបឹងកក់"]
          }
        ]
      },
      {
        name: "ខណ្ឌចំការមន",
        communes: [
          {
            name: "សង្កាត់ទន្លេបាសាក់",
            villages: ["ភូមិ១", "ភូមិ២", "ភូមិ៣", "ភូមិកោះពេជ្រ"],
            primarySchools: ["សាលាបឋមសិក្សាចតុមុខ", "សាលាបឋមសិក្សាទន្លេបាសាក់"]
          }
        ]
      }
    ]
  },
  {
    province: "ខេត្តកណ្តាល",
    districts: [
      {
        name: "ស្រុកតាខ្មៅ",
        communes: [
          {
            name: "សង្កាត់តាខ្មៅ",
            villages: ["ភូមិព្រែកហូរ", "ភូមិដីឥដ្ឋ", "ភូមិទួលសង្កែ"],
            primarySchools: ["សាលាបឋមសិក្សាតាខ្មៅ", "សាលាបឋមសិក្សាព្រែកហូរ"]
          }
        ]
      },
      {
        name: "ស្រុកកណ្តាលស្ទឹង",
        communes: [
          {
            name: "ឃុំបាគូ",
            villages: ["ភូមិបាគូកើត", "ភូមិបាគូលិច", "ភូមិព្រែកតាសុខ"],
            primarySchools: ["សាលាបឋមសិក្សាបាគូ"]
          }
        ]
      }
    ]
  }
];

export function getProvinces(): string[] {
  return (CAMBODIA_LOCATIONS || []).map(l => l.province);
}

export function getDistricts(provinceName: string): string[] {
  const prov = (CAMBODIA_LOCATIONS || []).find(p => p && p.province === provinceName);
  if (!prov || !Array.isArray(prov.districts)) return [];
  return prov.districts.map(d => d.name);
}

export function getCommunes(provinceName: string, districtName: string): string[] {
  const prov = (CAMBODIA_LOCATIONS || []).find(p => p && p.province === provinceName);
  if (!prov || !Array.isArray(prov.districts)) return [];
  const dist = prov.districts.find(d => d && d.name === districtName);
  if (!dist || !Array.isArray(dist.communes)) return [];
  return dist.communes.map(c => c.name);
}

export function getVillages(provinceName: string, districtName: string, communeName: string): string[] {
  const prov = (CAMBODIA_LOCATIONS || []).find(p => p && p.province === provinceName);
  if (!prov || !Array.isArray(prov.districts)) return [];
  const dist = prov.districts.find(d => d && d.name === districtName);
  if (!dist || !Array.isArray(dist.communes)) return [];
  const comm = dist.communes.find(c => c && c.name === communeName);
  if (!comm || !Array.isArray(comm.villages)) return [];
  return comm.villages;
}

export function getPrimarySchools(provinceName: string, districtName: string, communeName: string, villageName?: string): string[] {
  const prov = (CAMBODIA_LOCATIONS || []).find(p => p && p.province === provinceName);
  if (!prov || !Array.isArray(prov.districts)) return [];
  const dist = prov.districts.find(d => d && d.name === districtName);
  if (!dist || !Array.isArray(dist.communes)) return [];
  const comm = dist.communes.find(c => c && c.name === communeName);
  if (!comm || !Array.isArray(comm.primarySchools)) return [];
  // Return primary schools in commune or matching village if needed
  return comm.primarySchools;
}
