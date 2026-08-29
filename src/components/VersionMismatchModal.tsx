import React from 'react';
import { VersionConflictState } from '../types';
import { AlertTriangle, CloudDownload, HardDrive, X } from 'lucide-react';

interface VersionMismatchModalProps {
  conflictState: VersionConflictState;
  onDismiss: () => void;
  onKeepLocal: () => void;
  onKeepCloud: () => void;
}

export const VersionMismatchModal: React.FC<VersionMismatchModalProps> = ({
  conflictState,
  onDismiss,
  onKeepLocal,
  onKeepCloud
}) => {
  if (!conflictState.hasMismatch || conflictState.dismissed || !conflictState.cloudVersion) {
    return null;
  }

  const { cloudVersion, localVersion, status } = conflictState;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('km-KH');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 sm:p-6 flex items-start justify-between">
          <div className="flex gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                រកឃើញទិន្នន័យមិនស៊ីសង្វាក់គ្នា (Version Mismatch)
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                ប្រព័ន្ធបានរកឃើញថាទិន្នន័យបម្រុងទុកនៅលើ Google Drive (Cloud) {status === 'cloud_newer' ? 'មានភាពថ្មីជាង' : status === 'local_newer' ? 'មានភាពចាស់ជាង' : 'មានទិន្នន័យខុសគ្នាពី'} ទិន្នន័យដែលកំពុងប្រើប្រាស់នៅក្នុងម៉ាស៊ីននេះ។ សូមជ្រើសរើសទិន្នន័យមួយដែលអ្នកចង់រក្សាទុក។
              </p>
            </div>
          </div>
          <button 
            onClick={onDismiss}
            className="p-2 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Local Version Card */}
            <div className={`border-2 rounded-xl p-4 flex flex-col ${status === 'local_newer' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <HardDrive className="w-5 h-5" />
                <h3 className="font-bold">ទិន្នន័យក្នុងម៉ាស៊ីននេះ (Local)</h3>
                {status === 'local_newer' && (
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full ml-auto">ថ្មីជាង</span>
                )}
              </div>
              
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">កែប្រែចុងក្រោយ៖</span>
                  <span className="font-medium text-slate-800">{formatDate(localVersion.lastModifiedTime)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ចំនួនសិស្ស៖</span>
                  <span className="font-medium text-slate-800">{localVersion.studentCount} នាក់</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ចំនួនគ្រូ៖</span>
                  <span className="font-medium text-slate-800">{localVersion.teacherCount} នាក់</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ទិន្នន័យពិន្ទុ៖</span>
                  <span className="font-medium text-slate-800">{localVersion.scoreCount} កំណត់ត្រា</span>
                </div>
              </div>
              
              <button 
                onClick={onKeepLocal}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
              >
                ប្រើទិន្នន័យក្នុងម៉ាស៊ីននេះ
              </button>
            </div>
            
            {/* Cloud Version Card */}
            <div className={`border-2 rounded-xl p-4 flex flex-col ${status === 'cloud_newer' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-4 text-slate-700">
                <CloudDownload className="w-5 h-5" />
                <h3 className="font-bold">ទិន្នន័យលើក្លោដ (Google Drive)</h3>
                {status === 'cloud_newer' && (
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full ml-auto">ថ្មីជាង</span>
                )}
              </div>
              
              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">កែប្រែចុងក្រោយ៖</span>
                  <span className="font-medium text-slate-800">{formatDate(cloudVersion.modifiedTime)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">អ្នក Sync មុនគេ៖</span>
                  <span className="font-medium text-slate-800 truncate max-w-[120px]">{cloudVersion.syncedBy}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ចំនួនសិស្ស៖</span>
                  <span className="font-medium text-slate-800">{cloudVersion.studentCount ?? '?'} នាក់</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ចំនួនគ្រូ៖</span>
                  <span className="font-medium text-slate-800">{cloudVersion.teacherCount ?? '?'} នាក់</span>
                </div>
              </div>
              
              <button 
                onClick={onKeepCloud}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                ទាញយកទិន្នន័យពីក្លោដ
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
