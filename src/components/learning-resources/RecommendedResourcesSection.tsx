import React, { useMemo } from 'react';
import {
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Star,
  FileText,
  PlayCircle,
  QrCode,
  Tag,
  ChevronRight,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';
import {
  LearningResourceItem,
  ResourceRatingData,
  ResourceTag,
  TeacherPrivateNote
} from '../../data/learningResourcesData';

interface RecommendedResourcesSectionProps {
  allResources: LearningResourceItem[];
  favoriteIds: string[];
  ratingsMap: Record<string, ResourceRatingData>;
  teacherNotesMap: Record<string, TeacherPrivateNote>;
  onToggleFavorite: (id: string) => void;
  onOpenResource: (resource: LearningResourceItem) => void;
  onOpenNotesModal: (resource: LearningResourceItem) => void;
  onOpenQrModal: (resource: LearningResourceItem) => void;
}

export const RecommendedResourcesSection: React.FC<RecommendedResourcesSectionProps> = ({
  allResources = [],
  favoriteIds = [],
  ratingsMap = {},
  teacherNotesMap = {},
  onToggleFavorite,
  onOpenResource,
  onOpenNotesModal,
  onOpenQrModal
}) => {
  // Recommendation Algorithm based on user's favorited items
  const recommendationData = useMemo(() => {
    const resourcesList = Array.isArray(allResources) ? allResources : [];
    const favIdsList = Array.isArray(favoriteIds) ? favoriteIds : [];
    const safeRatings = ratingsMap || {};

    // 1. Calculate tag frequencies from favorited items
    const favoritedItems = resourcesList.filter(r => r && favIdsList.includes(r.id));
    const tagFrequencies: Record<string, number> = {};
    const gradeFrequencies: Record<number, number> = {};
    const subjectFrequencies: Record<string, number> = {};

    favoritedItems.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1;
      });
      if (item.grade) {
        gradeFrequencies[item.grade] = (gradeFrequencies[item.grade] || 0) + 1;
      }
      if (item.subject) {
        subjectFrequencies[item.subject] = (subjectFrequencies[item.subject] || 0) + 1;
      }
    });

    // Find top tag, grade, and subject
    const topTags = Object.entries(tagFrequencies)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0] as ResourceTag);

    const topGradeEntry = Object.entries(gradeFrequencies).sort((a, b) => b[1] - a[1])[0];
    const topGrade = topGradeEntry ? parseInt(topGradeEntry[0], 10) : undefined;

    // 2. Score resources
    const scoredResources = resourcesList.map(resource => {
      let score = 0;
      let matchedReasons: string[] = [];

      // Tag overlap score (weight 3x per match with top tags)
      (resource.tags || []).forEach(tag => {
        const freq = tagFrequencies[tag] || 0;
        if (freq > 0) {
          score += freq * 3;
          if (topTags.includes(tag) && matchedReasons.length < 2) {
            matchedReasons.push(`#${tag}`);
          }
        }
      });

      // Grade overlap score (weight 4x)
      if (resource.grade && gradeFrequencies[resource.grade]) {
        score += gradeFrequencies[resource.grade] * 4;
        if (resource.grade === topGrade) {
          matchedReasons.push(`ថ្នាក់ទី${resource.grade}`);
        }
      }

      // Subject overlap score (weight 2x)
      if (resource.subject && subjectFrequencies[resource.subject]) {
        score += subjectFrequencies[resource.subject] * 2;
      }

      // High rating score
      const rating = safeRatings[resource.id];
      if (rating && rating.totalVotes > 0) {
        const avg = rating.sumScore / rating.totalVotes;
        if (avg >= 4.7) {
          score += 5;
        }
      }

      // If user already favorited it, reduce rank slightly so new undiscovered items surface, but keep high if strong match
      const isFavorited = favIdsList.includes(resource.id);
      if (!isFavorited) {
        score += 8; // bonus for discovery of new relevant items
      }

      return {
        resource,
        score,
        isFavorited,
        reasonText:
          matchedReasons.length > 0
            ? `ផ្គូផ្គងនឹង ${matchedReasons.join(' & ')}`
            : 'ធនធានឆ្នើមពិន្ទុខ្ពស់សម្រាប់គ្រូបង្រៀន'
      };
    });

    // Sort by score descending and take top 4
    const topPicks = scoredResources
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return {
      topPicks,
      topTags: topTags.slice(0, 3),
      hasUserFavorites: favoritedItems.length > 0
    };
  }, [allResources, favoriteIds, ratingsMap]);

  if (recommendationData.topPicks.length === 0) return null;

  return (
    <div
      id="recommended-for-you-section"
      className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-700/50 relative overflow-hidden"
    >
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-indigo-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-400/20 font-black">
            <Sparkles className="w-5 h-5 text-indigo-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                ណែនាំសម្រាប់អ្នក (Recommended for You)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                ស្វ័យប្រវត្តិ
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {recommendationData.hasUserFavorites
                ? `ជ្រើសរើសដោយស្វ័យប្រវត្តិតាមចំណូលចិត្តស្លាក ${recommendationData.topTags.map(t => `#${t}`).join(' ')} ដែលអ្នកបានរក្សាទុក`
                : 'ធនធានពេញនិយម និងមានការវាយតម្លៃខ្ពស់បំផុតពីលោកគ្រូ-អ្នកគ្រូទូទាំងប្រទេស'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {recommendationData.topPicks.map(({ resource, isFavorited, reasonText }) => {
          const rating = ratingsMap[resource.id] || { totalVotes: 0, sumScore: 0 };
          const avgRating = rating.totalVotes > 0 ? (rating.sumScore / rating.totalVotes).toFixed(1) : '5.0';
          const hasNote = !!teacherNotesMap[resource.id];

          return (
            <div
              key={resource.id}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:border-white/30 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
            >
              <div>
                {/* Top Smart Badge */}
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span className="text-[10px] font-medium text-amber-300 bg-amber-400/15 border border-amber-400/25 px-2 py-0.5 rounded-full truncate max-w-[190px]">
                    ✨ {reasonText}
                  </span>
                  <button
                    onClick={() => onToggleFavorite(resource.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFavorited
                        ? 'text-amber-400 bg-amber-400/20'
                        : 'text-indigo-200 hover:text-white hover:bg-white/10'
                    }`}
                    title={isFavorited ? 'ដកចេញពី Saved' : 'រក្សាទុកក្នុង Saved'}
                  >
                    {isFavorited ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Title */}
                <h4 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors leading-snug line-clamp-2 mb-1.5">
                  {resource.titleKhmer}
                </h4>

                <p className="text-[11px] text-indigo-100 line-clamp-2 mb-3 leading-relaxed">
                  {resource.descriptionKhmer}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 2).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-indigo-100 border border-white/10"
                    >
                      #{t}
                    </span>
                  ))}
                  {resource.grade && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      ថ្នាក់ទី{resource.grade}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 text-amber-300 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{avgRating}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Note Button */}
                  <button
                    onClick={() => onOpenNotesModal(resource)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      hasNote
                        ? 'bg-amber-400 text-indigo-950 font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={hasNote ? 'មានកំណត់ត្រាផ្ទាល់ខ្លួន' : 'សរសេរកំណត់ត្រាគ្រូ'}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  {/* QR Button */}
                  <button
                    onClick={() => onOpenQrModal(resource)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="ស្កេន QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  {/* Launch Link */}
                  <button
                    onClick={() => onOpenResource(resource)}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-indigo-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all"
                  >
                    <span>បើកមើល</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
