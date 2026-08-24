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
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំព្រឹក';
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
  const schoolName = schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សាភ្នំព្រឹក';
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

