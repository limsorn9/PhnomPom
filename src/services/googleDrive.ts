import { getAccessToken } from './googleAuth';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  description?: string;
}

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
export const backupSchoolDataToDrive = async (schoolData: any, schoolName: string): Promise<DriveItem> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `បម្រុងទុកទិន្នន័យ_${schoolName}_${timestamp}.json`;
  const jsonContent = JSON.stringify(schoolData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });

  return uploadFileToDrive(
    blob,
    fileName,
    'application/json',
    undefined,
    `ឯកសារបម្រុងទុកទិន្នន័យសាលារៀន ${schoolName} កាលបរិច្ឆេទ ${new Date().toLocaleDateString('km-KH')}`
  );
};
