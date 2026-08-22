import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  Play, 
  RotateCcw, 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Share2, 
  Layers, 
  Flame, 
  Award,
  ArrowRight,
  RefreshCw,
  QrCode,
  Compass,
  Target
} from 'lucide-react';
import { AIEducationalGame, GameTemplateType, GameQuestionCard } from './types';
import { generateAIEducationalGame, saveAICreation } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';
import { StudentGameModeModal } from './StudentGameModeModal';
import { ClassroomPickerRaceArena } from './ClassroomPickerRaceArena';
import { ClassroomDuckRace } from './ClassroomDuckRace';

interface Props {
  initialGame?: AIEducationalGame;
  onSaved?: () => void;
}

export const EducationalGameGenerator: React.FC<Props> = ({ initialGame, onSaved }) => {
  const { showToast, students, updateStudent } = useSchool();

  // Top Sub-view switcher: 'duck_race' vs 'picker_race' vs 'ai_game_deck'
  const [activeSection, setActiveSection] = useState<'duck_race' | 'picker_race' | 'ai_game_deck'>('duck_race');

  // Form State for AI Question Deck Generator
  const [subject, setSubject] = useState<string>('គណិតវិទ្យា');
  const [grade, setGrade] = useState<number>(5);
  const [topic, setTopic] = useState<string>('វិធីគុណ និងវិធីចែកចំនួនធំៗ');
  const [selectedGameType, setSelectedGameType] = useState<GameTemplateType>('classroom_competition');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cardCount, setCardCount] = useState<number>(8);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(20);

  // Generated Game State
  const [game, setGame] = useState<AIEducationalGame | null>(initialGame || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Interactive Live Player State for Deck Games
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timer, setTimer] = useState<number>(20);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Student Host Session Modal
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);

  // Awarding score directly to student profile
  const handleAwardScore = (studentId: string, studentName: string, points: number) => {
    const targetStudent = students.find(s => s.id === studentId || s.nameKhmer === studentName);
    if (targetStudent) {
      updateStudent(targetStudent.id, {
        totalScore: (targetStudent.totalScore || 0) + points
      });
    }
  };

  // Game templates list (Quiz / Deck styles)
  const gameTemplates: { id: GameTemplateType; title: string; icon: string; desc: string; badge: string }[] = [
    { id: 'classroom_competition', title: 'ការប្រកួតជើងឯកក្នុងថ្នាក់', icon: '🏆', desc: 'សិស្សប្រកួតគ្នាឆ្លើយសំណួរដណ្តើមពិន្ទុ និងចំណាត់ថ្នាក់ផ្ទាល់ក្នុងថ្នាក់', badge: 'ពេញនិយមបំផុត' },
    { id: 'quiz', title: 'ល្បែងសំណួររហ័ស (Speed Quiz)', icon: '⚡', desc: 'សំណួរពហុជ្រើសរើសឆ្លើយតាមកំណត់ពេលវេលាវាស់ស្ទង់ភាពរហ័សរហួន', badge: 'ស្តង់ដារ' },
    { id: 'matching', title: 'ល្បែងផ្គូផ្គងពាក្យ & និយមន័យ', icon: '🔗', desc: 'ផ្គូផ្គងពាក្យគន្លឹះ រូបមន្ត ឬរូបភាពទៅនឹងអត្ថន័យត្រឹមត្រូវ', badge: 'យល់ដឹង' },
    { id: 'flashcards', title: 'ប័ណ្ណពាក្យឆ្លាតវៃ (Flashcards)', icon: '🃏', desc: 'បង្ហាញប័ណ្ណសំណួរ និងត្រឡប់មើលចម្លើយពង្រឹងការចងចាំ', badge: 'រំលឹកមេរៀន' },
    { id: 'true_false', title: 'សមរភូមិ ត្រូវ ឬ ខុស', icon: '⚖️', desc: 'វិភាគល្បះ ឬបាតុភូតថាតើត្រូវ ឬខុសក្នុងរយៈពេលខ្លី', badge: 'ល្បឿនលឿន' },
    { id: 'memory', title: 'ល្បែងត្រឡប់កាតចងចាំ (Memory Flip)', icon: '🧠', desc: 'ស្វែងរកគូកាតដែលដូចគ្នា ឬត្រូវគ្នាក្នុងចំណោមផ្ទាំងកាត', badge: 'ខួរក្បាល' },
    { id: 'word_puzzle', title: 'ល្បែងផ្គុំពាក្យ និងប្រយោគ', icon: '🧩', desc: 'រៀបចំអក្សរ ឬពាក្យដែលរញ៉េរញ៉ៃឱ្យក្លាយជាពាក្យពេញលេញ', badge: 'ភាសា' },
    { id: 'fill_blank', title: 'ល្បែងប្រណាំងបំពេញចន្លោះ', icon: '✏️', desc: 'បំពេញពាក្យ ឬលេខដែលបាត់ទៅក្នុងប្រយោគឱ្យបានលឿន', badge: 'អនុវត្ត' },
    { id: 'adventure', title: 'ដំណើរផ្សងព្រេងចំណេះដឹង', icon: '🗺️', desc: 'ដោះស្រាយសំណួរជាបន្តបន្ទាប់ដើម្បីឆ្លងកាត់ដំណាក់កាលនីមួយៗ', badge: 'កម្សាន្ត' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAIEducationalGame({
        subject,
        grade,
        topic,
        gameType: selectedGameType,
        difficulty,
        cardCount,
        timeLimitSeconds
      });
      setGame(generated);
      setIsPlaying(false);
      setIsGameOver(false);
      showToast('🎮 បានបង្កើតល្បែងសិក្សាឌីជីថលដោយ AI ជោគជ័យ!');

      // Save to history
      saveAICreation({
        id: generated.id,
        type: 'game',
        typeNameKh: 'ល្បែងសិក្សាឌីជីថល (Digital Game)',
        title: generated.title,
        subject: generated.subject,
        grade: generated.grade,
        createdAt: generated.createdAt,
        updatedAt: generated.updatedAt,
        payload: generated
      });
      if (onSaved) onSaved();
    } catch {
      showToast('⚠️ មិនអាចបង្កើតល្បែងបាននៅពេលនេះទេ។');
    } finally {
      setIsGenerating(false);
    }
  };

  // Start Live Single Player Mode
  const startPlaying = () => {
    if (!game) return;
    setIsPlaying(true);
    setIsGameOver(false);
    setActiveQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimer(game.timeLimitSeconds);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
  };

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isPlaying && !isGameOver && !isAnswerChecked && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isAnswerChecked, timer]);

  const handleTimeUp = () => {
    setIsAnswerChecked(true);
    setStreak(0);
  };

  const handleSelectAnswer = (option: string) => {
    if (isAnswerChecked || !game) return;
    setSelectedAnswer(option);
    setIsAnswerChecked(true);

    const currentCard = game.cardsOrQuestions[activeQuestionIndex];
    const isCorrect = option === currentCard.correctAnswer;

    if (isCorrect) {
      const bonusStreak = (streak + 1) * 20;
      setScore(prev => prev + currentCard.points + bonusStreak);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (!game) return;
    if (activeQuestionIndex < game.cardsOrQuestions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setTimer(game.timeLimitSeconds);
    } else {
      setIsGameOver(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* TOP TRI-MODE CONTROLLER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setActiveSection('duck_race')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-bold font-moul text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSection === 'duck_race'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md ring-2 ring-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🦆</span>
            <span>ប្រណាំងទាហែលទឹក (Duck Race Timer)</span>
          </button>

          <button
            onClick={() => setActiveSection('picker_race')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-bold font-moul text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSection === 'picker_race'
                ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🎯</span>
            <span>សង្វៀនប្រណាំង & ចាប់ឈ្មោះ (10 Arenas)</span>
          </button>

          <button
            onClick={() => setActiveSection('ai_game_deck')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-bold font-moul text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSection === 'ai_game_deck'
                ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-base">🧩</span>
            <span>កញ្ចប់ល្បែងសំណួរ & តេស្តចំណេះដឹង (Quiz Packs)</span>
          </button>
        </div>

        {game && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-bold">
            <span>🔑 កូដបន្ទប់លេង៖ {game.gameCode}</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: AUTHENTIC CLASSROOM DUCK RACE */}
      {/* ------------------------------------------------------------- */}
      {activeSection === 'duck_race' && (
        <ClassroomDuckRace
          onAwardScore={handleAwardScore}
          onBackToArena={() => setActiveSection('picker_race')}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: MULTI-MODE PICKER & RACING ARENAS */}
      {/* ------------------------------------------------------------- */}
      {activeSection === 'picker_race' && (
        <ClassroomPickerRaceArena
          externalQuestions={game ? game.cardsOrQuestions : []}
          onAwardScoreToStudent={handleAwardScore}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: AI QUESTION DECK & MULTI-TEMPLATE GAMES */}
      {/* ------------------------------------------------------------- */}
      {activeSection === 'ai_game_deck' && (
        <div className="space-y-6">
          {/* Parameter & Game Selection Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold font-moul text-blue-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>បង្កើតកញ្ចប់ល្បែងសិក្សាឌីជីថល (AI Interactive Game Creator)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                បង្កើតកញ្ចប់សំណួរពហុជ្រើសរើស ផ្គូផ្គងពាក្យ ប័ណ្ណពាក្យឆ្លាតវៃ និងល្បែងបញ្ញាដោយស្វ័យប្រវត្តិតាមកម្មវិធីសិក្សាជាតិ។
              </p>
            </div>

            {/* Game Templates Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-3">
                ជ្រើសរើសទម្រង់ល្បែងសិក្សា (Game Template) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gameTemplates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedGameType(t.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedGameType === t.id
                        ? 'border-blue-800 bg-blue-50/70 ring-2 ring-blue-800/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{t.icon}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md text-[10px] font-bold">
                        {t.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">មុខវិជ្ជា</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
                >
                  {['គណិតវិទ្យា', 'ភាសាខ្មែរ', 'វិទ្យាសាស្ត្រ', 'សិក្សាសង្គម', 'ភាសាអង់គ្លេស'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">កម្រិតថ្នាក់</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ចំនួនសំណួរ/កាត</label>
                <input
                  type="number"
                  min={4}
                  max={20}
                  value={cardCount}
                  onChange={e => setCardCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">កំណត់ពេលឆ្លើយ (វិនាទី)</label>
                <select
                  value={timeLimitSeconds}
                  onChange={e => setTimeLimitSeconds(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
                >
                  <option value={10}>១០ វិនាទី (Fast)</option>
                  <option value={20}>២០ វិនាទី (Standard)</option>
                  <option value={30}>៣០ វិនាទី (Relaxed)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ប្រធានបទមេរៀន ឬពាក្យគន្លឹះ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="ឧ. ចំនួនប្រភាគ, វដ្តនៃទឹក, ប្រវត្តិប្រាសាទអង្គរវត្ត, បរិស្ថាន..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden font-medium"
                />
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
                <span>{isGenerating ? '🤖 AI កំពុងរៀបចំកញ្ចប់ល្បែង...' : '✨ បង្កើតល្បែងសិក្សាដោយ AI'}</span>
              </button>
            </div>
          </div>

          {/* GAME RUNNER & MULTIPLAYER PREVIEW */}
          {game && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Header Bar */}
              <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs">
                      {game.subject} ថ្នាក់ទី{game.grade}
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1">
                      🔑 កូដចូលលេង (PIN)៖ <strong>{game.gameCode}</strong>
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-900 font-bold rounded-lg text-xs">
                      {game.cardsOrQuestions.length} សំណួរ/កាត
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-moul text-blue-950">
                    {game.title}
                  </h2>
                </div>

                {/* Launch Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={startPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>សាកល្បងលេងផ្ទាល់ (Play Preview)</span>
                  </button>

                  <button
                    onClick={() => setIsHostModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>បើកថ្នាក់ប្រកួត (Student Host Mode)</span>
                  </button>
                </div>
              </div>

              {/* LIVE SINGLE PLAYER PREVIEW STAGE */}
              {isPlaying && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-10 text-white relative shadow-xl">
                  {/* Top Stats Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-xl font-bold text-sm border border-amber-500/30">
                        <Trophy className="w-4 h-4" /> {score} ពិន្ទុ
                      </div>
                      {streak > 1 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-xl font-bold text-xs border border-rose-500/30 animate-pulse">
                          <Flame className="w-4 h-4 text-rose-400" /> {streak} Streak!
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-sm ${
                        timer <= 5 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-ping' : 'bg-white/10 text-white'
                      }`}>
                        <Clock className="w-4 h-4" /> {timer}s
                      </div>
                      <span className="text-xs text-white/60">
                        {activeQuestionIndex + 1} / {game.cardsOrQuestions.length}
                      </span>
                    </div>
                  </div>

                  {/* Game Over Screen */}
                  {isGameOver ? (
                    <div className="text-center py-10 space-y-4 max-w-md mx-auto">
                      <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto text-4xl border border-amber-400/40">
                        🏆
                      </div>
                      <h3 className="text-2xl font-bold font-moul text-amber-300">
                        បញ្ចប់ការប្រកួត!
                      </h3>
                      <p className="text-white/80 text-sm">
                        អ្នកទទួលបានពិន្ទុសរុប៖ <strong className="text-2xl text-white font-bold">{score}</strong> ពិន្ទុ
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-4">
                        <button
                          onClick={startPlaying}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" /> លេងម្តងទៀត
                        </button>
                        <button
                          onClick={() => setIsPlaying(false)}
                          className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs transition-all cursor-pointer"
                        >
                          ចាកចេញ
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Question & Options Area */
                    <div className="space-y-6 max-w-2xl mx-auto text-center">
                      <h3 className="text-xl md:text-2xl font-bold font-moul leading-relaxed">
                        {game.cardsOrQuestions[activeQuestionIndex]?.question}
                      </h3>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        {game.cardsOrQuestions[activeQuestionIndex]?.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswer === opt;
                          const isCorrect = opt === game.cardsOrQuestions[activeQuestionIndex]?.correctAnswer;

                          let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/10 text-white';
                          if (isAnswerChecked) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-600/80 border-emerald-400 text-white font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-600/80 border-rose-400 text-white';
                            } else {
                              btnStyle = 'bg-white/5 opacity-40 border-transparent';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswerChecked}
                              onClick={() => handleSelectAnswer(opt)}
                              className={`p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswerChecked && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
                              {isAnswerChecked && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-300 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation feedback & Next button */}
                      {isAnswerChecked && (
                        <div className="p-4 bg-white/10 rounded-2xl text-left text-xs space-y-2 animate-fadeIn">
                          <p className="text-white/90">
                            💡 <strong>ការពន្យល់៖</strong> {game.cardsOrQuestions[activeQuestionIndex]?.explanation}
                          </p>
                          <div className="flex justify-end">
                            <button
                              onClick={handleNextQuestion}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>សំណួរបន្ទាប់</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* QUESTION CARDS LIST OVERVIEW */}
              {!isPlaying && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 font-moul">
                    បញ្ជីកាតសំណួរក្នុងកញ្ចប់ល្បែង ({game.cardsOrQuestions.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {game.cardsOrQuestions.map((card, idx) => (
                      <div key={card.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-950">កាតទី {idx + 1}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold text-[10px]">
                            +{card.points} ពិន្ទុ
                          </span>
                        </div>
                        <p className="font-medium text-slate-800">{card.question}</p>
                        <div className="text-[11px] text-emerald-800 font-medium">
                          🔑 <strong>ចម្លើយត្រឹមត្រូវ៖</strong> {card.correctAnswer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Student Host Mode Live Classroom Modal */}
      {game && (
        <StudentGameModeModal
          isOpen={isHostModalOpen}
          onClose={() => setIsHostModalOpen(false)}
          game={game}
        />
      )}
    </div>
  );
};
