import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Layers, 
  FileText, 
  Award, 
  CheckSquare, 
  Eye, 
  EyeOff,
  BarChart3
} from 'lucide-react';
import { AITestPaper, TestQuestionItem, QuestionType, BloomLevel } from './types';
import { generateAITestPaper, saveAICreation } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  initialTestPaper?: AITestPaper;
  onSaved?: () => void;
}

export const TestQuestionGenerator: React.FC<Props> = ({ initialTestPaper, onSaved }) => {
  const { showToast } = useSchool();

  // Form Configuration
  const [subject, setSubject] = useState<string>('ភាសាខ្មែរ');
  const [grade, setGrade] = useState<number>(5);
  const [topic, setTopic] = useState<string>('អក្ខរាវិរុទ្ធ វេយ្យាករណ៍ និងការយល់ន័យអត្ថបទ');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [isStandardized, setIsStandardized] = useState<boolean>(true);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'true_false',
    'fill_blank',
    'short_answer',
    'essay'
  ]);

  // Output State
  const [testPaper, setTestPaper] = useState<AITestPaper | null>(initialTestPaper || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'paper' | 'answers' | 'blueprint'>('paper');

  const subjectsList = [
    'ភាសាខ្មែរ',
    'គណិតវិទ្យា',
    'វិទ្យាសាស្ត្រ',
    'សិក្សាសង្គម',
    'ភាសាអង់គ្លេស',
    'សិល្បៈ និងតន្ត្រី',
    'អប់រំកាយ និងកីឡា'
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAITestPaper({
        subject,
        grade,
        topic,
        questionCount,
        totalMarks,
        durationMinutes,
        difficulty,
        questionTypes: selectedTypes,
        isStandardized
      });
      setTestPaper(generated);
      showToast('✨ បានបង្កើតកម្រងតេស្ត និងវិញ្ញាសាដោយ AI ជោគជ័យ!');

      // Save to creations
      saveAICreation({
        id: generated.id,
        type: 'test',
        typeNameKh: 'តេស្តស្តង់ដារ & សំណួរ (Test Paper)',
        title: generated.title,
        subject: generated.subject,
        grade: generated.grade,
        createdAt: generated.createdAt,
        updatedAt: generated.updatedAt,
        payload: generated
      });
      if (onSaved) onSaved();
    } catch (err) {
      showToast('⚠️ មិនអាចបង្កើតវិញ្ញាសាបាននៅពេលនេះទេ។');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!testPaper) return;
    const updatedQuestions = testPaper.questions.filter(q => q.id !== qId);
    setTestPaper({
      ...testPaper,
      questions: updatedQuestions.map((q, idx) => ({ ...q, questionNumber: idx + 1 }))
    });
    showToast('បានលុបសំណួរជោគជ័យ!');
  };

  const getBloomBadge = (level: BloomLevel) => {
    switch (level) {
      case 'knowledge':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">កម្រិតចងចាំ (Knowledge)</span>;
      case 'understanding':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">កម្រិតយល់ដឹង (Comprehension)</span>;
      case 'application':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">កម្រិតអនុវត្ត (Application)</span>;
      case 'analysis':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">កម្រិតវិភាគ (Analysis)</span>;
      case 'evaluation':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold">កម្រិតវាយតម្លៃ (Evaluation)</span>;
      case 'creation':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold">កម្រិតបង្កើតថ្មី (Creation)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold font-moul text-blue-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>បង្កើតកម្រងសំណួរ & វិញ្ញាសាតេស្តស្តង់ដារ (Bloom's Taxonomy)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            រៀបចំកម្រងសំណួរចម្រុះបែបវិទ្យាសាស្ត្រអប់រំ ព្រមទាំងតារាងម៉ាទ្រីសវិញ្ញាសា (Test Blueprint) និងសន្លឹកកែចម្លើយស្វ័យប្រវត្តិ។
          </p>
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

          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ចំនួនសំណួរ (សរុប)
            </label>
            <input
              type="number"
              min={3}
              max={30}
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>

          {/* Total Marks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ពិន្ទុសរុប
            </label>
            <input
              type="number"
              min={10}
              max={100}
              value={totalMarks}
              onChange={e => setTotalMarks(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ថិរវេលាធ្វើតេស្ត (នាទី)
            </label>
            <select
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            >
              <option value={15}>១៥ នាទី (Quick Quiz)</option>
              <option value={30}>៣០ នាទី (Short Test)</option>
              <option value={45}>៤៥ នាទី (Period Test)</option>
              <option value={60}>៦០ នាទី (Monthly Exam)</option>
              <option value={90}>៩០ នាទី (Semester Exam)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              កម្រិតលំបាក
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            >
              <option value="mixed">ចម្រុះកម្រិត (ងាយ ៣០% មធ្យម ៥០% ពិបាក ២០%)</option>
              <option value="easy">កម្រិតងាយ (Easy - មូលដ្ឋានគ្រឹះ)</option>
              <option value="medium">កម្រិតមធ្យម (Medium - ស្តង់ដារ)</option>
              <option value="hard">កម្រិតលំបាក (Hard - សិស្សពូកែ)</option>
            </select>
          </div>

          {/* Topic */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ប្រធានបទ ឬខ្លឹមសារមេរៀន <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="ឧ. វិធីបូកដកប្រភាគ, សិទ្ធិកុមារ, ប្រព័ន្ធដង្ហើម..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Question Types Toggle */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 mb-2.5">
            ទម្រង់សំណួរដែលត្រូវបញ្ចូលក្នុងវិញ្ញាសា៖
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'multiple_choice' as QuestionType, label: 'ពហុជ្រើសរើស (MCQ)' },
              { type: 'true_false' as QuestionType, label: 'ត្រូវ ឬ ខុស (True/False)' },
              { type: 'fill_blank' as QuestionType, label: 'បំពេញចន្លោះ (Fill Blank)' },
              { type: 'matching' as QuestionType, label: 'ផ្គូផ្គង (Matching)' },
              { type: 'short_answer' as QuestionType, label: 'សំណួរខ្លី (Short Answer)' },
              { type: 'essay' as QuestionType, label: 'តែងសេចក្តី/សំណួរត្រិះរិះ (Essay)' },
              { type: 'problem_solving' as QuestionType, label: 'ចំណោទអនុវត្ត (Problem Solving)' },
            ].map(item => {
              const isChecked = selectedTypes.includes(item.type);
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => toggleQuestionType(item.type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? '🤖 AI កំពុងរៀបចំវិញ្ញាសា...' : '✨ បង្កើតវិញ្ញាសាតេស្តដោយ AI'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TEST PAPER RESULT VIEW */}
      {/* ========================================================================= */}
      {testPaper && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Header & Sub-Tabs */}
          <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs">
                  {testPaper.subject}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-900 font-bold rounded-lg text-xs">
                  ថ្នាក់ទី {testPaper.grade}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs">
                  ⏱️ {testPaper.durationMinutes} នាទី
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs">
                  🎯 ពិន្ទុសរុប៖ {testPaper.totalMarks} ពិន្ទុ
                </span>
              </div>
              <h2 className="text-xl font-bold font-moul text-blue-950">
                {testPaper.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('paper')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'paper' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📄 ក្រដាសវិញ្ញាសា
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'answers' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔑 សន្លឹកកែចម្លើយ & Rubrics
                </button>
                <button
                  onClick={() => setActiveTab('blueprint')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'blueprint' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📊 ម៉ាទ្រីស Bloom
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>បោះពុម្ព</span>
              </button>
            </div>
          </div>

          {/* 1. TEST PAPER VIEW */}
          {activeTab === 'paper' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold font-moul text-slate-900 block">
                  📌 ការណែនាំសម្រាប់សិស្ស (Exam Instructions)៖
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  {testPaper.instructions.map((ins, idx) => (
                    <li key={idx}>{ins}</li>
                  ))}
                </ul>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {testPaper.questions.map((q) => (
                  <div 
                    key={q.id} 
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-xl bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {q.questionNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {getBloomBadge(q.bloomLevel)}
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                              {q.marks} ពិន្ទុ
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            {q.questionText}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="លុបសំណួរ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-10">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-800">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer area for essay / fill blank in test paper */}
                    {!q.options && (
                      <div className="pl-10 pt-2">
                        <div className="w-full h-16 border-b border-dashed border-slate-300 text-[11px] text-slate-400 italic">
                          (កន្លែងសរសេរចម្លើយរបស់សិស្ស...)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ANSWERS & RUBRICS VIEW */}
          {activeTab === 'answers' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                💡 សន្លឹកកែចម្លើយស្តង់ដារ និងលក្ខណៈវិនិច្ឆ័យដាក់ពិន្ទុ (Answer Key & Grading Rubric) សម្រាប់គ្រូបង្រៀន
              </div>

              {testPaper.questions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950">សំណួរទី {q.questionNumber} ({q.marks} ពិន្ទុ)</span>
                    {getBloomBadge(q.bloomLevel)}
                  </div>

                  <p className="font-medium text-slate-700">{q.questionText}</p>

                  <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                    <span className="font-bold block mb-1">🔑 ចម្លើយត្រឹមត្រូវ៖</span>
                    {q.correctAnswer}
                  </div>

                  {q.explanation && (
                    <div className="text-slate-600 text-[11px] pt-1">
                      💡 <strong>ការពន្យល់/វិធីគណនា៖</strong> {q.explanation}
                    </div>
                  )}

                  {q.markingRubric && (
                    <div className="text-slate-500 text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                      📋 <strong>លក្ខណៈវិនិច្ឆ័យដាក់ពិន្ទុ៖</strong> {q.markingRubric}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 3. BLOOM TAXONOMY BLUEPRINT VIEW */}
          {activeTab === 'blueprint' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                📊 ម៉ាទ្រីសវិភាគវិញ្ញាសាតេស្តតាមទ្រឹស្តី Bloom's Taxonomy (Test Blueprint & Alignment)
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">កម្រិតនៃការគិត (Cognitive Level)</th>
                      <th className="p-3">ការពណ៌នា</th>
                      <th className="p-3 text-center">ចំនួនសំណួរ</th>
                      <th className="p-3 text-center">ពិន្ទុសរុប</th>
                      <th className="p-3 text-center">ភាគរយ (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {testPaper.blueprint.map((bp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-blue-900">{bp.bloomLevelKh}</td>
                        <td className="p-3 text-slate-600">{bp.description}</td>
                        <td className="p-3 text-center font-bold">{bp.questionCount} សំណួរ</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{bp.marks} ពិន្ទុ</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-[11px]">
                            {bp.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
