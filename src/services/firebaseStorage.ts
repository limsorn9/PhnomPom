import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Compresses an image client-side before uploading to optimize bandwidth and storage
 */
export const compressImageFile = (file: File, maxWidth = 600, maxHeight = 750, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a File or Blob to a Base64 data string (used for fallback or offline)
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export interface UploadPhotoResult {
  downloadUrl: string;
  storagePath?: string;
  isFirebaseStorage: boolean;
}

/**
 * Uploads a student profile photo to Firebase Storage
 * If Firebase Storage is temporarily unreachable or blocked, gracefully falls back to optimized Base64
 */
export const uploadStudentProfilePhoto = async (
  file: File,
  studentIdOrCode: string = 'new_student'
): Promise<UploadPhotoResult> => {
  const sanitizedId = studentIdOrCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const filename = `${sanitizedId}_${timestamp}.jpg`;
  const storagePath = `students/photos/${filename}`;

  try {
    // 1. Optimize image before upload
    const compressedBlob = await compressImageFile(file, 600, 750, 0.85);

    // 2. Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        studentId: sanitizedId,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadResult = await uploadBytes(storageRef, compressedBlob, metadata);
    const downloadUrl = await getDownloadURL(uploadResult.ref);

    return {
      downloadUrl,
      storagePath,
      isFirebaseStorage: true
    };
  } catch (storageError: any) {
    console.warn('Firebase Storage upload notice (falling back to optimized data URL):', storageError?.message || storageError);
    
    // Fallback: compress to high quality base64 so user's image is never lost
    try {
      const compressedBlob = await compressImageFile(file, 400, 500, 0.8);
      const base64Url = await fileToBase64(compressedBlob);
      return {
        downloadUrl: base64Url,
        isFirebaseStorage: false
      };
    } catch {
      const rawBase64 = await fileToBase64(file);
      return {
        downloadUrl: rawBase64,
        isFirebaseStorage: false
      };
    }
  }
};

/**
 * Deletes a student photo from Firebase Storage if it's hosted there
 */
export const deleteStudentProfilePhoto = async (photoUrlOrPath: string): Promise<boolean> => {
  if (!photoUrlOrPath || photoUrlOrPath.startsWith('data:')) {
    return true; // No cloud storage file to delete
  }

  try {
    let storageRef;
    if (photoUrlOrPath.startsWith('gs://') || photoUrlOrPath.startsWith('http')) {
      storageRef = ref(storage, photoUrlOrPath);
    } else {
      storageRef = ref(storage, photoUrlOrPath);
    }
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn('Could not delete file from Firebase Storage:', error);
    return false;
  }
};
