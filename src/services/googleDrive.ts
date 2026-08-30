import { getAccessToken } from './googleAuth';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
}

import { CloudVersionMetadata } from '../types';

export const PRIMARY_SCHOOL_DRIVE_FOLDER_ID = '1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g';

export const getDriveFolderUrl = (folderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID): string => {
  return `https://drive.google.com/drive/folders/${folderId}`;
};

/**
 * List files and folders from Google Drive
 */
export const listDriveFiles = async (
  folderId?: string,
  search?: string,
  mimeTypeFilter?: string
): Promise<DriveItem[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  let q = "trashed = false";
  if (folderId) {
    q += ` and '${folderId}' in parents`;
  }
  if (search && search.trim()) {
    q += ` and name contains '${search.replace(/'/g, "\\'")}'`;
  }
  if (mimeTypeFilter) {
    q += ` and mimeType = '${mimeTypeFilter}'`;
  }

  const fields = 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, thumbnailLink, parents, description)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=folder,modifiedTime desc&fields=${encodeURIComponent(fields)}&pageSize=50`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការទាញយកបញ្ជីឯកសារពី Google Drive');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Create a new folder in Google Drive
 */
export const createDriveFolder = async (folderName: string, parentFolderId?: string): Promise<DriveItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការបង្កើត Folder ថ្មី');
  }

  return response.json();
};

/**
 * Upload a file (binary, PDF, JSON, image, text) using multipart upload
 */
export const uploadFileToDrive = async (
  file: File | Blob,
  fileName: string,
  mimeType: string,
  parentFolderId?: string,
  description?: string
): Promise<DriveItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const metadata: any = {
    name: fileName,
    mimeType
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }
  if (description) {
    metadata.description = description;
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaHeaderPart = `${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;

  // Convert binary to base64
  let binaryString = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64Data = btoa(binaryString);

  const multipartBody = metadataPart + mediaHeaderPart + base64Data + closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការផ្ទុកឯកសារទៅ Google Drive');
  }

  return response.json();
};

/**
 * Delete a file or folder from Google Drive
 * (Note: Must be guarded by an explicit user confirmation modal in UI!)
 */
export const deleteDriveItem = async (fileId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'បរាជ័យក្នុងការលុបឯកសារពី Google Drive');
  }
};

/**
 * Backup full school database to Google Drive as JSON
 */
export const backupSchoolDataToDrive = async (
  schoolData: any,
  schoolName: string,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `បម្រុងទុកទិន្នន័យ_${schoolName.replace(/\s+/g, '_')}_${timestamp}.json`;
  const jsonContent = JSON.stringify(schoolData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });

  return uploadFileToDrive(
    blob,
    fileName,
    'application/json',
    targetFolderId,
    `ឯកសារបម្រុងទុកទិន្នន័យសាលារៀន ${schoolName} កាលបរិច្ឆេទ ${new Date().toLocaleDateString('km-KH')}`
  );
};

/**
 * Generate official styled HTML document for Teacher Meeting Minutes
 */
export const generateMeetingMinutesHtmlDocument = (meeting: any, schoolProfile: any): string => {
  const province = schoolProfile?.provinceKhmer || 'បាត់ដំបង';
  const district = schoolProfile?.districtKhmer || 'ភ្នំព្រឹក';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ';
  const principal = schoolProfile?.principalNameKhmer || schoolProfile?.principalName || 'លោក នាយកសាលា';

  const resolutionsHtml = (meeting.resolutions || meeting.keyDecisions || [])
    .map((res: string, idx: number) => `
      <div style="margin-bottom: 8px; font-size: 14px; line-height: 1.6; color: #1e1b4b; background: #f5f3ff; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #7c3aed;">
        <strong>ប្រការ ${idx + 1}៖</strong> ${res}
      </div>
    `).join('');

  const agendasHtml = (meeting.agendas || [])
    .map((ag: string) => `<li style="margin-bottom: 4px;">${ag}</li>`)
    .join('');

  const actionItemsHtml = (meeting.actionItems || [])
    .map((act: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${act.taskTitle || act.task || 'ការងារ'}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #1d4ed8;">${act.responsiblePerson || act.assignedTo || 'គ្រូបន្ទុកថ្នាក់'}</td>
        <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace;">${act.deadlineDate || act.deadline || 'មិនកំណត់'}</td>
      </tr>
    `).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>កំណត់ហេតុកិច្ចប្រជុំ - ${meeting.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
    body {
      font-family: 'Siemreap', 'Khmer OS Siemreap', 'Khmer OS', sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    .header-royal {
      text-align: center;
      margin-bottom: 25px;
    }
    .moul-title {
      font-family: 'Moul', cursive;
      color: #0f172a;
      font-size: 16px;
      margin: 4px 0;
    }
    .sub-header {
      font-size: 13px;
      color: #475569;
    }
    .box-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table-custom th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      font-weight: bold;
      text-align: left;
    }
    .signatures {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-royal">
    <div class="moul-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="moul-title" style="font-size: 14px; color: #b45309;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div style="letter-spacing: 4px; color: #b45309;">***</div>
    <div style="text-align: left; margin-top: 10px;">
      <div><strong>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${province}</strong></div>
      <div>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក${district}</div>
      <div><strong>${schoolName}</strong></div>
    </div>
  </div>

  <div style="text-align: center; margin: 25px 0;">
    <h2 class="moul-title" style="font-size: 18px; color: #4338ca;">កំណត់ហេតុកិច្ចប្រជុំផ្លូវការ</h2>
    <div style="font-size: 14px; font-weight: bold; color: #334155;">« ${meeting.title} »</div>
    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">លេខកូដកិច្ចប្រជុំ៖ ${meeting.meetingCode || 'MTG-' + new Date().getFullYear()}</div>
  </div>

  <div class="box-info">
    <table style="width: 100%; border: none;">
      <tr>
        <td style="padding: 4px 0;"><strong>កាលបរិច្ឆេទ៖</strong> ${meeting.meetingDate}</td>
        <td style="padding: 4px 0;"><strong>ពេលវេលា៖</strong> ${meeting.meetingTime || meeting.startTime + ' - ' + meeting.endTime}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;"><strong>ទីកន្លែង៖</strong> ${meeting.location || 'សាលប្រជុំសាលាបឋមសិក្សា'}</td>
        <td style="padding: 4px 0;"><strong>ឆ្នាំសិក្សា៖</strong> ${meeting.academicYear || schoolProfile?.academicYear || '២០២៦-២០២៧'}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;"><strong>ប្រធានអង្គប្រជុំ៖</strong> ${meeting.chairpersonName || meeting.chairPerson || principal}</td>
        <td style="padding: 4px 0;"><strong>លេខាកត់ត្រា៖</strong> ${meeting.secretaryName || meeting.secretary || 'អ្នកគ្រូ កែវ ផល្លា'}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0;" colspan="2"><strong>វត្តមានសរុប៖</strong> ${meeting.totalPresent || (meeting.totalAttendees - (meeting.absentCount || 0))} នាក់ / អវត្តមាន៖ ${meeting.absentCount || 0} នាក់</td>
      </tr>
    </table>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="font-size: 15px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">I. របៀបវារៈនៃកិច្ចប្រជុំ</h3>
    <ul style="padding-left: 20px;">
      ${agendasHtml || '<li>បូកសរុបលទ្ធផលការងារប្រចាំខែ និងលើកទិសដៅអនុវត្តបន្ត</li>'}
    </ul>
  </div>

  <div style="margin: 25px 0;">
    <h3 style="font-size: 15px; color: #7c3aed; border-bottom: 2px solid #e9d5ff; padding-bottom: 6px;">II. សេចក្ដីសម្រេចចិត្តរបស់អង្គប្រជុំ (Meeting Resolutions)</h3>
    <div style="margin-top: 10px;">
      ${resolutionsHtml || '<p>បានឯកភាពលើរបាយការណ៍ និងផែនការការងារដែលបានលើកឡើង។</p>'}
    </div>
  </div>

  ${actionItemsHtml ? `
  <div style="margin: 25px 0;">
    <h3 style="font-size: 15px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">III. ការបែងចែកភារកិច្ច និងផែនការសកម្មភាព (Action Items)</h3>
    <table class="table-custom">
      <thead>
        <tr>
          <th>កិច្ចការត្រូវអនុវត្ត</th>
          <th>អ្នកទទួលខុសត្រូវ</th>
          <th>កាលបរិច្ឆេទផុតកំណត់</th>
        </tr>
      </thead>
      <tbody>
        ${actionItemsHtml}
      </tbody>
    </table>
  </div>` : ''}

  <div class="signatures" style="margin-top: 50px; display: table; width: 100%;">
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>បានឃើញ និងឯកភាព</div>
      <div style="font-weight: bold; margin-top: 4px;">នាយកសាលា / ប្រធានអង្គប្រជុំ</div>
      <div style="margin-top: 65px; font-weight: bold; color: #1e293b;">${meeting.chairpersonName || meeting.chairPerson || principal}</div>
    </div>
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>ធ្វើនៅ ${district}, ថ្ងៃទី ${meeting.meetingDate.split('-')[2] || '២៨'} ខែ ${meeting.meetingDate.split('-')[1] || '០៨'} ឆ្នាំ ${meeting.meetingDate.split('-')[0] || '២០២៦'}</div>
      <div style="font-weight: bold; margin-top: 4px;">លេខាកត់ត្រា</div>
      <div style="margin-top: 65px; font-weight: bold; color: #1e293b;">${meeting.secretaryName || meeting.secretary || 'អ្នកគ្រូ កែវ ផល្លា'}</div>
    </div>
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
    ឯកសារនេះត្រូវបានបង្កើត និងធ្វើសមកាលកម្មស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សាឌីជីថល ទៅកាន់ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)
  </div>
</body>
</html>`;
};

/**
 * Upload single Meeting Minutes record to Google Drive as styled HTML document
 */
export const uploadMeetingMinutesToDrive = async (
  meeting: any,
  schoolProfile: any,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const htmlContent = generateMeetingMinutesHtmlDocument(meeting, schoolProfile);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const safeTitle = (meeting.title || 'កិច្ចប្រជុំ').replace(/[/\\?%*:|"<>]/g, '_');
  const dateStr = meeting.meetingDate || new Date().toISOString().split('T')[0];
  const fileName = `កំណត់ហេតុ_${safeTitle}_${dateStr}.html`;

  return uploadFileToDrive(
    blob,
    fileName,
    'text/html',
    targetFolderId,
    `កំណត់ហេតុការប្រជុំគ្រូ៖ ${meeting.title} កាលបរិច្ឆេទ ${dateStr}`
  );
};

/**
 * Generate official styled HTML document for 12-Month Financial Budget Report
 */
export const generateFinancialReportHtmlDocument = (
  monthlySummaries: any[],
  transactions: any[],
  schoolProfile: any,
  academicYear: string
): string => {
  const province = schoolProfile?.provinceKhmer || 'បាត់ដំបង';
  const district = schoolProfile?.districtKhmer || 'ភ្នំព្រឹក';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ';
  const principal = schoolProfile?.principalNameKhmer || schoolProfile?.principalName || 'លោក នាយកសាលា';

  const totalIncomeRiel = monthlySummaries.reduce((sum, m) => sum + (m.incomeRiel || 0), 0);
  const totalExpenseRiel = monthlySummaries.reduce((sum, m) => sum + (m.expenseRiel || 0), 0);
  const netBalanceRiel = totalIncomeRiel - totalExpenseRiel;

  const rowsHtml = monthlySummaries.map((m, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">ខែ${m.monthName}</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: right; color: #15803d; font-family: monospace;">${(m.incomeRiel || 0).toLocaleString()} ៛</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: right; color: #b91c1c; font-family: monospace;">${(m.expenseRiel || 0).toLocaleString()} ៛</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: ${m.balanceRiel >= 0 ? '#1d4ed8' : '#e11d48'}; font-family: monospace;">${(m.balanceRiel || 0).toLocaleString()} ៛</td>
      <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${m.transactionCount || 0}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>របាយការណ៍ហិរញ្ញវត្ថុ និងថវិកាសាលា ១២ ខែ</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
    body {
      font-family: 'Siemreap', 'Khmer OS Siemreap', 'Khmer OS', sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    .header-royal {
      text-align: center;
      margin-bottom: 25px;
    }
    .moul-title {
      font-family: 'Moul', cursive;
      color: #0f172a;
      font-size: 16px;
      margin: 4px 0;
    }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .table-custom th {
      background: #0f766e;
      color: #ffffff;
      border: 1px solid #0d9488;
      padding: 10px 12px;
      font-weight: bold;
      text-align: center;
    }
    .summary-card {
      display: inline-block;
      width: 30%;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      margin-right: 2%;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div class="header-royal">
    <div class="moul-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="moul-title" style="font-size: 14px; color: #b45309;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div style="letter-spacing: 4px; color: #b45309;">***</div>
    <div style="text-align: left; margin-top: 10px;">
      <div><strong>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${province}</strong></div>
      <div>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក${district}</div>
      <div><strong>${schoolName}</strong></div>
    </div>
  </div>

  <div style="text-align: center; margin: 25px 0;">
    <h2 class="moul-title" style="font-size: 18px; color: #0f766e;">របាយការណ៍បូកសរុបថវិកាចំណូល-ចំណាយ និងសមតុល្យប្រចាំឆ្នាំ</h2>
    <div style="font-size: 14px; font-weight: bold; color: #334155;">ឆ្នាំសិក្សា ${academicYear || '២០២៦-២០២៧'}</div>
    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">ប្រភពមូលនិធិ៖ ថវិការដ្ឋ (PB), មូលនិធិកែលម្អសាលា (SIG), និងវិភាគទានសហគមន៍</div>
  </div>

  <div style="margin: 20px 0; text-align: center;">
    <div class="summary-card" style="border-top: 4px solid #16a34a;">
      <div style="font-size: 12px; color: #475569;">ចំណូលសរុប (Total Income)</div>
      <div style="font-size: 16px; font-weight: bold; color: #15803d; margin-top: 4px;">${totalIncomeRiel.toLocaleString()} ៛</div>
    </div>
    <div class="summary-card" style="border-top: 4px solid #dc2626;">
      <div style="font-size: 12px; color: #475569;">ចំណាយសរុប (Total Expense)</div>
      <div style="font-size: 16px; font-weight: bold; color: #b91c1c; margin-top: 4px;">${totalExpenseRiel.toLocaleString()} ៛</div>
    </div>
    <div class="summary-card" style="border-top: 4px solid #2563eb; margin-right: 0;">
      <div style="font-size: 12px; color: #475569;">សមតុល្យថវិកាចុងគ្រា (Net Balance)</div>
      <div style="font-size: 16px; font-weight: bold; color: #1d4ed8; margin-top: 4px;">${netBalanceRiel.toLocaleString()} ៛</div>
    </div>
  </div>

  <table class="table-custom">
    <thead>
      <tr>
        <th style="width: 50px;">ល.រ</th>
        <th>ខែ</th>
        <th>ចំណូលសរុប (៛)</th>
        <th>ចំណាយសរុប (៛)</th>
        <th>សមតុល្យប្រចាំខែ (៛)</th>
        <th>ចំនួនប្រតិបត្តិការ</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      <tr style="background: #e6fffa; font-weight: bold; border-top: 2px solid #0f766e;">
        <td colspan="2" style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center;">សរុប ១២ ខែ</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: right; color: #15803d; font-family: monospace;">${totalIncomeRiel.toLocaleString()} ៛</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: right; color: #b91c1c; font-family: monospace;">${totalExpenseRiel.toLocaleString()} ៛</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: right; color: #1d4ed8; font-family: monospace;">${netBalanceRiel.toLocaleString()} ៛</td>
        <td style="padding: 10px 12px; border: 1px solid #cbd5e1; text-align: center;">${transactions.length}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 50px; display: table; width: 100%;">
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>បានឃើញ និងអនុម័ត</div>
      <div style="font-weight: bold; margin-top: 4px;">នាយកសាលា / ប្រធានគណៈកម្មការគ្រប់គ្រង</div>
      <div style="margin-top: 65px; font-weight: bold; color: #1e293b;">${principal}</div>
    </div>
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>ធ្វើនៅ ${district}, ថ្ងៃទី ${new Date().getDate()} ខែ ${new Date().getMonth() + 1} ឆ្នាំ ${new Date().getFullYear()}</div>
      <div style="font-weight: bold; margin-top: 4px;">បេឡាធិការ / គណនេយ្យករសាលា</div>
      <div style="margin-top: 65px; font-weight: bold; color: #1e293b;">អ្នកគ្រូ ស៊ឹម ស្រីមុំ</div>
    </div>
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
    ឯកសាររបាយការណ៍ហិរញ្ញវត្ថុនេះត្រូវបានបង្កើត និង Sync ស្វ័យប្រវត្តិទៅកាន់ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)
  </div>
</body>
</html>`;
};

/**
 * Upload Financial Budget Summary Report to Google Drive
 */
export const uploadFinancialReportToDrive = async (
  monthlySummaries: any[],
  transactions: any[],
  schoolProfile: any,
  academicYear: string,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const htmlContent = generateFinancialReportHtmlDocument(monthlySummaries, transactions, schoolProfile, academicYear);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const yearSafe = (academicYear || '2026-2027').replace(/\s+/g, '_');
  const fileName = `របាយការណ៍ហិរញ្ញវត្ថុ_ថវិកា១២ខែ_${yearSafe}.html`;

  return uploadFileToDrive(
    blob,
    fileName,
    'text/html',
    targetFolderId,
    `របាយការណ៍បូកសរុបចំណូល-ចំណាយ និងសមតុល្យថវិកាសាលា ១២ ខែ ឆ្នាំសិក្សា ${academicYear}`
  );
};

/**
 * Generate official Khmer HTML document for Student Rosters
 */
export const generateStudentRosterHtmlDocument = (
  studentsList: any[],
  classroomTitle: string,
  schoolProfile: any,
  academicYear: string
): string => {
  const province = schoolProfile?.provinceKhmer || 'បាត់ដំបង';
  const district = schoolProfile?.districtKhmer || 'ភ្នំព្រឹក';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ';
  const principal = schoolProfile?.principalNameKhmer || schoolProfile?.principalName || 'លោក នាយកសាលា';

  const femaleCount = studentsList.filter(s => s.gender === 'female' || s.gender === 'ស្រី').length;
  const poorCount = studentsList.filter(s => s.hasPoorCard || s.isPoor).length;

  const rowsHtml = studentsList.map((st, idx) => `
    <tr style="border-bottom: 1px solid #cbd5e1; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #1e3a8a;">${st.studentCode || st.code || '-'}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${st.nameKhmer || st.name}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569;">${st.nameLatin || '-'}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${st.gender === 'female' || st.gender === 'ស្រី' ? '#e11d48' : '#2563eb'};">
        ${st.gender === 'female' || st.gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស'}
      </td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${st.dob || st.dateOfBirth || '-'}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${st.grade ? `ថ្នាក់ទី ${st.grade}${st.section || ''}` : '-'}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${st.guardianName || st.fatherName || st.motherName || '-'}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${st.guardianPhone || st.phone || '-'}</td>
      <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px;">
        ${st.hasPoorCard ? '<span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-weight: bold;">ក្រីក្រ</span>' : 'ទូទៅ'}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>បញ្ជីរាយនាមសិស្ស - ${classroomTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
    body {
      font-family: 'Siemreap', 'Khmer OS Siemreap', 'Khmer OS', sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 35px;
      line-height: 1.5;
    }
    .header-royal {
      text-align: center;
      margin-bottom: 20px;
    }
    .moul-title {
      font-family: 'Moul', cursive;
      color: #0f172a;
      font-size: 15px;
      margin: 3px 0;
    }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 13px;
    }
    .table-custom th {
      background: #1e3a8a;
      color: #ffffff;
      border: 1px solid #172554;
      padding: 8px 10px;
      font-weight: bold;
      text-align: center;
    }
    .stats-card {
      display: inline-block;
      padding: 8px 16px;
      background: #f1f5f9;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      margin-right: 10px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header-royal">
    <div class="moul-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="moul-title" style="font-size: 13px; color: #b45309;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div style="letter-spacing: 4px; color: #b45309;">***</div>
    <div style="text-align: left; margin-top: 10px;">
      <div><strong>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${province}</strong></div>
      <div>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក${district}</div>
      <div><strong>${schoolName}</strong></div>
    </div>
  </div>

  <div style="text-align: center; margin: 20px 0;">
    <h2 class="moul-title" style="font-size: 17px; color: #1e3a8a;">បញ្ជីរាយនាមសិស្សផ្លូវការ</h2>
    <div style="font-size: 14px; font-weight: bold; color: #334155;">« ${classroomTitle} » • ឆ្នាំសិក្សា ${academicYear || '២០២៦-២០២៧'}</div>
  </div>

  <div style="margin: 15px 0;">
    <div class="stats-card">សិស្សសរុប៖ <strong>${studentsList.length}</strong> នាក់</div>
    <div class="stats-card">ស្រី៖ <strong style="color: #e11d48;">${femaleCount}</strong> នាក់</div>
    <div class="stats-card">ប្រុស៖ <strong style="color: #2563eb;">${studentsList.length - femaleCount}</strong> នាក់</div>
    <div class="stats-card">សិស្សមានប័ណ្ណក្រីក្រ៖ <strong style="color: #d97706;">${poorCount}</strong> នាក់</div>
  </div>

  <table class="table-custom">
    <thead>
      <tr>
        <th style="width: 40px;">ល.រ</th>
        <th>អត្តលេខ</th>
        <th>គោត្តនាម-នាម</th>
        <th>អក្សរឡាតាំង</th>
        <th style="width: 50px;">ភេទ</th>
        <th>ថ្ងៃខែឆ្នាំកំណើត</th>
        <th>ថ្នាក់</th>
        <th>អាណាព្យាបាល</th>
        <th>លេខទូរស័ព្ទ</th>
        <th>ស្ថានភាព</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="10" style="text-align:center; padding: 20px;">ពុំទាន់មានទិន្នន័យសិស្សឡើយ</td></tr>'}
    </tbody>
  </table>

  <div style="margin-top: 45px; display: table; width: 100%;">
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>បានឃើញ និងពិនិត្យត្រឹមត្រូវ</div>
      <div style="font-weight: bold; margin-top: 4px;">នាយកសាលា</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">${principal}</div>
    </div>
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>ធ្វើនៅ ${district}, ថ្ងៃទី ${new Date().getDate()} ខែ ${new Date().getMonth() + 1} ឆ្នាំ ${new Date().getFullYear()}</div>
      <div style="font-weight: bold; margin-top: 4px;">គ្រូបន្ទុកថ្នាក់ / អ្នករៀបចំ</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់</div>
    </div>
  </div>

  <div style="margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
    ឯកសារបញ្ជីសិស្សនេះត្រូវបាន Sync ស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធគ្រប់គ្រងសាលា ទៅកាន់ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)
  </div>
</body>
</html>`;
};

/**
 * Upload Student Roster to Google Drive
 */
export const uploadStudentRosterToDrive = async (
  studentsList: any[],
  classroomTitle: string,
  schoolProfile: any,
  academicYear: string,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const htmlContent = generateStudentRosterHtmlDocument(studentsList, classroomTitle, schoolProfile, academicYear);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const safeTitle = classroomTitle.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const fileName = `បញ្ជីសិស្ស_${safeTitle}_${academicYear.replace(/\s+/g, '_')}.html`;

  return uploadFileToDrive(
    blob,
    fileName,
    'text/html',
    targetFolderId,
    `បញ្ជីរាយនាមសិស្សផ្លូវការ៖ ${classroomTitle} ឆ្នាំសិក្សា ${academicYear} (សរុប ${studentsList.length} នាក់)`
  );
};

/**
 * Generate official Khmer HTML document for Monthly Exam Scores & Rankings
 */
export const generateScoresHtmlDocument = (
  scoresList: any[],
  examSubjects: any[],
  classroomTitle: string,
  monthOrSemester: string,
  schoolProfile: any,
  academicYear: string
): string => {
  const province = schoolProfile?.provinceKhmer || 'បាត់ដំបង';
  const district = schoolProfile?.districtKhmer || 'ភ្នំព្រឹក';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ';
  const principal = schoolProfile?.principalNameKhmer || schoolProfile?.principalName || 'លោក នាយកសាលា';

  const sortedScores = [...scoresList].sort((a, b) => (a.rank || 999) - (b.rank || 999));

  const subjects = (examSubjects && examSubjects.length > 0)
    ? examSubjects
    : [
        { key: 'khmerWriting', nameKhmer: 'ភាសាខ្មែរ (សរសេរ)', maxScore: 50 },
        { key: 'khmerReading', nameKhmer: 'ភាសាខ្មែរ (អាន)', maxScore: 50 },
        { key: 'math', nameKhmer: 'គណិតវិទ្យា', maxScore: 100 },
        { key: 'science', nameKhmer: 'វិទ្យាសាស្ត្រ', maxScore: 50 },
        { key: 'socialStudies', nameKhmer: 'សិក្សាសង្គម', maxScore: 50 }
      ];

  const headersHtml = subjects.map(s => `<th style="padding: 6px 8px; border: 1px solid #15803d; font-size: 11px;">${s.nameKhmer || s.name}</th>`).join('');

  const rowsHtml = sortedScores.map((sc, idx) => {
    const subjectCells = subjects.map(s => {
      const val = sc.subjects?.[s.key] ?? sc[s.key] ?? '-';
      return `<td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace;">${val}</td>`;
    }).join('');

    const rank = sc.rank || idx + 1;
    const rankColor = rank === 1 ? '#eab308' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : '#334155';

    return `
      <tr style="border-bottom: 1px solid #cbd5e1; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${rankColor}; font-size: 14px;">${rank}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #1e3a8a;">${sc.studentCode || '-'}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${sc.studentNameKhmer || sc.studentName}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${sc.gender === 'female' || sc.gender === 'ស្រី' ? '#e11d48' : '#2563eb'};">
          ${sc.gender === 'female' || sc.gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស'}
        </td>
        ${subjectCells}
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #15803d; font-family: monospace;">${sc.totalScore ?? '-'}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #0284c7; font-family: monospace;">${sc.averageScore?.toFixed ? sc.averageScore.toFixed(2) : sc.averageScore ?? '-'}</td>
        <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">
          <span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; background: ${sc.gradeLetter === 'A' ? '#dcfce7; color: #15803d;' : sc.gradeLetter === 'B' ? '#e0f2fe; color: #0369a1;' : sc.gradeLetter === 'F' ? '#fee2e2; color: #b91c1c;' : '#f1f5f9; color: #475569;'}">
            ${sc.gradeLetter || '-'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>តារាងពិន្ទុ និងចំណាត់ថ្នាក់ - ${classroomTitle} (${monthOrSemester})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
    body {
      font-family: 'Siemreap', 'Khmer OS Siemreap', 'Khmer OS', sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 35px;
      line-height: 1.5;
    }
    .header-royal {
      text-align: center;
      margin-bottom: 20px;
    }
    .moul-title {
      font-family: 'Moul', cursive;
      color: #0f172a;
      font-size: 15px;
      margin: 3px 0;
    }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 12px;
    }
    .table-custom th {
      background: #166534;
      color: #ffffff;
      border: 1px solid #14532d;
      padding: 8px 6px;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-royal">
    <div class="moul-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="moul-title" style="font-size: 13px; color: #b45309;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div style="letter-spacing: 4px; color: #b45309;">***</div>
    <div style="text-align: left; margin-top: 10px;">
      <div><strong>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${province}</strong></div>
      <div>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក${district}</div>
      <div><strong>${schoolName}</strong></div>
    </div>
  </div>

  <div style="text-align: center; margin: 20px 0;">
    <h2 class="moul-title" style="font-size: 17px; color: #166534;">តារាងពិន្ទុ និងចំណាត់ថ្នាក់ប្រចាំខែ</h2>
    <div style="font-size: 14px; font-weight: bold; color: #334155;">« ${classroomTitle} » • ខែ ${monthOrSemester} • ឆ្នាំសិក្សា ${academicYear || '២០២៦-២០២៧'}</div>
  </div>

  <table class="table-custom">
    <thead>
      <tr>
        <th style="width: 45px;">ចំណាត់ថ្នាក់</th>
        <th>អត្តលេខ</th>
        <th>គោត្តនាម-នាម</th>
        <th style="width: 40px;">ភេទ</th>
        ${headersHtml}
        <th>ពិន្ទុសរុប</th>
        <th>មធ្យមភាគ</th>
        <th>និទ្ទេស</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="12" style="text-align:center; padding: 20px;">ពុំទាន់មានទិន្នន័យពិន្ទុឡើយ</td></tr>'}
    </tbody>
  </table>

  <div style="margin-top: 45px; display: table; width: 100%;">
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>បានឃើញ និងអនុម័ត</div>
      <div style="font-weight: bold; margin-top: 4px;">នាយកសាលា</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">${principal}</div>
    </div>
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>ធ្វើនៅ ${district}, ថ្ងៃទី ${new Date().getDate()} ខែ ${new Date().getMonth() + 1} ឆ្នាំ ${new Date().getFullYear()}</div>
      <div style="font-weight: bold; margin-top: 4px;">គ្រូបន្ទុកថ្នាក់</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់</div>
    </div>
  </div>

  <div style="margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
    ឯកសារតារាងពិន្ទុនេះត្រូវបាន Sync ស្វ័យប្រវត្តិទៅកាន់ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)
  </div>
</body>
</html>`;
};

/**
 * Upload Monthly Exam Scores & Rankings to Google Drive
 */
export const uploadScoresToDrive = async (
  scoresList: any[],
  examSubjects: any[],
  classroomTitle: string,
  monthOrSemester: string,
  schoolProfile: any,
  academicYear: string,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const htmlContent = generateScoresHtmlDocument(scoresList, examSubjects, classroomTitle, monthOrSemester, schoolProfile, academicYear);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const safeTitle = classroomTitle.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const safeMonth = monthOrSemester.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const fileName = `តារាងពិន្ទុ_${safeTitle}_${safeMonth}_${academicYear.replace(/\s+/g, '_')}.html`;

  return uploadFileToDrive(
    blob,
    fileName,
    'text/html',
    targetFolderId,
    `តារាងពិន្ទុ និងចំណាត់ថ្នាក់សិស្ស៖ ${classroomTitle} ខែ ${monthOrSemester} ឆ្នាំសិក្សា ${academicYear}`
  );
};

/**
 * Generate official Khmer HTML document for Top Honor Rolls
 */
export const generateHonorRollHtmlDocument = (
  topStudents: any[],
  classroomTitle: string,
  monthOrSemester: string,
  schoolProfile: any,
  academicYear: string
): string => {
  const province = schoolProfile?.provinceKhmer || 'បាត់ដំបង';
  const district = schoolProfile?.districtKhmer || 'ភ្នំព្រឹក';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ';
  const principal = schoolProfile?.principalNameKhmer || schoolProfile?.principalName || 'លោក នាយកសាលា';

  const cardsHtml = topStudents.map((st, idx) => {
    const rank = st.rank || idx + 1;
    const badgeColor = rank === 1 ? '#eab308' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : '#3b82f6';
    const rankLabel = rank === 1 ? 'ចំណាត់ថ្នាក់លេខ ១ (ឆ្នើម)' : rank === 2 ? 'ចំណាត់ថ្នាក់លេខ ២' : rank === 3 ? 'ចំណាត់ថ្នាក់លេខ ៣' : `ចំណាត់ថ្នាក់លេខ ${rank}`;

    return `
      <div style="border: 2px solid ${badgeColor}; border-radius: 12px; padding: 16px; margin-bottom: 15px; background: #fafaf9; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 13px; font-weight: bold; color: ${badgeColor};">${rankLabel}</div>
          <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px;">${st.studentNameKhmer || st.studentName || st.nameKhmer}</div>
          <div style="font-size: 12px; color: #64748b;">អត្តលេខ៖ ${st.studentCode || '-'} • ភេទ៖ ${st.gender === 'female' || st.gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស'}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #475569;">មធ្យមភាគពិន្ទុ</div>
          <div style="font-size: 20px; font-weight: bold; color: #16a34a; font-family: monospace;">${st.averageScore?.toFixed ? st.averageScore.toFixed(2) : st.averageScore ?? '-'}</div>
          <div style="font-size: 11px; font-weight: bold; color: #0284c7;">និទ្ទេស ${st.gradeLetter || 'A'}</div>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>តារាងកិត្តិយសសិស្សឆ្នើម - ${classroomTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
    body {
      font-family: 'Siemreap', 'Khmer OS Siemreap', 'Khmer OS', sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 35px;
      line-height: 1.5;
    }
    .header-royal {
      text-align: center;
      margin-bottom: 20px;
    }
    .moul-title {
      font-family: 'Moul', cursive;
      color: #0f172a;
      font-size: 15px;
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="header-royal">
    <div class="moul-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="moul-title" style="font-size: 13px; color: #b45309;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div style="letter-spacing: 4px; color: #b45309;">***</div>
    <div style="text-align: left; margin-top: 10px;">
      <div><strong>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${province}</strong></div>
      <div>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក${district}</div>
      <div><strong>${schoolName}</strong></div>
    </div>
  </div>

  <div style="text-align: center; margin: 25px 0;">
    <h2 class="moul-title" style="font-size: 18px; color: #b45309;">តារាងកិត្តិយសសិស្សឆ្នើម (Top 5 Honor Roll)</h2>
    <div style="font-size: 14px; font-weight: bold; color: #334155;">« ${classroomTitle} » • ខែ ${monthOrSemester} • ឆ្នាំសិក្សា ${academicYear || '២០២៦-២០២៧'}</div>
  </div>

  <div style="margin: 20px 0;">
    ${cardsHtml || '<div style="text-align:center; padding: 20px;">ពុំទាន់មានទិន្នន័យសិស្សឆ្នើមឡើយ</div>'}
  </div>

  <div style="margin-top: 45px; display: table; width: 100%;">
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>បានឃើញ និងអបអរសាទរ</div>
      <div style="font-weight: bold; margin-top: 4px;">នាយកសាលា</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">${principal}</div>
    </div>
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>ធ្វើនៅ ${district}, ថ្ងៃទី ${new Date().getDate()} ខែ ${new Date().getMonth() + 1} ឆ្នាំ ${new Date().getFullYear()}</div>
      <div style="font-weight: bold; margin-top: 4px;">គ្រូបន្ទុកថ្នាក់</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់</div>
    </div>
  </div>

  <div style="margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
    ឯកសារតារាងកិត្តិយសនេះត្រូវបាន Sync ស្វ័យប្រវត្តិទៅកាន់ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)
  </div>
</body>
</html>`;
};

/**
 * Upload Honor Roll to Google Drive
 */
export const uploadHonorRollToDrive = async (
  topStudents: any[],
  classroomTitle: string,
  monthOrSemester: string,
  schoolProfile: any,
  academicYear: string,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const htmlContent = generateHonorRollHtmlDocument(topStudents, classroomTitle, monthOrSemester, schoolProfile, academicYear);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const safeTitle = classroomTitle.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const safeMonth = monthOrSemester.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
  const fileName = `តារាងកិត្តិយស_${safeTitle}_${safeMonth}_${academicYear.replace(/\s+/g, '_')}.html`;

  return uploadFileToDrive(
    blob,
    fileName,
    'text/html',
    targetFolderId,
    `តារាងកិត្តិយសសិស្សឆ្នើម Top 5៖ ${classroomTitle} ខែ ${monthOrSemester}`
  );
};

/**
 * Download file content directly from Google Drive
 */
export const downloadDriveFileContent = async (fileId: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google ជាមុនសិន');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('បរាជ័យក្នុងការទាញយកទិន្នន័យពី Google Drive');
  }

  return response.text();
};

/**
 * Generate official Khmer HTML document for Staff & Teacher Directory
 */
export const generateStaffDirectoryHtmlDocument = (
  teachersList: any[],
  schoolProfile: any,
  academicYear: string
): string => {
  const province = schoolProfile?.provinceKhmer || 'បាត់ដំបង';
  const district = schoolProfile?.districtKhmer || 'ភ្នំព្រឹក';
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំពុំ';
  const principal = schoolProfile?.principalNameKhmer || schoolProfile?.principalName || 'លោក នាយកសាលា';

  const femaleCount = teachersList.filter(t => t.gender === 'female' || t.gender === 'ស្រី' || t.gender === 'F').length;

  const rowsHtml = teachersList.map((t, idx) => {
    const isFemale = t.gender === 'female' || t.gender === 'ស្រី' || t.gender === 'F';
    const roleKhmer = t.role === 'director' ? 'នាយកសាលា' : t.role === 'deputy_director' ? 'នាយករង' : t.role === 'secretary' ? 'លេខាធិការ' : 'គ្រូបង្រៀន';
    const assignedClass = t.assignedGrade ? `ថ្នាក់ទី ${t.assignedGrade}${t.assignedSection ? `«${t.assignedSection}»` : ''}` : '-';

    return `
      <tr style="border-bottom: 1px solid #cbd5e1; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #1e3a8a;">${t.teacherCode || t.idNumber || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${t.fullNameKhmer || t.name}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #475569;">${t.fullNameLatin || t.nameEn || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${isFemale ? '#e11d48' : '#2563eb'};">
          ${isFemale ? 'ស្រី' : 'ប្រុស'}
        </td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; color: #334155;">${t.dateOfBirth || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #0369a1;">${roleKhmer}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #15803d;">${assignedClass}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${t.phoneNumber || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #475569;">${t.degree || t.educationLevel || 'គរុកោសល្យ'}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <title>បញ្ជីរាយនាមបុគ្គលិក និងលោកគ្រូ-អ្នកគ្រូ - ${schoolName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
    body {
      font-family: 'Siemreap', 'Khmer OS Siemreap', 'Khmer OS', sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 35px;
      line-height: 1.5;
    }
    .header-royal {
      text-align: center;
      margin-bottom: 20px;
    }
    .moul-title {
      font-family: 'Moul', cursive;
      color: #0f172a;
      font-size: 15px;
      margin: 3px 0;
    }
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 12px;
    }
    .table-custom th {
      background: #1e3a8a;
      color: #ffffff;
      border: 1px solid #172554;
      padding: 9px 8px;
      font-weight: bold;
      text-align: center;
    }
    .stats-card {
      display: inline-block;
      padding: 6px 14px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      margin-right: 10px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header-royal">
    <div class="moul-title">ព្រះរាជាណាចក្រកម្ពុជា</div>
    <div class="moul-title" style="font-size: 13px; color: #b45309;">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
    <div style="letter-spacing: 4px; color: #b45309;">***</div>
    <div style="text-align: left; margin-top: 10px;">
      <div><strong>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត${province}</strong></div>
      <div>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក${district}</div>
      <div><strong>${schoolName}</strong></div>
    </div>
  </div>

  <div style="text-align: center; margin: 20px 0;">
    <h2 class="moul-title" style="font-size: 17px; color: #1e3a8a;">បញ្ជីរាយនាមបុគ្គលិកអប់រំ និងលោកគ្រូ-អ្នកគ្រូ</h2>
    <div style="font-size: 14px; font-weight: bold; color: #334155;">ឆ្នាំសិក្សា ${academicYear || '២០២៦-២០២៧'}</div>
  </div>

  <div style="margin: 15px 0;">
    <div class="stats-card">បុគ្គលិកសរុប៖ <strong>${teachersList.length}</strong> នាក់</div>
    <div class="stats-card">ស្រី៖ <strong style="color: #e11d48;">${femaleCount}</strong> នាក់</div>
    <div class="stats-card">ប្រុស៖ <strong style="color: #2563eb;">${teachersList.length - femaleCount}</strong> នាក់</div>
  </div>

  <table class="table-custom">
    <thead>
      <tr>
        <th style="width: 40px;">ល.រ</th>
        <th>អត្តលេខ</th>
        <th>គោត្តនាម-នាម</th>
        <th>អក្សរឡាតាំង</th>
        <th style="width: 50px;">ភេទ</th>
        <th>ថ្ងៃខែឆ្នាំកំណើត</th>
        <th>តួនាទី</th>
        <th>បន្ទុកថ្នាក់</th>
        <th>លេខទូរស័ព្ទ</th>
        <th>កម្រិតវប្បធម៌</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="10" style="text-align:center; padding: 20px;">ពុំទាន់មានទិន្នន័យបុគ្គលិកឡើយ</td></tr>'}
    </tbody>
  </table>

  <div style="margin-top: 45px; display: table; width: 100%;">
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>បានឃើញ និងពិនិត្យត្រឹមត្រូវ</div>
      <div style="font-weight: bold; margin-top: 4px;">នាយកសាលា</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">${principal}</div>
    </div>
    <div style="display: table-cell; width: 50%; text-align: center;">
      <div>ធ្វើនៅ ${district}, ថ្ងៃទី ${new Date().getDate()} ខែ ${new Date().getMonth() + 1} ឆ្នាំ ${new Date().getFullYear()}</div>
      <div style="font-weight: bold; margin-top: 4px;">អ្នករៀបចំឯកសារ</div>
      <div style="margin-top: 60px; font-weight: bold; color: #1e293b;">លេខាធិការដ្ឋានសាលា</div>
    </div>
  </div>

  <div style="margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
    ឯកសារបញ្ជីបុគ្គលិកនេះត្រូវបាន Sync ស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធគ្រប់គ្រងសាលា ទៅកាន់ Google Drive (Folder ID: 1GCMdTew9rgw5lwkBhmsEuy8WBGELNM1g)
  </div>
</body>
</html>`;
};

/**
 * Upload Staff Directory to Google Drive
 */
export const uploadStaffDirectoryToDrive = async (
  teachersList: any[],
  schoolProfile: any,
  academicYear: string,
  targetFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<DriveItem> => {
  const htmlContent = generateStaffDirectoryHtmlDocument(teachersList, schoolProfile, academicYear);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const fileName = `បញ្ជីបុគ្គលិក_${academicYear.replace(/\s+/g, '_')}.html`;

  return uploadFileToDrive(
    blob,
    fileName,
    'text/html',
    targetFolderId,
    `បញ្ជីរាយនាមបុគ្គលិក និងលោកគ្រូ-អ្នកគ្រូផ្លូវការ ឆ្នាំសិក្សា ${academicYear} (សរុប ${teachersList.length} នាក់)`
  );
};

export const listFilesFromDrive = listDriveFiles;

/**
 * Fetch and analyze the latest Cloud Master Backup from Google Drive
 */
export const fetchLatestCloudMasterBackup = async (
  folderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<CloudVersionMetadata | null> => {
  try {
    const files = await listDriveFiles(folderId);
    if (!files || files.length === 0) {
      return null;
    }

    // Filter for Master Backup JSON files
    const jsonBackups = files.filter(f => 
      f.mimeType === 'application/json' || 
      f.name?.endsWith('.json') || 
      f.name?.includes('បម្រុងទុក') ||
      f.name?.includes('backup')
    );

    if (jsonBackups.length === 0) {
      return null;
    }

    // Sort by modifiedTime descending
    jsonBackups.sort((a, b) => {
      const timeA = new Date(a.modifiedTime || 0).getTime();
      const timeB = new Date(b.modifiedTime || 0).getTime();
      return timeB - timeA;
    });

    const latestFile = jsonBackups[0];
    const sizeBytes = latestFile.size ? parseInt(latestFile.size) : 0;
    const sizeFormatted = sizeBytes > 1024 * 1024 
      ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : sizeBytes > 0 
      ? `${(sizeBytes / 1024).toFixed(1)} KB` 
      : 'មិនស្គាល់ទំហំ';

    // Download content and parse detailed statistics
    let snapshotData: any = null;
    let studentCount = 0;
    let teacherCount = 0;
    let scoreCount = 0;
    let classroomCount = 0;
    let meetingCount = 0;
    let budgetCount = 0;
    let academicYear = '';
    let version = '2.5.0';

    try {
      const content = await downloadDriveFileContent(latestFile.id);
      snapshotData = JSON.parse(content);

      if (Array.isArray(snapshotData.students)) studentCount = snapshotData.students.length;
      if (Array.isArray(snapshotData.teachers)) teacherCount = snapshotData.teachers.length;
      if (Array.isArray(snapshotData.scores)) scoreCount = snapshotData.scores.length;
      if (Array.isArray(snapshotData.classrooms)) classroomCount = snapshotData.classrooms.length;
      if (Array.isArray(snapshotData.teacherMeetings)) meetingCount = snapshotData.teacherMeetings.length;
      if (Array.isArray(snapshotData.budgetTransactions)) budgetCount = snapshotData.budgetTransactions.length;
      if (snapshotData.selectedAcademicYear) academicYear = snapshotData.selectedAcademicYear;
      else if (snapshotData.schoolProfile?.academicYear) academicYear = snapshotData.schoolProfile.academicYear;
      if (snapshotData.version) version = snapshotData.version;
    } catch (parseErr) {
      console.warn('Could not deeply inspect cloud backup content:', parseErr);
    }

    return {
      fileId: latestFile.id,
      fileName: latestFile.name || 'Master_Backup.json',
      fileSizeBytes: sizeBytes,
      fileSizeFormatted: sizeFormatted,
      modifiedTime: latestFile.modifiedTime || new Date().toISOString(),
      syncedBy: (latestFile as any).lastModifyingUser?.emailAddress || 'Google Drive',
      studentCount,
      teacherCount,
      scoreCount,
      classroomCount,
      meetingCount,
      budgetCount,
      academicYear,
      version,
      snapshotData
    };
  } catch (err) {
    console.error('Failed to fetch latest cloud backup metadata:', err);
    throw err;
  }
};

/**
 * Upload User/Director/Teacher/Student Profile Photo to Google Drive
 * Sets permissions so the photo is publicly viewable by link and returns the direct Google Drive photo URL
 */
export const uploadProfilePhotoToDrive = async (
  file: File | Blob,
  fileName: string = `profile_${Date.now()}.jpg`,
  parentFolderId: string = PRIMARY_SCHOOL_DRIVE_FOLDER_ID
): Promise<{ fileId: string; viewUrl: string; directPhotoUrl: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ត្រូវការភ្ជាប់គណនី Google (Google Drive) ជាមុនសិន');
  }

  // 1. Upload the image file to Google Drive folder
  const driveItem = await uploadFileToDrive(
    file,
    fileName,
    'image/jpeg',
    parentFolderId,
    `រូបថតប្រវត្តិរូប (Profile Photo) ផ្ទុកឡើងនៅ ${new Date().toLocaleString('km-KH')}`
  );

  // 2. Set file permission to anyone with the link can view
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${driveItem.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (permErr) {
    console.warn('Could not set public permission on Google Drive photo:', permErr);
  }

  // 3. Generate high-reliability direct photo URL
  const directPhotoUrl = `https://lh3.googleusercontent.com/d/${driveItem.id}`;
  const viewUrl = driveItem.webViewLink || `https://drive.google.com/file/d/${driveItem.id}/view`;

  return {
    fileId: driveItem.id,
    viewUrl,
    directPhotoUrl
  };
};


