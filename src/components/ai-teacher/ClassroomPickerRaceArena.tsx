import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Volume1,
  Music,
  Sliders,
  Users, 
  Trophy, 
  Plus, 
  Trash2, 
  Shuffle, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Settings, 
  History, 
  ChevronRight, 
  Bot, 
  Flame,
  Check,
  RefreshCw,
  Crown,
  Layers,
  Clock,
  Zap,
  Timer as TimerIcon,
  PartyPopper,
  Radio,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PickerGameMode, PickerCandidate, AICustomGameTheme, GameQuestionCard } from './types';
import { soundManager, BGMTheme } from '../../utils/gameSoundEffects';
import { useSchool } from '../../context/SchoolContext';
import { generateAIChatResponse } from '../../services/aiTeacherService';

// PRESET MODES (Horse race removed completely as requested)
const PRESET_MODES: {
  id: PickerGameMode;
  nameKh: string;
  desc: string;
  icon: string;
  runnerEmoji: string;
  trackType: 'wheel' | 'water' | 'road' | 'dirt' | 'sky' | 'coral' | 'space' | 'box' | 'ball' | 'custom';
  bgGradient: string;
  soundType: 'tick' | 'splash' | 'engine' | 'whoosh';
}[] = [
  { id: 'wheel', nameKh: 'បង្វិលកងសំណាង (Wheel)', desc: 'បង្វិលកងរំកិលតាមរូបវិទ្យា ចាប់ឈ្មោះសិស្សដោយចៃដន្យ', icon: '🎡', runnerEmoji: '🎯', trackType: 'wheel', bgGradient: 'from-amber-600 to-indigo-900', soundType: 'tick' },
  { id: 'duck_race', nameKh: 'ប្រណាំងទាហែលទឹក (Duck Race)', desc: 'កូនទាហែលទឹកលើផ្ទៃទឹករលកពិតៗ ឆ្ពោះទៅបន្ទាត់ព្រំដែន', icon: '🦆', runnerEmoji: '🦆', trackType: 'water', bgGradient: 'from-cyan-600 via-blue-600 to-indigo-950', soundType: 'splash' },
  { id: 'moto_race', nameKh: 'ប្រណាំងម៉ូតូ (Motorbike Race)', desc: 'ម៉ូតូស្ព័រប្រណាំងលើផ្លូវកៅស៊ូ និងកាត់ឧបសគ្គយ៉ាងរស់រវើក', icon: '🏍️', runnerEmoji: '🏍️', trackType: 'dirt', bgGradient: 'from-amber-900 via-orange-950 to-slate-900', soundType: 'engine' },
  { id: 'airplane_race', nameKh: 'ប្រណាំងយន្តហោះ (Jet Flight)', desc: 'យន្តហោះចម្បាំង Supersonic ហោះកាត់ពពកលើមេឃ', icon: '✈️', runnerEmoji: '✈️', trackType: 'sky', bgGradient: 'from-sky-600 via-indigo-700 to-blue-950', soundType: 'whoosh' },
  { id: 'car_race', nameKh: 'ប្រណាំងឡានស្ព័រ (Car Race)', desc: 'ឡានប្រណាំង Supercar លើផ្លូវកៅស៊ូ បើកភ្លើងនីត្រូ', icon: '🏎️', runnerEmoji: '🏎️', trackType: 'road', bgGradient: 'from-slate-900 via-zinc-800 to-red-950', soundType: 'engine' },
  { id: 'fish_race', nameKh: 'ប្រណាំងត្រីសមុទ្រ (Fish Swim)', desc: 'ត្រីហែលប្រណាំងគ្នាក្នុងបាតសមុទ្រផ្កាថ្ម ជាមួយពពុះទឹក', icon: '🐟', runnerEmoji: '🐠', trackType: 'coral', bgGradient: 'from-blue-600 via-teal-700 to-cyan-950', soundType: 'splash' },
  { id: 'rocket_race', nameKh: 'ប្រណាំងរ៉ុក្កែតអវកាស (Rocket Space)', desc: 'រ៉ុក្កែតហោះកាត់ផ្កាយក្នុងលំហអាកាស ទៅកាន់ភពព្រះចន្ទ', icon: '🚀', runnerEmoji: '🚀', trackType: 'space', bgGradient: 'from-indigo-950 via-purple-950 to-slate-950', soundType: 'whoosh' },
  { id: 'mystery_box', nameKh: 'ប្រអប់កាដូអាថ៌កំបាំង (Mystery Box)', desc: 'ប្រអប់កាដូញ័រ និងផ្ទុះបើកចេញឈ្មោះសិស្សសំណាង', icon: '🎁', runnerEmoji: '🎁', trackType: 'box', bgGradient: 'from-fuchsia-900 via-pink-900 to-purple-950', soundType: 'tick' },
  { id: 'lottery_ball', nameKh: 'ម៉ាស៊ីនគ្រាប់បាល់សំណាង (Lotto Balls)', desc: 'គ្រាប់បាល់វិលក្នុងបាល់កញ្ចក់ រមៀលចេញឈ្មោះអ្នកឈ្នះ', icon: '🎰', runnerEmoji: '🔮', trackType: 'ball', bgGradient: 'from-amber-700 via-orange-800 to-red-950', soundType: 'tick' },
  { id: 'custom_ai', nameKh: '🤖 ល្បែងបង្កើតតាម AI (AI Custom Theme)', desc: 'ឱ្យ AI បង្កើតទម្រង់ល្បែងប្រណាំង និងចាប់ឈ្មោះតាមការស្រមើស្រមៃ', icon: '✨', runnerEmoji: '🌟', trackType: 'custom', bgGradient: 'from-purple-900 via-blue-900 to-slate-950', soundType: 'whoosh' },
];

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#84cc16', '#e11d48', '#d97706', '#0284c7', '#9333ea'
];

interface Props {
  externalQuestions?: GameQuestionCard[];
  onAwardScoreToStudent?: (studentId: string, studentName: string, points: number) => void;
}

export const ClassroomPickerRaceArena: React.FC<Props> = ({ 
  externalQuestions = [],
  onAwardScoreToStudent 
}) => {
  const { students, showToast } = useSchool();

  // Settings & Mode
  const [activeMode, setActiveMode] = useState<PickerGameMode>('duck_race');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [eliminateOnWin, setEliminateOnWin] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState<boolean>(true);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState<boolean>(false);
  const [sfxVolume, setSfxVolume] = useState<number>(80);
  const [bgmVolume, setBgmVolume] = useState<number>(50);

  // RACE DURATION (SECONDS / MINUTES) CONTROLLER
  // 5s, 10s, 15s, 30s, 45s, 60s (1mn), 120s (2mn), 180s (3mn), 300s (5mn)
  const [raceDurationSeconds, setRaceDurationSeconds] = useState<number>(10);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number>(10);

  // Candidates List
  const [candidates, setCandidates] = useState<PickerCandidate[]>([]);
  const [newCandidateName, setNewCandidateName] = useState<string>('');
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [isBulkInputOpen, setIsBulkInputOpen] = useState<boolean>(false);

  // Game Engine State
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [winner, setWinner] = useState<PickerCandidate | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [runnerPositions, setRunnerPositions] = useState<{ [id: string]: number }>({});
  const [historyWinners, setHistoryWinners] = useState<{ candidate: PickerCandidate; mode: PickerGameMode; time: string }[]>([]);

  // Wheel specific state
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const wheelCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Arena Stage Ref & Fullscreen Handler
  const arenaStageRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !isFullscreen) {
      if (arenaStageRef.current?.requestFullscreen) {
        arenaStageRef.current.requestFullscreen().catch(() => {
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

  // Box / Lottery Ball specific state
  const [revealedBoxIndex, setRevealedBoxIndex] = useState<number | null>(null);

  // AI Custom Theme Generator State
  const [customThemePrompt, setCustomThemePrompt] = useState<string>('ប្រណាំងទូកងប្រពៃណីខ្មែរលើដងទន្លេសាប');
  const [isGeneratingTheme, setIsGeneratingTheme] = useState<boolean>(false);
  const [customTheme, setCustomTheme] = useState<AICustomGameTheme>({
    id: 'custom-1',
    themeNameKh: 'ប្រណាំងទូកងមហោស្រពទន្លេ',
    themeNameEn: 'Khmer Traditional Dragon Boat Race',
    description: 'កីឡាករទូកងប្រណាំងគ្នាយ៉ាងស្វិតស្វាញលើដងទន្លេសាប ក្រោមសម្រែកហ៊ោរអបអរ',
    characterEmoji: '🛶',
    runnerEmojis: ['🛶', '🚣', '⛵', '🌊', '🐉'],
    trackType: 'water',
    bgGradient: 'from-blue-900 via-indigo-950 to-cyan-900',
    soundType: 'splash',
    sampleQuestions: [
      'តើបុណ្យអុំទូកប្រព្រឹត្តទៅនៅខែណា?',
      'តើទូកងមានប្រភព និងប្រវត្តិមកពីសម័យណា?'
    ]
  });

  // Winner Challenge & AI Question Popup
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<{
    q: string;
    options: string[];
    correct: string;
    explanation: string;
  } | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  // Synchronize Sound Manager Settings
  useEffect(() => {
    soundManager.setMuted(isMuted);
    soundManager.setSfxVolume(sfxVolume / 100);
    soundManager.setBgmVolume(bgmVolume / 100);
  }, [isMuted, sfxVolume, bgmVolume]);

  // Clean up BGM on unmount or when changing mode
  useEffect(() => {
    return () => {
      soundManager.stopBGM();
    };
  }, []);

  // Load students into candidates on mount or filter change
  useEffect(() => {
    let list = students;
    if (selectedGradeFilter !== 'all') {
      const gNum = Number(selectedGradeFilter);
      list = students.filter(s => s.grade === gNum);
    }

    if (list.length > 0) {
      setCandidates(list.map((s, idx) => ({
        id: s.id,
        name: s.nameKhmer || `សិស្ស ${idx + 1}`,
        avatar: ['🦆', '🏍️', '🏎️', '✈️', '🐟', '🚀', '⭐', '🦁', '🐼', '🦊', '🐰', '🦄'][idx % 12],
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        grade: s.grade,
        eliminated: false,
        score: s.totalScore || 0
      })));
    } else {
      // Default sample candidates
      const samples = [
        'សុខ វិបុល', 'ជា ចាន់រ៉ា', 'លី ស្រីនាង', 'ខៀវ ពិសិដ្ឋ',
        'មាស សុភា', 'ហេង រតនា', 'ប៉ែន សុវណ្ណ', 'អ៊ុច ធីតា',
        'ចាន់ សុផល', 'ង៉ែត វណ្ណា', 'កែវ មករា', 'ស៊ុន កល្យាណ'
      ];
      setCandidates(samples.map((name, idx) => ({
        id: `c-${idx + 1}`,
        name,
        avatar: ['🦆', '🏍️', '🏎️', '✈️', '🐟', '🚀', '⭐', '🦁', '🐼', '🦊', '🐰', '🦄'][idx % 12],
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        eliminated: false,
        score: 0
      })));
    }
  }, [students, selectedGradeFilter]);

  // Active non-eliminated candidates
  const activeCandidates = candidates.filter(c => !c.eliminated);

  // -------------------------------------------------------------
  // DRAW CANVAS FOR SPINNING WHEEL
  // -------------------------------------------------------------
  useEffect(() => {
    if (activeMode !== 'wheel' || !wheelCanvasRef.current) return;
    const canvas = wheelCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    const count = activeCandidates.length;
    if (count === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px "Kantumruy Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('គ្មានបេក្ខជនក្នុងបញ្ជី', centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / count;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((wheelRotation * Math.PI) / 180);

    for (let i = 0; i < count; i++) {
      const angle = i * arcSize;
      const c = activeCandidates[i];

      // Wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arcSize);
      ctx.closePath();
      ctx.fillStyle = c.color || COLOR_PALETTE[i % COLOR_PALETTE.length];
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Text Label
      ctx.save();
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Kantumruy Pro", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      const displayName = c.name.length > 14 ? c.name.slice(0, 12) + '..' : c.name;
      ctx.fillText(`⭐ ${displayName}`, radius - 20, 5);
      ctx.restore();
    }

    // Center Hub circle
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px "Moul", serif';
    ctx.textAlign = 'center';
    ctx.fillText('ភ្នំពុំ', 0, 5);

    ctx.restore();
  }, [activeMode, activeCandidates, wheelRotation]);

  // Helper to map mode to BGM theme
  const getBgmThemeForMode = (mode: PickerGameMode): BGMTheme => {
    switch (mode) {
      case 'duck_race': return 'duck';
      case 'car_race': return 'car';
      case 'moto_race': return 'moto';
      case 'airplane_race': return 'airplane';
      case 'fish_race': return 'fish';
      case 'rocket_race': return 'space';
      case 'wheel': return 'wheel';
      case 'mystery_box':
      case 'lottery_ball': return 'quiz';
      default: return 'general';
    }
  };

  // -------------------------------------------------------------
  // START GAME / RACE TRIGGER (WITH CUSTOM DURATION & GRAPHICS)
  // -------------------------------------------------------------
  const handleStartPicker = () => {
    if (activeCandidates.length === 0) {
      showToast('⚠️ សូមបន្ថែម ឬជ្រើសរើសឈ្មោះសិស្សយ៉ាងហោច ១ នាក់!', 'error');
      return;
    }
    if (isRacing) return;

    setIsRacing(true);
    setWinner(null);
    setShowCelebrationModal(false);
    setRevealedBoxIndex(null);
    setRemainingTimeSeconds(raceDurationSeconds);

    const totalDurationMs = raceDurationSeconds * 1000;

    // 1. Trigger Race Starting Whistle
    soundManager.playRaceWhistle();

    // 2. Start Background Music Loop for this Game Mode
    if (isBgmEnabled && !isMuted) {
      const bgmTheme = getBgmThemeForMode(activeMode);
      soundManager.startBGM(bgmTheme, activeMode === 'car_race' || activeMode === 'moto_race' ? 140 : 128);
    }

    // 1. WHEEL MODE
    if (activeMode === 'wheel') {
      const spins = Math.max(4, Math.floor(raceDurationSeconds * 1.5));
      const randomExtra = Math.random() * 360;
      const targetDeg = wheelRotation + (spins * 360) + randomExtra;
      const duration = totalDurationMs;
      const startTime = performance.now();
      const initialRotation = wheelRotation;

      let lastTickDegree = initialRotation;

      const animateWheel = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic ease out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRot = initialRotation + (targetDeg - initialRotation) * easeOut;
        setWheelRotation(currentRot);

        const timeLeft = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        setRemainingTimeSeconds(timeLeft);

        // Sound tick check
        if (Math.abs(currentRot - lastTickDegree) > (360 / Math.max(activeCandidates.length, 6))) {
          soundManager.playTick();
          lastTickDegree = currentRot;
        }

        if (progress < 1) {
          requestAnimationFrame(animateWheel);
        } else {
          // Finished
          const normalized = (360 - (currentRot % 360)) % 360;
          const arcSize = 360 / activeCandidates.length;
          const winningIndex = Math.floor(normalized / arcSize) % activeCandidates.length;
          const chosen = activeCandidates[winningIndex];
          concludeWinner(chosen);
        }
      };

      requestAnimationFrame(animateWheel);
      return;
    }

    // 2. MYSTERY BOX MODE
    if (activeMode === 'mystery_box') {
      let tickCount = 0;
      const steps = Math.max(10, Math.floor(raceDurationSeconds * 4));
      const intervalMs = Math.floor(totalDurationMs / steps);
      
      const boxInterval = setInterval(() => {
        setRevealedBoxIndex(Math.floor(Math.random() * activeCandidates.length));
        soundManager.playTick();
        tickCount++;
        setRemainingTimeSeconds(prev => Math.max(0, prev - (intervalMs / 1000)));

        if (tickCount >= steps) {
          clearInterval(boxInterval);
          const chosen = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];
          setRevealedBoxIndex(activeCandidates.findIndex(c => c.id === chosen.id));
          concludeWinner(chosen);
        }
      }, intervalMs);
      return;
    }

    // 3. LOTTERY BALL MACHINE MODE
    if (activeMode === 'lottery_ball') {
      let ballTicks = 0;
      const steps = Math.max(12, Math.floor(raceDurationSeconds * 5));
      const intervalMs = Math.floor(totalDurationMs / steps);

      const ballInterval = setInterval(() => {
        soundManager.playTick();
        ballTicks++;
        setRemainingTimeSeconds(prev => Math.max(0, prev - (intervalMs / 1000)));

        if (ballTicks >= steps) {
          clearInterval(ballInterval);
          const chosen = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];
          concludeWinner(chosen);
        }
      }, intervalMs);
      return;
    }

    // 4. RACING MODES (Duck, Moto, Airplane, Car, Fish, Rocket, AI Custom)
    // Initialize runners at 0%
    const initialPos: { [id: string]: number } = {};
    activeCandidates.forEach(c => {
      initialPos[c.id] = 0;
    });
    setRunnerPositions(initialPos);

    // Pick target winner in advance to create dramatic finish
    const targetWinner = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];
    
    // Play appropriate sound loop
    const currentModeConfig = PRESET_MODES.find(m => m.id === activeMode);
    const soundType = activeMode === 'custom_ai' ? customTheme.soundType : (currentModeConfig?.soundType || 'engine');
    
    const startTime = performance.now();
    const updateTickIntervalMs = 120; // 120ms tick
    let tickCount = 0;

    const raceInterval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / totalDurationMs, 1);
      tickCount++;

      // Countdown display
      const timeLeft = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));
      setRemainingTimeSeconds(timeLeft);

      // Mode-specific audio sound effects
      if (activeMode === 'duck_race') {
        if (tickCount % 12 === 0) {
          soundManager.playQuack('soft');
        } else if (tickCount % 4 === 0) {
          soundManager.playGentlePaddle();
        }
      } else if (soundType === 'splash') {
        soundManager.playSplash();
      } else if (soundType === 'engine') {
        soundManager.playEngineRev(1.1);
      } else if (soundType === 'whoosh') {
        soundManager.playWhoosh();
      } else {
        soundManager.playTick();
      }

      setRunnerPositions(prev => {
        const next: { [id: string]: number } = { ...prev };
        
        activeCandidates.forEach(c => {
          const isTarget = c.id === targetWinner.id;
          // Calculate realistic speed curve: slow start, mid-race jockeying, fast finish
          const baseProgress = progressRatio * 90;
          const randomWobble = Math.sin(elapsed / 300 + parseInt(c.id.slice(-2) || '1', 10)) * 6;
          
          let targetProgress = baseProgress + randomWobble;
          if (isTarget) {
            // Target winner surges ahead near the end
            targetProgress += (progressRatio * 10);
            if (progressRatio >= 0.98) targetProgress = 100;
          } else {
            // Others stay behind max 95%
            targetProgress = Math.min(targetProgress, 92 + Math.random() * 4);
          }
          
          next[c.id] = Math.max(0, Math.min(100, targetProgress));
        });

        return next;
      });

      if (progressRatio >= 1) {
        clearInterval(raceInterval);
        setRunnerPositions(prev => ({
          ...prev,
          [targetWinner.id]: 100
        }));
        setTimeout(() => {
          concludeWinner(targetWinner);
        }, 300);
      }
    }, updateTickIntervalMs);
  };

  // Conclude Winner & Trigger Celebrations (Popup modal with Name)
  const concludeWinner = (winnerCandidate: PickerCandidate) => {
    // 1. Stop background music immediately
    soundManager.stopBGM();

    setIsRacing(false);
    setWinner(winnerCandidate);
    setShowCelebrationModal(true);

    // 2. Play Grand Victory Fanfare + Audience Cheer or Loud Quack celebration for duck race
    if (activeMode === 'duck_race') {
      soundManager.playVictoryDuckCelebration();
      setTimeout(() => {
        soundManager.playVictoryFanfare();
      }, 400);
    } else {
      soundManager.playVictoryFanfare();
    }

    // 3. Confetti explosion fireworks
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);

    // Add to history
    setHistoryWinners(prev => [
      {
        candidate: winnerCandidate,
        mode: activeMode,
        time: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev.slice(0, 19)
    ]);

    // Eliminate on win if enabled
    if (eliminateOnWin) {
      setCandidates(prev => prev.map(c => 
        c.id === winnerCandidate.id ? { ...c, eliminated: true } : c
      ));
      showToast(`🎯 សិស្ស «${winnerCandidate.name}» ត្រូវបានជ្រើសរើស និងដកចេញពីកងបង្វិល!`);
    } else {
      showToast(`🎉 អបអរសាទរ! សិស្ស «${winnerCandidate.name}» ត្រូវបានជ្រើសរើស!`);
    }
  };

  // Add Single Candidate
  const handleAddCandidate = () => {
    if (!newCandidateName.trim()) return;
    const newCand: PickerCandidate = {
      id: `custom-${Date.now()}`,
      name: newCandidateName.trim(),
      avatar: ['🦆', '🏍️', '🏎️', '✈️', '🐟', '🚀', '⭐', '🦁', '🐼', '🦊'][candidates.length % 10],
      color: COLOR_PALETTE[candidates.length % COLOR_PALETTE.length],
      eliminated: false,
      score: 0
    };
    setCandidates(prev => [...prev, newCand]);
    setNewCandidateName('');
    showToast(`✅ បានបន្ថែមសិស្ស៖ ${newCand.name}`);
  };

  // Bulk Add / Paste Names
  const handleBulkImport = () => {
    const lines = bulkInputText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newItems: PickerCandidate[] = lines.map((name, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      name,
      avatar: ['🦆', '🏍️', '🏎️', '✈️', '🐟', '🚀', '⭐', '🦁', '🐼', '🦊'][idx % 10],
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      eliminated: false,
      score: 0
    }));

    setCandidates(newItems);
    setIsBulkInputOpen(false);
    setBulkInputText('');
    showToast(`✅ បានដាក់បញ្ចូលឈ្មោះសិស្ស ${newItems.length} នាក់ជោគជ័យ!`);
  };

  // Reset all eliminated
  const handleResetEliminated = () => {
    setCandidates(prev => prev.map(c => ({ ...c, eliminated: false })));
    showToast('🔄 បានដាក់បញ្ចូលបេក្ខជនទាំងអស់ឡើងវិញរួចរាល់!');
  };

  // Shuffle List
  const handleShuffle = () => {
    setCandidates(prev => [...prev].sort(() => Math.random() - 0.5));
    showToast('🔀 បានច្របល់លំដាប់ឈ្មោះសិស្សរួចរាល់!');
  };

  // -------------------------------------------------------------
  // AI CUSTOM THEME GENERATOR
  // -------------------------------------------------------------
  const handleGenerateCustomTheme = async () => {
    if (!customThemePrompt.trim()) return;
    setIsGeneratingTheme(true);
    try {
      const promptText = `អ្នកជាអ្នកបង្កើតប្រធានបទល្បែងប្រណាំងឌីជីថលសម្រាប់កុមារ និងសិស្សបឋមសិក្សានៅកម្ពុជា។ 
សូមបង្កើត Theme ល្បែងប្រណាំងតាមការស្នើ៖ "${customThemePrompt}"។
សូមឆ្លើយតបជា JSON តែមួយគត់តាមទម្រង់នេះ៖
{
  "themeNameKh": "ឈ្មោះប្រធានបទជាភាសាខ្មែរ",
  "themeNameEn": "Theme Name in English",
  "description": "ការពិពណ៌នាខ្លី ២-៣ បន្ទាត់",
  "characterEmoji": "រូបតំណាង emoji មួយគត់ (ឧ. 🛶, 🐘, 🚲, 🐉)",
  "runnerEmojis": ["emoji1", "emoji2", "emoji3", "emoji4"],
  "trackType": "water|road|dirt|sky|space|coral",
  "bgGradient": "from-indigo-900 via-purple-950 to-slate-950",
  "soundType": "splash|engine|whoosh|tick",
  "sampleQuestions": [
    "សំណួរគំរូទី១?",
    "សំណួរគំរូទី២?"
  ]
}`;

      const res = await generateAIChatResponse(promptText);
      const jsonMatch = res.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setCustomTheme({
          id: `theme-${Date.now()}`,
          themeNameKh: parsed.themeNameKh || 'ប្រធានបទច្នៃប្រឌិត AI',
          themeNameEn: parsed.themeNameEn || 'AI Custom Theme',
          description: parsed.description || 'ល្បែងប្រណាំងដែលបង្កើតដោយ AI',
          characterEmoji: parsed.characterEmoji || '✨',
          runnerEmojis: parsed.runnerEmojis || ['🌟', '⚡', '🔥', '🚀'],
          trackType: parsed.trackType || 'water',
          bgGradient: parsed.bgGradient || 'from-indigo-900 via-purple-950 to-slate-950',
          soundType: parsed.soundType || 'splash',
          sampleQuestions: parsed.sampleQuestions || ['តើអ្វីជាគន្លឹះសំខាន់នៃមេរៀន?']
        });
        setActiveMode('custom_ai');
        showToast('🎨 AI បានបង្កើតទម្រង់ល្បែងប្រណាំងថ្មីជោគជ័យ!');
      }
    } catch {
      showToast('⚠️ បរាជ័យក្នុងការបង្កើតប្រធានបទតាម AI ប្រើប្រាស់គំរូជំនួស។', 'info');
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  // -------------------------------------------------------------
  // AI IMMEDIATE QUESTION GENERATION FOR WINNER
  // -------------------------------------------------------------
  const handleOpenWinnerQuestion = async () => {
    if (!winner) return;
    setIsQuestionModalOpen(true);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);

    // If external game questions available, pick one
    if (externalQuestions.length > 0) {
      const q = externalQuestions[Math.floor(Math.random() * externalQuestions.length)];
      setCurrentQuestion({
        q: q.question,
        options: q.options,
        correct: q.correctAnswer,
        explanation: q.explanation || 'សូមពិនិត្យមើលទ្រឹស្តីមេរៀនបន្ថែម។'
      });
      return;
    }

    // Else generate instant AI question
    setIsGeneratingQuestion(true);
    try {
      const promptText = `បង្កើតសំណួររហ័ស ១ សម្រាប់សិស្សបឋមសិក្សា (ថ្នាក់ទី${winner.grade || 5})៖
ចម្លើយត្រូវមាន ៤ ជម្រើស ក. ខ. គ. ឃ.។
សូមឆ្លើយតបជា JSON តែមួយគត់៖
{
  "q": "ខ្លឹមសារសំណួរ?",
  "options": ["ក. ...", "ខ. ...", "គ. ...", "ឃ. ..."],
  "correct": "ក. ...",
  "explanation": "ការពន្យល់ខ្លី"
}`;
      const res = await generateAIChatResponse(promptText);
      const match = res.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setCurrentQuestion({
          q: parsed.q,
          options: parsed.options,
          correct: parsed.correct,
          explanation: parsed.explanation
        });
      } else {
        setCurrentQuestion({
          q: `ចូរគណនា៖ ២៥ × ៤ = ?`,
          options: ['ក. ៨០', 'ខ. ៩០', 'គ. ១០០', 'ឃ. ១២០'],
          correct: 'គ. ១០០',
          explanation: '២៥ គុណ ៤ ស្មើនឹង ១០០។'
        });
      }
    } catch {
      setCurrentQuestion({
        q: `តើប្រទេសកម្ពុជាមានរាជធានីឈ្មោះអ្វី?`,
        options: ['ក. ខេត្តសៀមរាប', 'ខ. រាជធានីភ្នំពេញ', 'គ. ខេត្តបាត់ដំបង', 'ឃ. ខេត្តកំពត'],
        correct: 'ខ. រាជធានីភ្នំពេញ',
        explanation: 'រាជធានីភ្នំពេញ គឺជារាជធានីនៃព្រះរាជាណាចក្រកម្ពុជា។'
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleSelectQuizOption = (option: string) => {
    if (isAnswerChecked || !currentQuestion) return;
    setSelectedAnswer(option);
    setIsAnswerChecked(true);

    const isCorrect = option === currentQuestion.correct;
    if (isCorrect) {
      soundManager.playCorrect();
      confetti({ particleCount: 60, spread: 70 });
      showToast(`🌟 ត្រឹមត្រូវល្អណាស់! +100 ពិន្ទុសម្រាប់ «${winner?.name}»!`);
      if (winner && onAwardScoreToStudent) {
        onAwardScoreToStudent(winner.id, winner.name, 100);
      }
    } else {
      soundManager.playWrong();
      showToast(`❌ មិនទាន់ត្រឹមត្រូវទេ លើកទឹកចិត្តព្យាយាមម្តងទៀត!`, 'info');
    }
  };

  const currentModeInfo = PRESET_MODES.find(m => m.id === activeMode);

  // -------------------------------------------------------------
  // RENDER DETAILED REALISTIC SVG RACERS WITH NAMEPLATES
  // -------------------------------------------------------------
  const renderRealisticRacer = (cand: PickerCandidate, idx: number, progress: number) => {
    const isLead = progress > 70;

    // 1. DUCK RACE: Realistic Animated Swimming Duck with Speech Bubble Callout & Wing Number
    if (activeMode === 'duck_race') {
      const laneNum = idx + 1;
      return (
        <div className="flex items-center gap-2 group relative">
          {/* Student Speech Bubble Callout */}
          <div className="absolute -top-7 left-1 z-30 transition-all">
            <div className="relative bg-white text-slate-950 font-bold text-[11px] px-2 py-0.5 rounded-lg border-2 border-black shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>{cand.name}</span>
              <div className="absolute -bottom-1.5 left-3 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-black"></div>
              <div className="absolute -bottom-1 left-3 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-white"></div>
            </div>
          </div>

          {/* Water Wake Ripple Behind Duck */}
          {isRacing && (
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none">
              <div className="w-6 h-3 border border-cyan-200/80 rounded-full animate-water-wake"></div>
            </div>
          )}

          {/* Duck Sprite */}
          <div className="relative">
            <svg viewBox="0 0 100 80" className={`w-14 h-12 drop-shadow-lg transition-transform ${isRacing ? 'animate-duck-swim' : 'animate-duck-float'}`}>
              <defs>
                <linearGradient id={`duckGrad-${cand.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="beakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>

              {/* Water Splash & Waves */}
              <ellipse cx="45" cy="68" rx="35" ry="7" fill="rgba(255,255,255,0.4)" className="animate-pulse" />
              <path d="M 10 68 Q 25 60 40 68 T 70 68" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />

              {/* Duck Body */}
              <path d="M 25 45 C 15 50 15 65 35 68 C 65 72 80 62 82 48 C 84 38 72 35 60 38 C 55 25 70 12 55 8 C 42 5 38 18 42 30 C 32 35 25 40 25 45 Z" fill={`url(#duckGrad-${cand.id})`} stroke="#854d0e" strokeWidth="2" />

              {/* Duck Wing */}
              <path d="M 40 45 C 30 48 32 60 50 58 C 62 56 65 48 55 45 Z" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />

              {/* White Rounded Number Badge on Duck Wing */}
              <rect x="36" y="47" width="18" height="12" rx="6" fill="#ffffff" stroke="#000000" strokeWidth="1.2" />
              <text x="45" y="56" fontSize="8" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#000000">
                {laneNum}
              </text>

              {/* Duck Beak */}
              <path d="M 38 18 L 15 22 C 14 24 20 28 36 26 Z" fill="url(#beakGrad)" stroke="#c2410c" strokeWidth="1.5" />

              {/* Duck Eye */}
              <circle cx="48" cy="16" r="3.5" fill="#0f172a" />
              <circle cx="49" cy="15" r="1.2" fill="#ffffff" />
            </svg>
          </div>
        </div>
      );
    }

    // 2. MOTORBIKE RACE: Realistic Racing Motorcycle with Rider & Smoke Exhaust
    if (activeMode === 'moto_race') {
      const bikeColor = cand.color || '#f97316';
      return (
        <div className="flex items-center gap-2 group relative">
          <div className="relative">
            <svg viewBox="0 0 120 70" className={`w-16 h-10 drop-shadow-xl transition-transform ${isRacing ? 'rotate-[-2deg]' : ''}`}>
              <defs>
                <linearGradient id={`bikeGrad-${cand.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={bikeColor} />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Wheels */}
              <circle cx="25" cy="50" r="15" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
              <circle cx="25" cy="50" r="6" fill="#94a3b8" />
              <circle cx="95" cy="50" r="15" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
              <circle cx="95" cy="50" r="6" fill="#94a3b8" />

              {/* Frame & Engine */}
              <path d="M 25 50 L 55 45 L 80 50 L 95 50 L 70 30 L 45 32 Z" fill={`url(#bikeGrad-${cand.id})`} stroke="#0f172a" strokeWidth="2" />
              
              {/* Exhaust Smoke if racing */}
              {isRacing && (
                <path d="M 10 52 Q 0 48 2 40" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" className="animate-ping" />
              )}

              {/* Rider Helmet & Body */}
              <circle cx="55" cy="18" r="9" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
              <path d="M 52 18 L 63 18" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
              <path d="M 45 28 C 45 28 55 24 68 28 L 78 40 L 60 42 Z" fill="#0f172a" />
              <path d="M 65 28 L 80 34" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Student Nameplate Tag */}
          <div className="flex flex-col">
            <span className="px-2 py-0.5 rounded-lg bg-orange-500 text-white font-bold text-[10px] shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1 backdrop-blur-xs">
              <span>🏍️</span>
              <span>{cand.name}</span>
            </span>
          </div>
        </div>
      );
    }

    // 3. AIRPLANE RACE: Supersonic Fighter Jet with Cloud Trails
    if (activeMode === 'airplane_race') {
      return (
        <div className="flex items-center gap-2 group relative">
          <div className="relative">
            <svg viewBox="0 0 120 60" className={`w-16 h-9 drop-shadow-xl transition-transform ${isRacing ? 'rotate-1' : ''}`}>
              <defs>
                <linearGradient id={`jetGrad-${cand.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="70%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="fireTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>

              {/* Jet Thruster Flame */}
              <polygon points="5,30 25,25 25,35" fill="url(#fireTrail)" className={isRacing ? 'animate-pulse' : ''} />

              {/* Jet Wings & Fuselage */}
              <path d="M 25 30 L 45 12 L 65 30 L 115 30 L 75 48 L 50 30 Z" fill={`url(#jetGrad-${cand.id})`} stroke="#0c4a6e" strokeWidth="1.5" />
              <polygon points="30,30 20,15 40,30" fill="#0369a1" />

              {/* Cockpit Window */}
              <ellipse cx="85" cy="30" rx="12" ry="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
            </svg>
          </div>

          {/* Student Nameplate Tag */}
          <div className="flex flex-col">
            <span className="px-2 py-0.5 rounded-lg bg-sky-500 text-white font-bold text-[10px] shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1 backdrop-blur-xs">
              <span>✈️</span>
              <span>{cand.name}</span>
            </span>
          </div>
        </div>
      );
    }

    // 4. CAR RACE: Realistic Supercar with Neon Lights
    if (activeMode === 'car_race') {
      const carColor = cand.color || '#ef4444';
      return (
        <div className="flex items-center gap-2 group relative">
          <div className="relative">
            <svg viewBox="0 0 120 50" className="w-16 h-8 drop-shadow-xl">
              {/* Wheels */}
              <circle cx="30" cy="38" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
              <circle cx="95" cy="38" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="3" />

              {/* Car Body */}
              <path d="M 10 35 L 20 22 L 45 15 L 85 15 L 110 26 L 118 36 L 10 36 Z" fill={carColor} stroke="#0f172a" strokeWidth="1.5" />
              {/* Windows */}
              <polygon points="48,17 80,17 75,25 45,25" fill="#bae6fd" />
              {/* Headlights */}
              <polygon points="112,28 118,30 118,34 112,32" fill="#fef08a" />
            </svg>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold text-[10px] shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1 backdrop-blur-xs">
            <span>🏎️</span>
            <span>{cand.name}</span>
          </span>
        </div>
      );
    }

    // 5. FISH RACE: Swimming Ocean Fish with Bubbles
    if (activeMode === 'fish_race') {
      return (
        <div className="flex items-center gap-2 group relative">
          <div className="relative">
            <svg viewBox="0 0 100 60" className={`w-14 h-9 drop-shadow-md ${isRacing ? 'animate-pulse' : ''}`}>
              <path d="M 85 30 C 70 10 30 10 15 30 C 30 50 70 50 85 30 Z" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.5" />
              <polygon points="15,30 0,15 0,45" fill="#0891b2" />
              <circle cx="70" cy="25" r="3" fill="#0f172a" />
              <circle cx="71" cy="24" r="1" fill="#ffffff" />
            </svg>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-cyan-600 text-white font-bold text-[10px] shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1 backdrop-blur-xs">
            <span>🐟</span>
            <span>{cand.name}</span>
          </span>
        </div>
      );
    }

    // 6. ROCKET RACE: Galaxy Space Rocket
    if (activeMode === 'rocket_race') {
      return (
        <div className="flex items-center gap-2 group relative">
          <div className="relative">
            <svg viewBox="0 0 110 50" className="w-16 h-8 drop-shadow-xl">
              <polygon points="5,25 20,20 20,30" fill="#f59e0b" className={isRacing ? 'animate-ping' : ''} />
              <path d="M 20 25 L 40 15 L 80 15 L 105 25 L 80 35 L 40 35 Z" fill="#8b5cf6" stroke="#4c1d95" strokeWidth="1.5" />
              <circle cx="65" cy="25" r="5" fill="#bae6fd" />
            </svg>
          </div>

          <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white font-bold text-[10px] shadow-md border border-white/30 whitespace-nowrap flex items-center gap-1 backdrop-blur-xs">
            <span>🚀</span>
            <span>{cand.name}</span>
          </span>
        </div>
      );
    }

    // Default / AI Custom Theme
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl drop-shadow-md">{activeMode === 'custom_ai' ? customTheme.characterEmoji : (cand.avatar || '⭐')}</span>
        <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white font-bold text-[10px] shadow-md border border-white/30 whitespace-nowrap">
          {cand.name}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SELECTION: GAME MODES & TIMERS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-moul text-blue-950 flex items-center gap-2">
              <span className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-xl shadow-xs text-sm">
                🎯
              </span>
              <span>ល្បែងចាប់ឈ្មោះសិស្ស & ប្រណាំងល្បែងសិក្សាឌីជីថល</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ជ្រើសរើសទម្រង់ល្បែងប្រណាំង ដូចជា ប្រណាំងទាហែលទឹក, ម៉ូតូស្ព័រ, យន្តហោះ, ឡាន, ត្រីសមុទ្រ ឬបង្វិលកងសំណាង!
            </p>
          </div>

          {/* Quick Settings Bar: Timer selector + Audio Toggle + Eliminate */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* RACE DURATION CONTROLLER (SECONDS / MINUTES) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-950 text-xs font-bold shadow-xs">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>កំណត់ពេល៖</span>
              <select
                value={raceDurationSeconds}
                disabled={isRacing}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRaceDurationSeconds(val);
                  setRemainingTimeSeconds(val);
                }}
                className="bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={5}>៥ វិនាទី (Fast ⚡)</option>
                <option value={10}>១០ វិនាទី (Standard 🎯)</option>
                <option value={15}>១៥ វិនាទី (Exciting 🏁)</option>
                <option value={30}>៣០ វិនាទី (Suspense 🔥)</option>
                <option value={60}>១ នាទី (1 Minute ⏱️)</option>
                <option value={120}>២ នាទី (2 Minutes ⏱️)</option>
                <option value={180}>៣ នាទី (3 Minutes ⏱️)</option>
                <option value={300}>៥ នាទី (5 Minutes ⏱️)</option>
              </select>
            </div>

            {/* Sound & Music Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {/* Audio Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isMuted 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-white text-slate-800 shadow-xs'
                }`}
                title={isMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                <span className="hidden sm:inline text-[11px]">{isMuted ? 'បិទសំឡេង' : 'សំឡេង SFX'}</span>
              </button>

              {/* BGM Music Loop Toggle */}
              <button
                onClick={() => {
                  const nextBgm = !isBgmEnabled;
                  setIsBgmEnabled(nextBgm);
                  if (!nextBgm) {
                    soundManager.stopBGM();
                  } else if (isRacing && !isMuted) {
                    soundManager.startBGM(getBgmThemeForMode(activeMode));
                  }
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isBgmEnabled && !isMuted
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-200/70 text-slate-500'
                }`}
                title="បើក/បិទ តន្ត្រីប្រណាំង BGM"
              >
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">តន្ត្រី BGM</span>
              </button>

              {/* Sound Studio Popover Button */}
              <button
                onClick={() => setIsSoundSettingsOpen(!isSoundSettingsOpen)}
                className="p-2 rounded-xl hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="កម្រិតសំឡេង & សាកល្បងសំឡេង (Sound Effects & Volume)"
              >
                <Sliders className="w-4 h-4 text-indigo-700" />
              </button>
            </div>

            {/* Eliminate toggle */}
            <button
              onClick={() => setEliminateOnWin(!eliminateOnWin)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                eliminateOnWin 
                  ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/20' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${eliminateOnWin ? 'text-amber-700' : 'text-slate-400'}`} />
              <span>ដកឈ្មោះក្រោយឈ្នះ</span>
            </button>

            {/* Top Toolbar Click to Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                isFullscreen 
                  ? 'bg-amber-400 border-amber-500 text-slate-950 ring-2 ring-amber-400/30' 
                  : 'bg-indigo-900 hover:bg-indigo-800 text-white border-indigo-700'
              }`}
              title={isFullscreen ? 'ចេញពីពេញអេក្រង់ (Exit Fullscreen - Esc)' : 'ចុចដើម្បីបង្ហាញពេញអេក្រង់ (Click to Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-slate-950" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-300" />}
              <span className="font-moul text-[11px] sm:text-xs">
                {isFullscreen ? 'បង្រួម' : 'ពេញអេក្រង់'}
              </span>
            </button>
          </div>
        </div>

        {/* Sound Studio / Volume & Test Sound Panel (Collapsible) */}
        {isSoundSettingsOpen && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white shadow-md border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold font-moul text-amber-300">
                  ប្រព័ន្ធគ្រប់គ្រងសំឡេងឌីជីថល (Audio Studio & Fanfares)
                </h4>
              </div>
              <button
                onClick={() => setIsSoundSettingsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* SFX Volume */}
              <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between font-bold">
                  <span className="flex items-center gap-1 text-slate-200">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>កម្រិតសំឡេង SFX</span>
                  </span>
                  <span className="text-cyan-300">{sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={e => setSfxVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* BGM Volume */}
              <div className="space-y-1.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between font-bold">
                  <span className="flex items-center gap-1 text-slate-200">
                    <Music className="w-3.5 h-3.5 text-purple-400" />
                    <span>កម្រិតតន្ត្រី BGM</span>
                  </span>
                  <span className="text-purple-300">{bgmVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgmVolume}
                  onChange={e => setBgmVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Sound Effect Test Triggers */}
              <div className="sm:col-span-2 flex items-center gap-2 flex-wrap bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[11px] font-bold text-amber-300 w-full mb-0.5">សាកល្បងសំឡេងប្រណាំង (Live Test)：</span>
                <button
                  onClick={() => soundManager.playRaceWhistle()}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>📢</span>
                  <span>ផ្លុំកញ្ចែ (Whistle)</span>
                </button>
                <button
                  onClick={() => soundManager.playVictoryFanfare()}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>🎺</span>
                  <span>ភ្លេងជ័យជម្នះ (Fanfare)</span>
                </button>
                <button
                  onClick={() => soundManager.playQuack()}
                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>🦆</span>
                  <span>សំឡេងទា (Quack)</span>
                </button>
                <button
                  onClick={() => soundManager.playEngineRev(1.3)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <span>🏎️</span>
                  <span>សំឡេងឡាន (Engine)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10 Game Modes Grid (Horse race removed completely) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {PRESET_MODES.map(mode => {
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id);
                  setWinner(null);
                  setShowCelebrationModal(false);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-800 bg-blue-50/90 ring-2 ring-blue-800/20 shadow-xs scale-[1.02]'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{mode.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-800 animate-ping"></span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{mode.nameKh}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{mode.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Custom Theme Creator Input Bar */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs shrink-0">
            <Bot className="w-4 h-4 text-purple-600" />
            <span>បង្កើតទម្រង់ល្បែង AI ថ្មីៗ៖</span>
          </div>
          <input
            type="text"
            value={customThemePrompt}
            onChange={e => setCustomThemePrompt(e.target.value)}
            placeholder="ឧ. ប្រណាំងទូកងប្រពៃណីខ្មែរ, ប្រណាំងដំរីនៅអង្គរ, ប្រណាំងកង់ភ្នំ, ស្វាលោតបេះចេក..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <button
            onClick={handleGenerateCustomTheme}
            disabled={isGeneratingTheme || !customThemePrompt.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingTheme ? 'animate-spin' : ''}`} />
            <span>{isGeneratingTheme ? 'AI កំពុងរៀបចំ...' : '✨ បង្កើតល្បែងនេះដោយ AI'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN STAGE / INTERACTIVE ARENA */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: The Main Game Stage */}
        <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6 bg-slate-950/95 overflow-y-auto' : 'lg:col-span-2'}`}>
          <div 
            ref={arenaStageRef}
            className={`p-5 sm:p-7 text-white relative overflow-hidden shadow-xl bg-gradient-to-br ${
              activeMode === 'custom_ai' ? customTheme.bgGradient : (currentModeInfo?.bgGradient || 'from-indigo-950 to-blue-950')
            } border border-white/10 flex flex-col justify-between transition-all duration-200 ${
              isFullscreen 
                ? 'min-h-[85vh] rounded-2xl w-full max-w-7xl mx-auto shadow-2xl' 
                : 'min-h-[460px] rounded-3xl'
            }`}
          >
            
            {/* Stage Header Info */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 z-10 gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {activeMode === 'custom_ai' ? customTheme.characterEmoji : currentModeInfo?.icon}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-moul text-amber-300">
                    {activeMode === 'custom_ai' ? customTheme.themeNameKh : currentModeInfo?.nameKh}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-white/80 mt-0.5">
                    <span>បេក្ខជនសរុប៖ <strong>{activeCandidates.length}</strong> នាក់</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-200">
                      <TimerIcon className="w-3.5 h-3.5" />
                      <span>{isRacing ? `នៅសល់៖ ${remainingTimeSeconds} វិនាទី` : `កំណត់៖ ${raceDurationSeconds >= 60 ? `${raceDurationSeconds/60} នាទី` : `${raceDurationSeconds} វិនាទី`}`}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Fullscreen & START */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all ${
                    isFullscreen 
                      ? 'bg-amber-400 border-amber-300 text-slate-950 ring-2 ring-amber-300' 
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title={isFullscreen ? 'ចេញពីពេញអេក្រង់ (Exit Fullscreen - Esc)' : 'ចុចដើម្បីបង្ហាញពេញអេក្រង់ (Click to Fullscreen)'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-950" /> : <Maximize2 className="w-4 h-4 text-amber-300" />}
                  <span className="text-[11px] font-bold hidden sm:inline">
                    {isFullscreen ? 'បង្រួម' : 'ពេញអេក្រង់'}
                  </span>
                </button>

                {/* Action Big Play Button */}
                <button
                  onClick={handleStartPicker}
                  disabled={isRacing || activeCandidates.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold font-moul text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                >
                  <Play className={`w-4 h-4 fill-current ${isRacing ? 'animate-spin' : ''}`} />
                  <span>{isRacing ? `កំពុងប្រណាំង (${remainingTimeSeconds}s)...` : 'ចាប់ផ្តើមលេង! (START)'}</span>
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* A. WHEEL CANVAS ARENA */}
            {/* --------------------------------------------------------- */}
            {activeMode === 'wheel' && (
              <div className="flex-1 flex flex-col items-center justify-center py-4 relative my-auto">
                {/* Pointer / Needle */}
                <div className="absolute top-2 z-20 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-bounce"></div>
                </div>

                {/* Rotating Wheel Canvas */}
                <div className="relative p-2 bg-white/10 rounded-full border-4 border-amber-400/40 shadow-2xl backdrop-blur-sm">
                  <canvas
                    ref={wheelCanvasRef}
                    width={360}
                    height={360}
                    className="max-w-[280px] sm:max-w-[340px] max-h-[280px] sm:max-h-[340px] rounded-full"
                  />
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* B. MYSTERY BOXES ARENA */}
            {/* --------------------------------------------------------- */}
            {activeMode === 'mystery_box' && (
              <div className="flex-1 flex items-center justify-center py-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 max-w-lg w-full">
                  {activeCandidates.slice(0, 12).map((cand, idx) => {
                    const isSelected = revealedBoxIndex === idx;
                    const isWinnerBox = winner?.id === cand.id;
                    return (
                      <div
                        key={cand.id}
                        className={`p-3 rounded-2xl border text-center transition-all duration-300 transform ${
                          isWinnerBox
                            ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 scale-110 border-amber-300 shadow-xl ring-4 ring-amber-300/40'
                            : isSelected
                            ? 'bg-fuchsia-600/80 border-fuchsia-300 scale-105 animate-pulse'
                            : 'bg-white/10 border-white/10 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-3xl mb-1">
                          {isWinnerBox ? '🎉' : isSelected ? '✨' : '🎁'}
                        </div>
                        <p className="text-[11px] font-bold truncate">
                          {isWinnerBox ? cand.name : `ប្រអប់ #${idx + 1}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* C. LOTTERY BALL MACHINE ARENA */}
            {/* --------------------------------------------------------- */}
            {activeMode === 'lottery_ball' && (
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div className="relative w-56 h-56 rounded-full bg-white/10 border-4 border-amber-400/40 shadow-inner flex items-center justify-center overflow-hidden">
                  {/* Floating lottery balls */}
                  {activeCandidates.slice(0, 8).map((cand, idx) => (
                    <div
                      key={cand.id}
                      className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-md border border-white/40 ${
                        isRacing ? 'animate-ping' : ''
                      }`}
                      style={{
                        backgroundColor: cand.color || '#f59e0b',
                        top: `${20 + (idx * 22) % 65}%`,
                        left: `${15 + (idx * 27) % 65}%`,
                        transform: `rotate(${idx * 45}deg)`
                      }}
                    >
                      {cand.avatar || idx + 1}
                    </div>
                  ))}
                  <div className="z-10 bg-slate-950/80 px-4 py-2 rounded-2xl border border-white/20 text-center">
                    <span className="text-2xl">🎰</span>
                    <p className="text-[10px] font-bold text-amber-300">Lotto Sphere</p>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* D. REALISTIC RACE TRACKS (Duck on Real Water, Moto, Airplane, Car, Fish, Rocket, AI) */}
            {/* --------------------------------------------------------- */}
            {activeMode !== 'wheel' && activeMode !== 'mystery_box' && activeMode !== 'lottery_ball' && (
              <div className="flex-1 space-y-2 py-3 overflow-y-auto max-h-[340px] scrollbar-none pr-1">
                {activeCandidates.slice(0, 10).map((cand, idx) => {
                  const progress = runnerPositions[cand.id] || 0;
                  const isWinningLane = winner?.id === cand.id;

                  // Dynamic Track Background Style
                  let trackBg = 'bg-slate-950/40 border-white/10';
                  if (activeMode === 'duck_race') {
                    // Realistic Water Waves Background with ripples
                    trackBg = 'bg-gradient-to-r from-blue-900/80 via-cyan-800/80 to-blue-950/90 border-cyan-400/30';
                  } else if (activeMode === 'moto_race') {
                    // Realistic Asphalt Road with dashed white line
                    trackBg = 'bg-gradient-to-r from-zinc-900 via-neutral-800 to-zinc-950 border-amber-500/20';
                  } else if (activeMode === 'airplane_race') {
                    // Realistic High Sky with Cloud particles
                    trackBg = 'bg-gradient-to-r from-sky-900/90 via-indigo-900/80 to-blue-950 border-sky-400/20';
                  } else if (activeMode === 'fish_race') {
                    // Coral Ocean Blue
                    trackBg = 'bg-gradient-to-r from-teal-900/90 via-cyan-900/80 to-blue-950 border-teal-400/20';
                  }

                  return (
                    <div
                      key={cand.id}
                      className={`p-2 rounded-2xl border transition-all ${
                        isWinningLane
                          ? 'bg-amber-400/20 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {/* Lane Header */}
                      <div className="flex items-center justify-between text-[11px] mb-1 px-1 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-white/80 text-[10px]">#{idx + 1}</span>
                          <span className="text-amber-200">{cand.name}</span>
                        </div>
                        <span className="text-[10px] text-white/70">
                          {Math.round(progress)}%
                        </span>
                      </div>

                      {/* Race Track Line with Realistic Background */}
                      <div className={`relative h-11 ${trackBg} rounded-xl overflow-hidden border flex items-center px-1`}>
                        
                        {/* Realistic Track Decors: Water Waves / Road Marks / Clouds */}
                        {activeMode === 'duck_race' && (
                          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-around text-xs">
                            <span>🌊</span><span>〰️</span><span>🌊</span><span>〰️</span><span>🌊</span>
                          </div>
                        )}
                        {activeMode === 'moto_race' && (
                          <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-white/30 top-1/2 pointer-events-none"></div>
                        )}
                        {activeMode === 'airplane_race' && (
                          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-around text-xs">
                            <span>☁️</span><span>⛅</span><span>☁️</span><span>⛅</span>
                          </div>
                        )}

                        {/* Finish Flag Marker */}
                        <div className="absolute right-2 text-sm z-0 opacity-90 drop-shadow-md">
                          🏁
                        </div>

                        {/* Moving Runner Sprite (Duck, Moto, Airplane, etc.) */}
                        <div
                          className="absolute transition-all duration-150 ease-linear flex items-center gap-1 z-10"
                          style={{ left: `calc(${progress}% - ${progress > 85 ? '70px' : '0px'})` }}
                        >
                          {renderRealisticRacer(cand, idx, progress)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* E. WINNER BANNER ANNOUNCEMENT ON STAGE */}
            {/* --------------------------------------------------------- */}
            {winner && (
              <div className="p-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-300 animate-fadeIn z-20 mt-2">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <span className="text-3xl p-2 bg-white/90 rounded-2xl shadow-xs">
                    🏆
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-moul">
                      🎉 អ្នកឈ្នះ / សិស្សដែលត្រូវបានជ្រើសរើស៖
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold font-moul text-blue-950">
                      {winner.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenWinnerQuestion}
                    className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span>🎯 ចោទសួរភ្លាមៗ (Quiz)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onAwardScoreToStudent) {
                        onAwardScoreToStudent(winner.id, winner.name, 50);
                      }
                      showToast(`🏆 បានផ្តល់ ៥០ ពិន្ទុលើកទឹកចិត្តដល់ «${winner.name}»!`);
                    }}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>+50 ពិន្ទុ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Candidate Roster Management & Winners History */}
        <div className="space-y-4">
          {/* Candidate List Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-900" />
                <h4 className="text-xs sm:text-sm font-bold font-moul text-slate-900">
                  បញ្ជីឈ្មោះបេក្ខជន ({activeCandidates.length}/{candidates.length})
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleShuffle}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer"
                  title="ច្របល់ឈ្មោះ"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetEliminated}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all cursor-pointer"
                  title="ដាក់ឈ្មោះឡើងវិញទាំងអស់"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter by Grade */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-600 shrink-0">កម្រិតថ្នាក់៖</label>
              <select
                value={selectedGradeFilter}
                onChange={e => setSelectedGradeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800"
              >
                <option value="all">សិស្សទាំងអស់ (All Students)</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>ថ្នាក់ទី {g}</option>
                ))}
              </select>
            </div>

            {/* Quick Add Name */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCandidateName}
                onChange={e => setNewCandidateName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCandidate()}
                placeholder="ឈ្មោះសិស្សថ្មី..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-800"
              />
              <button
                onClick={handleAddCandidate}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែម</span>
              </button>
            </div>

            {/* Candidates Badges List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    cand.eliminated
                      ? 'bg-slate-100 border-slate-200 text-slate-400 line-through opacity-60'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{cand.avatar || '⭐'}</span>
                    <span className="font-bold truncate">{cand.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, eliminated: !c.eliminated } : c))}
                      className="text-[10px] text-blue-700 hover:underline px-1"
                    >
                      {cand.eliminated ? 'បើកវិញ' : 'ដកចេញ'}
                    </button>
                    <button
                      onClick={() => setCandidates(prev => prev.filter(c => c.id !== cand.id))}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Paste Button */}
            <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <button
                onClick={() => setIsBulkInputOpen(!isBulkInputOpen)}
                className="text-blue-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isBulkInputOpen ? 'បិទការចម្លងដាក់' : '📋 ចម្លងឈ្មោះដាក់បញ្ចូលច្រើន'}</span>
              </button>
            </div>

            {/* Bulk Input Box */}
            {isBulkInputOpen && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-fadeIn">
                <textarea
                  rows={4}
                  value={bulkInputText}
                  onChange={e => setBulkInputText(e.target.value)}
                  placeholder="ដាក់ឈ្មោះសិស្ស ១ នាក់ក្នុង ១ ជួរ..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsBulkInputOpen(false)}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    បោះបង់
                  </button>
                  <button
                    onClick={handleBulkImport}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                  >
                    រក្សាទុកបញ្ជី
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Winners History Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <History className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs sm:text-sm font-bold font-moul text-slate-900">
                ប្រវត្តិសិស្សដែលបានចាប់ ({historyWinners.length})
              </h4>
            </div>

            {historyWinners.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">
                មិនទាន់មានប្រវត្តិនៃការចាប់នៅឡើយទេ
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
                {historyWinners.map((h, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-bold text-slate-900">{h.candidate.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{h.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. PROMINENT CELEBRATION POPUP MODAL WITH WINNER NAME */}
      {/* ------------------------------------------------------------- */}
      {showCelebrationModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-500 text-slate-950 rounded-3xl w-full max-w-lg border-4 border-yellow-200 shadow-2xl p-6 md:p-8 space-y-6 text-center animate-bounce-short">
            
            {/* Close Button */}
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-950 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Big Trophy & Fireworks Icon */}
            <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center mx-auto text-5xl shadow-xl border-4 border-amber-300">
              🏆
            </div>

            {/* Salutation Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-950 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider font-moul shadow-md">
                <PartyPopper className="w-4 h-4 text-amber-400" />
                <span>សូមអបអរសាទរជើងឯក!</span>
                <PartyPopper className="w-4 h-4 text-amber-400" />
              </div>

              {/* Huge Student Winner Name */}
              <h2 className="text-3xl sm:text-4xl font-bold font-moul text-slate-950 drop-shadow-sm tracking-wide">
                « {winner.name} »
              </h2>

              <p className="text-xs sm:text-sm font-medium text-slate-900">
                បានឈ្នះជើងឯកក្នុងការប្រកួត <strong>{currentModeInfo?.nameKh || 'ល្បែងប្រណាំង'}</strong>!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  handleOpenWinnerQuestion();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl text-xs sm:text-sm font-bold font-moul shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>🎯 ចោទសួរភ្លាមៗ (Quiz)</span>
              </button>

              <button
                onClick={() => {
                  if (onAwardScoreToStudent) {
                    onAwardScoreToStudent(winner.id, winner.name, 100);
                  }
                  showToast(`🏆 បានផ្តល់ ១០០ ពិន្ទុលើកទឹកចិត្តដល់ «${winner.name}»!`);
                  setShowCelebrationModal(false);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold font-moul shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>+100 ពិន្ទុ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. WINNER INTERACTIVE QUESTION / QUIZ CHALLENGE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl w-full max-w-xl border border-white/10 shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-base font-bold font-moul text-amber-300">
                    សំណួរបញ្ចាំងសម្រាប់ «{winner?.name}»
                  </h3>
                  <p className="text-[11px] text-white/60">
                    សូមឱ្យសិស្សឆ្លើយផ្ទាល់ក្នុងថ្នាក់ និងជ្រើសរើសចម្លើយដើម្បីទទួលពិន្ទុ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isGeneratingQuestion ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-white/80 font-bold">
                  AI កំពុងបង្កើតសំណួរថ្មីសម្រាប់សិស្ស...
                </p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-4">
                <h4 className="text-base md:text-lg font-bold font-moul leading-relaxed text-center text-amber-200">
                  {currentQuestion.q}
                </h4>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === currentQuestion.correct;

                    let btnStyle = 'bg-white/10 hover:bg-white/20 border-white/15 text-white';
                    if (isAnswerChecked) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/30';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 border-rose-400 text-white';
                      } else {
                        btnStyle = 'bg-white/5 opacity-40 border-transparent';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswerChecked}
                        onClick={() => handleSelectQuizOption(opt)}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback */}
                {isAnswerChecked && (
                  <div className="p-3.5 bg-white/10 rounded-2xl text-xs space-y-1 animate-fadeIn border border-white/10">
                    <p className="text-white/90">
                      💡 <strong>ការពន្យល់៖</strong> {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={handleOpenWinnerQuestion}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ប្តូរសំណួរផ្សេង</span>
              </button>

              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                រួចរាល់
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
