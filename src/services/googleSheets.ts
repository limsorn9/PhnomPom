import { getAccessToken } from './googleAuth';
import { Student, Teacher, StudentScoreRecord, BudgetTransaction, SchoolProfile } from '../types';

export interface CreatedSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface SheetFileSummary {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

/**
 * Creates a new Google Spreadsheet with specific title and sheets
 */
export const createSpreadsheet = async (title: string, sheetTitles: string[] = ['ទិន្នន័យ']): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const body = {
    properties: {
      title,
      locale: 'km_KH',
      autoRecalc: 'ON_CHANGE'
    },
    sheets: sheetTitles.map(name => ({
      properties: {
        title: name,
        gridProperties: {
          rowCount: 500,
          columnCount: 26,
          frozenRowCount: 4
        }
      }
    }))
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការបង្កើត Google Sheet');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
};

/**
 * Appends/writes values to a Google Sheet
 */
export const writeSheetValues = async (spreadsheetId: string, range: string, values: (string | number)[][]): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការសរសេរទិន្នន័យចូល Google Sheet');
  }
};

/**
 * Format headers and cells in Google Sheets
 */
export const formatSheetHeader = async (spreadsheetId: string, sheetId: number = 0): Promise<void> => {
  const token = await getAccessToken();
  if (!token) return;

  const requests = [
    // Header styling for title row
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: 12
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.08, green: 0.39, blue: 0.75 },
            textFormat: {
              bold: true,
              fontSize: 12,
              foregroundColor: { red: 1, green: 1, blue: 1 }
            },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    },
    // Table header row styling
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 3,
          endRowIndex: 4,
          startColumnIndex: 0,
          endColumnIndex: 15
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.92, green: 0.95, blue: 0.99 },
            textFormat: {
              bold: true,
              fontSize: 10,
              foregroundColor: { red: 0.1, green: 0.2, blue: 0.4 }
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    }
  ];

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
  } catch (err) {
    console.warn('Formatting sheet skipped:', err);
  }
};

/**
 * Read values from a spreadsheet
 */
export const readSpreadsheetValues = async (spreadsheetId: string, range: string): Promise<any[][]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការអានទិន្នន័យពី Google Sheet');
  }

  const data = await response.json();
  return data.values || [];
};

/**
 * Fetch spreadsheet metadata to get sheet names
 */
export const getSpreadsheetMetadata = async (spreadsheetId: string): Promise<any> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការទាញយកព័ត៌មាន Google Sheet');
  }

  return response.json();
};

/**
 * Export Students Roster to a new Google Sheet
 */
export const exportStudentsToGoogleSheets = async (
  schoolProfile: SchoolProfile,
  students: Student[],
  filterLabel?: string
): Promise<CreatedSheetResult> => {
  const title = `បញ្ជីឈ្មោះសិស្ស_${schoolProfile.nameKhmer}_${filterLabel || 'ទាំងអស់'}_${new Date().toLocaleDateString('km-KH')}`;
  const sheetName = 'បញ្ជីឈ្មោះសិស្ស';

  const { spreadsheetId, spreadsheetUrl } = await createSpreadsheet(title, [sheetName]);

  const rows: (string | number)[][] = [
    // Header Meta
    ['ក្រសួងអប់រំ យុវជន និងកីឡា', '', '', '', schoolProfile.nameKhmer, '', '', '', '', '', ''],
    [`សាលាបឋមសិក្សា៖ ${schoolProfile.nameKhmer}`, '', '', `ឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}`, '', '', `ទីតាំង៖ ${schoolProfile.district}, ${schoolProfile.province}`],
    ['', '', '', '', '', '', '', '', '', '', ''],
    // Table Columns
    [
      'ល.រ',
      'អត្តលេខ',
      'គោត្តនាម និងនាម',
      'ឈ្មោះឡាតាំង',
      'ភេទ',
      'ថ្នាក់',
      'ថ្ងៃខែឆ្នាំកំណើត',
      'ទីកន្លែងកំណើត',
      'អាណាព្យាបាល',
      'ទូរស័ព្ទ',
      'អាសយដ្ឋានបច្ចុប្បន្ន',
      'ស្ថានភាព'
    ]
  ];

  students.forEach((stu, index) => {
    rows.push([
      index + 1,
      stu.code,
      stu.nameKhmer,
      stu.nameLatin,
      stu.gender === 'M' ? 'ប្រុស' : 'ស្រី',
      `ថ្នាក់ទី${stu.grade}${stu.section}`,
      stu.dob,
      stu.pob,
      `${stu.guardianName} (${stu.guardianRelationship})`,
      stu.guardianPhone,
      stu.address,
      stu.status === 'active' ? 'កំពុងរៀន' : stu.status === 'transferred' ? 'ផ្ទេរចេញ' : 'ឈប់រៀន'
    ]);
  });

  await writeSheetValues(spreadsheetId, `'${sheetName}'!A1:L${rows.length}`, rows);
  await formatSheetHeader(spreadsheetId, 0);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title
  };
};

/**
 * Export Classroom Monthly Scores to Google Sheets
 */
export const exportScoresToGoogleSheets = async (
  schoolProfile: SchoolProfile,
  grade: number,
  section: string,
  month: string,
  scores: StudentScoreRecord[]
): Promise<CreatedSheetResult> => {
  const title = `តារាងពិន្ទុ_ថ្នាក់ទី${grade}${section}_ខែ${month}_${schoolProfile.nameKhmer}`;
  const sheetName = `ពិន្ទុ_ថ្នាក់${grade}${section}_${month}`;

  const { spreadsheetId, spreadsheetUrl } = await createSpreadsheet(title, [sheetName]);

  const rows: (string | number)[][] = [
    ['ក្រសួងអប់រំ យុវជន និងកីឡា', '', '', '', schoolProfile.nameKhmer, '', '', '', '', '', '', ''],
    [`សាលាបឋមសិក្សា៖ ${schoolProfile.nameKhmer}`, '', '', `តារាងពិន្ទុថ្នាក់ទី ${grade}${section} ខែ ${month}`, '', '', `ឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}`],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    [
      'ល.រ',
      'អត្តលេខ',
      'គោត្តនាម-នាម',
      'ភេទ',
      'អំណាន (10)',
      'សំណេរ (10)',
      'គណិត (10)',
      'វិទ្យាសាស្ត្រ (10)',
      'សីលធម៌ (10)',
      'សិល្បៈ/កាយ (10)',
      'ពិន្ទុសរុប (60)',
      'មធ្យមភាគ (10)',
      'ចំណាត់ថ្នាក់',
      'និទ្ទេស',
      'លទ្ធផល'
    ]
  ];

  scores.forEach((sc, idx) => {
    rows.push([
      idx + 1,
      sc.studentCode,
      sc.studentNameKhmer,
      sc.gender === 'M' ? 'ប្រុស' : 'ស្រី',
      sc.scores.khmerReading,
      sc.scores.khmerWriting,
      sc.scores.mathematics,
      sc.scores.scienceSocial,
      sc.scores.moralCivics,
      sc.scores.artsPhysical,
      sc.totalScore,
      sc.averageScore,
      sc.rank,
      sc.gradeLetter,
      sc.resultStatus
    ]);
  });

  await writeSheetValues(spreadsheetId, `'${sheetName}'!A1:O${rows.length}`, rows);
  await formatSheetHeader(spreadsheetId, 0);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title
  };
};

/**
 * Export Teachers Directory to Google Sheets
 */
export const exportTeachersToGoogleSheets = async (
  schoolProfile: SchoolProfile,
  teachers: Teacher[]
): Promise<CreatedSheetResult> => {
  const title = `បញ្ជីបុគ្គលិក_គ្រូបង្រៀន_${schoolProfile.nameKhmer}_${schoolProfile.academicYear}`;
  const sheetName = 'បុគ្គលិក-គ្រូបង្រៀន';

  const { spreadsheetId, spreadsheetUrl } = await createSpreadsheet(title, [sheetName]);

  const rows: (string | number)[][] = [
    ['ក្រសួងអប់រំ យុវជន និងកីឡា', '', '', '', schoolProfile.nameKhmer, '', '', '', ''],
    [`សាលាបឋមសិក្សា៖ ${schoolProfile.nameKhmer}`, '', '', `បញ្ជីឈ្មោះគ្រូបង្រៀន និងបុគ្គលិកអប់រំ`, '', '', `ឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}`],
    ['', '', '', '', '', '', '', '', ''],
    [
      'ល.រ',
      'អត្តលេខមន្ត្រី',
      'គោត្តនាម-នាម',
      'ឈ្មោះឡាតាំង',
      'ភេទ',
      'មុខងារ / តួនាទី',
      'កម្រិតវប្បធម៌-គរុកោសល្យ',
      'ថ្នាក់បន្ទុក',
      'ទូរស័ព្ទ',
      'អ៊ីមែល',
      'អតីតភាព (ឆ្នាំ)',
      'ស្ថានភាព'
    ]
  ];

  teachers.forEach((t, idx) => {
    rows.push([
      idx + 1,
      t.staffCode,
      t.nameKhmer,
      t.nameLatin,
      t.gender === 'M' ? 'ប្រុស' : 'ស្រី',
      t.role,
      t.qualification,
      t.assignedGrade ? `ថ្នាក់ទី ${t.assignedGrade}${t.assignedSection || ''}` : 'គ្មាន',
      t.phone,
      t.email,
      t.yearsOfService,
      t.status === 'active' ? 'កំពុងបង្រៀន' : 'ឈប់សម្រាក'
    ]);
  });

  await writeSheetValues(spreadsheetId, `'${sheetName}'!A1:L${rows.length}`, rows);
  await formatSheetHeader(spreadsheetId, 0);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title
  };
};

/**
 * Export Financial Transactions to Google Sheets
 */
export const exportFinanceToGoogleSheets = async (
  schoolProfile: SchoolProfile,
  transactions: BudgetTransaction[]
): Promise<CreatedSheetResult> => {
  const title = `សៀវភៅតាមដានថវិកាសាលា_${schoolProfile.nameKhmer}_${schoolProfile.academicYear}`;
  const sheetName = 'ថវិកា និងហិរញ្ញវត្ថុ';

  const { spreadsheetId, spreadsheetUrl } = await createSpreadsheet(title, [sheetName]);

  const rows: (string | number)[][] = [
    ['ក្រសួងអប់រំ យុវជន និងកីឡា', '', '', '', schoolProfile.nameKhmer, '', '', ''],
    [`សាលាបឋមសិក្សា៖ ${schoolProfile.nameKhmer}`, '', '', `សៀវភៅកត់ត្រាចំណូល-ចំណាយថវិការដ្ឋ (PB/SIG)`, '', '', `ឆ្នាំសិក្សា៖ ${schoolProfile.academicYear}`],
    ['', '', '', '', '', '', '', ''],
    [
      'ល.រ',
      'លេខកូដប្រតិបត្តិការ',
      'កាលបរិច្ឆេទ',
      'បរិយាយ / មុខទំនិញ',
      'ប្រភេទ',
      'ប្រភពថវិកា',
      'ជំពូក / ប្រភេទចំណាយ',
      'ចំនួនទឹកប្រាក់ (រៀល)',
      'ចំនួនទឹកប្រាក់ (ដុល្លារ)',
      'អ្នកកត់ត្រា',
      'ស្ថានភាព'
    ]
  ];

  transactions.forEach((tx, idx) => {
    rows.push([
      idx + 1,
      tx.referenceCode,
      tx.date,
      tx.title,
      tx.type === 'income' ? 'ចំណូល (+)' : 'ចំណាយ (-)',
      tx.source,
      tx.category,
      tx.amountRiel,
      tx.amountUsd,
      tx.recordedBy,
      tx.status === 'approved' ? 'អនុម័តរួច' : 'កំពុងរង់ចាំ'
    ]);
  });

  await writeSheetValues(spreadsheetId, `'${sheetName}'!A1:K${rows.length}`, rows);
  await formatSheetHeader(spreadsheetId, 0);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title
  };
};
