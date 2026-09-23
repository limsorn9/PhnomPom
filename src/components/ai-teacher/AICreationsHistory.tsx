import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Eye, 
  Search, 
  FileText, 
  Presentation, 
  Calendar, 
  HelpCircle, 
  Gamepad2, 
  Download, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { AICreationItem } from './types';
import { getSavedAICreations, deleteAICreation } from '../../services/aiTeacherService';
import { useSchool } from '../../context/SchoolContext';

interface Props {
  onOpenCreation: (item: AICreationItem) => void;
}

export const AICreationsHistory: React.FC<Props> = ({ onOpenCreation }) => {
  const { showToast } = useSchool();
  const [creations, setCreations] = useState<AICreationItem[]>(getSavedAICreations());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'lesson' | 'slide' | 'curriculum' | 'test' | 'game'>('all');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('តើអ្នកពិតជាចង់លុបឯកសារដែលបានរក្សាទុកនេះមែនទេ?')) {
      deleteAICreation(id);
      setCreations(getSavedAICreations());
      showToast('បានលុបឯកសារជោគជ័យ!');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-indigo-600" />;
      case 'curriculum':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'test':
        return <HelpCircle className="w-5 h-5 text-rose-600" />;
      case 'game':
        return <Gamepad2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredCreations = creations.filter(item => {
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.typeNameKh.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-moul text-blue-950 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-800" />
            <span>ប្រវត្តិមាតិកាដែលបានបង្កើតដោយ AI (Saved Creations)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            មើលឡើងវិញ បើកកែសម្រួល ឬទាញយកកិច្ចតែងការ ស្លាយ កម្មវិធីសិក្សា និងល្បែងទាំងអស់ដែលអ្នកបានបង្កើត។
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាមចំណងជើង ឬមុខវិជ្ជា..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-800 outline-hidden"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {[
            { id: 'all', label: 'ទាំងអស់' },
            { id: 'lesson', label: 'កិច្ចតែងការ' },
            { id: 'slide', label: 'ស្លាយ' },
            { id: 'curriculum', label: 'កម្មវិធីសិក្សា' },
            { id: 'test', label: 'វិញ្ញាសាតេស្ត' },
            { id: 'game', label: 'ល្បែងសិក្សា' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedFilter === f.id
                  ? 'bg-blue-900 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Creations Grid */}
      {filteredCreations.length === 0 ? (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <History className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-xs font-medium">មិនមានឯកសារដែលត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreations.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenCreation(item)}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    {getIcon(item.type)}
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-100 rounded-md text-[10px] font-bold">
                    {item.subject} ថ្នាក់ទី{item.grade}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    {item.typeNameKh}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-blue-900 transition-colors mt-0.5">
                    {item.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>{new Date(item.createdAt).toLocaleDateString('km-KH')}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                    title="លុប"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="flex items-center gap-1 font-bold text-blue-900 group-hover:translate-x-0.5 transition-transform">
                    <span>បើកមើល</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
