import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Music, 
  Bell, 
  Shuffle, 
  Settings, 
  Trophy, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Award,
  Sparkles,
  HelpCircle,
  Clock,
  Shirt,
  Palette,
  CheckCircle2,
  ListFilter,
  Swords,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Flame,
  Zap,
  Crown,
  Gauge,
  Maximize2,
  Minimize2,
  Medal,
  Timer as TimerIcon,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PickerCandidate } from './types';
import { soundManager } from '../../utils/gameSoundEffects';
import { useSchool } from '../../context/SchoolContext';

// Fastest Duck Speed Record for Local Leaderboard
export interface FastestDuckRecord {
  id: string;
  candidateId: string;
  name: string;
  timeSeconds: number;
  targetDuration: number;
  costume: DuckCostumeType;
  date: string;
  gameMode: 'classroom' | 'duel_2p';
}

// Duck Costume Definitions matching the user's reference images
export type DuckCostumeType = 
  | 'classic_yellow'
  | 'superhero'
  | 'pink_striped'
  | 'spa_cucumber'
  | 'construction'
  | 'pirate'
  | 'graduate'
  | 'chef'
  | 'king'
  | 'space';

export interface DuckCostumeInfo {
  id: DuckCostumeType;
  nameKh: string;
  nameEn: string;
  color: string;
  accentColor: string;
}

export const DUCK_COSTUMES: DuckCostumeInfo[] = [
  { id: 'classic_yellow', nameKh: 'ទាពណ៌លឿងប្រពៃណី', nameEn: 'Classic Yellow', color: '#facc15', accentColor: '#ea580c' },
  { id: 'superhero', nameKh: 'ទាវីរបុរស (Superhero)', nameEn: 'Superhero', color: '#2563eb', accentColor: '#dc2626' },
  { id: 'pink_striped', nameKh: 'ទាឆ្នូតផ្កាឈូក', nameEn: 'Pink Striped', color: '#f472b6', accentColor: '#db2777' },
  { id: 'spa_cucumber', nameKh: 'ទាស្ប៉ា & មួកងូតទឹក', nameEn: 'Spa & Cucumber', color: '#facc15', accentColor: '#10b981' },
  { id: 'construction', nameKh: 'ទាមួកសុវត្ថិភាព', nameEn: 'Construction Hat', color: '#ea580c', accentColor: '#f59e0b' },
  { id: 'pirate', nameKh: 'ទាចោរសមុទ្រ', nameEn: 'Pirate Captain', color: '#1e293b', accentColor: '#dc2626' },
  { id: 'graduate', nameKh: 'ទាបណ្ឌិតបញ្ចប់ការសិក្សា', nameEn: 'Graduate Scholar', color: '#0f172a', accentColor: '#eab308' },
  { id: 'chef', nameKh: 'ទាចុងភៅ', nameEn: 'Master Chef', color: '#f8fafc', accentColor: '#ef4444' },
  { id: 'king', nameKh: 'ទាស្តេចគ្រងមកុដ', nameEn: 'Royal King', color: '#eab308', accentColor: '#7c3aed' },
  { id: 'space', nameKh: 'ទាអវកាស', nameEn: 'Astro Duck', color: '#38bdf8', accentColor: '#6366f1' },
];

interface Props {
  candidates?: PickerCandidate[];
  onCandidatesChange?: (candidates: PickerCandidate[]) => void;
  onWinner?: (winner: PickerCandidate) => void;
  onAwardScore?: (studentId: string, studentName: string, points: number) => void;
  onBackToArena?: () => void;
}

export const ClassroomDuckRace: React.FC<Props> = ({
  candidates: propCandidates,
  onCandidatesChange,
  onWinner,
  onAwardScore,
  onBackToArena
}) => {
  const { students, showToast } = useSchool();

  // 1. Duck Candidates State
  const [candidates, setCandidates] = useState<PickerCandidate[]>(() => {
    if (propCandidates && propCandidates.length > 0) return propCandidates;
    if (students && students.length > 0) {
      return students.slice(0, 10).map((s, idx) => ({
        id: s.id,
        name: s.nameKhmer || `សិស្ស ${idx + 1}`,
        avatar: '🦆',
        color: DUCK_COSTUMES[idx % DUCK_COSTUMES.length].color,
        eliminated: false,
        score: s.totalScore || 0
      }));
    }
    const defaultNames = ['Rozalyn', 'Rory', 'Aaron', 'Sophia', 'សុខ វិបុល', 'ជា ចាន់រ៉ា', 'លី ស្រីនាង', 'ខៀវ ពិសិដ្ឋ'];
    return defaultNames.map((name, idx) => ({
      id: `duck-${idx + 1}`,
      name,
      avatar: '🦆',
      color: DUCK_COSTUMES[idx % DUCK_COSTUMES.length].color,
      eliminated: false,
      score: 0
    }));
  });

  // Assign costumes to candidate IDs
  const [candidateCostumes, setCandidateCostumes] = useState<{ [id: string]: DuckCostumeType }>({});

  useEffect(() => {
    const map: { [id: string]: DuckCostumeType } = {};
    candidates.forEach((c, idx) => {
      map[c.id] = DUCK_COSTUMES[idx % DUCK_COSTUMES.length].id;
    });
    setCandidateCostumes(map);
  }, [candidates.length]);

  // Mode tabs: 'Numbers' vs 'Names'
  const [displayMode, setDisplayMode] = useState<'names' | 'numbers'>('names');

  // Game Mode: 'classroom' (entire class) vs 'duel_2p' (2-player turn-based competition)
  const [gameMode, setGameMode] = useState<'classroom' | 'duel_2p'>('classroom');

  // Turn-Based 2-Player Registration State
  const [isTwoPlayerSetupOpen, setIsTwoPlayerSetupOpen] = useState<boolean>(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1); // 1 = Player 1 Turn, 2 = Player 2 Turn, 3 = Match Face-off
  const [player1, setPlayer1] = useState<{ name: string; costume: DuckCostumeType; motto: string; wins: number }>({
    name: 'ទាជើងខ្លាំង A',
    costume: 'yellow',
    motto: '⚡ ហែលលឿនដូចផ្លេកបន្ទោរ',
    wins: 0
  });
  const [player2, setPlayer2] = useState<{ name: string; costume: DuckCostumeType; motto: string; wins: number }>({
    name: 'ទាសំណាង B',
    costume: 'king',
    motto: '🔥 មិនខ្លាចគូប្រកួត',
    wins: 0
  });
  const [duelMaxRounds, setDuelMaxRounds] = useState<number>(3); // Best of 3
  const [duelCurrentRound, setDuelCurrentRound] = useState<number>(1);
  const [duelMatchWinner, setDuelMatchWinner] = useState<'p1' | 'p2' | null>(null);

  // Keypad & Timer state (HH:MM:SS format)
  // Input digits string (e.g. "002000" -> 00:20:00)
  const [timerDigits, setTimerDigits] = useState<string>('000010'); // Default 10 seconds
  const [targetSeconds, setTargetSeconds] = useState<number>(10);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(10);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceFinished, setRaceFinished] = useState<boolean>(false);

  // Audio settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState<boolean>(true);
  const [isBellEnabled, setIsBellEnabled] = useState<boolean>(true);

  // Race Animation State
  const [duckPositions, setDuckPositions] = useState<{ [id: string]: number }>({});
  const [winner, setWinner] = useState<PickerCandidate | null>(null);
  const [removeWinnerOnNext, setRemoveWinnerOnNext] = useState<boolean>(true);

  // Joyful winner duck quack phrase rotation ("យំកាប កាប យ៉ាងសប្បាយរីករាយ")
  const WINNER_QUACK_PHRASES = [
    '🦆 កាប! កាប! (Quack! Quack!)',
    '🎉 យេ! ខ្ញុំឈ្នះហើយ! (I Won!)',
    '👑 កាបៗៗ! ខ្ញុំជាជើងឯក! 🏆',
    '✨ ហែលលឿនជាងគេ! កាប! កាប! 💨',
    '🎵 កាប! កាប! Quack Quack! 🌟'
  ];
  const [winnerPhraseIndex, setWinnerPhraseIndex] = useState<number>(0);

  // Modals & Panels
  const [isEditListOpen, setIsEditListOpen] = useState<boolean>(false);
  const [isCostumeSelectorOpen, setIsCostumeSelectorOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [costumeCarouselIndex, setCostumeCarouselIndex] = useState<number>(0);

  // Winner History
  const [winnerHistory, setWinnerHistory] = useState<{ candidate: PickerCandidate; time: string; costume: DuckCostumeType }[]>([]);

  // Local Leaderboard: Fastest Times for ducks crossing finish line (Stored persistently in LocalStorage)
  const [fastestLeaderboard, setFastestLeaderboard] = useState<FastestDuckRecord[]>(() => {
    try {
      const saved = localStorage.getItem('duck_race_fastest_times_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.sort((a: FastestDuckRecord, b: FastestDuckRecord) => a.timeSeconds - b.timeSeconds);
        }
      }
      // Initial default records if empty
      return [
        {
          id: 'rec_init_1',
          candidateId: 'init_1',
          name: 'ទាផ្លេកបន្ទោរ (Speedy Duck)',
          timeSeconds: 4.62,
          targetDuration: 5,
          costume: 'superhero',
          date: 'កន្លងទៅ',
          gameMode: 'classroom'
        },
        {
          id: 'rec_init_2',
          candidateId: 'init_2',
          name: 'ទាអធិរាជ (Royal Champion)',
          timeSeconds: 9.15,
          targetDuration: 10,
          costume: 'king',
          date: 'កន្លងទៅ',
          gameMode: 'classroom'
        }
      ];
    } catch (e) {
      console.error('Failed to load duck race records from localStorage', e);
      return [];
    }
  });

  const [leaderboardTab, setLeaderboardTab] = useState<'fastest' | 'recent'>('fastest');
  const [fastestTimeFilter, setFastestTimeFilter] = useState<number | 'all'>('all');
  const [latestFinishTime, setLatestFinishTime] = useState<number | null>(null);
  const [isNewSpeedRecord, setIsNewSpeedRecord] = useState<boolean>(false);

  // Container Ref & Fullscreen Handler
  const arenaContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !isFullscreen) {
      if (arenaContainerRef.current?.requestFullscreen) {
        arenaContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // List editing form state
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [bulkListText, setBulkListText] = useState<string>('');

  // Active (non-eliminated) ducks or 2-Player Duel contenders
  const activeCandidates: PickerCandidate[] = useMemo(() => {
    if (gameMode === 'duel_2p') {
      return [
        {
          id: 'p1',
          name: player1.name || 'អ្នកលេងទី ១',
          avatar: '🦆',
          color: DUCK_COSTUMES.find(c => c.id === player1.costume)?.color || '#facc15',
          eliminated: false,
          score: player1.wins
        },
        {
          id: 'p2',
          name: player2.name || 'អ្នកលេងទី ២',
          avatar: '🦆',
          color: DUCK_COSTUMES.find(c => c.id === player2.costume)?.color || '#f97316',
          eliminated: false,
          score: player2.wins
        }
      ];
    }
    return candidates.filter(c => !c.eliminated);
  }, [gameMode, player1, player2, candidates]);

  // Audio volume sync
  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    return () => {
      soundManager.stopBGM();
    };
  }, []);

  // Periodic joyful quacking & victory swimming cheer when winner duck wins ("យំកាប កាប និងហែលទៅមុខសប្បាយរីករាយ")
  useEffect(() => {
    if (!raceFinished || !winner) return;

    // Trigger alternating quack sounds and rotating speech bubble phrases
    const victoryInterval = setInterval(() => {
      setWinnerPhraseIndex(prev => (prev + 1) % WINNER_QUACK_PHRASES.length);
      if (!isMuted) {
        soundManager.playQuack(Math.random() > 0.4 ? 'victory' : 'loud');
      }
    }, 2400);

    return () => {
      clearInterval(victoryInterval);
    };
  }, [raceFinished, winner, isMuted]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Convert timer digits string ("002000") to seconds
  const digitsToSeconds = (digits: string): number => {
    const clean = digits.padStart(6, '0').slice(-6);
    const hh = parseInt(clean.slice(0, 2), 10) || 0;
    const mm = parseInt(clean.slice(2, 4), 10) || 0;
    const ss = parseInt(clean.slice(4, 6), 10) || 0;
    return hh * 3600 + mm * 60 + ss;
  };

  // Handle Keypad button press
  const handleKeypadPress = (val: string) => {
    if (isRacing) return;
    if (val === 'Clear') {
      setTimerDigits('000000');
      setTargetSeconds(0);
      setRemainingSeconds(0);
      return;
    }
    if (val === 'Set') {
      const secs = digitsToSeconds(timerDigits);
      if (secs === 0) {
        setTargetSeconds(10);
        setRemainingSeconds(10);
        setTimerDigits('000010');
      } else {
        setTargetSeconds(secs);
        setRemainingSeconds(secs);
      }
      showToast(`⏱️ បានកំណត់ពេលវេលាប្រណាំង៖ ${formatTime(secs > 0 ? secs : 10)}`);
      return;
    }

    // Append digit (sliding from right)
    soundManager.playTick();
    const newDigits = (timerDigits + val).slice(-6);
    setTimerDigits(newDigits);
    const secs = digitsToSeconds(newDigits);
    setTargetSeconds(secs);
    setRemainingSeconds(secs);
  };

  // Preset Time Quick Setters
  const handleQuickTime = (secs: number) => {
    if (isRacing) return;
    setTargetSeconds(secs);
    setRemainingSeconds(secs);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const digitStr = `${String(hrs).padStart(2, '0')}${String(mins).padStart(2, '0')}${String(s).padStart(2, '0')}`;
    setTimerDigits(digitStr);
    showToast(`⏱️ បានជ្រើសរើស៖ ${formatTime(secs)}`);
  };

  // Shuffle Duck lanes and costumes
  const handleShuffle = () => {
    if (isRacing) return;
    soundManager.playTick();
    setCandidates(prev => [...prev].sort(() => Math.random() - 0.5));
    showToast('🔀 បានច្របល់លំដាប់កូនទា និងផ្លូវប្រណាំង!');
  };

  // -------------------------------------------------------------
  // START DUCK RACE
  // -------------------------------------------------------------
  const handleStartRace = () => {
    if (isRacing) return;
    if (activeCandidates.length === 0) {
      showToast('សូមបញ្ចូលឈ្មោះសិស្សយ៉ាងហោចណាស់ 1 នាក់!', 'error');
      return;
    }

    const durationSec = targetSeconds > 0 ? targetSeconds : 10;
    setRemainingSeconds(durationSec);
    setIsRacing(true);
    setRaceFinished(false);
    setWinner(null);

    // Initial Duck Positions at 0%
    const initPos: { [id: string]: number } = {};
    activeCandidates.forEach(c => { initPos[c.id] = 0; });
    setDuckPositions(initPos);

    // 1. Play Starting Referee Whistle
    soundManager.playRaceWhistle();

    // 2. Play Background Water Music Loop
    if (isBgmEnabled && !isMuted) {
      soundManager.startBGM('duck', 130);
    }

    // 3. Determine winner in advance
    const chosenWinner = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];

    const startTime = performance.now();
    const totalDurationMs = durationSec * 1000;
    const intervalTickMs = 80;
    let tickCount = 0;

    const timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progressRatio = Math.min(elapsed / totalDurationMs, 1);
      tickCount++;

      // Update remaining countdown time
      const leftSecs = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      setRemainingSeconds(leftSecs);

      // Sound effects (Gentle Soft Quacks "កាបៗតិចៗ" and Soft Water Paddling)
      if (tickCount % 22 === 0) {
        // Soft ambient quacking while swimming naturally
        soundManager.playQuack('soft');
      } else if (tickCount % 7 === 0) {
        // Gentle water paddle ripple sound
        soundManager.playGentlePaddle();
      }

      // Calculate natural duck swimming positions with paddle bursts & water surges
      setDuckPositions(prev => {
        const next: { [id: string]: number } = { ...prev };
        activeCandidates.forEach((cand, idx) => {
          const isChosenWinner = cand.id === chosenWinner.id;
          
          // Organic duck swimming dynamics:
          // Ducks swim via foot paddling (burst of speed on foot push followed by coasting glide)
          const paddleCadence = 1.35; // strokes per second
          const phase = ((elapsed / 1000) * paddleCadence * Math.PI * 2) + (idx * 1.1);
          const paddlePulse = Math.pow((Math.sin(phase) + 1) / 2, 2) * 2.4;
          const waterCurrent = Math.sin((elapsed / 1000) * 0.8 + idx) * 1.2;

          let targetPercent = progressRatio * 90;
          if (isChosenWinner) {
            // Winning duck surges ahead and crosses the finish line (100%)
            targetPercent = Math.min(100, progressRatio * 100 + paddlePulse + waterCurrent);
          } else {
            // Competitor ducks lag noticeably behind before the finish line
            const maxAllowed = progressRatio > 0.72 ? (68 + (idx % 8)) : 82;
            targetPercent = Math.min(maxAllowed, progressRatio * 76 + paddlePulse + waterCurrent);
          }
          next[cand.id] = Math.max(0, Math.min(100, targetPercent));
        });
        return next;
      });

      // Finish Race when time expires or duck crosses
      if (elapsed >= totalDurationMs) {
        clearInterval(timerInterval);
        finishRace(chosenWinner);
      }
    }, intervalTickMs);
  };

  // Finish Race Handler
  const finishRace = (winnerCandidate: PickerCandidate) => {
    setIsRacing(false);
    setRaceFinished(true);
    setRemainingSeconds(0);
    setTimerDigits('000000');
    setWinner(winnerCandidate);

    // Stop background music
    soundManager.stopBGM();

    // 1. Play Loud Joyful Winner Duck Celebration Quacks ("កាប! កាប! កាបៗៗ!" យំលឺៗយ៉ាងសប្បាយរីករាយ)
    soundManager.playVictoryDuckCelebration();

    // 2. Play Victory Fanfare & Crowd cheering
    setTimeout(() => {
      soundManager.playVictoryFanfare();
    }, 400);

    // 3. Confetti Explosion
    confetti({
      particleCount: 160,
      spread: 110,
      origin: { y: 0.5 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0.1 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 0.9 }
      });
    }, 350);

    // 4. Update 2-Player Duel Score & Series Status if in 2-Player mode
    if (gameMode === 'duel_2p') {
      const isP1 = winnerCandidate.id === 'p1';
      const targetWins = Math.ceil(duelMaxRounds / 2);
      if (isP1) {
        const newWins = player1.wins + 1;
        setPlayer1(prev => ({ ...prev, wins: newWins }));
        if (newWins >= targetWins) {
          setDuelMatchWinner('p1');
          showToast(`🏆 អបអរសាទរ! «${player1.name}» ឈ្នះជើងឯកការប្រកួតទ្វេភាគី (Champion)!`, 'success');
        } else {
          showToast(`🎉 «${player1.name}» ឈ្នះជុំទី ${duelCurrentRound}! (ពិន្ទុ ${newWins} - ${player2.wins})`);
        }
      } else {
        const newWins = player2.wins + 1;
        setPlayer2(prev => ({ ...prev, wins: newWins }));
        if (newWins >= targetWins) {
          setDuelMatchWinner('p2');
          showToast(`🏆 អបអរសាទរ! «${player2.name}» ឈ្នះជើងឯកការប្រកួតទ្វេភាគី (Champion)!`, 'success');
        } else {
          showToast(`🎉 «${player2.name}» ឈ្នះជុំទី ${duelCurrentRound}! (ពិន្ទុ ${player1.wins} - ${newWins})`);
        }
      }
    }

    // 5. Save to winner history
    const costume = gameMode === 'duel_2p' 
      ? (winnerCandidate.id === 'p1' ? player1.costume : player2.costume)
      : (candidateCostumes[winnerCandidate.id] || 'classic_yellow');
    setWinnerHistory(prev => [
      {
        candidate: winnerCandidate,
        time: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        costume
      },
      ...prev.slice(0, 19)
    ]);

    if (onWinner) {
      onWinner(winnerCandidate);
    }
  };

  // -------------------------------------------------------------
  // 2-PLAYER DUEL ROUND HANDLERS
  // -------------------------------------------------------------
  const handleDuelNextRound = () => {
    soundManager.stopBGM();
    setIsRacing(false);
    setRaceFinished(false);
    setWinner(null);
    setDuelCurrentRound(prev => prev + 1);

    const secs = targetSeconds > 0 ? targetSeconds : 10;
    setRemainingSeconds(secs);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    setTimerDigits(`${String(hrs).padStart(2, '0')}${String(mins).padStart(2, '0')}${String(s).padStart(2, '0')}`);

    const initPos: { [id: string]: number } = { p1: 0, p2: 0 };
    setDuckPositions(initPos);
    showToast(`🏁 ចាប់ផ្តើមត្រៀមជុំទី ${duelCurrentRound + 1}!`);
  };

  const handleResetDuelScore = () => {
    setPlayer1(prev => ({ ...prev, wins: 0 }));
    setPlayer2(prev => ({ ...prev, wins: 0 }));
    setDuelCurrentRound(1);
    setDuelMatchWinner(null);
    setWinner(null);
    setRaceFinished(false);
    setIsRacing(false);
    const initPos: { [id: string]: number } = { p1: 0, p2: 0 };
    setDuckPositions(initPos);
    showToast('🔄 បានកំណត់ពិន្ទុប្រកួត ២ នាក់ឡើងវិញ (0 - 0)!');
  };

  const handleOpenTwoPlayerSetup = () => {
    if (isRacing) return;
    setSetupStep(1);
    setIsTwoPlayerSetupOpen(true);
  };

  // Reset or Race Again
  const handleRaceAgain = () => {
    soundManager.stopBGM();
    setIsRacing(false);
    setRaceFinished(false);

    if (gameMode === 'duel_2p') {
      handleDuelNextRound();
      return;
    }

    // If remove winner is checked, eliminate previous winner
    if (removeWinnerOnNext && winner) {
      setCandidates(prev => prev.map(c => 
        c.id === winner.id ? { ...c, eliminated: true } : c
      ));
      showToast(`🎯 បានដកឈ្មោះ «${winner.name}» ចេញពីការប្រណាំងបន្ទាប់!`);
    }

    setWinner(null);
    const secs = targetSeconds > 0 ? targetSeconds : 10;
    setRemainingSeconds(secs);
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    setTimerDigits(`${String(hrs).padStart(2, '0')}${String(mins).padStart(2, '0')}${String(s).padStart(2, '0')}`);

    // Reset duck positions
    const initPos: { [id: string]: number } = {};
    activeCandidates.forEach(c => { initPos[c.id] = 0; });
    setDuckPositions(initPos);
  };

  // Reset all eliminated candidates
  const handleResetAllCandidates = () => {
    setCandidates(prev => prev.map(c => ({ ...c, eliminated: false })));
    showToast('🔄 បានដាក់បញ្ចូលបេក្ខជនទាំងអស់ឡើងវិញរួចរាល់!');
  };

  // Add single candidate
  const handleAddCandidate = () => {
    if (!newStudentName.trim()) return;
    const newCand: PickerCandidate = {
      id: `custom-duck-${Date.now()}`,
      name: newStudentName.trim(),
      avatar: '🦆',
      color: DUCK_COSTUMES[candidates.length % DUCK_COSTUMES.length].color,
      eliminated: false,
      score: 0
    };
    const updated = [...candidates, newCand];
    setCandidates(updated);
    if (onCandidatesChange) onCandidatesChange(updated);
    setNewStudentName('');
    showToast(`✅ បានបន្ថែម៖ ${newCand.name}`);
  };

  // Bulk import names
  const handleBulkImport = () => {
    const lines = bulkListText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newItems: PickerCandidate[] = lines.map((name, idx) => ({
      id: `duck-bulk-${Date.now()}-${idx}`,
      name,
      avatar: '🦆',
      color: DUCK_COSTUMES[idx % DUCK_COSTUMES.length].color,
      eliminated: false,
      score: 0
    }));

    setCandidates(newItems);
    if (onCandidatesChange) onCandidatesChange(newItems);
    setIsEditListOpen(false);
    setBulkListText('');
    showToast(`✅ បានបញ្ចូលឈ្មោះកូនទា ${newItems.length} នាក់ជោគជ័យ!`);
  };

  // -------------------------------------------------------------
  // DUCK SVG COSTUME RENDERER (REALISTIC RIGHT-FACING SWIMMING DUCK)
  // Realistic natural rubber & mallard duck swimming right towards the finish goal
  // -------------------------------------------------------------
  const renderDuckCharacter = (cand: PickerCandidate, laneNumber: number, costumeType: DuckCostumeType, isSelectedPreview: boolean = false, currentProgressPercent: number = 0) => {
    const isLeadWinner = raceFinished && winner?.id === cand.id;
    const clampedPercent = Math.max(0, Math.min(100, Math.round(currentProgressPercent)));
    const remainingPercent = Math.max(0, 100 - clampedPercent);

    // Handle clicking the winner duck to make it quack loudly again
    const handleWinnerDuckClick = () => {
      if (isLeadWinner) {
        soundManager.playVictoryDuckCelebration();
      } else if (!isRacing) {
        soundManager.playQuack('soft');
      }
    };

    return (
      <div 
        onClick={handleWinnerDuckClick}
        className={`relative flex items-center group select-none ${isLeadWinner ? 'cursor-pointer' : ''}`}
      >
        
        {/* 1. SPEECH BUBBLE CALLOUT (Follows duck head on the right) */}
        {!isSelectedPreview && (
          <div className="absolute -top-11 left-4 z-30 transition-all">
            {isLeadWinner ? (
              // Winner Joyful Quack Callout with rotating cheerful phrases ("យំកាប កាប យ៉ាងសប្បាយរីករាយ")
              <div className="relative bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-slate-950 font-black text-xs sm:text-sm px-3 py-1.5 rounded-2xl border-2 border-black shadow-2xl flex items-center gap-1.5 whitespace-nowrap animate-bounce z-40">
                <span className="text-sm">👑</span>
                <span className="font-moul">{displayMode === 'names' ? `${cand.name} (ឈ្នះ!)` : `ទា #${laneNumber} ឈ្នះ!`}</span>
                <span className="animate-quack-pulse text-[11px] font-black text-amber-950 bg-amber-100/95 px-2 py-0.5 rounded-lg border border-amber-500 shadow-xs">
                  {WINNER_QUACK_PHRASES[winnerPhraseIndex]}
                </span>
                {/* Floating Musical Notes & Stars */}
                <span className="absolute -top-3.5 -left-2 text-sm animate-music-note">🎵</span>
                <span className="absolute -top-4 right-1 text-sm animate-music-note" style={{ animationDelay: '0.8s' }}>🎶</span>
                <span className="absolute -bottom-2 -right-2 text-amber-600 text-sm animate-ping">✨</span>
                {/* Pointer Triangle pointing down to duck head */}
                <div className="absolute -bottom-1.5 left-6 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-black"></div>
                <div className="absolute -bottom-1 left-6 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-300"></div>
              </div>
            ) : (
              // Standard Student Name Bubble with mini progress indicator
              <div className="relative flex flex-col items-start">
                <div className="relative bg-white text-slate-950 font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-xl border-2 border-black shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <span>{displayMode === 'names' ? cand.name : `ទា #${laneNumber}`}</span>
                  {isRacing && (
                    <span className="text-[10px] font-black text-cyan-900 bg-cyan-100 px-1.5 py-0.2 rounded-md border border-cyan-400">
                      {clampedPercent}%
                    </span>
                  )}
                  {/* Pointer Triangle pointing down to duck head */}
                  <div className="absolute -bottom-1.5 left-6 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-black"></div>
                  <div className="absolute -bottom-1 left-6 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white"></div>
                </div>

                {/* Micro Progress Bar below name during active race */}
                {isRacing && (
                  <div className="mt-1 w-24 bg-slate-900/80 rounded-full p-0.5 border border-cyan-300/60 shadow-md flex items-center gap-1">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${clampedPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-bold text-cyan-200 whitespace-nowrap">
                      {remainingPercent > 0 ? `-${remainingPercent}%` : '🏁'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. DUCK SPRITE & REALISTIC WATER WAKE & BOW WAVE */}
        <div className="relative flex items-center">
          
          {/* A. Dynamic Water Wake Trailing Behind to the Left (ហែលទៅស្តាំ បន្សល់ទឹករលកទៅឆ្វេង) */}
          {(isRacing || isLeadWinner) && (
            <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-12 h-8 pointer-events-none flex items-center justify-end z-0">
              {/* Expanding water ripples behind */}
              <div className="absolute right-0 w-8 h-4 border-2 border-cyan-200/80 rounded-full animate-water-wake"></div>
              <div className="absolute right-3 w-6 h-3 border border-white/70 rounded-full animate-water-ripple" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute right-6 w-4 h-2 border border-cyan-100/60 rounded-full animate-water-ripple" style={{ animationDelay: '0.6s' }}></div>
              {/* Trailing V-wake */}
              <svg viewBox="0 0 40 20" className="w-10 h-5 text-cyan-200/70 drop-shadow-xs">
                <path d="M 38 10 L 4 2 M 38 10 L 4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          )}

          {/* B. Bow Wave at Front of Duck's Chest/Beak pushing water right */}
          {(isRacing || isLeadWinner) && (
            <div className="absolute -right-2.5 bottom-1 pointer-events-none z-10 animate-water-bow">
              <svg viewBox="0 0 20 16" className="w-5 h-4 text-white/80">
                <path d="M 2 2 C 8 6 12 12 18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          )}

          {/* C. Water Base Glow & Splash underneath duck body */}
          <div className={`absolute -bottom-1 -left-3 -right-3 h-4 bg-cyan-200/50 rounded-full blur-xs pointer-events-none ${(isRacing || isLeadWinner) ? 'animate-pulse' : ''}`}></div>

          {/* D. Winner Golden Crown & Sparkles Effect */}
          {isLeadWinner && (
            <>
              <div className="absolute -top-3.5 left-5 text-lg animate-bounce pointer-events-none drop-shadow-md z-30">
                👑
              </div>
              <div className="absolute -top-3 -right-3 text-amber-300 font-bold text-lg animate-ping pointer-events-none">
                ✨
              </div>
            </>
          )}

          {/* E. Main Realistic Duck SVG Facing Right towards the Finish Goal */}
          <svg 
            viewBox="0 0 120 90" 
            className={`w-16 h-14 sm:w-20 sm:h-16 drop-shadow-lg transition-transform ${
              isLeadWinner 
                ? 'animate-winner-duck' 
                : isRacing 
                ? 'animate-duck-swim' 
                : 'animate-duck-float'
            }`}
          >
            <defs>
              {/* Base Duck Yellow Gradient */}
              <linearGradient id={`duckYellow-${cand.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>

              {/* Head / Chest Highlight Gradient */}
              <linearGradient id={`duckHeadGrad-${cand.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="70%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>

              {/* Beak Orange Gradient */}
              <linearGradient id="beakOrange" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              {/* Webbed Foot Orange Gradient */}
              <linearGradient id="footOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>

              {/* Pink Striped Pattern */}
              <pattern id="pinkStripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#db2777" strokeWidth="4" />
                <line x1="5" y1="0" x2="5" y2="10" stroke="#f472b6" strokeWidth="6" />
              </pattern>
            </defs>

            {/* --- Underwater Webbed Foot (Paddling backwards to propel duck right) --- */}
            <g className={isRacing ? 'animate-duck-foot origin-[42px_74px]' : ''}>
              <path 
                d="M 38 72 L 32 84 C 36 86 42 85 46 83 L 44 72 Z" 
                fill="url(#footOrange)" 
                stroke="#9a3412" 
                strokeWidth="1.2" 
                opacity="0.85"
              />
              {/* Webbed toes lines */}
              <line x1="38" y1="74" x2="35" y2="83" stroke="#7c2d12" strokeWidth="1" />
              <line x1="41" y1="74" x2="41" y2="84" stroke="#7c2d12" strokeWidth="1" />
            </g>

            {/* --- Water Ripple Ring directly under duck --- */}
            <ellipse cx="62" cy="74" rx="46" ry="7" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

            {/* --- Upturned Tail Feathers on the Left (With Tail Waggle) --- */}
            <g className={isRacing ? 'animate-duck-tail origin-[36px_52px]' : ''}>
              <path 
                d="M 38 48 C 22 42 16 52 24 58 C 30 62 38 60 42 56 Z" 
                fill={`url(#duckYellow-${cand.id})`} 
                stroke="#854d0e" 
                strokeWidth="2" 
              />
            </g>

            {/* --- A. DUCK BODY (Sleek aerodynamic duck body facing right) --- */}
            {costumeType === 'pink_striped' ? (
              <path 
                d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                fill="url(#pinkStripes)" 
                stroke="#9d174d" 
                strokeWidth="2.5" 
              />
            ) : costumeType === 'superhero' ? (
              // Superhero Blue Suit Body
              <g>
                <path 
                  d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                  fill={`url(#duckYellow-${cand.id})`} 
                  stroke="#854d0e" 
                  strokeWidth="2.5" 
                />
                {/* Blue superhero suit & Red Cape */}
                <path d="M 88 56 C 96 62 94 72 80 74 C 55 77 35 70 28 58 C 40 54 60 56 72 52 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.5" />
                {/* Red Cape fluttering behind to the left */}
                <path d="M 30 52 C 16 48 12 64 24 68 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
                {/* Superhero Diamond Shield on chest */}
                <polygon points="68,58 76,58 79,63 72,69 65,63" fill="#eab308" stroke="#dc2626" strokeWidth="1" />
                <text x="69" y="65" fontSize="7" fontWeight="bold" fill="#dc2626">S</text>
                {/* Superhero hair curl */}
                <path d="M 68 10 C 68 4 55 4 50 12 C 55 10 65 12 68 10 Z" fill="#0f172a" />
              </g>
            ) : costumeType === 'construction' ? (
              // Construction Safety Hardhat
              <g>
                <path 
                  d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                  fill={`url(#duckYellow-${cand.id})`} 
                  stroke="#854d0e" 
                  strokeWidth="2.5" 
                />
                {/* Orange Safety Hardhat */}
                <path d="M 46 12 C 44 0 68 0 70 12 L 76 14 L 40 14 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
                <rect x="38" y="13" width="40" height="3.5" rx="1.5" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
                <rect x="54" y="3" width="6" height="10" fill="#fed7aa" />
              </g>
            ) : costumeType === 'spa_cucumber' ? (
              // Spa White Towel Cap & Cucumber Slice on Eye
              <g>
                <path 
                  d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                  fill={`url(#duckYellow-${cand.id})`} 
                  stroke="#854d0e" 
                  strokeWidth="2.5" 
                />
                {/* White Shower Cap */}
                <path d="M 44 14 C 44 -2 72 -2 74 14 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="59" cy="1" r="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                {/* Green Cucumber Slice on right-facing Eye */}
                <circle cx="58" cy="18" r="6" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
                <circle cx="58" cy="18" r="3" fill="#bbf7d0" />
                <circle cx="58" cy="18" r="1" fill="#15803d" />
              </g>
            ) : costumeType === 'pirate' ? (
              // Pirate Hat & Eye Patch
              <g>
                <path 
                  d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                  fill={`url(#duckYellow-${cand.id})`} 
                  stroke="#854d0e" 
                  strokeWidth="2.5" 
                />
                {/* Black Pirate Hat */}
                <path d="M 38 12 C 42 -4 72 -4 76 12 C 84 14 82 4 57 -2 C 32 4 30 14 38 12 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                <circle cx="57" cy="5" r="2.5" fill="#ffffff" />
                {/* Pirate Eye patch */}
                <circle cx="58" cy="18" r="4.5" fill="#0f172a" />
                <line x1="50" y1="12" x2="66" y2="24" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            ) : costumeType === 'graduate' ? (
              // Graduation Cap
              <g>
                <path 
                  d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                  fill={`url(#duckYellow-${cand.id})`} 
                  stroke="#854d0e" 
                  strokeWidth="2.5" 
                />
                <polygon points="57,0 80,8 57,16 34,8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <rect x="48" y="12" width="18" height="6" fill="#1e293b" />
                <line x1="57" y1="8" x2="40" y2="18" stroke="#eab308" strokeWidth="1.5" />
                <circle cx="40" cy="19" r="1.5" fill="#eab308" />
              </g>
            ) : costumeType === 'king' ? (
              // King Royal Crown
              <g>
                <path 
                  d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                  fill={`url(#duckYellow-${cand.id})`} 
                  stroke="#854d0e" 
                  strokeWidth="2.5" 
                />
                {/* Gold Crown */}
                <polygon points="44,12 44,2 50,7 57,0 64,7 70,2 70,12" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                <circle cx="44" cy="2" r="1.5" fill="#ef4444" />
                <circle cx="57" cy="0" r="1.5" fill="#3b82f6" />
                <circle cx="70" cy="2" r="1.5" fill="#10b981" />
              </g>
            ) : (
              // Default Classic Yellow Duck Body
              <path 
                d="M 86 50 C 98 56 100 70 82 76 C 54 82 34 76 26 58 C 24 44 38 40 48 44 C 52 30 40 15 54 10 C 68 5 74 20 68 34 C 80 40 86 44 86 50 Z" 
                fill={`url(#duckYellow-${cand.id})`} 
                stroke="#854d0e" 
                strokeWidth="2.5" 
              />
            )}

            {/* --- B. DUCK HEAD & BOBBING MOTION (Facing Right) --- */}
            <g className={isRacing ? 'animate-duck-head origin-[60px_24px]' : ''}>
              {/* Head Base Highlight */}
              <circle cx="58" cy="20" r="15" fill={`url(#duckHeadGrad-${cand.id})`} />

              {/* DUCK BEAK (Orange Bill Pointing to the RIGHT towards the Finish Goal) */}
              {isLeadWinner ? (
                // Open Quacking Beak for Winner (Quacking happily)
                <g>
                  <path d="M 68 16 L 94 18 C 96 21 88 25 70 24 Z" fill="url(#beakOrange)" stroke="#9a3412" strokeWidth="1.5" />
                  <path d="M 70 26 L 90 30 C 88 33 80 33 68 30 Z" fill="url(#beakOrange)" stroke="#9a3412" strokeWidth="1.5" />
                  <polygon points="72,23 88,25 72,28" fill="#7c2d12" />
                </g>
              ) : (
                // Standard Right-Pointing Bill with smiling contour
                <g>
                  <path d="M 68 18 L 92 22 C 94 26 88 30 70 28 Z" fill="url(#beakOrange)" stroke="#9a3412" strokeWidth="1.5" />
                  <path d="M 72 24 C 82 24 84 23 88 23" stroke="#7c2d12" strokeWidth="1" fill="none" />
                  <circle cx="74" cy="20" r="0.8" fill="#7c2d12" /> {/* Nostril */}
                </g>
              )}

              {/* DUCK EYE (Big expressive eye with shiny reflection) */}
              {costumeType !== 'spa_cucumber' && costumeType !== 'pirate' && (
                <g>
                  <circle cx="58" cy="18" r="4.5" fill="#0f172a" />
                  <circle cx="60" cy="16" r="1.6" fill="#ffffff" />
                </g>
              )}
            </g>

            {/* --- C. DUCK WING & WHITE NUMBER BADGE (Centered) --- */}
            {/* Wing with layered feather contour */}
            <path d="M 66 50 C 78 54 76 68 56 66 C 42 64 38 54 50 50 Z" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.5" />
            
            {/* White Rounded Number Badge on Duck Wing */}
            <rect x="48" y="52" width="22" height="14" rx="7" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
            <text x="59" y="63" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#000000">
              {laneNumber}
            </text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={arenaContainerRef}
      className={`w-full bg-slate-900 overflow-hidden shadow-2xl text-slate-900 flex flex-col font-sans select-none transition-all duration-200 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none border-0 h-screen w-screen max-w-none' 
          : 'rounded-3xl border-4 border-slate-800'
      }`}
    >
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER / CONTROL TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between border-b-2 border-emerald-700 text-white z-20">
        
        {/* Left: Tools & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onBackToArena && (
            <button
              onClick={onBackToArena}
              className="p-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
              title="ត្រឡប់ទៅសង្វៀនប្រណាំងចម្រុះ (Arena)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">សង្វៀនចម្រុះ</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-white font-bold cursor-pointer transition-all shadow-xs"
            title="ការកំណត់ (Settings)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Sound / Music Toggle */}
          <button
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (nextMute) soundManager.stopBGM();
              else if (isRacing) soundManager.startBGM('duck', 130);
            }}
            className={`p-2 rounded-xl font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1 ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
            title={isMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bell / Whistle sound indicator */}
          <button
            onClick={() => {
              setIsBellEnabled(!isBellEnabled);
              soundManager.playRaceWhistle();
            }}
            className={`p-2 rounded-xl font-bold cursor-pointer transition-all shadow-xs ${
              isBellEnabled ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'bg-emerald-900/50 text-emerald-300'
            }`}
            title="សាកល្បងផ្លុំកញ្ចែ (Referee Whistle)"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Shuffle Characters */}
          <button
            onClick={handleShuffle}
            disabled={isRacing}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs active:scale-95"
            title="ច្របល់លំដាប់កូនទា"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Shuffle</span>
          </button>
        </div>

        {/* Center/Right: Title & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦆</span>
            <h2 className="text-sm sm:text-base font-bold font-moul tracking-wide text-white drop-shadow-xs hidden md:inline">
              ប្រណាំងទាហែលទឹក (Duck Race)
            </h2>
          </div>

          {/* Game Mode Switcher Pills: Classroom vs 2-Player Duel */}
          <div className="flex items-center bg-emerald-900/60 p-1 rounded-xl border border-emerald-500/50 shadow-inner">
            <button
              onClick={() => {
                if (isRacing) return;
                setGameMode('classroom');
                setWinner(null);
                setRaceFinished(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                gameMode === 'classroom' 
                  ? 'bg-white text-slate-900 shadow-md' 
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ទាំងថ្នាក់ (Class)</span>
            </button>
            <button
              onClick={() => {
                if (isRacing) return;
                setGameMode('duel_2p');
                setWinner(null);
                setRaceFinished(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                gameMode === 'duel_2p' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>ប្រកួត ២ នាក់ (1v1)</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Dedicated 2-Player Turn-based Setup Button */}
          <button
            onClick={handleOpenTwoPlayerSetup}
            disabled={isRacing}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
            title="រៀបចំការប្រកួត ២ នាក់ (Turn-based 2-Player Setup)"
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-moul hidden sm:inline">Setup (២ នាក់)</span>
          </button>

          {/* Trophy Podium button */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 transition-all"
            title="តារាងជ័យលាភី (Leaderboard & Winners)"
          >
            <Trophy className="w-4 h-4 text-amber-300 fill-amber-400" />
            <span className="text-xs font-bold hidden sm:inline">{winnerHistory.length}</span>
          </button>

          {/* Dedicated Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all ${
              isFullscreen 
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-400/30' 
                : 'bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-500/50'
            }`}
            title={isFullscreen ? 'ចេញពីពេញអេក្រង់ (Exit Fullscreen - Esc)' : 'ចុចដើម្បីបង្ហាញពេញអេក្រង់ (Click to Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-950" /> : <Maximize2 className="w-4 h-4 text-amber-300" />}
            <span className="font-moul text-[11px] sm:text-xs">
              {isFullscreen ? 'បង្រួម' : 'ពេញអេក្រង់'}
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE MAIN ARENA CANVAS (SKY, RIVERBANK, FLOWING RIVER & FINISH LINE) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative w-full overflow-hidden bg-sky-300 min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
        
        {/* --- A. SKY, SUN & CLOUDS --- */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 pointer-events-none">
          {/* Golden Sun in top left corner */}
          <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-yellow-300 border-4 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.8)]">
            <div className="absolute inset-0 rounded-full bg-yellow-200 animate-ping opacity-25"></div>
          </div>

          {/* Fluffy White Clouds */}
          <div className="absolute top-3 right-12 opacity-85">
            <div className="w-24 h-9 bg-white rounded-full shadow-xs relative">
              <div className="absolute -top-4 left-4 w-12 h-12 bg-white rounded-full"></div>
              <div className="absolute -top-2 right-4 w-10 h-10 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="absolute top-6 left-36 opacity-70">
            <div className="w-20 h-7 bg-white rounded-full shadow-xs relative">
              <div className="absolute -top-3 left-3 w-9 h-9 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* --- B. GREEN GRASSY RIVERBANK & MUD SHORELINE --- */}
        <div className="relative z-10 w-full pt-1 sm:pt-2">
          {/* Green Grass Bank */}
          <div className="w-full h-12 sm:h-14 bg-gradient-to-b from-emerald-500 to-green-600 relative border-b-4 border-amber-900 shadow-inner flex items-center justify-between px-6">
            {/* Bushes on Riverbank */}
            <div className="flex items-center gap-10 opacity-70">
              <span className="text-xl">🌳</span>
              <span className="text-lg">🌿</span>
              <span className="text-xl">🌳</span>
            </div>
            <div className="flex items-center gap-8 opacity-70">
              <span className="text-lg">🌿</span>
              <span className="text-xl">🌳</span>
              <span className="text-lg">🌿</span>
            </div>
          </div>
          {/* Muddy Shore Edge */}
          <div className="w-full h-2.5 bg-amber-900 border-b border-amber-950"></div>
        </div>

        {/* --- C. TOP CENTER: BIG DIGITAL LCD TIMER DISPLAY & KEYPAD --- */}
        <div className="relative z-20 flex flex-col items-center justify-center -mt-8 sm:-mt-10 px-3">
          
          {/* 1. BIG DIGITAL LCD TIMER BOX (Exact match to 00:20:00 style in Image 1 & 2) */}
          <div className="relative bg-indigo-50/95 border-4 border-slate-900 rounded-2xl sm:rounded-3xl px-6 sm:px-10 py-2 sm:py-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 sm:gap-6 min-w-[280px] sm:min-w-[420px]">
            {/* Clock Icon on Left */}
            <div className="text-slate-400 flex items-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            {/* Center: BIG DIGITAL DIGITS */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-wider drop-shadow-xs">
                {isRacing ? formatTime(remainingSeconds) : formatTime(targetSeconds)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest -mt-1">
                {isRacing ? 'កំពុងប្រណាំង (RACING)' : 'ម៉ោងកំណត់ (HH:MM:SS)'}
              </span>
            </div>

            {/* Alarm Bell on Right */}
            <div className="text-slate-400 flex flex-col items-center">
              <Bell className={`w-6 h-6 sm:w-8 sm:h-8 ${isRacing ? 'animate-bounce text-amber-500' : ''}`} />
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">HH:MM:SS</span>
            </div>

            {/* Quick Action Start / Clear next to timer */}
            <div className="absolute -right-24 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-1.5">
              {!isRacing ? (
                <button
                  onClick={handleStartRace}
                  disabled={activeCandidates.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={handleRaceAgain}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              )}
              <button
                onClick={() => handleKeypadPress('Clear')}
                disabled={isRacing}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>

          {/* 2. GREEN KEYPAD (5 6 7 8 9 Set / 0 1 2 3 4 Clear) - Shown before race */}
          {!isRacing && !raceFinished && (
            <div className="mt-3 flex flex-col items-center gap-1.5 bg-slate-900/60 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
              {/* Row 1: 5 6 7 8 9 Set */}
              <div className="flex items-center gap-1.5">
                {['5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="w-9 h-8 sm:w-12 sm:h-10 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm sm:text-base rounded-xl border-2 border-lime-700 shadow-md cursor-pointer transition-all active:scale-90 flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleKeypadPress('Set')}
                  className="px-3 sm:px-5 h-8 sm:h-10 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl border-2 border-lime-700 shadow-md cursor-pointer transition-all active:scale-90 flex items-center justify-center font-moul"
                >
                  Set
                </button>
              </div>

              {/* Row 2: 0 1 2 3 4 Clear */}
              <div className="flex items-center gap-1.5">
                {['0', '1', '2', '3', '4'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="w-9 h-8 sm:w-12 sm:h-10 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm sm:text-base rounded-xl border-2 border-lime-700 shadow-md cursor-pointer transition-all active:scale-90 flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleKeypadPress('Clear')}
                  className="px-3 sm:px-4 h-8 sm:h-10 bg-slate-400 hover:bg-slate-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl border-2 border-slate-600 shadow-md cursor-pointer transition-all active:scale-90 flex items-center justify-center"
                >
                  Clear
                </button>
              </div>

              {/* Quick Time Preset Pills */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
                {[
                  { label: '5s', val: 5 },
                  { label: '10s', val: 10 },
                  { label: '20s', val: 20 },
                  { label: '30s', val: 30 },
                  { label: '1mn', val: 60 },
                  { label: '2mn', val: 120 }
                ].map(p => (
                  <button
                    key={p.val}
                    onClick={() => handleQuickTime(p.val)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      targetSeconds === p.val 
                        ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-xs' 
                        : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. CENTER ACTION AREA: 2-Player Match Status or Classroom Tabs */}
          {!isRacing && !raceFinished && (
            <div className="mt-2.5 flex flex-col items-center gap-2 w-full max-w-xl px-2">
              {gameMode === 'duel_2p' ? (
                /* 2-Player Duel Matchup Banner */
                <div className="w-full bg-slate-950/85 backdrop-blur-md rounded-2xl border-2 border-amber-400/70 p-3 shadow-2xl flex flex-col items-center gap-2.5">
                  <div className="flex items-center justify-between w-full gap-2">
                    {/* Player 1 Card */}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-950 to-blue-900/80 border-2 border-blue-400/60 rounded-xl p-2 flex-1 shadow-md">
                      <div className="w-9 h-9 rounded-full bg-blue-500/30 border border-blue-300 flex items-center justify-center text-base shadow-inner">
                        🦆
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-blue-300 uppercase tracking-wider">🔵 កីឡាករ P1</span>
                          <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1 rounded-sm">{DUCK_COSTUMES.find(c => c.id === player1.costume)?.nameKh}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white truncate font-moul">{player1.name}</span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          {Array.from({ length: Math.min(5, player1.wins) }).map((_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                          <span className="text-[10px] text-amber-300 font-black">ឈ្នះ {player1.wins} ជុំ</span>
                        </div>
                      </div>
                    </div>

                    {/* VS Center Badge */}
                    <div className="flex flex-col items-center px-1 shrink-0">
                      <div className="flex items-center gap-1 text-amber-400 font-black text-sm sm:text-base font-moul drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                        <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
                        <span>VS</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700 whitespace-nowrap mt-0.5">
                        ជុំទី {duelCurrentRound} (Best of {duelMaxRounds})
                      </span>
                    </div>

                    {/* Player 2 Card */}
                    <div className="flex items-center gap-2 bg-gradient-to-l from-purple-950 to-purple-900/80 border-2 border-purple-400/60 rounded-xl p-2 flex-1 shadow-md justify-end">
                      <div className="flex flex-col text-right truncate flex-1">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1 rounded-sm">{DUCK_COSTUMES.find(c => c.id === player2.costume)?.nameKh}</span>
                          <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider">🟣 កីឡាករ P2</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white truncate font-moul">{player2.name}</span>
                        <div className="flex items-center justify-end gap-1 text-amber-400 text-xs">
                          {Array.from({ length: Math.min(5, player2.wins) }).map((_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                          <span className="text-[10px] text-amber-300 font-black">ឈ្នះ {player2.wins} ជុំ</span>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-purple-500/30 border border-purple-300 flex items-center justify-center text-base shadow-inner">
                        🦆
                      </div>
                    </div>
                  </div>

                  {/* Duel Action Buttons */}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap justify-center">
                    <button
                      onClick={handleOpenTwoPlayerSetup}
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 font-moul"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>កែប្រែឈ្មោះ & ម៉ូតទា (Race Setup)</span>
                    </button>
                    <button
                      onClick={handleResetDuelScore}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset ពិន្ទុ (0-0)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Classroom Tabs & Edit List Button */
                <>
                  <div className="flex items-center bg-white rounded-full p-1 border-2 border-black shadow-md">
                    <button
                      onClick={() => setDisplayMode('numbers')}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        displayMode === 'numbers' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Numbers
                    </button>
                    <button
                      onClick={() => setDisplayMode('names')}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        displayMode === 'names' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Names
                    </button>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setIsEditListOpen(true)}
                      className="px-8 sm:px-12 py-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm sm:text-base rounded-full border-2 border-black shadow-lg cursor-pointer transition-all active:scale-95 font-moul"
                    >
                      Edit List (កែសម្រួលបញ្ជីឈ្មោះ)
                    </button>
                    <span className="text-[11px] font-bold text-slate-900 bg-white/80 px-3 py-0.5 rounded-full border border-black/30 mt-1 shadow-xs">
                      Names in list: {activeCandidates.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- D. BLUE WATER RIVER RACETRACK (SWIMMING FROM LEFT START TO RIGHT FINISH GOAL) --- */}
        <div className="relative flex-1 w-full bg-gradient-to-b from-cyan-600 via-blue-600 to-sky-700 min-h-[310px] overflow-hidden flex flex-col justify-around py-3 px-2">
          
          {/* Ambient River Wave Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-around">
            <div className="w-full h-3 border-b-2 border-white/40"></div>
            <div className="w-full h-3 border-b-2 border-white/40"></div>
            <div className="w-full h-3 border-b-2 border-white/40"></div>
            <div className="w-full h-3 border-b-2 border-white/40"></div>
          </div>

          {/* TOP RACING LEADERBOARD / DISTANCE-TO-GOAL PROGRESS BAR HUD */}
          {isRacing && (
            <div className="absolute top-1.5 left-10 right-28 sm:right-36 z-30 pointer-events-none flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-400/40 shadow-lg animate-fadeIn">
              <span className="text-[10px] font-black text-amber-300 whitespace-nowrap flex items-center gap-1 font-moul">
                <Gauge className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>ចម្ងាយដល់គោលដៅ (Race Progress):</span>
              </span>

              {/* Progress Track with Duck Heads */}
              <div className="relative flex-1 h-3 bg-slate-800/90 rounded-full border border-cyan-500/30 overflow-visible flex items-center">
                {/* 25%, 50%, 75% tick marks */}
                <span className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white/20"></span>
                <span className="absolute left-2/4 top-0 bottom-0 w-[1px] bg-white/20"></span>
                <span className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-white/20"></span>

                {/* Markers for top ducks on the overall bar */}
                {activeCandidates.slice(0, 8).map((cand, idx) => {
                  const progressVal = Math.max(0, Math.min(100, duckPositions[cand.id] || 0));
                  const isLead = Math.max(...activeCandidates.map(c => duckPositions[c.id] || 0)) === progressVal;
                  return (
                    <div 
                      key={cand.id}
                      className="absolute -top-1 transform -translate-x-1/2 transition-all duration-150 ease-out z-20 flex flex-col items-center"
                      style={{ left: `${progressVal}%` }}
                    >
                      <span className={`text-[10px] leading-none select-none drop-shadow-md ${isLead ? 'scale-125 z-30' : 'opacity-80'}`}>
                        {isLead ? '👑' : '🦆'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Leader stats badge */}
              {(() => {
                const leadDuck = [...activeCandidates].sort((a, b) => (duckPositions[b.id] || 0) - (duckPositions[a.id] || 0))[0];
                const leadProgress = Math.round(duckPositions[leadDuck?.id] || 0);
                const distanceRemaining = Math.max(0, 100 - leadProgress);
                return (
                  <div className="flex items-center gap-1 text-[10px] font-black text-cyan-200 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-400/50 whitespace-nowrap">
                    <span>🏁 នៅសល់៖ {distanceRemaining}%</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 1. STARTING DOCK & BUOY POST ON THE FAR LEFT (ចំណុចចេញដំណើរ) */}
          <div className="absolute left-1 top-0 bottom-0 w-4 bg-amber-800/80 border-r-2 border-amber-950 z-10 flex flex-col justify-around items-center">
            <div className="absolute -top-1 left-0 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-md shadow-xs border border-emerald-400">
              START
            </div>
            {activeCandidates.slice(0, 8).map((_, idx) => (
              <span key={idx} className="text-[10px] font-bold text-amber-200 opacity-60">
                •
              </span>
            ))}
          </div>

          {/* 2. SLANTED CHECKERED FINISH LINE ON THE FAR RIGHT (គោលដៅនៅខាងស្តាំ) */}
          <div 
            className="absolute right-12 sm:right-20 top-0 bottom-0 w-8 z-10 pointer-events-none transform -skew-x-12 flex flex-col justify-around border-r-2 border-l-2 border-black shadow-xl"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, #000, #000 14px, #fff 14px, #fff 28px)`
            }}
          >
            {/* Top Finish Flag Marker */}
            <div className="absolute -top-4 -left-3 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md border border-black shadow-md whitespace-nowrap transform skew-x-12 flex items-center gap-1">
              <span>🏁</span>
              <span>FINISH / គោលដៅ</span>
            </div>

            {/* Lane Numbers marked in bold black italics on the goal line */}
            {activeCandidates.slice(0, 8).map((_, idx) => (
              <div 
                key={idx} 
                className="absolute text-slate-950 font-black text-2xl sm:text-3xl italic drop-shadow-md select-none transform skew-x-12"
                style={{
                  right: '-32px',
                  top: `${(idx / Math.max(1, activeCandidates.length - 1)) * 75 + 5}%`
                }}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          {/* 3. DUCK LANES (Swimming Ducks on Water from Left to Right) */}
          {activeCandidates.slice(0, 10).map((cand, idx) => {
            const laneNumber = idx + 1;
            const progress = isRacing ? (duckPositions[cand.id] || 0) : (raceFinished && winner?.id === cand.id ? 100 : 0);
            const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
            const remainingToFinish = Math.max(0, 100 - clampedProgress);
            const costume = gameMode === 'duel_2p'
              ? (cand.id === 'p1' ? player1.costume : player2.costume)
              : (candidateCostumes[cand.id] || DUCK_COSTUMES[idx % DUCK_COSTUMES.length].id);
            const isWinnerDuck = winner?.id === cand.id;
            const isDuel = gameMode === 'duel_2p';

            return (
              <div 
                key={cand.id}
                className={`relative w-full flex items-center border-b border-cyan-400/20 ${
                  isDuel ? 'h-20 sm:h-24 bg-cyan-900/10' : 'h-14 sm:h-16'
                }`}
              >
                {/* Lane Marker on Left */}
                {isDuel && (
                  <div className="absolute left-6 top-2 z-0 flex items-center gap-1.5 opacity-80 pointer-events-none">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      cand.id === 'p1' ? 'bg-blue-600/80 text-white border-blue-400' : 'bg-purple-600/80 text-white border-purple-400'
                    }`}>
                      {cand.id === 'p1' ? '🔵 LANE 1 (P1)' : '🟣 LANE 2 (P2)'}
                    </span>
                    <span className="text-xs font-bold text-white/70 truncate hidden sm:inline">
                      {cand.id === 'p1' ? `"${player1.motto}"` : `"${player2.motto}"`}
                    </span>
                  </div>
                )}

                {/* Subdued Lane Progress Track Bar (Shows exact path from start to finish line) */}
                <div className="absolute left-6 right-20 sm:right-28 bottom-1.5 h-1.5 bg-black/25 rounded-full overflow-hidden pointer-events-none z-0 border border-white/15">
                  <div 
                    className={`h-full transition-all duration-150 ease-out rounded-full ${
                      isWinnerDuck && raceFinished 
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-sm' 
                        : cand.id === 'p1'
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-300'
                        : cand.id === 'p2'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-300'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-300'
                    }`}
                    style={{ width: `${clampedProgress}%` }}
                  />
                </div>

                {/* Animated Duck Position swimming along the River from Left to Right */}
                <div 
                  className={`absolute transition-all duration-150 ease-linear z-20 ${
                    isWinnerDuck && raceFinished ? 'animate-winner-cruise z-40' : ''
                  }`}
                  style={
                    isWinnerDuck && raceFinished
                      ? undefined
                      : {
                          left: isRacing 
                            ? `calc(${progress * 0.84}% + 14px)` 
                            : raceFinished 
                            ? `calc(${Math.min(72, (duckPositions[cand.id] || (45 + (idx % 4) * 6)) * 0.78)}% + 14px)`
                            : `${12 + (idx % 3) * 10}px` // starting dock line on left
                        }
                  }
                >
                  {renderDuckCharacter(cand, laneNumber, costume, false, progress)}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- E. BOTTOM LEFT COSTUME SELECTOR CARD (From Image 1) --- */}
        {!isRacing && (
          <div className="absolute bottom-3 left-4 z-30 hidden sm:block">
            <div className="bg-white p-2.5 rounded-2xl border-2 border-black shadow-xl flex flex-col items-center w-36">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 font-moul">
                Colors & Costumes
              </span>
              
              {/* Costume Preview Carousel */}
              <div className="relative flex items-center justify-center my-1">
                <button
                  onClick={() => setCostumeCarouselIndex((costumeCarouselIndex - 1 + DUCK_COSTUMES.length) % DUCK_COSTUMES.length)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="w-16 h-14 flex items-center justify-center">
                  {renderDuckCharacter(
                    { id: 'preview', name: '', color: DUCK_COSTUMES[costumeCarouselIndex].color, eliminated: false, score: 0 },
                    costumeCarouselIndex + 1,
                    DUCK_COSTUMES[costumeCarouselIndex].id,
                    true
                  )}
                </div>

                <button
                  onClick={() => setCostumeCarouselIndex((costumeCarouselIndex + 1) % DUCK_COSTUMES.length)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dots indicator ⚪⚪⚪ */}
              <div className="flex items-center gap-1 my-1">
                {DUCK_COSTUMES.slice(0, 5).map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full ${costumeCarouselIndex === idx ? 'bg-slate-900' : 'bg-slate-300'}`}
                  />
                ))}
              </div>

              <span className="text-[9px] font-bold text-slate-600 text-center truncate w-full">
                {DUCK_COSTUMES[costumeCarouselIndex].nameKh}
              </span>
            </div>
          </div>
        )}

        {/* --- F. WINNER BANNER & "RACE AGAIN?" CARD --- */}
        {raceFinished && winner && (
          <div className="absolute top-4 left-4 z-40 bg-white p-3.5 rounded-2xl border-4 border-black shadow-2xl max-w-xs animate-fadeIn space-y-2.5">
            {gameMode === 'duel_2p' ? (
              /* 2-Player Duel Winner Banner */
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-2xl">👑</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {duelMatchWinner ? '🏆 ម្ចាស់ជើងឯក (CHAMPION)' : `ជុំទី ${duelCurrentRound} / ${duelMaxRounds}`}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-moul leading-tight">
                      «{winner.name}» ឈ្នះ!
                    </h4>
                  </div>
                </div>

                {/* Score Status */}
                <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-around text-xs font-bold border border-slate-300">
                  <div className={`flex flex-col items-center ${winner.id === 'p1' ? 'text-blue-700 font-black' : 'text-slate-600'}`}>
                    <span className="text-[10px]">🔵 {player1.name}</span>
                    <span className="text-base font-black">{player1.wins} ឈ្នះ</span>
                  </div>
                  <span className="text-slate-400 font-black">VS</span>
                  <div className={`flex flex-col items-center ${winner.id === 'p2' ? 'text-purple-700 font-black' : 'text-slate-600'}`}>
                    <span className="text-[10px]">🟣 {player2.name}</span>
                    <span className="text-base font-black">{player2.wins} ឈ្នះ</span>
                  </div>
                </div>

                {duelMatchWinner ? (
                  <div className="bg-amber-100 border border-amber-300 rounded-xl p-2 text-center text-xs font-bold text-amber-900 animate-pulse">
                    🎉 «{duelMatchWinner === 'p1' ? player1.name : player2.name}» បានឈ្នះជើងឯកការប្រកួតទ្វេភាគី!
                  </div>
                ) : null}

                {/* Action Buttons */}
                {!duelMatchWinner ? (
                  <button
                    onClick={handleDuelNextRound}
                    className="w-full py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold font-moul text-xs sm:text-sm rounded-xl border-2 border-black shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ប្រណាំងជុំទី {duelCurrentRound + 1} ➡️</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetDuelScore}
                    className="w-full py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold font-moul text-xs sm:text-sm rounded-xl border-2 border-black shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>ប្រកួតស៊េរីថ្មីឡើងវិញ (Rematch)</span>
                  </button>
                )}

                <button
                  onClick={handleOpenTwoPlayerSetup}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>រៀបចំទា ឬប្តូរឈ្មោះកីឡាករ</span>
                </button>
              </div>
            ) : (
              /* Classroom Winner Banner */
              <>
                {/* Remove winner from next race checkbox */}
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={removeWinnerOnNext}
                    onChange={e => setRemoveWinnerOnNext(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span>Remove winner from next race?</span>
                </label>

                {/* Big Green "Race Again?" Button */}
                <button
                  onClick={handleRaceAgain}
                  className="w-full py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold font-moul text-sm rounded-xl border-2 border-black shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Race Again? (ប្រណាំងម្តងទៀត)</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* --- G. BIG CIRCULAR TROPHY BUTTON (Bottom Right - from Image 3) --- */}
        <button
          onClick={() => setIsLeaderboardOpen(true)}
          className="absolute bottom-4 right-4 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-black shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="តារាងជ័យលាភី & ពិន្ទុសិស្ស (Winners Podium)"
        >
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 fill-amber-400 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL: EDIT LIST (កែសម្រួលបញ្ជីឈ្មោះសិស្ស) */}
      {/* ------------------------------------------------------------- */}
      {isEditListOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-4 border-slate-900 space-y-4 max-h-[90vh] flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦆</span>
                <h3 className="text-base sm:text-lg font-bold font-moul text-slate-900">
                  កែសម្រួលបញ្ជីឈ្មោះកូនទា (Edit Duck List)
                </h3>
              </div>
              <button
                onClick={() => setIsEditListOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Single Candidate */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCandidate()}
                placeholder="វាយបញ្ចូលឈ្មោះសិស្សថ្មី..."
                className="flex-1 px-3.5 py-2 rounded-xl border-2 border-slate-300 text-xs font-bold focus:border-emerald-600 focus:outline-hidden"
              />
              <button
                onClick={handleAddCandidate}
                disabled={!newStudentName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែម</span>
              </button>
            </div>

            {/* Bulk Paste Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>ឬចម្លង & បិទភ្ជាប់បញ្ជីឈ្មោះ (១ ជួរ = ១ នាក់)៖</span>
                <span className="text-slate-400 font-normal">Bulk Import</span>
              </label>
              <textarea
                value={bulkListText}
                onChange={e => setBulkListText(e.target.value)}
                placeholder="សុខ វិបុល&#10;ជា ចាន់រ៉ា&#10;លី ស្រីនាង&#10;ខៀវ ពិសិដ្ឋ..."
                rows={4}
                className="w-full p-2.5 rounded-xl border-2 border-slate-300 text-xs font-mono focus:border-emerald-600 focus:outline-hidden"
              />
              {bulkListText.trim() && (
                <button
                  onClick={handleBulkImport}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  បញ្ចូលឈ្មោះទាំងអស់ខាងលើ
                </button>
              )}
            </div>

            {/* Current Candidates List */}
            <div className="flex-1 overflow-y-auto max-h-48 border rounded-2xl p-2 space-y-1.5 bg-slate-50">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold ${
                    cand.eliminated ? 'bg-slate-200 text-slate-400 line-through' : 'bg-white text-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{cand.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCandidates(prev => prev.map(c => 
                          c.id === cand.id ? { ...c, eliminated: !c.eliminated } : c
                        ));
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        cand.eliminated ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cand.eliminated ? 'ដាក់វិញ' : 'ដកចេញ'}
                    </button>
                    <button
                      onClick={() => {
                        setCandidates(prev => prev.filter(c => c.id !== cand.id));
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={handleResetAllCandidates}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                ដាក់ចូលទាំងអស់វិញ
              </button>
              <button
                onClick={() => setIsEditListOpen(false)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                រួចរាល់ (Save & Close)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL: LEADERBOARD & WINNER PODIUM */}
      {/* ------------------------------------------------------------- */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border-4 border-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
                <h3 className="text-base sm:text-lg font-bold font-moul text-slate-900">
                  តារាងជ័យលាភីប្រណាំងទា (Leaderboard)
                </h3>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {winnerHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <p>មិនទាន់មានប្រវត្តិអ្នកឈ្នះនៅឡើយទេ!</p>
                <p className="mt-1">សូមចុច Start ដើម្បីចាប់ផ្តើមការប្រណាំង</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {winnerHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border bg-amber-50 border-amber-200 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-900">{item.candidate.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                      {onAwardScore && (
                        <button
                          onClick={() => {
                            onAwardScore(item.candidate.id, item.candidate.name, 50);
                            showToast(`🏆 បានផ្តល់ ៥០ ពិន្ទុដល់ «${item.candidate.name}»!`);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          +50 ពិន្ទុ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsLeaderboardOpen(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL: TURN-BASED 2-PLAYER 'RACE SETUP' (រៀបចំការប្រកួត ២ នាក់) */}
      {/* ------------------------------------------------------------- */}
      {isTwoPlayerSetupOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border-4 border-amber-400 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏁</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-moul text-amber-400">
                    រៀបចំការប្រកួត ២ នាក់ (Turn-Based Race Setup)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ចុះឈ្មោះកូនទា និងជ្រើសរើសម៉ូតតាមវេនរៀងៗខ្លួន
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTwoPlayerSetupOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <button
                onClick={() => setSetupStep(1)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  setupStep === 1 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/40' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px]">1</span>
                <span className="truncate font-moul text-[11px]">វេនទី ១ (P1)</span>
              </button>

              <button
                onClick={() => setSetupStep(2)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  setupStep === 2 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/40' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px]">2</span>
                <span className="truncate font-moul text-[11px]">វេនទី ២ (P2)</span>
              </button>

              <button
                onClick={() => setSetupStep(3)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  setupStep === 3 
                    ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg ring-2 ring-amber-300/40 font-black' 
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px]">3</span>
                <span className="truncate font-moul text-[11px]">ផ្ទៀងផ្ទាត់ (VS)</span>
              </button>
            </div>

            {/* --- STEP 1: PLAYER 1 TURN --- */}
            {setupStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-blue-950/60 border-2 border-blue-500/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-xl shadow-md">
                    🔵
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold font-moul text-blue-300">
                      វេនកីឡាករទី ១៖ ចុះឈ្មោះ និងជ្រើសរើសកូនទា
                    </h4>
                    <p className="text-xs text-blue-200/80">
                      សូមបញ្ចូលឈ្មោះទារបស់អ្នក និងម៉ូតសំលៀកបំពាក់
                    </p>
                  </div>
                </div>

                {/* Duck Preview & Name input */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Live SVG Duck Bobbing Preview */}
                  <div className="bg-slate-800/90 rounded-2xl p-4 border border-blue-500/40 flex flex-col items-center justify-center min-h-[140px] shadow-inner">
                    <div className="animate-bounce">
                      {renderDuckCharacter(
                        { id: 'p1_prev', name: player1.name, color: DUCK_COSTUMES.find(c => c.id === player1.costume)?.color || '#facc15', eliminated: false, score: 0 },
                        1,
                        player1.costume,
                        true
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-blue-300 mt-2 font-moul truncate">
                      {player1.name || 'ទាទី ១'}
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      "{player1.motto || 'ហែលលឿនដូចផ្លេកបន្ទោរ'}"
                    </span>
                  </div>

                  {/* Name & Preset Chips */}
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ឈ្មោះកូនទា (Duck Name)៖
                      </label>
                      <input
                        type="text"
                        value={player1.name}
                        onChange={e => setPlayer1(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="វាយបញ្ចូលឈ្មោះទាទី ១..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-blue-500/50 text-white font-bold text-sm focus:border-blue-400 focus:outline-hidden"
                      />
                    </div>

                    {/* Quick Preset Name Chips */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">ឈ្មោះពេញនិយម (Presets)៖</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          '⚡ ទាផ្លេកបន្ទោរ',
                          '🔥 ទាអគ្គី',
                          '👑 ទាអធិរាជ',
                          '🚀 ទារ៉ុក្កែត',
                          'សុខ វិបុល'
                        ].map(preset => (
                          <button
                            key={preset}
                            onClick={() => {
                              setPlayer1(prev => ({ ...prev, name: preset }));
                              soundManager.playQuack('soft');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-500 rounded-lg text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slogan Motto Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ពាក្យស្លោកលើកទឹកចិត្ត (Cheer Motto)៖
                      </label>
                      <input
                        type="text"
                        value={player1.motto}
                        onChange={e => setPlayer1(prev => ({ ...prev, motto: e.target.value }))}
                        placeholder="ពាក្យស្លោក..."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-blue-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Costume Selection Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    ជ្រើសរើសម៉ូតទា (Duck Outfit & Theme)៖
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DUCK_COSTUMES.map(costume => (
                      <button
                        key={costume.id}
                        onClick={() => {
                          setPlayer1(prev => ({ ...prev, costume: costume.id }));
                          soundManager.playQuack('soft');
                        }}
                        className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          player1.costume === costume.id
                            ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/40 shadow-md'
                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-10 h-9 flex items-center justify-center">
                          {renderDuckCharacter(
                            { id: `c_p1_${costume.id}`, name: '', color: costume.color, eliminated: false, score: 0 },
                            1,
                            costume.id,
                            true
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-white truncate w-full text-center">
                          {costume.nameKh}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Turn Button */}
                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      if (!player1.name.trim()) {
                        setPlayer1(prev => ({ ...prev, name: 'ទាជើងខ្លាំង P1' }));
                      }
                      soundManager.playQuack('soft');
                      setSetupStep(2);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-2 font-moul"
                  >
                    <span>រក្សាទុកទាទី ១ ➡️ ប្តូរវេនទៅអ្នកលេងទី ២</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: PLAYER 2 TURN --- */}
            {setupStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-purple-950/60 border-2 border-purple-500/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-xl shadow-md">
                    🟣
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold font-moul text-purple-300">
                      វេនកីឡាករទី ២៖ ចុះឈ្មោះ និងជ្រើសរើសកូនទា
                    </h4>
                    <p className="text-xs text-purple-200/80">
                      សូមបញ្ចូលឈ្មោះទារបស់អ្នក និងម៉ូតសំលៀកបំពាក់
                    </p>
                  </div>
                </div>

                {/* Duck Preview & Name input */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Live SVG Duck Bobbing Preview */}
                  <div className="bg-slate-800/90 rounded-2xl p-4 border border-purple-500/40 flex flex-col items-center justify-center min-h-[140px] shadow-inner">
                    <div className="animate-bounce">
                      {renderDuckCharacter(
                        { id: 'p2_prev', name: player2.name, color: DUCK_COSTUMES.find(c => c.id === player2.costume)?.color || '#f97316', eliminated: false, score: 0 },
                        2,
                        player2.costume,
                        true
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-purple-300 mt-2 font-moul truncate">
                      {player2.name || 'ទាទី ២'}
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      "{player2.motto || 'មិនខ្លាចគូប្រកួត'}"
                    </span>
                  </div>

                  {/* Name & Preset Chips */}
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ឈ្មោះកូនទា (Duck Name)៖
                      </label>
                      <input
                        type="text"
                        value={player2.name}
                        onChange={e => setPlayer2(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="វាយបញ្ចូលឈ្មោះទាទី ២..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-2 border-purple-500/50 text-white font-bold text-sm focus:border-purple-400 focus:outline-hidden"
                      />
                    </div>

                    {/* Quick Preset Name Chips */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">ឈ្មោះពេញនិយម (Presets)៖</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          '🍀 ទាសំណាង',
                          '🌊 ទារលកយក្ស',
                          '🎯 ទាព្រួញទិព្វ',
                          '💎 ទាត្បូងពេជ្រ',
                          'ជា ចាន់រ៉ា'
                        ].map(preset => (
                          <button
                            key={preset}
                            onClick={() => {
                              setPlayer2(prev => ({ ...prev, name: preset }));
                              soundManager.playQuack('soft');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500 rounded-lg text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slogan Motto Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ពាក្យស្លោកលើកទឹកចិត្ត (Cheer Motto)៖
                      </label>
                      <input
                        type="text"
                        value={player2.motto}
                        onChange={e => setPlayer2(prev => ({ ...prev, motto: e.target.value }))}
                        placeholder="ពាក្យស្លោក..."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-purple-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Costume Selection Grid */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    ជ្រើសរើសម៉ូតទា (Duck Outfit & Theme)៖
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DUCK_COSTUMES.map(costume => (
                      <button
                        key={costume.id}
                        onClick={() => {
                          setPlayer2(prev => ({ ...prev, costume: costume.id }));
                          soundManager.playQuack('soft');
                        }}
                        className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          player2.costume === costume.id
                            ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-400/40 shadow-md'
                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-10 h-9 flex items-center justify-center">
                          {renderDuckCharacter(
                            { id: `c_p2_${costume.id}`, name: '', color: costume.color, eliminated: false, score: 0 },
                            2,
                            costume.id,
                            true
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-white truncate w-full text-center">
                          {costume.nameKh}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSetupStep(1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>⬅️ កែប្រែទាទី ១</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!player2.name.trim()) {
                        setPlayer2(prev => ({ ...prev, name: 'ទាសំណាង P2' }));
                      }
                      soundManager.playQuack('soft');
                      setSetupStep(3);
                    }}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-2 font-moul"
                  >
                    <span>រក្សាទុកទាទី ២ ➡️ ផ្ទៀងផ្ទាត់ការប្រកួត</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: FACE-OFF & MATCH CONFIGURATION --- */}
            {setupStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* High-Energy VS Showdown Banner */}
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-purple-950 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-2xl">
                  <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
                    
                    {/* Player 1 Card */}
                    <div className="flex flex-col items-center text-center p-3 bg-blue-900/40 border border-blue-400/40 rounded-2xl shadow-inner">
                      <div className="w-14 h-12 flex items-center justify-center animate-pulse">
                        {renderDuckCharacter(
                          { id: 'p1_vs', name: '', color: DUCK_COSTUMES.find(c => c.id === player1.costume)?.color || '#facc15', eliminated: false, score: 0 },
                          1,
                          player1.costume,
                          true
                        )}
                      </div>
                      <span className="text-[10px] font-black text-blue-300 uppercase mt-1">🔵 កីឡាករទី ១</span>
                      <h4 className="text-xs sm:text-base font-bold font-moul text-white truncate max-w-full">
                        {player1.name || 'ទាជើងខ្លាំង P1'}
                      </h4>
                      <span className="text-[10px] text-slate-300 italic truncate max-w-full">
                        "{player1.motto}"
                      </span>
                    </div>

                    {/* VS Badge in Middle */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black font-moul text-base sm:text-lg flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.8)] border-2 border-white animate-bounce">
                        VS
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 mt-1 uppercase tracking-wider">
                        HEAD-TO-HEAD
                      </span>
                    </div>

                    {/* Player 2 Card */}
                    <div className="flex flex-col items-center text-center p-3 bg-purple-900/40 border border-purple-400/40 rounded-2xl shadow-inner">
                      <div className="w-14 h-12 flex items-center justify-center animate-pulse">
                        {renderDuckCharacter(
                          { id: 'p2_vs', name: '', color: DUCK_COSTUMES.find(c => c.id === player2.costume)?.color || '#f97316', eliminated: false, score: 0 },
                          2,
                          player2.costume,
                          true
                        )}
                      </div>
                      <span className="text-[10px] font-black text-purple-300 uppercase mt-1">🟣 កីឡាករទី ២</span>
                      <h4 className="text-xs sm:text-base font-bold font-moul text-white truncate max-w-full">
                        {player2.name || 'ទាសំណាង P2'}
                      </h4>
                      <span className="text-[10px] text-slate-300 italic truncate max-w-full">
                        "{player2.motto}"
                      </span>
                    </div>

                  </div>
                </div>

                {/* Match Format & Race Length Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Series Format */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 font-moul">
                      🏆 ចំនួនជុំប្រកួត (Match Series)៖
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: '1 ជុំ', desc: 'Single', val: 1 },
                        { label: '3 ជុំ', desc: 'Best of 3', val: 3 },
                        { label: '5 ជុំ', desc: 'Best of 5', val: 5 }
                      ].map(s => (
                        <button
                          key={s.val}
                          onClick={() => setDuelMaxRounds(s.val)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            duelMaxRounds === s.val
                              ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md'
                              : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span className="block text-xs font-bold">{s.label}</span>
                          <span className="text-[9px] opacity-80">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timer Duration */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 font-moul">
                      ⏱️ រយៈពេលប្រណាំង (Race Timer)៖
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: '5 វិនាទី', val: 5 },
                        { label: '10 វិនាទី', val: 10 },
                        { label: '20 វិនាទី', val: 20 }
                      ].map(t => (
                        <button
                          key={t.val}
                          onClick={() => handleQuickTime(t.val)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            targetSeconds === t.val
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-md'
                              : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span className="block text-xs font-bold">{t.label}</span>
                          <span className="text-[9px] opacity-80">{t.val}s</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Launch Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSetupStep(2)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>⬅️ កែប្រែឡើងវិញ</span>
                  </button>

                  <button
                    onClick={() => {
                      setGameMode('duel_2p');
                      setIsTwoPlayerSetupOpen(false);
                      handleResetDuelScore();
                      soundManager.playRaceWhistle();
                      showToast(`⚔️ ការប្រកួតទ្វេភាគីរវាង «${player1.name}» VS «${player2.name}» រួចរាល់ហើយ!`, 'success');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl cursor-pointer shadow-2xl active:scale-95 transition-all flex items-center gap-2 font-moul border-2 border-white"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>🚀 ចាប់ផ្តើមការប្រណាំង ២ នាក់ (Start Duel)</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
