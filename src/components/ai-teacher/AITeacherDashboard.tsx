import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Presentation, 
  Calendar, 
  HelpCircle, 
  Gamepad2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Award,
  Flame,
  Star,
  Users,
  ChevronRight
} from 'lucide-react';
import { AITeacherSubTab, AICreationItem } from './types';
import { getSavedAICreations } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  onSelectTab: (tab: AITeacherSubTab) => void;
  onOpenCreation: (item: AICreationItem) => void;
}

export const AITeacherDashboard: React.FC<Props> = ({ onSelectTab, onOpenCreation }) => {
  const { currentUser } = useSchool();
  const recentCreations = getSavedAICreations().slice(0, 4);

  const featureCards = [
    {
      id: 'moeys_standards' as AITeacherSubTab,
      title: 'ស្តង់ដារបឋមសិក្សាគំរូ & កម្មវិធីសិក្សា MoEYS',
      subtitle: 'Official MoEYS Standards & Textbooks',
      desc: 'ផ្ទៀងផ្ទាត់ ៥ ស្តង់ដារ ២៧ សូចនាករបឋមសិក្សាគំរូ និងកម្មវិធីសិក្សាគ្រប់មុខវិជ្ជាថ្នាក់ទី១ ដល់ទី៦ ស្របតាមសៀវភៅពុម្ពក្រសួងអប់រំ។',
      icon: '🏆',
      gradient: 'from-amber-600 to-indigo-800',
      badge: 'ស្តង់ដារជាតិ MoEYS'
    },
    {
      id: 'weekly_lesson' as AITeacherSubTab,
      title: 'កិច្ចតែងការបង្រៀនប្រចាំសប្តាហ៍',
      subtitle: 'MoEYS Weekly Lesson Template',
      desc: 'រៀបចំកិច្ចតែងការបង្រៀន ៥ ជំហាន (ចន្ទ ដល់ សុក្រ/សៅរ៍) តាមស្តង់ដារក្រសួងអប់រំ បែងចែកចំណេះដឹង បំណិន ឥរិយាបថ និងការគាំទ្រសិស្សរៀនយឺត។',
      icon: '📅',
      gradient: 'from-emerald-600 to-teal-700',
      badge: 'គំរូផ្លូវការក្រសួង'
    },
    {
      id: 'lesson_slide' as AITeacherSubTab,
      title: 'កិច្ចតែងការទោល & ស្លាយ',
      subtitle: 'Lesson Plan & Slide Deck',
      desc: 'រៀបចំកិច្ចតែងការ ៩ ជំហានតាមស្តង់ដារក្រសួងអប់រំ ព្រមទាំងបង្កើតស្លាយបង្រៀនអន្តរកម្មស្វ័យប្រវត្តិជាមួយទម្រង់ Presenter។',
      icon: '📝',
      gradient: 'from-blue-600 to-indigo-700',
      badge: 'កិច្ចការប្រចាំថ្ងៃ'
    },
    {
      id: 'curriculum' as AITeacherSubTab,
      title: 'បំណែងចែកកម្មវិធីសិក្សា',
      subtitle: 'Curriculum & Syllabus',
      desc: 'បំបែកកាលវិភាគម៉ោងបង្រៀនតាមសប្តាហ៍ គោលបំណង សកម្មភាព និងការវាយតម្លៃសម្រាប់ឆមាសទី១ ឆមាសទី២ ឬពេញមួយឆ្នាំ។',
      icon: '📅',
      gradient: 'from-amber-600 to-orange-700',
      badge: 'ផែនការសិក្សា'
    },
    {
      id: 'test_generator' as AITeacherSubTab,
      title: 'វិញ្ញាសាតេស្ត & សំណួរ Bloom',
      subtitle: 'Standardized Test Paper',
      desc: 'បង្កើតកម្រងសំណួរចម្រុះ ៧ ទម្រង់ ម៉ាទ្រីសវិភាគវិញ្ញាសាតាមកម្រិតពុទ្ធិ Bloom’s Taxonomy ព្រមទាំងសន្លឹកកែចម្លើយ និង Rubrics។',
      icon: '🎯',
      gradient: 'from-rose-600 to-pink-700',
      badge: 'វាយតម្លៃសមត្ថភាព'
    },
    {
      id: 'educational_game' as AITeacherSubTab,
      title: 'ល្បែងសិក្សា & ចាប់ឈ្មោះប្រណាំង',
      subtitle: 'Picker & Interactive Games',
      desc: 'ល្បែងចាប់ឈ្មោះសិស្ស (បង្វិលកង, ប្រណាំងទាហែលទឹក, ឡានស្ព័រ, ម៉ូតូ, យន្តហោះ, ត្រីសមុទ្រ, AI Custom) ព្រមទាំងល្បែងសំណួរប្រកួតប្រជែងក្នុងថ្នាក់។',
      icon: '🎯',
      gradient: 'from-emerald-600 to-teal-700',
      badge: 'ពេញនិយម និងសប្បាយ'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 text-white p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Teaching Assistant សម្រាប់គ្រូបង្រៀនកម្ពុជា</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-moul leading-relaxed">
            ជំនួយការបង្រៀនឆ្លាតវៃ AI សម្រាប់លោកគ្រូ-អ្នកគ្រូ
          </h2>

          <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed">
            ជួយកាត់បន្ថយពេលវេលារៀបចំឯកសារបង្រៀនរហូតដល់ ៨០% តាមរយៈការបង្កើតកិច្ចតែងការ ស្លាយ វិញ្ញាសាតេស្ត និងល្បែងសិក្សាស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា។
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onSelectTab('moeys_standards')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>ស្តង់ដារបឋមសិក្សាគំរូ & សៀវភៅពុម្ព MoEYS</span>
            </button>
            <button
              onClick={() => onSelectTab('weekly_lesson')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer backdrop-blur-xs"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>កិច្ចតែងការប្រចាំសប្តាហ៍</span>
            </button>
            <button
              onClick={() => onSelectTab('educational_game')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-xl text-xs transition-all cursor-pointer backdrop-blur-xs"
            >
              <Gamepad2 className="w-4 h-4 text-cyan-300" />
              <span>ល្បែងសិក្សា & ចាប់ឈ្មោះ</span>
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center pr-8 pointer-events-none text-9xl">
          🤖
        </div>
      </div>

      {/* Quick Impact Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'កិច្ចតែងការ & ស្លាយ', value: '១២០+ គំរូ', icon: '📝', color: 'text-blue-600' },
          { label: 'កម្មវិធីសិក្សា MoEYS', value: 'ថ្នាក់ទី ១-១២', icon: '📚', color: 'text-amber-600' },
          { label: 'ម៉ាទ្រីស Bloom', value: '៦ កម្រិតពុទ្ធិ', icon: '🎯', color: 'text-rose-600' },
          { label: 'ល្បែងសិក្សាឌីជីថល', value: '១០ ទម្រង់', icon: '🎮', color: 'text-emerald-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <span className="text-base font-bold text-slate-900 block">{stat.value}</span>
              <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Main Functional Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-moul text-slate-900">
            មុខងារចម្បងទាំង ៤ សម្រាប់គ្រូបង្រៀន (Core AI Modules)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectTab(card.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold font-moul text-slate-900 group-hover:text-blue-900 transition-colors">
                    {card.title}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium block">
                    {card.subtitle}
                  </span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-blue-900">
                <span>ចាប់ផ្តើមប្រើប្រាស់</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent AI Creations Feed */}
      {recentCreations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-800" />
              <h4 className="text-xs font-bold font-moul text-slate-900">
                ឯកសារ និងមាតិកាដែលបានបង្កើតថ្មីៗ (Recent Creations)
              </h4>
            </div>
            <button
              onClick={() => onSelectTab('saved_resources')}
              className="text-xs text-blue-900 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <span>មើលទាំងអស់ ({getSavedAICreations().length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentCreations.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenCreation(item)}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-blue-900">{item.subject} ថ្នាក់ទី{item.grade}</span>
                  <span className="text-slate-400">{new Date(item.createdAt).toLocaleDateString('km-KH')}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 line-clamp-2">
                  {item.title}
                </h5>
                <span className="text-[10px] font-medium text-slate-500 block">
                  {item.typeNameKh}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
