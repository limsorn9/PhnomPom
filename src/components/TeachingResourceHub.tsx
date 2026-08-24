import React, { useState, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { TeachingResourceFile } from '../types';
import {
  uploadFileToDrive,
  getDriveFolderUrl,
  PRIMARY_SCHOOL_DRIVE_FOLDER_ID
} from '../services/googleDrive';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import {
  FolderKanban,
  FileText,
  FileSpreadsheet,
  Film,
  Sparkles,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Download,
  Trash2,
  Share2,
  HardDrive,
  UploadCloud,
  CheckCircle2,
  BookOpen,
  Presentation,
  File,
  X
} from 'lucide-react';

export const TeachingResourceHub: React.FC = () => {
  const {
    teachingResources,
    addTeachingResource,
    deleteTeachingResource,
    currentUser,
    showToast
  } = useSchool();

  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const initialForm = {
    titleKhmer: '',
    description: '',
    subject: 'គណិតវិទ្យា',
    grade: 5,
    fileType: 'pdf' as 'pdf' | 'slide' | 'doc' | 'sheet' | 'video' | 'audio' | 'other',
    category: 'lesson_plan' as 'lesson_plan' | 'slide_presentation' | 'worksheet' | 'supplementary_book' | 'assessment_rubric' | 'multimedia',
    googleDriveFolderId: PRIMARY_SCHOOL_DRIVE_FOLDER_ID,
    externalUrl: '',
    selectedFile: null as File | null
  };

  const [formData, setFormData] = useState(initialForm);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'video':
        return <Film className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-indigo-600" />;
    }
  };

  const filteredResources = teachingResources.filter(res => {
    const matchesGrade = filterGrade === 'all' || res.grade.toString() === filterGrade;
    const matchesSubject = filterSubject === 'all' || res.subject === filterSubject;
    const matchesType = filterType === 'all' || res.fileType === filterType;
    const matchesSearch =
      searchTerm === '' ||
      res.titleKhmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.authorTeacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesGrade && matchesSubject && matchesType && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        selectedFile: file,
        titleKhmer: formData.titleKhmer || file.name.replace(/\.[^/.]+$/, "")
      });
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleKhmer.trim()) {
      showToast('សូមបញ្ចូលចំណងជើងឯកសារបង្រៀន!', 'error');
      return;
    }

    let driveFileId: string | undefined = undefined;
    let webViewLink = formData.externalUrl;
    let downloadLink: string | undefined = undefined;
    let fileSizeStr = '1.5 MB';

    // Upload to Google Drive if file selected
    if (formData.selectedFile) {
      setIsUploadingDrive(true);
      fileSizeStr = `${(formData.selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      try {
        let token = await getAccessToken();
        if (!token) {
          const authRes = await googleSignIn();
          if (authRes) {
            token = authRes.accessToken;
          }
        }

        if (token) {
          const driveResult = await uploadFileToDrive(
            formData.selectedFile,
            formData.selectedFile.name,
            formData.selectedFile.type || 'application/octet-stream',
            PRIMARY_SCHOOL_DRIVE_FOLDER_ID,
            formData.description
          );
          driveFileId = driveResult.id;
          webViewLink = driveResult.webViewLink || getDriveFolderUrl(PRIMARY_SCHOOL_DRIVE_FOLDER_ID);
          downloadLink = driveResult.webContentLink || driveResult.webViewLink;
        }
      } catch (err: any) {
        console.warn('Could not upload to Google Drive directly, saving locally', err);
      } finally {
        setIsUploadingDrive(false);
      }
    }

    addTeachingResource({
      titleKhmer: formData.titleKhmer,
      description: formData.description,
      subject: formData.subject,
      gradeLevel: Number(formData.grade),
      fileType: formData.fileType,
      fileSizeFormatted: fileSizeStr,
      originalFileName: formData.selectedFile?.name || `${formData.titleKhmer}.${formData.fileType === 'pdf' ? 'pdf' : 'docx'}`,
      driveFileId: driveFileId,
      driveWebViewLink: webViewLink || getDriveFolderUrl(PRIMARY_SCHOOL_DRIVE_FOLDER_ID),
      driveDownloadLink: downloadLink,
      authorTeacherName: currentUser?.name || 'អ្នកគ្រូ កែវ ផល្លា',
      downloadsCount: 0,
      viewsCount: 1,
      isSharedWithAllTeachers: true,
      syncedToGoogleDrive: !!driveFileId
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
            <HardDrive className="w-3.5 h-3.5" />
            <span>មជ្ឈមណ្ឌលធនធានបង្រៀន & Google Drive Hub</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-moul text-amber-300">
            មជ្ឈមណ្ឌលផ្ទុក និងចែករំលែកធនធានបង្រៀន (Google Drive)
          </h2>
          <p className="text-sm text-sky-100 max-w-2xl">
            កន្លែងប្រមូលផ្តុំកិច្ចតែងការបង្រៀន (Lesson Plans), ស្លាយបទបង្ហាញ (PowerPoint), សៀវភៅជំនួយស្មារតី និងឯកសារ PDF សម្រាប់គ្រូគ្រប់កម្រិតថ្នាក់ ដោយរក្សាទុកលើ Google Drive។
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={getDriveFolderUrl(PRIMARY_SCHOOL_DRIVE_FOLDER_ID)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium shadow-md transition-all text-sm"
          >
            <FolderKanban className="w-4 h-4" />
            <span>បើក Google Drive Folder</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-md transition-all text-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>បង្ហោះឯកសារថ្មី</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង មុខវិជ្ជា ឬឈ្មោះគ្រូ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Grade filter */}
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">ថ្នាក់ទាំងអស់</option>
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g.toString()}>ថ្នាក់ទី {g}</option>
            ))}
          </select>

          {/* Subject filter */}
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">មុខវិជ្ជាទាំងអស់</option>
            <option value="ភាសាខ្មែរ">ភាសាខ្មែរ</option>
            <option value="គណិតវិទ្យា">គណិតវិទ្យា</option>
            <option value="វិទ្យាសាស្ត្រ">វិទ្យាសាស្ត្រ</option>
            <option value="សិក្សាសង្គម">សិក្សាសង្គម</option>
            <option value="ភាសាអង់គ្លេស">ភាសាអង់គ្លេស</option>
            <option value="សិល្បៈ">សិល្បៈ</option>
            <option value="អប់រំកាយនិងកីឡា">អប់រំកាយនិងកីឡា</option>
          </select>

          {/* File type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">ប្រភេទឯកសារទាំងអស់</option>
            <option value="pdf">PDF Document</option>
            <option value="slide">PowerPoint (Slide)</option>
            <option value="sheet">Excel / Sheets</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">មិនមានធនធានបង្រៀនស្របតាមលក្ខខណ្ឌស្វែងរកទេ</p>
          </div>
        ) : (
          filteredResources.map(resource => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {getFileIcon(resource.fileType)}
                    </div>
                    <div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                        ថ្នាក់ទី {resource.grade} • {resource.subject}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{resource.fileSize}</span>
                </div>

                <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-sky-700 transition-colors">
                  {resource.titleKhmer}
                </h4>

                {resource.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {resource.description}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>រៀបចំដោយ៖ <strong className="text-slate-600">{resource.authorTeacherName}</strong></span>
                  <span>{resource.createdAt.split('T')[0]}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={resource.googleDriveWebViewLink || `https://drive.google.com/drive/folders/${PRIMARY_SCHOOL_DRIVE_FOLDER_ID}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>បើកក្នុង Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => deleteTeachingResource(resource.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="លុបឯកសារ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Upload / Add Resource */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-sky-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">បង្ហោះធនធានបង្រៀនថ្មី</h3>
                  <p className="text-xs text-slate-500">រក្សាទុកក្នុង Google Drive Folder របស់សាលា</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ជ្រើសរើសឯកសារ (PDF, PPTX, DOCX, ស្លាយ...) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer border border-slate-200 rounded-xl p-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ចំណងជើងឯកសារបង្រៀន *
                </label>
                <input
                  type="text"
                  value={formData.titleKhmer}
                  onChange={e => setFormData({ ...formData, titleKhmer: e.target.value })}
                  placeholder="ឧ. កិច្ចតែងការបង្រៀនភាសាខ្មែរ មេរៀនទី១២..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កម្រិតថ្នាក់
                  </label>
                  <select
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    មុខវិជ្ជា
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="ភាសាខ្មែរ">ភាសាខ្មែរ</option>
                    <option value="គណិតវិទ្យា">គណិតវិទ្យា</option>
                    <option value="វិទ្យាសាស្ត្រ">វិទ្យាសាស្ត្រ</option>
                    <option value="សិក្សាសង្គម">សិក្សាសង្គម</option>
                    <option value="ភាសាអង់គ្លេស">ភាសាអង់គ្លេស</option>
                    <option value="សិល្បៈ">សិល្បៈ</option>
                    <option value="អប់រំកាយនិងកីឡា">អប់រំកាយនិងកីឡា</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ទម្រង់ឯកសារ (Type)
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={e => setFormData({ ...formData, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="slide">PowerPoint (Slide)</option>
                    <option value="doc">Word (Docx)</option>
                    <option value="sheet">Excel / Sheets</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ប្រភេទមាតិកា (Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="lesson_plan">កិច្ចតែងការបង្រៀន</option>
                    <option value="slide_presentation">ស្លាយបទបង្ហាញ</option>
                    <option value="worksheet">សន្លឹកកិច្ចការសិស្ស</option>
                    <option value="supplementary_book">សៀវភៅជំនួយស្មារតី</option>
                    <option value="assessment_rubric">តារាងវាស់ស្ទង់</option>
                    <option value="multimedia">វីដេអូ/អូឌីយ៉ូ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  សេចក្តីពិពណ៌នាសង្ខេប
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="ពិពណ៌នាខ្លឹមសារសង្ខេបនៃឯកសារបង្រៀន..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDrive}
                  className="px-5 py-2 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md font-medium flex items-center gap-1.5"
                >
                  {isUploadingDrive ? (
                    <UploadCloud className="w-4 h-4 animate-bounce" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploadingDrive ? 'កំពុង Upload ទៅ Drive...' : 'រក្សាទុក & Upload'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
