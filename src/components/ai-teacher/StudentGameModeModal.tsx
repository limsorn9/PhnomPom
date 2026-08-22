import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Play, 
  Trophy, 
  QrCode, 
  Copy, 
  Check, 
  Sparkles, 
  Flame, 
  Clock, 
  Award, 
  ChevronRight, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { AIEducationalGame, StudentPlayer } from './types';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  game: AIEducationalGame;
}

export const StudentGameModeModal: React.FC<Props> = ({ isOpen, onClose, game }) => {
  const { showToast, students } = useSchool();

  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [sessionStatus, setSessionStatus] = useState<'lobby' | 'countdown' | 'in_progress' | 'leaderboard'>('lobby');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [joinedPlayers, setJoinedPlayers] = useState<StudentPlayer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [roundTimer, setRoundTimer] = useState<number>(game.timeLimitSeconds);

  // Initialize lobby with simulated joined students from the class
  useEffect(() => {
    if (isOpen) {
      setSessionStatus('lobby');
      setCurrentQuestionIndex(0);
      setRoundTimer(game.timeLimitSeconds);

      // Populate 6-10 real students from SchoolContext
      const sample = students.slice(0, 8).map((s, idx) => ({
        id: s.id,
        name: s.nameKhmer || `សិស្សទី ${idx + 1}`,
        score: 0,
        answeredCount: 0,
        streak: 0,
        avatar: ['🦁', '🐯', '🐼', '🦊', '🐰', '🦄', '🐨', '🐬'][idx % 8],
        isOnline: true
      }));

      setJoinedPlayers(sample.length > 0 ? sample : [
        { id: '1', name: 'សុខ វិបុល', score: 0, answeredCount: 0, streak: 0, avatar: '🦁', isOnline: true },
        { id: '2', name: 'ជា ចាន់រ៉ា', score: 0, answeredCount: 0, streak: 0, avatar: '🐯', isOnline: true },
        { id: '3', name: 'លី ស្រីនាង', score: 0, answeredCount: 0, streak: 0, avatar: '🐼', isOnline: true },
        { id: '4', name: 'ខៀវ ពិសិដ្ឋ', score: 0, answeredCount: 0, streak: 0, avatar: '🦊', isOnline: true },
      ]);
    }
  }, [isOpen, game, students]);

  // Handle countdown
  useEffect(() => {
    let timer: any;
    if (sessionStatus === 'countdown') {
      if (countdownNum > 0) {
        timer = setTimeout(() => setCountdownNum(prev => prev - 1), 1000);
      } else {
        setSessionStatus('in_progress');
        setRoundTimer(game.timeLimitSeconds);
      }
    }
    return () => clearTimeout(timer);
  }, [sessionStatus, countdownNum, game.timeLimitSeconds]);

  // Handle Question Round Timer & simulate real-time student answers
  useEffect(() => {
    let interval: any;
    if (sessionStatus === 'in_progress' && roundTimer > 0) {
      interval = setInterval(() => {
        setRoundTimer(prev => prev - 1);
        
        // Randomly award points to joined students to simulate live gameplay
        setJoinedPlayers(prev => prev.map(p => {
          if (Math.random() > 0.6) {
            const added = Math.floor(Math.random() * 50) + 50;
            return {
              ...p,
              score: p.score + added,
              answeredCount: p.answeredCount + 1,
              streak: p.streak + 1
            };
          }
          return p;
        }));
      }, 1000);
    } else if (sessionStatus === 'in_progress' && roundTimer === 0) {
      // Auto move to next or leaderboard
      if (currentQuestionIndex < game.cardsOrQuestions.length - 1) {
        // short delay
      } else {
        setSessionStatus('leaderboard');
      }
    }
    return () => clearInterval(interval);
  }, [sessionStatus, roundTimer, currentQuestionIndex, game.cardsOrQuestions.length]);

  if (!isOpen) return null;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(game.gameCode);
    setCopiedPin(true);
    showToast(`🔑 បានចម្លងកូដចូលលេង៖ ${game.gameCode}`);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleStartGame = () => {
    setCountdownNum(3);
    setSessionStatus('countdown');
  };

  const handleNextRound = () => {
    if (currentQuestionIndex < game.cardsOrQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRoundTimer(game.timeLimitSeconds);
    } else {
      setSessionStatus('leaderboard');
    }
  };

  const sortedPlayers = [...joinedPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl w-full max-w-4xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h3 className="text-base md:text-lg font-bold font-moul">
                {game.title}
              </h3>
              <p className="text-xs text-white/60">
                {game.subject} • ថ្នាក់ទី{game.grade} • របៀបប្រកួតផ្ទាល់ក្នុងថ្នាក់
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-center">

          {/* 1. LOBBY SCREEN */}
          {sessionStatus === 'lobby' && (
            <div className="space-y-8">
              {/* PIN Code & QR Banner */}
              <div className="bg-white/10 border border-white/15 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                  <span className="text-xs uppercase tracking-widest text-cyan-300 font-bold block mb-1">
                    លេខកូដសម្ងាត់សម្រាប់សិស្សចូលលេង (GAME PIN)
                  </span>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <span className="text-4xl md:text-6xl font-black font-mono tracking-widest text-amber-400">
                      {game.gameCode}
                    </span>
                    <button
                      onClick={handleCopyPin}
                      className="p-3 bg-white/15 hover:bg-white/25 rounded-2xl transition-all cursor-pointer"
                      title="ចម្លងកូដ"
                    >
                      {copiedPin ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6 text-white" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/70 mt-2">
                    សិស្សអាចបើកកម្មវិធី ឬស្កេន QR Code ដើម្បីចូលរួមប្រកួតភ្លាមៗ
                  </p>
                </div>

                {/* QR Box */}
                <div className="bg-white p-3 rounded-2xl text-slate-900 flex flex-col items-center shadow-lg">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="text-[10px] font-bold text-slate-600 mt-1">ស្កេនចូលលេង</span>
                </div>
              </div>

              {/* Joined Students Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white/80">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>សិស្សដែលបានចូលរួម ({joinedPlayers.length} នាក់)</span>
                  </span>
                  <span className="text-emerald-400 animate-pulse">● កំពុងរង់ចាំគ្រូចុចចាប់ផ្តើម</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {joinedPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className="p-3 bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-xs animate-fadeIn"
                    >
                      <span className="text-2xl">{player.avatar}</span>
                      <div className="truncate">
                        <span className="font-bold text-xs block text-white truncate">{player.name}</span>
                        <span className="text-[10px] text-emerald-300">បានភ្ជាប់រួចរាល់</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold font-moul text-sm shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>ចាប់ផ្តើមការប្រកួត (START GAME)</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. COUNTDOWN SCREEN */}
          {sessionStatus === 'countdown' && (
            <div className="text-center py-16 space-y-6">
              <span className="text-xs uppercase tracking-widest text-cyan-300 font-bold">
                ត្រៀមខ្លួនរួចរាល់...
              </span>
              <div className="text-8xl md:text-9xl font-black font-moul text-amber-400 animate-bounce">
                {countdownNum > 0 ? countdownNum : 'GO!'}
              </div>
              <p className="text-sm text-white/80">
                សំណួរទី ១ នឹងបង្ហាញក្នុងពេលបន្តិចទៀតនេះ!
              </p>
            </div>
          )}

          {/* 3. IN PROGRESS SCREEN (Teacher Big Screen View) */}
          {sessionStatus === 'in_progress' && (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-cyan-300">
                  សំណួរ {currentQuestionIndex + 1} នៃ {game.cardsOrQuestions.length}
                </span>
                <div className={`px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2 ${
                  roundTimer <= 5 ? 'bg-rose-500 text-white animate-ping' : 'bg-white/20 text-white'
                }`}>
                  <Clock className="w-4 h-4" /> {roundTimer} វិនាទី
                </div>
              </div>

              {/* Big Question Display */}
              <div className="text-center py-4 max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold font-moul leading-relaxed">
                  {game.cardsOrQuestions[currentQuestionIndex]?.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto w-full">
                {game.cardsOrQuestions[currentQuestionIndex]?.options.map((opt, oIdx) => (
                  <div key={oIdx} className="p-4 bg-white/10 border border-white/15 rounded-2xl text-sm font-medium flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                      {['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>

              {/* Live Answer Progress */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>សិស្សកំពុងឆ្លើយលើឧបករណ៍ផ្ទាល់ខ្លួន...</span>
                </div>
                <button
                  onClick={handleNextRound}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>សំណួរបន្ទាប់</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. LEADERBOARD SCREEN */}
          {sessionStatus === 'leaderboard' && (
            <div className="space-y-6 text-center max-w-2xl mx-auto w-full">
              <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto text-4xl border border-amber-400/40">
                🏆
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-moul text-amber-300">
                តារាងកិត្តិយស និងជើងឯកក្នុងថ្នាក់ (LEADERBOARD)
              </h2>

              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-3 items-end pt-4 pb-2">
                {/* 2nd place */}
                {sortedPlayers[1] && (
                  <div className="p-4 bg-slate-800/80 border border-slate-600 rounded-2xl flex flex-col items-center">
                    <span className="text-2xl">{sortedPlayers[1].avatar}</span>
                    <span className="text-lg font-bold text-slate-300 mt-1">🥈 លេខ ២</span>
                    <span className="text-xs font-bold text-white truncate max-w-full">{sortedPlayers[1].name}</span>
                    <span className="text-xs text-amber-300 font-bold">{sortedPlayers[1].score} pts</span>
                  </div>
                )}

                {/* 1st place */}
                {sortedPlayers[0] && (
                  <div className="p-5 bg-amber-500/20 border-2 border-amber-400 rounded-2xl flex flex-col items-center scale-105 shadow-xl">
                    <span className="text-3xl">{sortedPlayers[0].avatar}</span>
                    <span className="text-xl font-bold text-amber-400 mt-1">🥇 ជើងឯក</span>
                    <span className="text-sm font-bold text-white truncate max-w-full">{sortedPlayers[0].name}</span>
                    <span className="text-sm text-amber-300 font-bold">{sortedPlayers[0].score} pts</span>
                  </div>
                )}

                {/* 3rd place */}
                {sortedPlayers[2] && (
                  <div className="p-4 bg-amber-900/40 border border-amber-700/60 rounded-2xl flex flex-col items-center">
                    <span className="text-2xl">{sortedPlayers[2].avatar}</span>
                    <span className="text-lg font-bold text-amber-600 mt-1">🥉 លេខ ៣</span>
                    <span className="text-xs font-bold text-white truncate max-w-full">{sortedPlayers[2].name}</span>
                    <span className="text-xs text-amber-300 font-bold">{sortedPlayers[2].score} pts</span>
                  </div>
                )}
              </div>

              {/* Other players list */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {sortedPlayers.slice(3).map((p, idx) => (
                  <div key={p.id} className="p-3 bg-white/10 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white/50 w-5">{idx + 4}</span>
                      <span>{p.avatar}</span>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <span className="font-bold text-amber-300">{p.score} pts</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setSessionStatus('lobby')}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> លេងម្តងទៀត
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs"
                >
                  បិទផ្ទាំង
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
