import React, { useState } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  HelpCircle, 
  Gamepad2, 
  History, 
  Bot, 
  MessageSquare,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';
import { AITeacherSubTab, AICreationItem } from './types';
import { AITeacherDashboard } from './AITeacherDashboard';
import { MoEYSPrimaryCurriculumHub } from './MoEYSPrimaryCurriculumHub';
import { WeeklyLessonPlanGenerator } from './WeeklyLessonPlanGenerator';
import { LessonSlideGenerator } from './LessonSlideGenerator';
import { CurriculumGenerator } from './CurriculumGenerator';
import { TestQuestionGenerator } from './TestQuestionGenerator';
import { EducationalGameGenerator } from './EducationalGameGenerator';
import { AICreationsHistory } from './AICreationsHistory';
import { AIAssistantSidePanel } from './AIAssistantSidePanel';

export const AITeacherHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AITeacherSubTab>('dashboard');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [selectedCreation, setSelectedCreation] = useState<AICreationItem | null>(null);

  // Handle opening a creation from history
  const handleOpenCreation = (item: AICreationItem) => {
    setSelectedCreation(item);
    switch (item.type) {
      case 'weekly_lesson':
        setActiveSubTab('weekly_lesson');
        break;
      case 'lesson':
      case 'slide':
        setActiveSubTab('lesson_slide');
        break;
      case 'curriculum':
        setActiveSubTab('curriculum');
        break;
      case 'test':
        setActiveSubTab('test_generator');
        break;
      case 'game':
        setActiveSubTab('educational_game');
        break;
      default:
        setActiveSubTab('dashboard');
    }
  };

  const navItems = [
    { id: 'dashboard' as AITeacherSubTab, label: 'ផ្ទាំងដើម', icon: LayoutDashboard },
    { id: 'moeys_standards' as AITeacherSubTab, label: 'ស្តង់ដារបឋមសិក្សាគំរូ & សៀវភៅពុម្ព MoEYS', icon: Award },
    { id: 'weekly_lesson' as AITeacherSubTab, label: 'កិច្ចតែងការប្រចាំសប្តាហ៍', icon: Calendar },
    { id: 'lesson_slide' as AITeacherSubTab, label: 'កិច្ចតែងការទោល & ស្លាយ', icon: BookOpen },
    { id: 'curriculum' as AITeacherSubTab, label: 'បំណែងចែកកម្មវិធីសិក្សា', icon: Layers },
    { id: 'test_generator' as AITeacherSubTab, label: 'វិញ្ញាសាតេស្ត & សំណួរ', icon: HelpCircle },
    { id: 'educational_game' as AITeacherSubTab, label: 'ល្បែងសិក្សាឌីជីថល', icon: Gamepad2 },
    { id: 'saved_resources' as AITeacherSubTab, label: 'ឯកសាររក្សាទុក', icon: History },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Sub-Nav */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg md:text-xl font-bold font-moul text-blue-950">
                AI សម្រាប់គ្រូបង្រៀន (AI Teaching Assistant)
              </h1>
              <p className="text-xs text-slate-500">
                ប្រព័ន្ធជំនួយការឆ្លាតវៃសម្រាប់រៀបចំការបង្រៀន និងគ្រប់គ្រងសកម្មភាពសិក្សា
              </p>
            </div>
          </div>
        </div>

        {/* AI Assistant Quick Trigger Button */}
        <button
          onClick={() => setIsAIAssistantOpen(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Bot className="w-4 h-4 text-cyan-300" />
          <span>{isAIAssistantOpen ? 'បិទជំនួយការ AI' : '💬 ជជែកជាមួយជំនួយការ AI'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSubTab(item.id);
                setSelectedCreation(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Sub-Tab Workspace */}
      <div className="transition-all duration-300">
        {activeSubTab === 'dashboard' && (
          <AITeacherDashboard 
            onSelectTab={(tab) => {
              setActiveSubTab(tab);
              setSelectedCreation(null);
            }} 
            onOpenCreation={handleOpenCreation}
          />
        )}

        {activeSubTab === 'moeys_standards' && (
          <MoEYSPrimaryCurriculumHub 
            onNavigateToTab={(tab) => {
              setActiveSubTab(tab);
              setSelectedCreation(null);
            }}
          />
        )}

        {activeSubTab === 'weekly_lesson' && (
          <WeeklyLessonPlanGenerator 
            initialPlan={selectedCreation?.type === 'weekly_lesson' ? selectedCreation.payload : undefined}
          />
        )}

        {activeSubTab === 'lesson_slide' && (
          <LessonSlideGenerator 
            initialLesson={selectedCreation?.type === 'lesson' ? selectedCreation.payload : undefined}
          />
        )}

        {activeSubTab === 'curriculum' && (
          <CurriculumGenerator 
            initialCurriculum={selectedCreation?.type === 'curriculum' ? selectedCreation.payload : undefined}
          />
        )}

        {activeSubTab === 'test_generator' && (
          <TestQuestionGenerator 
            initialTestPaper={selectedCreation?.type === 'test' ? selectedCreation.payload : undefined}
          />
        )}

        {activeSubTab === 'educational_game' && (
          <EducationalGameGenerator 
            initialGame={selectedCreation?.type === 'game' ? selectedCreation.payload : undefined}
          />
        )}

        {activeSubTab === 'saved_resources' && (
          <AICreationsHistory 
            onOpenCreation={handleOpenCreation}
          />
        )}
      </div>

      {/* AI Assistant Floating Chat Panel */}
      <AIAssistantSidePanel 
        isOpen={isAIAssistantOpen}
        onToggle={() => setIsAIAssistantOpen(false)}
      />
    </div>
  );
};
