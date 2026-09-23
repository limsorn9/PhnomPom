import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import { AppUser, Student, UserRole } from '../types';
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Key,
  Printer,
  FileText,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Search,
  Filter,
  Check,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';

interface BatchClassStudentAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGrade?: number;
  initialSection?: string;
}

interface ParsedStudentAccountRow {
  id: string;
  studentCode: string;
  nameKhmer: string;
  nameLatin: string;
  gender: 'M' | 'F';
  dob?: string;
  grade: number;
  section: string;
  username: string;
  password: string;
  phone?: string;
  existingUser?: AppUser | null;
  existingStudent?: Student | null;
  status: 'new' | 'existing' | 'invalid';
  validationMessage?: string;
  isSelected: boolean;
}

export const BatchClassStudentAccountsModal: React.FC<BatchClassStudentAccountsModalProps> = ({
  isOpen,
  onClose,
  initialGrade = 1,
  initialSection = 'ក'
}) => {
  const {
    students,
    addStudent,
    appUsers,
    setAppUsers,
    currentUser,
    schoolProfile,
    showToast,
    addAccountAuditLog,
    isStudentRegisteredInAccounts
  } = useSchool();

  // Current User Role check
  const isTeacher = currentUser?.role === 'teacher';
  const defaultGrade = isTeacher && currentUser.assignedGrade ? currentUser.assignedGrade : initialGrade;
  const defaultSection = isTeacher && currentUser.assignedSection ? currentUser.assignedSection : initialSection;

  const [selectedGrade, setSelectedGrade] = useState<number>(defaultGrade);
  const [selectedSection, setSelectedSection] = useState<string>(defaultSection);

  const [activeStep, setActiveStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentAccountRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Settings
  const [passwordMode, setPasswordMode] = useState<'from_file_or_code' | 'student_code' | 'common_password'>('from_file_or_code');
  const [commonPassword, setCommonPassword] = useState<string>('12345678');
  const [forcePasswordChange, setForcePasswordChange] = useState<boolean>(false);
  const [autoEnrollNewStudents, setAutoEnrollNewStudents] = useState<boolean>(true);
  const [overwriteExistingPasswords, setOverwriteExistingPasswords] = useState<boolean>(false);

  // UI States
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'existing' | 'invalid'>('all');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdSummary, setCreatedSummary] = useState<{ created: number; updated: number; enrolled: number } | null>(null);
  const [lastCreatedAccounts, setLastCreatedAccounts] = useState<ParsedStudentAccountRow[]>([]);

  // Print Slips state
  const [isGeneratingPrintSlips, setIsGeneratingPrintSlips] = useState<boolean>(false);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics for current selected class in DB
  const classStudentsInDb = useMemo(() => {
    return students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [students, selectedGrade, selectedSection]);

  const classStudentsWithAccounts = useMemo(() => {
    return classStudentsInDb.filter(s => isStudentRegisteredInAccounts(s));
  }, [classStudentsInDb, isStudentRegisteredInAccounts]);

  const classStudentsMissingAccounts = useMemo(() => {
    return classStudentsInDb.filter(s => !isStudentRegisteredInAccounts(s));
  }, [classStudentsInDb, isStudentRegisteredInAccounts]);

  if (!isOpen) return null;

  // 1. Download Blank CSV Template
  const handleDownloadBlankTemplate = () => {
    const csvContent =
      '\uFEFF' +
      'អត្តលេខសិស្ស,ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ (M/F),ថ្ងៃកំណើត (YYYY-MM-DD),ថ្នាក់ទី,បន្ទប់,ឈ្មោះចូល (Username),ពាក្យសម្ងាត់ (Password),លេខទូរស័ព្ទអាណាព្យាបាល,សម្គាល់\n' +
      `STU-2026-001,សាន់ វណ្ណា,SANN VANNA,M,2015-04-12,${selectedGrade},${selectedSection},stu_${selectedGrade}${selectedSection === 'ក' ? 'a' : 'b'}_001,STU-2026-001,012334455,គំរូ\n` +
      `STU-2026-002,កែវ សុខនី,KEO SOKNY,F,2015-08-20,${selectedGrade},${selectedSection},stu_${selectedGrade}${selectedSection === 'ក' ? 'a' : 'b'}_002,STU-2026-002,098765432,គំរូ\n` +
      `STU-2026-003,ហេង ចាន់រិទ្ធ,HENG CHANRITH,M,2015-01-15,${selectedGrade},${selectedSection},stu_${selectedGrade}${selectedSection === 'ក' ? 'a' : 'b'}_003,STU-2026-003,077112233,គំរូ`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Student_Accounts_Grade_${selectedGrade}_Section_${selectedSection}.csv`;
    link.click();
    showToast(`បានទាញយកឯកសារគំរូទទេសម្រាប់ ថ្នាក់ទី ${selectedGrade} «${selectedSection}» ជោគជ័យ!`, 'success');
  };

  // 2. Download Pre-filled Class Roster CSV Template
  const handleDownloadClassRosterTemplate = () => {
    if (classStudentsInDb.length === 0) {
      showToast(`ពុំទាន់មានទិន្នន័យសិស្សក្នុងថ្នាក់ទី ${selectedGrade} «${selectedSection}» ក្នុងប្រព័ន្ធនៅឡើយទេ! សូមទាញយកគំរូទទេ`, 'info');
      handleDownloadBlankTemplate();
      return;
    }

    const header = 'អត្តលេខសិស្ស,ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ (M/F),ថ្ងៃកំណើត (YYYY-MM-DD),ថ្នាក់ទី,បន្ទប់,ឈ្មោះចូល (Username),ពាក្យសម្ងាត់ (Password),លេខទូរស័ព្ទអាណាព្យាបាល,សម្គាល់\n';
    
    const rows = classStudentsInDb.map((st, index) => {
      const code = st.code || `STU-${selectedGrade}${selectedSection === 'ក' ? 'A' : 'B'}-${String(index + 1).padStart(3, '0')}`;
      const defaultUser = code.toLowerCase().replace(/[^a-z0-9]/g, '');
      const defaultPass = code;
      const genderStr = st.gender === 'F' ? 'F' : 'M';
      const phone = st.guardianPhone || st.phone || '';
      const dob = st.dob || '';
      const note = isStudentRegisteredInAccounts(st) ? 'មានគណនីរួច' : 'ខ្វះគណនី';
      return `${code},${st.nameKhmer},${st.nameLatin || ''},${genderStr},${dob},${selectedGrade},${selectedSection},${defaultUser},${defaultPass},${phone},${note}`;
    }).join('\n');

    const csvContent = '\uFEFF' + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Roster_Student_Accounts_Grade_${selectedGrade}_Section_${selectedSection}_${schoolProfile.academicYear.replace(/\s+/g, '_')}.csv`;
    link.click();
    showToast(`បានទាញយកបញ្ជីសិស្សស្រាប់ចំនួន ${classStudentsInDb.length} នាក់ សម្រាប់ថ្នាក់ទី ${selectedGrade} «${selectedSection}» ជោគជ័យ!`, 'success');
  };

  // 3. Helper: Clean CSV Cell
  const cleanCell = (val: string): string => {
    if (!val) return '';
    return val.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  };

  // 4. Parse CSV / Text Data
  const parseData = (rawText: string) => {
    setParseError(null);
    if (!rawText || !rawText.trim()) {
      setParseError('សូមជ្រើសរើស ឬបិទភ្ជាប់ទិន្នន័យឯកសារ CSV/Excel ជាមុនសិន!');
      return;
    }

    try {
      const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const filteredLines = lines.filter(l => l.trim().length > 0);

      if (filteredLines.length < 1) {
        setParseError('ឯកសារគ្មានទិន្នន័យឡើយ!');
        return;
      }

      // Check delimiter (comma, tab, semicolon)
      const firstLine = filteredLines[0];
      let delimiter = ',';
      if (firstLine.includes('\t')) delimiter = '\t';
      else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

      let startIndex = 0;
      // If first row is a header containing keywords
      if (
        firstLine.includes('អត្តលេខ') ||
        firstLine.includes('ឈ្មោះ') ||
        firstLine.includes('Code') ||
        firstLine.includes('Name') ||
        firstLine.includes('Grade') ||
        firstLine.includes('ថ្នាក់')
      ) {
        startIndex = 1;
      }

      const rows: ParsedStudentAccountRow[] = [];

      for (let i = startIndex; i < filteredLines.length; i++) {
        const line = filteredLines[i].trim();
        if (!line) continue;

        // Split by delimiter respecting quotes
        let cols: string[] = [];
        if (delimiter === ',') {
          // Simple CSV splitter
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
          const matches = line.match(regex) || [];
          cols = matches.map(m => cleanCell(m.replace(/^,/, '')));
        } else {
          cols = line.split(delimiter).map(c => cleanCell(c));
        }

        if (cols.length < 2) continue;

        // Flexible column extraction
        const rawCode = cols[0] || '';
        const rawNameKhmer = cols[1] || '';
        const rawNameLatin = cols[2] || '';
        const rawGender = cols[3] || 'M';
        const rawDob = cols[4] || '';
        const rawGrade = parseInt(cols[5]) || selectedGrade;
        const rawSection = cols[6] || selectedSection;
        const rawUsername = cols[7] || '';
        const rawPassword = cols[8] || '';
        const rawPhone = cols[9] || '';

        if (!rawNameKhmer && !rawCode) continue;

        const cleanCode = rawCode || `STU-${selectedGrade}${selectedSection === 'ក' ? 'A' : 'B'}-${String(rows.length + 1).padStart(3, '0')}`;
        const cleanKhmer = rawNameKhmer || `សិស្ស ${cleanCode}`;
        const cleanLatin = rawNameLatin || '';
        const cleanGender: 'M' | 'F' = (rawGender === 'F' || rawGender === 'ស្រី' || rawGender === 'f') ? 'F' : 'M';

        // Username generation
        let finalUsername = rawUsername;
        if (!finalUsername) {
          finalUsername = cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        }

        // Password generation
        let finalPassword = rawPassword;
        if (passwordMode === 'student_code' || !finalPassword) {
          finalPassword = cleanCode;
        } else if (passwordMode === 'common_password') {
          finalPassword = commonPassword || '12345678';
        }

        // Match existing student in DB
        const matchedStudent = students.find(s =>
          (s.code && s.code.trim().toLowerCase() === cleanCode.toLowerCase()) ||
          (s.nameKhmer && s.nameKhmer.trim() === cleanKhmer.trim() && s.grade === selectedGrade && s.section === selectedSection)
        );

        // Match existing AppUser in DB
        const matchedUser = appUsers.find(u =>
          (u.studentCode && u.studentCode.trim().toLowerCase() === cleanCode.toLowerCase()) ||
          (u.username && u.username.trim().toLowerCase() === finalUsername.toLowerCase()) ||
          (matchedStudent && u.studentId === matchedStudent.id) ||
          (u.nameKhmer && u.nameKhmer.trim() === cleanKhmer.trim() && u.role === 'student' && u.assignedGrade === selectedGrade && u.assignedSection === selectedSection)
        );

        let status: 'new' | 'existing' | 'invalid' = 'new';
        let validationMsg = '';

        if (!cleanKhmer) {
          status = 'invalid';
          validationMsg = 'ខ្វះឈ្មោះសិស្ស';
        } else if (matchedUser) {
          status = 'existing';
          validationMsg = `មានគណនីរួចហើយ (${matchedUser.username})`;
        } else {
          status = 'new';
          validationMsg = matchedStudent ? 'មានក្នុងបញ្ជីសិស្សរួច (ភ្ជាប់គណនី)' : 'សិស្សថ្មី (នឹងបង្កើតទាំងគណនី និងបញ្ជី)';
        }

        rows.push({
          id: `row-${i}-${Date.now()}`,
          studentCode: cleanCode,
          nameKhmer: cleanKhmer,
          nameLatin: cleanLatin,
          gender: cleanGender,
          dob: rawDob,
          grade: rawGrade || selectedGrade,
          section: rawSection || selectedSection,
          username: finalUsername,
          password: finalPassword,
          phone: rawPhone,
          existingStudent: matchedStudent || null,
          existingUser: matchedUser || null,
          status,
          validationMessage: validationMsg,
          isSelected: status === 'new'
        });
      }

      if (rows.length === 0) {
        setParseError('មិនអាចស្វែងរកទិន្នន័យសិស្សត្រឹមត្រូវក្នុងឯកសារបានឡើយ! សូមពិនិត្យមើលទម្រង់ក្បាលតារាង។');
        return;
      }

      setParsedRows(rows);
      setActiveStep('preview');
      showToast(`បានត្រួតពិនិត្យទិន្នន័យសិស្សចំនួន ${rows.length} នាក់ ជោគជ័យ!`, 'info');
    } catch (err: any) {
      setParseError(`កំហុសក្នុងការអានឯកសារ: ${err.message || 'សូមពិនិត្យឯកសារ CSV របស់អ្នក'}`);
    }
  };

  // 5. File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileContent(text);
      parseData(text);
    };
    reader.onerror = () => {
      setParseError('បរាជ័យក្នុងការបើកអានឯកសារ!');
    };
    reader.readAsText(file, 'utf-8');
  };

  // 6. Drag & Drop Handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setFileContent(text);
        parseData(text);
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  // 7. Toggle row selection
  const handleToggleRowSelect = (rowId: string) => {
    setParsedRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, isSelected: !r.isSelected } : r))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedRows(prev =>
      prev.map(r => (r.status !== 'invalid' ? { ...r, isSelected: select } : r))
    );
  };

  // Filtered rows for preview table
  const filteredRows = useMemo(() => {
    return parsedRows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.nameKhmer.toLowerCase().includes(q) || r.nameLatin.toLowerCase().includes(q);
        const matchCode = r.studentCode.toLowerCase().includes(q);
        const matchUser = r.username.toLowerCase().includes(q);
        return matchName || matchCode || matchUser;
      }
      return true;
    });
  }, [parsedRows, statusFilter, searchQuery]);

  const selectedCount = parsedRows.filter(r => r.isSelected).length;
  const newCount = parsedRows.filter(r => r.status === 'new').length;
  const existingCount = parsedRows.filter(r => r.status === 'existing').length;
  const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;

  // 8. Execute Batch Student Account Creation
  const handleExecuteBatchCreate = async () => {
    const toProcess = parsedRows.filter(r => r.isSelected && r.status !== 'invalid');
    if (toProcess.length === 0) {
      showToast('សូមជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីបង្កើតគណនី!', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      let created = 0;
      let updated = 0;
      let enrolled = 0;

      const newUsersToAdd: AppUser[] = [];
      const updatedUsers: AppUser[] = [...appUsers];
      const createdRowsRecord: ParsedStudentAccountRow[] = [];

      for (const row of toProcess) {
        let studentRecordId = row.existingStudent?.id;

        // Auto-enroll student into school roster if not found and allowed
        if (!studentRecordId && autoEnrollNewStudents) {
          const newStudentId = `stu-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          const newStudentObj: Student = {
            id: newStudentId,
            code: row.studentCode,
            nameKhmer: row.nameKhmer,
            nameLatin: row.nameLatin || row.nameKhmer,
            gender: row.gender,
            dob: row.dob || '2015-01-01',
            pob: `ឃុំ${schoolProfile.commune || 'បាត់ដំបង'} ស្រុក${schoolProfile.district || 'បាត់ដំបង'}`,
            grade: row.grade,
            section: row.section,
            phone: row.phone || '',
            guardianPhone: row.phone || '',
            guardianName: 'អាណាព្យាបាលសិស្ស',
            guardianRelationship: 'អាណាព្យាបាល',
            guardianOccupation: 'កសិករ/អាជីវករ',
            status: 'active',
            admissionDate: new Date().toISOString().split('T')[0],
            address: `ឃុំ${schoolProfile.commune || ''} ស្រុក${schoolProfile.district || ''}`,
            livingCondition: 'ទូទៅ',
            academicYear: schoolProfile.academicYear,
            health: {
              heightCm: 125,
              weightKg: 26,
              bmi: 16.6,
              bloodType: 'O',
              nutritionStatus: 'normal',
              vaccinated: true,
              lastCheckedDate: new Date().toISOString().split('T')[0]
            },
            attendance: {
              present: 0,
              absentWithPermission: 0,
              absentWithoutPermission: 0,
              totalDays: 0
            }
          };
          addStudent(newStudentObj);
          studentRecordId = newStudentId;
          enrolled++;
        }

        // Determine password
        let assignedPassword = row.password;
        if (passwordMode === 'student_code' || !assignedPassword) {
          assignedPassword = row.studentCode;
        } else if (passwordMode === 'common_password') {
          assignedPassword = commonPassword || '12345678';
        }

        // Check if user already exists and overwrite requested
        if (row.existingUser) {
          if (overwriteExistingPasswords) {
            const idx = updatedUsers.findIndex(u => u.id === row.existingUser!.id);
            if (idx !== -1) {
              updatedUsers[idx] = {
                ...updatedUsers[idx],
                password: assignedPassword,
                forcePasswordChange: forcePasswordChange,
                passwordUpdatedAt: new Date().toISOString()
              };
              updated++;
              createdRowsRecord.push({
                ...row,
                password: assignedPassword
              });
            }
          }
          continue;
        }

        // Create new AppUser
        const cleanUser = row.username || row.studentCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanEmail = `${cleanUser}@student.moeys.gov.kh`;
        const newUserId = `usr-stu-${studentRecordId || Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

        const newUser: AppUser = {
          id: newUserId,
          username: cleanUser,
          email: cleanEmail,
          password: assignedPassword,
          nameKhmer: row.nameKhmer,
          nameLatin: row.nameLatin || row.nameKhmer,
          role: 'student',
          studentId: studentRecordId,
          studentCode: row.studentCode,
          assignedGrade: row.grade,
          assignedSection: row.section,
          phone: row.phone || '',
          createdBy: currentUser?.id || 'admin',
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active',
          forcePasswordChange: forcePasswordChange,
          passwordUpdatedAt: new Date().toISOString()
        };

        newUsersToAdd.push(newUser);
        created++;
        createdRowsRecord.push({
          ...row,
          username: cleanUser,
          password: assignedPassword
        });
      }

      // Commit users to context
      if (newUsersToAdd.length > 0) {
        setAppUsers(prev => [...newUsersToAdd, ...prev]);
      } else if (updated > 0) {
        setAppUsers(updatedUsers);
      }

      // Security Audit Trail
      addAccountAuditLog({
        eventType: 'create',
        targetUserId: `batch-class-${selectedGrade}-${selectedSection}`,
        targetUserName: `ថ្នាក់ទី ${selectedGrade} «${selectedSection}» (${created} គណនី)`,
        targetUserRole: 'student',
        actor: {
          id: currentUser?.id || 'admin',
          nameKhmer: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
          email: currentUser?.email || 'admin@moeys.gov.kh',
          role: currentUser?.role || 'secretary'
        },
        reason: 'បង្កើតគណនីសិស្សម្តងមួយថ្នាក់ តាមការអាប់ឡូតឯកសារគំរូ CSV',
        details: `បានបង្កើតគណនីសិស្សថ្មី ${created} នាក់ និងធ្វើបច្ចុប្បន្នភាព ${updated} នាក់ សម្រាប់ថ្នាក់ទី ${selectedGrade} «${selectedSection}»`
      });

      setCreatedSummary({ created, updated, enrolled });
      setLastCreatedAccounts(createdRowsRecord);
      setActiveStep('success');
      showToast(`បានបង្កើតគណនីសិស្សចំនួន ${created} នាក់ ក្នុងថ្នាក់ទី ${selectedGrade} «${selectedSection}» ដោយជោគជ័យ!`, 'success');
    } catch (err: any) {
      console.error('Batch student account creation failed:', err);
      showToast(`បរាជ័យក្នុងការបង្កើតគណនី: ${err.message || 'សូមព្យាយាមម្តងទៀត'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 9. Download Created Accounts Credentials (CSV)
  const handleDownloadCredentialsCsv = () => {
    if (lastCreatedAccounts.length === 0) return;

    const header = 'ល.រ,អត្តលេខសិស្ស,ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ,ថ្នាក់ទី,បន្ទប់,ឈ្មោះចូល (Username),ពាក្យសម្ងាត់ (Password),អ៊ីមែលសិស្ស\n';
    const rows = lastCreatedAccounts.map((r, idx) => {
      const email = `${r.username}@student.moeys.gov.kh`;
      return `${idx + 1},${r.studentCode},${r.nameKhmer},${r.nameLatin || ''},${r.gender},${r.grade},${r.section},${r.username},${r.password},${email}`;
    }).join('\n');

    const csvContent = '\uFEFF' + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Student_Logins_Grade_${selectedGrade}_Section_${selectedSection}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('បានទាញយកតារាងឈ្មោះចូល និងពាក្យសម្ងាត់ជា CSV រួចរាល់!', 'success');
  };

  // 10. Generate Printable Student Login Slips with QR Codes
  const handlePrintLoginSlips = async () => {
    setIsGeneratingPrintSlips(true);
    try {
      // Pre-generate QR codes for fast login
      const qrMap: Record<string, string> = {};
      for (const item of lastCreatedAccounts) {
        const qrPayload = JSON.stringify({
          app: 'phnom_pom_primary',
          type: 'student_login',
          code: item.studentCode,
          user: item.username,
          pass: item.password
        });
        const dataUrl = await QRCode.toDataURL(qrPayload, {
          width: 120,
          margin: 1,
          color: { dark: '#1e1b4b', light: '#ffffff' }
        });
        qrMap[item.id] = dataUrl;
      }
      setQrCodeDataUrls(qrMap);

      // Trigger print after state render
      setTimeout(() => {
        window.print();
        setIsGeneratingPrintSlips(false);
      }, 500);
    } catch (e) {
      console.error('Print slips error:', e);
      setIsGeneratingPrintSlips(false);
      showToast('បរាជ័យក្នុងការរៀបចំសន្លឹកបោះពុម្ព', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>បង្កើតគណនីសិស្សម្តង១ថ្នាក់ (Batch Class Accounts)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-purple-950">
                  CSV / Excel
                </span>
              </h3>
              <p className="text-purple-200 text-xs mt-0.5">
                ដំណើរការបង្កើតគណនីចូលប្រើប្រាស់សម្រាប់សិស្សម្តងមួយថ្នាក់ ដោយអាប់ឡូតឯកសារពីគំរូ CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-purple-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveStep('upload')}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                activeStep === 'upload' ? 'text-purple-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'upload' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>ជ្រើសរើសថ្នាក់ & អាប់ឡូតគំរូ</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

            <button
              type="button"
              disabled={parsedRows.length === 0}
              onClick={() => setActiveStep('preview')}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                activeStep === 'preview' ? 'text-purple-800' : 'text-slate-500 hover:text-slate-800 disabled:opacity-40'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'preview' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>ផ្ទៀងផ្ទាត់ & កំណត់ពាក្យសម្ងាត់ ({parsedRows.length})</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

            <div className={`flex items-center gap-1.5 font-bold ${
              activeStep === 'success' ? 'text-emerald-700' : 'text-slate-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span>បញ្ចប់ & បោះពុម្ពកាតគណនី</span>
            </div>
          </div>

          {/* Quick Target Class Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-bold text-xs">
            <span>ថ្នាក់គោលដៅ៖</span>
            <span className="text-purple-950 font-extrabold">ថ្នាក់ទី {selectedGrade} «{selectedSection}»</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CLASS SELECTION & TEMPLATE DOWNLOAD & UPLOAD */}
          {activeStep === 'upload' && (
            <div className="space-y-6">
              {/* Class Selector Card */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-700" />
                      <span>ជ្រើសរើសកម្រិតថ្នាក់ និងបន្ទប់សិក្សាដែលត្រូវបង្កើតគណនី (Target Class)</span>
                    </label>
                    <p className="text-slate-600 text-xs">
                      ជ្រើសរើសថ្នាក់ដែលអ្នកចង់ទាញយកឯកសារគំរូ ឬអាប់ឡូតគណនីសិស្សចូល
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">ថ្នាក់ទី</span>
                      <select
                        value={selectedGrade}
                        disabled={isTeacher && !!currentUser?.assignedGrade}
                        onChange={e => setSelectedGrade(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-2xs"
                      >
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>
                            ថ្នាក់ទី {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">បន្ទប់សិក្សា</span>
                      <select
                        value={selectedSection}
                        disabled={isTeacher && !!currentUser?.assignedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        className="px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600 focus:outline-none shadow-2xs"
                      >
                        {['ក', 'ខ', 'គ', 'ឃ', 'ង'].map(sec => (
                          <option key={sec} value={sec}>
                            បន្ទប់ {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Class Status Live Snapshot */}
                <div className="mt-4 pt-4 border-t border-purple-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between">
                    <span className="text-slate-600">សិស្សក្នុងថ្នាក់នេះ (បញ្ជី)៖</span>
                    <span className="font-bold text-purple-950">{classStudentsInDb.length} នាក់</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-emerald-700">មានគណនីរួចហើយ៖</span>
                    <span className="font-bold text-emerald-800">{classStudentsWithAccounts.length} នាក់</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
                    <span className="text-amber-700">ខ្វះគណនីចូលប្រើ៖</span>
                    <span className="font-bold text-amber-800">{classStudentsMissingAccounts.length} នាក់</span>
                  </div>
                </div>
              </div>

              {/* Template Download Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>ជំហានទី ១៖ ទាញយកឯកសារគំរូ CSV (Download Template)</span>
                    </h4>
                    <p className="text-slate-600 text-xs mt-0.5">
                      ទាញយកឯកសារគំរូដែលមានទម្រង់ក្បាលតារាងត្រឹមត្រូវ រួចបើកក្នុង Microsoft Excel ឬ Google Sheets
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadBlankTemplate}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">ទាញយកឯកសារគំរូទទេ (Blank Template)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        គំរូក្បាលតារាងស្តង់ដារ MoEYS សម្រាប់ថ្នាក់ទី {selectedGrade} «{selectedSection}»
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadClassRosterTemplate}
                    className="p-3.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                        <span>ទាញយកគំរូស្រង់ឈ្មោះសិស្សក្នុងថ្នាក់ស្រាប់ ({classStudentsInDb.length} នាក់)</span>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        មានស្រាប់ឈ្មោះ អត្តលេខ ឈ្មោះចូល និងពាក្យសម្ងាត់លំនាំដើមរបស់សិស្សក្នុងថ្នាក់ស្រេច
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* File Upload / Paste Area */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-700" />
                  <span>ជំហានទី ២៖ អាប់ឡូតឯកសារ CSV ឬបិទភ្ជាប់ទិន្នន័យ (Upload File / Paste Data)</span>
                </h4>

                {/* Drag and drop zone */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-950 text-xs sm:text-sm">
                      {fileName ? `បានជ្រើសរើស៖ ${fileName}` : 'ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ CSV ឬទម្លាក់ឯកសារទីនេះ'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      គាំទ្រប្រភេទឯកសារ .CSV, .TXT, .TSV (UTF-8 Encoding)
                    </p>
                  </div>
                </div>

                {/* Raw text area toggle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    ឬចម្លងទិន្នន័យពី Excel (Copy & Paste Text) ដាក់ក្នុងប្រអប់ខាងក្រោម៖
                  </label>
                  <textarea
                    rows={4}
                    value={fileContent}
                    onChange={e => setFileContent(e.target.value)}
                    placeholder="អត្តលេខសិស្ស,ឈ្មោះខ្មែរ,ឈ្មោះឡាតាំង,ភេទ,ថ្ងៃកំណើត,ថ្នាក់ទី,បន្ទប់,ឈ្មោះចូល,ពាក្យសម្ងាត់&#10;STU-2026-001,សាន់ វណ្ណា,SANN VANNA,M,2015-04-12,5,ក,stu_5a_001,STU-2026-001"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                {/* Error Banner if any */}
                {parseError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{parseError}</span>
                  </div>
                )}

                {/* Action button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => parseData(fileContent)}
                    disabled={!fileContent.trim()}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>ត្រួតពិនិត្យ និងបន្តទៅផ្ទៀងផ្ទាត់ (Next: Preview)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & CUSTOMIZE ACCOUNTS */}
          {activeStep === 'preview' && (
            <div className="space-y-5">
              {/* Account Generation Rules & Settings Bar */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-200/80 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-purple-700" />
                      <span>គោលការណ៍កំណត់ពាក្យសម្ងាត់ (Password Generation Policy)</span>
                    </h4>
                    <p className="text-slate-600 text-[11px]">
                      ជ្រើសរើសរបៀបកំណត់ពាក្យសម្ងាត់សម្រាប់សិស្សក្នុងថ្នាក់ទី {selectedGrade} «{selectedSection}»
                    </p>
                  </div>

                  {/* Password Mode Radios */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 rounded-xl cursor-pointer font-bold text-slate-700 hover:bg-purple-50">
                      <input
                        type="radio"
                        name="pwdMode"
                        checked={passwordMode === 'from_file_or_code'}
                        onChange={() => setPasswordMode('from_file_or_code')}
                        className="text-purple-700"
                      />
                      <span>តាមហ្វាល់ CSV / អត្តលេខ</span>
                    </label>

                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 rounded-xl cursor-pointer font-bold text-slate-700 hover:bg-purple-50">
                      <input
                        type="radio"
                        name="pwdMode"
                        checked={passwordMode === 'student_code'}
                        onChange={() => setPasswordMode('student_code')}
                        className="text-purple-700"
                      />
                      <span>ស្មើនឹងអត្តលេខសិស្ស</span>
                    </label>

                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 rounded-xl cursor-pointer font-bold text-slate-700 hover:bg-purple-50">
                      <input
                        type="radio"
                        name="pwdMode"
                        checked={passwordMode === 'common_password'}
                        onChange={() => setPasswordMode('common_password')}
                        className="text-purple-700"
                      />
                      <span>ពាក្យសម្ងាត់រួម</span>
                    </label>
                  </div>
                </div>

                {/* Common Password Input if selected */}
                {passwordMode === 'common_password' && (
                  <div className="pt-2 border-t border-purple-200/60 flex items-center gap-3">
                    <span className="text-xs font-bold text-purple-900">បញ្ចូលពាក្យសម្ងាត់រួម៖</span>
                    <input
                      type="text"
                      value={commonPassword}
                      onChange={e => setCommonPassword(e.target.value)}
                      placeholder="12345678"
                      className="px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-950 focus:ring-2 focus:ring-purple-600 focus:outline-none w-48"
                    />
                  </div>
                )}

                {/* Checkbox Options */}
                <div className="pt-2 border-t border-purple-200/60 flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={autoEnrollNewStudents}
                      onChange={e => setAutoEnrollNewStudents(e.target.checked)}
                      className="rounded text-purple-700"
                    />
                    <span>បង្កើតទម្រង់សិស្សថ្មីចូលបញ្ជីសាលាស្វ័យប្រវត្តិ ប្រសិនបើសិស្សមិនទាន់មានក្នុងបញ្ជី (Auto-Enroll)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={forcePasswordChange}
                      onChange={e => setForcePasswordChange(e.target.checked)}
                      className="rounded text-purple-700"
                    />
                    <span>តម្រូវឱ្យសិស្សផ្លាស់ប្តូរពាក្យសម្ងាត់ពេលចូលប្រើលើកដំបូង (Force Password Change)</span>
                  </label>

                  {existingCount > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer text-amber-800 font-bold">
                      <input
                        type="checkbox"
                        checked={overwriteExistingPasswords}
                        onChange={e => setOverwriteExistingPasswords(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់ឡើងវិញសម្រាប់គណនីដែលមានស្រាប់ ({existingCount} នាក់)</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Status Counters & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                {/* Status Badges Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'all' ? 'bg-purple-700 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ទាំងអស់ ({parsedRows.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('new')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'new' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>គណនីថ្មី ({newCount})</span>
                  </button>

                  {existingCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('existing')}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'existing' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>មានគណនីរួច ({existingCount})</span>
                    </button>
                  )}

                  {invalidCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('invalid')}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        statusFilter === 'invalid' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>មិនត្រឹមត្រូវ ({invalidCount})</span>
                    </button>
                  )}
                </div>

                {/* Search in preview */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកក្នុងតារាង..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCount === parsedRows.filter(r => r.status !== 'invalid').length && selectedCount > 0}
                        onChange={e => handleSelectAll(e.target.checked)}
                        className="rounded text-purple-700"
                      />
                      <span>ជ្រើសរើសទាំងអស់</span>
                    </label>
                    <span className="text-slate-400">|</span>
                    <span className="text-purple-800 font-bold">បានជ្រើសរើស៖ {selectedCount} នាក់</span>
                  </div>

                  <span className="text-slate-500 text-[11px]">
                    ថ្នាក់ទី {selectedGrade} «{selectedSection}»
                  </span>
                </div>

                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/90 text-slate-700 text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">អត្តលេខសិស្ស</th>
                        <th className="p-3">ឈ្មោះខ្មែរ</th>
                        <th className="p-3">ឈ្មោះឡាតាំង</th>
                        <th className="p-3 text-center">ភេទ</th>
                        <th className="p-3">ឈ្មោះចូល (Username)</th>
                        <th className="p-3">ពាក្យសម្ងាត់</th>
                        <th className="p-3">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredRows.map((row, idx) => {
                        const isPasswordVisible = showPasswordMap[row.id] || false;
                        const rowPassword = passwordMode === 'student_code'
                          ? row.studentCode
                          : passwordMode === 'common_password'
                          ? (commonPassword || '12345678')
                          : row.password;

                        return (
                          <tr
                            key={row.id}
                            className={`hover:bg-purple-50/30 transition-colors ${
                              !row.isSelected ? 'opacity-60 bg-slate-50/50' : ''
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                disabled={row.status === 'invalid'}
                                checked={row.isSelected}
                                onChange={() => handleToggleRowSelect(row.id)}
                                className="rounded text-purple-700 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {row.studentCode}
                            </td>
                            <td className="p-3 font-bold text-purple-950">
                              {row.nameKhmer}
                            </td>
                            <td className="p-3 text-slate-600">
                              {row.nameLatin || '-'}
                            </td>
                            <td className="p-3 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                row.gender === 'F' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {row.gender === 'F' ? 'ស្រី' : 'ប្រុស'}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-purple-800">
                              {row.username}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg w-max">
                                <span>{isPasswordVisible ? rowPassword : '••••••••'}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPasswordMap(prev => ({ ...prev, [row.id]: !prev[row.id] }))
                                  }
                                  className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                                >
                                  {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-3">
                              {row.status === 'new' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>គណនីថ្មី</span>
                                </span>
                              )}
                              {row.status === 'existing' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Info className="w-3 h-3" />
                                  <span>មានរួចហើយ</span>
                                </span>
                              )}
                              {row.status === 'invalid' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{row.validationMessage || 'មិនត្រឹមត្រូវ'}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('upload')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ← ថយក្រោយ (ជ្រើសរើសឯកសារផ្សេង)
                </button>

                <button
                  type="button"
                  onClick={handleExecuteBatchCreate}
                  disabled={selectedCount === 0 || isProcessing}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isProcessing
                      ? 'កំពុងដំណើរការបង្កើតគណនី...'
                      : `យល់ព្រម បង្កើតគណនីសិស្ស (${selectedCount} នាក់)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & CREDENTIAL DISTRIBUTION */}
          {activeStep === 'success' && createdSummary && (
            <div className="space-y-6 text-center py-4">
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-lg font-bold text-slate-900">
                  បានបង្កើតគណនីសិស្សដោយជោគជ័យ!
                </h4>
                <p className="text-slate-600 text-xs">
                  គណនីសិស្សទាំងអស់សម្រាប់ <strong>ថ្នាក់ទី {selectedGrade} «{selectedSection}»</strong> ត្រូវបានបញ្ចូលទៅក្នុងប្រព័ន្ធ និងត្រៀមរួចជាស្រេចសម្រាប់សិស្សចូលប្រើប្រាស់។
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                  <p className="text-[11px] font-bold text-emerald-700">គណនីថ្មីបានបង្កើត</p>
                  <p className="text-xl font-extrabold text-emerald-900 mt-1">{createdSummary.created} នាក់</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
                  <p className="text-[11px] font-bold text-blue-700">ធ្វើបច្ចុប្បន្នភាព</p>
                  <p className="text-xl font-extrabold text-blue-900 mt-1">{createdSummary.updated} នាក់</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl">
                  <p className="text-[11px] font-bold text-purple-700">សិស្សថ្មីចុះឈ្មោះ</p>
                  <p className="text-xl font-extrabold text-purple-900 mt-1">{createdSummary.enrolled} នាក់</p>
                </div>
              </div>

              {/* Actions: Download CSV / Print Slips */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl max-w-xl mx-auto space-y-4">
                <h5 className="font-bold text-slate-800 text-xs">
                  ចែករំលែក ឬបោះពុម្ពព័ត៌មានគណនីជូនសិស្ស & អាណាព្យាបាល៖
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadCredentialsCsv}
                    className="p-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-950 text-xs">ទាញយកតារាង CSV</p>
                      <p className="text-[10.5px] text-slate-500">ឈ្មោះចូល និងពាក្យសម្ងាត់</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintLoginSlips}
                    disabled={isGeneratingPrintSlips}
                    className="p-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer shadow-md"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-amber-300">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">
                        {isGeneratingPrintSlips ? 'កំពុងរៀបចំ...' : 'បោះពុម្ពប័ណ្ណគណនីសិស្ស'}
                      </p>
                      <p className="text-[10.5px] text-purple-200">សន្លឹកកាតមាន QR Code Login</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  បិទផ្ទាំង (រួចរាល់)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HIDDEN PRINTABLE STUDENT LOGIN CARDS (A4 Layout ready for cutting) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-6 text-black">
        <div className="text-center pb-4 mb-4 border-b border-black/30">
          <h2 className="font-bold text-lg">{schoolProfile.nameKhmer || 'សាលាបឋមសិក្សាភ្នំព្រឹក'}</h2>
          <h3 className="font-bold text-sm">
            សន្លឹកព័ត៌មានគណនីចូលប្រើប្រាស់សិស្ស — ថ្នាក់ទី {selectedGrade} «{selectedSection}»
          </h3>
          <p className="text-xs text-gray-600">ឆ្នាំសិក្សា {schoolProfile.academicYear}</p>
        </div>

        {/* Grid of Student Cards (4 per page) */}
        <div className="grid grid-cols-2 gap-4">
          {lastCreatedAccounts.map((item, idx) => (
            <div
              key={item.id}
              className="border-2 border-dashed border-gray-400 p-4 rounded-xl flex items-start justify-between gap-3 page-break-inside-avoid"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-bold text-xs text-purple-900">{schoolProfile.nameKhmer}</span>
                  <span className="font-bold text-xs bg-gray-200 px-1.5 py-0.5 rounded">ថ្នាក់ទី {item.grade} «{item.section}»</span>
                </div>
                <p className="font-bold text-sm text-black mt-1">{item.nameKhmer}</p>
                <p className="text-[11px] text-gray-700 font-mono">អត្តលេខ៖ {item.studentCode}</p>
                <div className="bg-gray-100 p-2 rounded border mt-2 space-y-0.5 font-mono text-xs">
                  <p><strong>ឈ្មោះចូល (User):</strong> {item.username}</p>
                  <p><strong>ពាក្យសម្ងាត់ (Pass):</strong> {item.password}</p>
                </div>
                <p className="text-[9px] text-gray-500 mt-1">គេហទំព័រសាលា ៖ ស្កេន QR Code ដើម្បីចូលប្រើ</p>
              </div>

              {qrCodeDataUrls[item.id] && (
                <div className="text-center shrink-0">
                  <img
                    src={qrCodeDataUrls[item.id]}
                    alt="QR Login"
                    className="w-20 h-20 border rounded"
                  />
                  <span className="text-[9px] text-gray-600 block mt-0.5">QR ចូលប្រើ</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
