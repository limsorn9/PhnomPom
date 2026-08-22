import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { AICurriculumPlan, CurriculumWeekItem, StudentLevel } from './types';
import { generateAICurriculumPlan, saveAICreation } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  initialCurriculum?: AICurriculumPlan;
  onSaved?: () => void;
}

export const CurriculumGenerator: React.FC<Props> = ({ initialCurriculum, onSaved }) => {
  const { showToast } = useSchool();

  // Form Parameters
  const [subject, setSubject] = useState<string>('ភាសាខ្មែរ');
  const [grade, setGrade] = useState<number>(5);
  const [semester, setSemester] = useState<'semester_1' | 'semester_2' | 'full_year'>('semester_1');
  const [academicYear, setAcademicYear] = useState<string>('2024-2025');
  const [totalWeeks, setTotalWeeks] = useState<number>(15);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(6);
  const [topicsGuide, setTopicsGuide] = useState<string>('ផ្តោតលើអំណាន វេយ្យាករណ៍ ការតែងសេចក្តី និងសីលធម៌');
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('average');

  // State
  const [curriculum, setCurriculum] = useState<AICurriculumPlan | null>(initialCurriculum || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);

  const subjectsList = [
    'ភាសាខ្មែរ',
    'គណិតវិទ្យា',
    'វិទ្យាសាស្ត្រ',
    'សិក្សាសង្គម',
    'ភាសាអង់គ្លេស',
    'សិល្បៈ និងតន្ត្រី',
    'អប់រំកាយ និងកីឡា',
    'បំណិនជីវិត'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAICurriculumPlan({
        subject,
        grade,
        semester,
        academicYear,
        totalWeeks,
        hoursPerWeek,
        topicsGuide,
        studentLevel
      });
      setCurriculum(generated);
      showToast('✨ បានបង្កើតបំណែងចែកកម្មវិធីសិក្សាដោយ AI ជោគជ័យ!');

      // Save to storage
      saveAICreation({
        id: generated.id,
        type: 'curriculum',
        typeNameKh: 'បំណែងចែកកម្មវិធីសិក្សា (Curriculum)',
        title: generated.title,
        subject: generated.subject,
        grade: generated.grade,
        createdAt: generated.createdAt,
        updatedAt: generated.updatedAt,
        payload: generated
      });
      if (onSaved) onSaved();
    } catch (err) {
      showToast('⚠️ មិនអាចបង្កើតកម្មវិធីសិក្សាបាននៅពេលនេះទេ។');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateWeek = (weekId: string, field: keyof CurriculumWeekItem, value: any) => {
    if (!curriculum) return;
    const updatedWeeks = curriculum.weeks.map(w => {
      if (w.id === weekId) {
        return { ...w, [field]: value };
      }
      return w;
    });
    setCurriculum({ ...curriculum, weeks: updatedWeeks });
  };

  const handleAddWeek = () => {
    if (!curriculum) return;
    const nextWeekNum = curriculum.weeks.length + 1;
    const newWeek: CurriculumWeekItem = {
      id: `w-${Date.now()}`,
      weekNumber: nextWeekNum,
      lessonNumber: Math.floor(nextWeekNum / 2) + 1,
      lessonTitle: `មេរៀនថ្មីសប្តាហ៍ទី ${nextWeekNum}`,
      topic: 'ប្រធានបទថ្មី',
      teachingHours: curriculum.hoursPerWeek,
      learningObjectives: 'សិស្សអាចយល់ដឹងពីទ្រឹស្តី និងដោះស្រាយលំហាត់',
      keyActivities: 'ពន្យល់ទ្រឹស្តី និងអនុវត្តជាក្រុម',
      assessmentMethod: 'សង្កេត និងសំណួរផ្ទាល់មាត់',
      materials: `សៀវភៅពុម្ព ${curriculum.subject} ថ្នាក់ទី${curriculum.grade}`
    };
    setCurriculum({
      ...curriculum,
      totalWeeks: nextWeekNum,
      weeks: [...curriculum.weeks, newWeek]
    });
    showToast(`បានបន្ថែមសប្តាហ៍ទី ${nextWeekNum} ជោគជ័យ!`);
  };

  const handleDeleteWeek = (weekId: string) => {
    if (!curriculum) return;
    const updated = curriculum.weeks.filter(w => w.id !== weekId);
    // re-index
    const reindexed = updated.map((w, idx) => ({
      ...w,
      weekNumber: idx + 1
    }));
    setCurriculum({
      ...curriculum,
      totalWeeks: reindexed.length,
      weeks: reindexed
    });
    showToast('បានលុបសប្តាហ៍ជោគជ័យ!');
  };

  const handleExportCSV = () => {
    if (!curriculum) return;
    const headers = ['សប្តាហ៍', 'មេរៀនទី', 'ចំណងជើងមេរៀន', 'ប្រធានបទ', 'ម៉ោងបង្រៀន', 'គោលបំណង', 'សកម្មភាព', 'ការវាយតម្លៃ', 'សម្ភារៈ'];
    const rows = curriculum.weeks.map(w => [
      `សប្តាហ៍ទី ${w.weekNumber}`,
      w.lessonNumber,
      `"${w.lessonTitle.replace(/"/g, '""')}"`,
      `"${w.topic.replace(/"/g, '""')}"`,
      w.teachingHours,
      `"${w.learningObjectives.replace(/"/g, '""')}"`,
      `"${w.keyActivities.replace(/"/g, '""')}"`,
      `"${w.assessmentMethod.replace(/"/g, '""')}"`,
      `"${w.materials.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Curriculum_${curriculum.subject}_Grade${curriculum.grade}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 បានទាញយកឯកសារ CSV ជោគជ័យ!');
  };

  return (
    <div className="space-y-6">
      {/* Parameter Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-moul text-blue-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>បង្កើតបំណែងចែកកម្មវិធីសិក្សាប្រចាំឆមាស/ឆ្នាំ (Curriculum Breakdown)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              AI នឹងរៀបចំតារាងបំណែងចែកម៉ោងបង្រៀន សប្តាហ៍នីមួយៗ គោលបំណង សកម្មភាព និងការវាយតម្លៃស្របតាមស្តង់ដារក្រសួងអប់រំ។
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              មុខវិជ្ជា <span className="text-rose-500">*</span>
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            >
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              កម្រិតថ្នាក់ <span className="text-rose-500">*</span>
            </label>
            <select
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>ថ្នាក់ទី {g}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ឆមាស / រយៈពេល <span className="text-rose-500">*</span>
            </label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            >
              <option value="semester_1">ឆមាសទី ១ (១៥ សប្តាហ៍)</option>
              <option value="semester_2">ឆមាសទី ២ (១៥ សប្តាហ៍)</option>
              <option value="full_year">ពេញមួយឆ្នាំសិក្សា (៣០ សប្តាហ៍)</option>
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ឆ្នាំសិក្សា
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>

          {/* Total Weeks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ចំនួនសប្តាហ៍សរុប
            </label>
            <input
              type="number"
              min={1}
              max={40}
              value={totalWeeks}
              onChange={e => setTotalWeeks(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>

          {/* Hours per week */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ម៉ោងបង្រៀនក្នុង ១ សប្តាហ៍ (ម៉ោង)
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={hoursPerWeek}
              onChange={e => setHoursPerWeek(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>

          {/* Topics guide */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ការណែនាំបន្ថែម ឬជំពូកដែលត្រូវផ្តោត
            </label>
            <input
              type="text"
              value={topicsGuide}
              onChange={e => setTopicsGuide(e.target.value)}
              placeholder="ឧ. ផ្តោតលើមេរៀនធរណីមាត្រ និងប្រភាគ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? '🤖 AI កំពុងរៀបចំកម្មវិធីសិក្សា...' : '✨ បង្កើតបំណែងចែកកម្មវិធីសិក្សាដោយ AI'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CURRICULUM BREAKDOWN TABLE VIEW */}
      {/* ========================================================================= */}
      {curriculum && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Header Info & Actions */}
          <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs">
                  {curriculum.subject}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-900 font-bold rounded-lg text-xs">
                  ថ្នាក់ទី {curriculum.grade}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs">
                  {curriculum.semester === 'semester_1' ? 'ឆមាសទី ១' : curriculum.semester === 'semester_2' ? 'ឆមាសទី ២' : 'ពេញមួយឆ្នាំ'}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs">
                  {curriculum.totalWeeks} សប្តាហ៍ ({curriculum.totalWeeks * curriculum.hoursPerWeek} ម៉ោងសរុប)
                </span>
              </div>
              <h2 className="text-xl font-bold font-moul text-blue-950">
                {curriculum.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAddWeek}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែមសប្តាហ៍</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition-all border border-blue-200"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ទាញយក Excel (CSV)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ព</span>
              </button>
            </div>
          </div>

          {/* Curriculum Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3 w-16 text-center">សប្តាហ៍</th>
                  <th className="p-3 w-28">មេរៀន / ម៉ោង</th>
                  <th className="p-3 min-w-[180px]">ប្រធានបទ & ខ្លឹមសារ</th>
                  <th className="p-3 min-w-[200px]">គោលបំណងសិក្សា</th>
                  <th className="p-3 min-w-[180px]">សកម្មភាពបង្រៀន & រៀន</th>
                  <th className="p-3 min-w-[140px]">វិធីសាស្ត្រវាយតម្លៃ</th>
                  <th className="p-3 w-16 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {curriculum.weeks.map((week) => (
                  <tr key={week.id} className="hover:bg-blue-50/30 transition-all">
                    <td className="p-3 text-center font-bold text-blue-900 bg-slate-50/50">
                      សប្តាហ៍ {week.weekNumber}
                    </td>

                    <td className="p-3 font-medium">
                      <div className="font-bold text-slate-800">{week.lessonTitle}</div>
                      <div className="text-[11px] text-slate-500">⏱️ {week.teachingHours} ម៉ោង</div>
                    </td>

                    <td className="p-3">
                      {editingWeekId === week.id ? (
                        <input
                          type="text"
                          value={week.topic}
                          onChange={e => handleUpdateWeek(week.id, 'topic', e.target.value)}
                          className="w-full p-1.5 border rounded-lg text-xs"
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{week.topic}</span>
                      )}
                    </td>

                    <td className="p-3">
                      {editingWeekId === week.id ? (
                        <textarea
                          rows={2}
                          value={week.learningObjectives}
                          onChange={e => handleUpdateWeek(week.id, 'learningObjectives', e.target.value)}
                          className="w-full p-1.5 border rounded-lg text-xs"
                        />
                      ) : (
                        <span className="text-slate-600">{week.learningObjectives}</span>
                      )}
                    </td>

                    <td className="p-3">
                      {editingWeekId === week.id ? (
                        <textarea
                          rows={2}
                          value={week.keyActivities}
                          onChange={e => handleUpdateWeek(week.id, 'keyActivities', e.target.value)}
                          className="w-full p-1.5 border rounded-lg text-xs"
                        />
                      ) : (
                        <span className="text-slate-600">{week.keyActivities}</span>
                      )}
                    </td>

                    <td className="p-3">
                      {editingWeekId === week.id ? (
                        <input
                          type="text"
                          value={week.assessmentMethod}
                          onChange={e => handleUpdateWeek(week.id, 'assessmentMethod', e.target.value)}
                          className="w-full p-1.5 border rounded-lg text-xs"
                        />
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-700 font-medium inline-block">
                          {week.assessmentMethod}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingWeekId(editingWeekId === week.id ? null : week.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            editingWeekId === week.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-500'
                          }`}
                          title={editingWeekId === week.id ? 'រក្សាទុក' : 'កែប្រែ'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWeek(week.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-all"
                          title="លុប"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
