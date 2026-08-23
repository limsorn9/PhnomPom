import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  ALL_LEARNING_RESOURCES,
  AVAILABLE_TAGS,
  INITIAL_RESOURCE_RATINGS,
  INITIAL_RESOURCE_COMMENTS,
  INITIAL_TEACHER_NOTES,
  INITIAL_PLAYLIST_PROGRESS,
  LearningResourceItem,
  ResourceComment,
  ResourceRatingData,
  ResourceTag,
  TeacherPrivateNote,
  ResourceProgressTracker
} from '../data/learningResourcesData';
import {
  Video,
  PlayCircle,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Search,
  BookOpen,
  Calculator,
  Layers,
  Sparkles,
  Globe,
  MonitorPlay,
  GraduationCap,
  Tv,
  Info,
  X,
  Bookmark,
  BookmarkCheck,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  Filter,
  Flame,
  Lightbulb,
  Tag,
  Share2,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
  Pin,
  Clock,
  Trash2,
  Download,
  Printer,
  FileText,
  MessageCircle,
  Radio,
  FileSpreadsheet,
  Upload,
  StickyNote,
  ListOrdered,
  Plus,
  Minus,
  CheckCheck
} from 'lucide-react';
import { AngkorPageWatermark, MoEYSRoyalHeader } from './AngkorMotif';
import { downloadElementAsPdf, printElement } from '../utils/printUtils';
import { BulkCsvImportModal } from './learning-resources/BulkCsvImportModal';
import { TeacherNotesModal } from './learning-resources/TeacherNotesModal';
import { PlaylistProgressModal } from './learning-resources/PlaylistProgressModal';
import { RecommendedResourcesSection } from './learning-resources/RecommendedResourcesSection';

interface RecentlyViewedItem {
  resourceId: string;
  accessedAt: string;
}

export const OtherLearningResources: React.FC = () => {
  const { showToast, currentUser, language, schoolProfile } = useSchool();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'khmer' | 'math'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'platform' | 'video'>('all');
  const [selectedTag, setSelectedTag] = useState<ResourceTag | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyHighRated, setOnlyHighRated] = useState(false);
  const [onlyWithTips, setOnlyWithTips] = useState(false);
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);

  // Custom User-Imported Resources from CSV
  const [customResources, setCustomResources] = useState<LearningResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('school_custom_learning_resources');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active interaction states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCommentDrawerId, setActiveCommentDrawerId] = useState<string | null>(null);
  const [qrModalItem, setQrModalItem] = useState<{ title: string; url: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [shareModalItem, setShareModalItem] = useState<LearningResourceItem | null>(null);
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);

  // New Modals: Bulk CSV, Teacher Notes, Playlist Progress
  const [showBulkCsvModal, setShowBulkCsvModal] = useState(false);
  const [activeNotesResource, setActiveNotesResource] = useState<LearningResourceItem | null>(null);
  const [activeProgressResource, setActiveProgressResource] = useState<LearningResourceItem | null>(null);

  const printContainerRef = useRef<HTMLDivElement>(null);

  // Teacher Private Notes state
  const [teacherNotesMap, setTeacherNotesMap] = useState<Record<string, TeacherPrivateNote>>(() => {
    try {
      const saved = localStorage.getItem('school_learning_teacher_notes');
      return saved ? JSON.parse(saved) : INITIAL_TEACHER_NOTES;
    } catch {
      return INITIAL_TEACHER_NOTES;
    }
  });

  // Playlist / Multi-lesson Video Progress state
  const [playlistProgressMap, setPlaylistProgressMap] = useState<Record<string, ResourceProgressTracker>>(() => {
    try {
      const saved = localStorage.getItem('school_learning_playlist_progress');
      return saved ? JSON.parse(saved) : INITIAL_PLAYLIST_PROGRESS;
    } catch {
      return INITIAL_PLAYLIST_PROGRESS;
    }
  });

  // Favorites state synced with localStorage and custom window event
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('school_favorite_learning_resources');
      return saved ? JSON.parse(saved) : ['plp', 'sala', 'g1-khmer', 'g1-math'];
    } catch {
      return ['plp', 'sala', 'g1-khmer', 'g1-math'];
    }
  });

  // Combine Default and Custom Imported Resources
  const allCombinedResources = useMemo(() => {
    const defaultIds = new Set(ALL_LEARNING_RESOURCES.map(r => r.id));
    const uniqueCustom = customResources.filter(r => !defaultIds.has(r.id));
    return [...ALL_LEARNING_RESOURCES, ...uniqueCustom];
  }, [customResources]);

  // Recently Viewed state (tracks up to 5 last accessed resources)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => {
    try {
      const saved = localStorage.getItem('school_recent_learning_resources');
      return saved ? JSON.parse(saved) : [
        { resourceId: 'plp', accessedAt: 'ថ្មីៗនេះ' },
        { resourceId: 'sala', accessedAt: 'ថ្មីៗនេះ' }
      ];
    } catch {
      return [
        { resourceId: 'plp', accessedAt: 'ថ្មីៗនេះ' },
        { resourceId: 'sala', accessedAt: 'ថ្មីៗនេះ' }
      ];
    }
  });

  // Ratings state
  const [ratingsMap, setRatingsMap] = useState<Record<string, ResourceRatingData>>(() => {
    try {
      const saved = localStorage.getItem('school_learning_resource_ratings');
      return saved ? JSON.parse(saved) : INITIAL_RESOURCE_RATINGS;
    } catch {
      return INITIAL_RESOURCE_RATINGS;
    }
  });

  // Hover rating state for interactive stars: { [resourceId]: hoveredStarNumber }
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});

  // Comments / Teaching tips state
  const [commentsList, setCommentsList] = useState<ResourceComment[]>(() => {
    try {
      const saved = localStorage.getItem('school_learning_resource_comments');
      return saved ? JSON.parse(saved) : INITIAL_RESOURCE_COMMENTS;
    } catch {
      return INITIAL_RESOURCE_COMMENTS;
    }
  });

  // New tip form state
  const [newTipText, setNewTipText] = useState('');
  const [newTipAuthor, setNewTipAuthor] = useState(currentUser?.nameKhmer || 'លោកគ្រូ/អ្នកគ្រូ');
  const [newTipRole, setNewTipRole] = useState(currentUser?.role === 'director' ? 'នាយកសាលា' : 'គ្រូបង្រៀន');
  const [newTipGrade, setNewTipGrade] = useState('ថ្នាក់ទី១');
  const [newTipTag, setNewTipTag] = useState<'គន្លឹះបង្រៀន' | 'សកម្មភាពក្នុងថ្នាក់' | 'កិច្ចការផ្ទះ' | 'ល្បែងសិក្សា' | 'មតិទូទៅ'>('គន្លឹះបង្រៀន');
  const [isSubmittingTip, setIsSubmittingTip] = useState(false);

  // Track access to Recently Viewed list (max 5 items)
  const trackResourceAccess = (resourceId: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.resourceId !== resourceId);
      const nextList: RecentlyViewedItem[] = [
        { resourceId, accessedAt: `ម៉ោង ${nowStr}` },
        ...filtered
      ].slice(0, 5);

      try {
        localStorage.setItem('school_recent_learning_resources', JSON.stringify(nextList));
      } catch (e) {
        console.error(e);
      }
      return nextList;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem('school_recent_learning_resources');
    } catch (e) {
      console.error(e);
    }
    showToast('បានសម្អាតប្រវត្តិចូលមើលថ្មីៗជោគជ័យ!', 'info');
  };

  // Sync favorites change to localStorage and dispatch event for Sidebar
  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('school_favorite_learning_resources', JSON.stringify(next));
        window.dispatchEvent(new Event('school_favorites_updated'));
      } catch (e) {
        console.error(e);
      }
      const item = allCombinedResources.find(r => r.id === id);
      if (next.includes(id)) {
        showToast(`បានរក្សាទុក «${item?.titleKhmer || id}» ទៅក្នុងបញ្ជី Saved Resources!`, 'success');
      } else {
        showToast(`បានដក «${item?.titleKhmer || id}» ចេញពីបញ្ជី Saved Resources`, 'info');
      }
      return next;
    });
  };

  // Save Teacher Private Note
  const handleSaveTeacherNote = (note: TeacherPrivateNote) => {
    setTeacherNotesMap(prev => {
      const updated = { ...prev, [note.resourceId]: note };
      try {
        localStorage.setItem('school_learning_teacher_notes', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    trackResourceAccess(note.resourceId);
    showToast('បានរក្សាទុកកំណត់ត្រាវិធីសាស្ត្របង្រៀនផ្ទាល់ខ្លួនជោគជ័យ!', 'success');
  };

  // Delete Teacher Private Note
  const handleDeleteTeacherNote = (resourceId: string) => {
    setTeacherNotesMap(prev => {
      const updated = { ...prev };
      delete updated[resourceId];
      try {
        localStorage.setItem('school_learning_teacher_notes', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast('បានលុបកំណត់ត្រាផ្ទាល់ខ្លួនជោគជ័យ!', 'info');
  };

  // Save Playlist Progress Tracker
  const handleSavePlaylistProgress = (progress: ResourceProgressTracker) => {
    setPlaylistProgressMap(prev => {
      const updated = { ...prev, [progress.resourceId]: progress };
      try {
        localStorage.setItem('school_learning_playlist_progress', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    trackResourceAccess(progress.resourceId);
    showToast(`បានកត់ត្រាវឌ្ឍនភាព (${progress.completedCount}/${progress.totalLessons} មេរៀន) ជោគជ័យ!`, 'success');
  };

  // Quick increment progress directly from card (+1 lesson)
  const handleQuickIncrementProgress = (resource: LearningResourceItem) => {
    const total = resource.totalLessons || 30;
    const current = playlistProgressMap[resource.id] || {
      resourceId: resource.id,
      totalLessons: total,
      completedCount: 0,
      completedLessonNumbers: [],
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    if (current.completedCount < total) {
      const nextCount = current.completedCount + 1;
      const nextNumbers = Array.from(new Set([...(current.completedLessonNumbers || []), nextCount])).sort((a, b) => a - b);
      const lessonMeta = resource.lessonsList?.find(l => l.number === nextCount);
      const updated: ResourceProgressTracker = {
        ...current,
        totalLessons: total,
        completedCount: nextCount,
        completedLessonNumbers: nextNumbers,
        lastTopicCovered: lessonMeta ? `មេរៀនទី${nextCount}: ${lessonMeta.title}` : `មេរៀនទី${nextCount}`,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setPlaylistProgressMap(prev => {
        const nextMap = { ...prev, [resource.id]: updated };
        try {
          localStorage.setItem('school_learning_playlist_progress', JSON.stringify(nextMap));
        } catch (e) {
          console.error(e);
        }
        return nextMap;
      });

      trackResourceAccess(resource.id);
      showToast(`+១ មេរៀន! វឌ្ឍនភាពបច្ចុប្បន្ន៖ ${nextCount}/${total} (${Math.round((nextCount / total) * 100)}%)`, 'success');
    }
  };

  // Bulk Import Resources from CSV
  const handleImportCsvResources = (newResources: LearningResourceItem[]) => {
    if (newResources.length === 0) return;

    setCustomResources(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filteredNew = newResources.filter(r => !existingIds.has(r.id));
      const combined = [...prev, ...filteredNew];
      try {
        localStorage.setItem('school_custom_learning_resources', JSON.stringify(combined));
      } catch (e) {
        console.error(e);
      }
      return combined;
    });

    // Auto-favorite new imported items into Saved Resources
    const newIds = newResources.map(r => r.id);
    setFavoriteIds(prev => {
      const combinedIds = Array.from(new Set([...prev, ...newIds]));
      try {
        localStorage.setItem('school_favorite_learning_resources', JSON.stringify(combinedIds));
        window.dispatchEvent(new Event('school_favorites_updated'));
      } catch (e) {
        console.error(e);
      }
      return combinedIds;
    });

    showToast(`បាននាំចូលធនធានចំនួន ${newResources.length} ដោយជោគជ័យ និងបានរក្សាទុកក្នុង Saved Resources!`, 'success');
  };

  // Export Filtered Resources to CSV File
  const handleExportCsv = () => {
    try {
      const headers = ['id', 'titleKhmer', 'titleEnglish', 'url', 'type', 'grade', 'subject', 'subjectNameKhmer', 'tags', 'descriptionKhmer', 'totalLessons'];
      const rows = filteredResources.map(res => [
        `"${res.id.replace(/"/g, '""')}"`,
        `"${res.titleKhmer.replace(/"/g, '""')}"`,
        `"${res.titleEnglish.replace(/"/g, '""')}"`,
        `"${res.url.replace(/"/g, '""')}"`,
        `"${res.type}"`,
        `"${res.grade || ''}"`,
        `"${res.subject || ''}"`,
        `"${res.subjectNameKhmer.replace(/"/g, '""')}"`,
        `"${(res.tags || []).join(';')}"`,
        `"${res.descriptionKhmer.replace(/"/g, '""')}"`,
        `"${res.totalLessons || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `MoEYS_Learning_Resources_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('បានទាញយកឯកសារ CSV ជោគជ័យ!', 'success');
    } catch (e) {
      console.error(e);
      showToast('មានបញ្ហាក្នុងការនាំចេញ CSV', 'error');
    }
  };

  // Submit a 5-star rating for a resource
  const handleRateResource = (resourceId: string, ratingScore: number) => {
    setRatingsMap(prev => {
      const current = prev[resourceId] || { resourceId, totalVotes: 0, sumScore: 0 };
      let newTotal = current.totalVotes;
      let newSum = current.sumScore;

      if (current.userVote) {
        newSum = newSum - current.userVote + ratingScore;
      } else {
        newTotal += 1;
        newSum += ratingScore;
      }

      const updatedMap = {
        ...prev,
        [resourceId]: {
          resourceId,
          totalVotes: newTotal,
          sumScore: newSum,
          userVote: ratingScore
        }
      };

      try {
        localStorage.setItem('school_learning_resource_ratings', JSON.stringify(updatedMap));
      } catch (e) {
        console.error(e);
      }

      trackResourceAccess(resourceId);
      showToast(`អ្នកបានផ្តល់ពិន្ទុ ${ratingScore} ផ្កាយ ⭐ ជោគជ័យ!`, 'success');
      return updatedMap;
    });
  };

  // Submit a new teaching tip / comment
  const handleAddComment = (resourceId: string) => {
    if (!newTipText.trim()) {
      showToast('សូមបញ្ចូលខ្លឹមសារគន្លឹះបង្រៀន ឬមតិយោបល់ជាមុនសិន!', 'error');
      return;
    }

    setIsSubmittingTip(true);
    const newComment: ResourceComment = {
      id: `tip-${Date.now()}`,
      resourceId,
      authorName: newTipAuthor.trim() || 'លោកគ្រូ/អ្នកគ្រូ',
      authorRole: newTipRole.trim() || 'គ្រូបង្រៀន',
      gradeOrClass: newTipGrade,
      content: newTipText.trim(),
      tag: newTipTag,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      likes: 1
    };

    setCommentsList(prev => {
      const updated = [newComment, ...prev];
      try {
        localStorage.setItem('school_learning_resource_comments', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setNewTipText('');
    setIsSubmittingTip(false);
    trackResourceAccess(resourceId);
    showToast('បានចែករំលែកគន្លឹះបង្រៀនជោគជ័យ! សូមអរគុណលោកគ្រូ-អ្នកគ្រូ', 'success');
  };

  // Like a comment/tip
  const handleLikeComment = (commentId: string) => {
    setCommentsList(prev => {
      const updated = prev.map(c => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
      try {
        localStorage.setItem('school_learning_resource_comments', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Copy link
  const handleCopyLink = async (url: string, id: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      trackResourceAccess(id);
      showToast(`បានចម្លងតំណភ្ជាប់ «${label}» ជោគជ័យ!`, 'success');
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    } catch {
      showToast('មិនអាចចម្លងតំណភ្ជាប់បានទេ', 'error');
    }
  };

  // Open QR modal
  const handleOpenQrModal = (title: string, url: string, id: string) => {
    setQrModalItem({ title, url });
    trackResourceAccess(id);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setQrDataUrl(qrUrl);
  };

  // Open Share modal
  const handleOpenShareModal = (item: LearningResourceItem) => {
    setShareModalItem(item);
    trackResourceAccess(item.id);
  };

  // Handle native Web Share API
  const handleNativeShare = async (item: LearningResourceItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.titleKhmer,
          text: `${item.titleKhmer} (${item.titleEnglish}) - ធនធានសិក្សាផ្លូវការ MoEYS\n${item.descriptionKhmer}`,
          url: item.url
        });
        showToast('បានចែករំលែកជោគជ័យ!', 'success');
      } catch (err) {
        // user cancelled or error
      }
    } else {
      handleCopyLink(item.url, item.id, item.titleKhmer);
    }
  };

  // Helper to compute average rating for a resource
  const getAverageRating = (resourceId: string) => {
    const data = ratingsMap[resourceId];
    if (!data || data.totalVotes === 0) return { avg: 5.0, count: 0, userVote: undefined };
    const avg = Number((data.sumScore / data.totalVotes).toFixed(1));
    return { avg, count: data.totalVotes, userVote: data.userVote };
  };

  // Filtered resources list
  const filteredResources = useMemo(() => {
    return allCombinedResources.filter(item => {
      // Type filter (Platforms vs Videos)
      if (selectedType === 'platform' && item.type !== 'platform') return false;
      if (selectedType === 'video' && item.type !== 'video') return false;

      // Grade filter
      if (selectedGrade !== 'all') {
        if (item.grade !== selectedGrade) return false;
      }

      // Subject filter
      if (selectedSubject !== 'all') {
        if (item.subject !== selectedSubject && item.subject !== 'all') return false;
      }

      // Tag filter
      if (selectedTag !== 'all') {
        if (!item.tags || !item.tags.includes(selectedTag)) return false;
      }

      // Only Favorites
      if (onlyFavorites && !favoriteIds.includes(item.id)) {
        return false;
      }

      // Only High Rated (>= 4.85)
      if (onlyHighRated) {
        const { avg } = getAverageRating(item.id);
        if (avg < 4.85) return false;
      }

      // Only With Tips
      if (onlyWithTips) {
        const count = commentsList.filter(c => c.resourceId === item.id).length;
        if (count === 0) return false;
      }

      // Only With Teacher Notes
      if (onlyWithNotes) {
        if (!teacherNotesMap[item.id]) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.titleKhmer.toLowerCase().includes(q) || item.titleEnglish.toLowerCase().includes(q);
        const matchesDesc = item.descriptionKhmer.toLowerCase().includes(q);
        const matchesSubject = item.subjectNameKhmer.toLowerCase().includes(q);
        const matchesGrade = item.grade ? `ថ្នាក់ទី${item.grade}`.includes(q) || `grade ${item.grade}`.includes(q) || `${item.grade}` === q : false;
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        
        // Also search within comments/tips
        const matchesTips = commentsList.some(c => c.resourceId === item.id && (c.content.toLowerCase().includes(q) || c.authorName.toLowerCase().includes(q)));
        // Also search within private teacher notes
        const note = teacherNotesMap[item.id];
        const matchesNotes = note ? (note.noteContent.toLowerCase().includes(q) || (note.teachingStrategies && note.teachingStrategies.some(s => s.toLowerCase().includes(q)))) : false;

        return matchesTitle || matchesDesc || matchesSubject || matchesGrade || matchesTags || matchesTips || matchesNotes;
      }

      return true;
    });
  }, [allCombinedResources, searchQuery, selectedGrade, selectedSubject, selectedType, selectedTag, onlyFavorites, onlyHighRated, onlyWithTips, onlyWithNotes, favoriteIds, ratingsMap, commentsList, teacherNotesMap]);

  // Pinned favorite items list
  const savedFavoriteItems = useMemo(() => {
    return allCombinedResources.filter(r => favoriteIds.includes(r.id));
  }, [allCombinedResources, favoriteIds]);

  // Resolved Recently Viewed Items
  const resolvedRecentItems = useMemo(() => {
    return recentlyViewed
      .map(rv => {
        const item = allCombinedResources.find(r => r.id === rv.resourceId);
        return item ? { ...item, accessedAt: rv.accessedAt } : null;
      })
      .filter((item): item is (LearningResourceItem & { accessedAt: string }) => item !== null);
  }, [allCombinedResources, recentlyViewed]);

  // Selected item for comment drawer
  const activeCommentResource = useMemo(() => {
    return allCombinedResources.find(r => r.id === activeCommentDrawerId);
  }, [allCombinedResources, activeCommentDrawerId]);

  const activeComments = useMemo(() => {
    if (!activeCommentDrawerId) return [];
    return commentsList.filter(c => c.resourceId === activeCommentDrawerId);
  }, [activeCommentDrawerId, commentsList]);

  // Handle Export Filtered List to PDF
  const handleDownloadPdf = async () => {
    setIsPdfExporting(true);
    setShowPdfPreviewModal(true);
    setTimeout(async () => {
      try {
        const element = document.getElementById('learning-resources-pdf-export');
        if (element) {
          await downloadElementAsPdf(
            element,
            `បញ្ជីធនធានសិក្សា_MoEYS_${new Date().toISOString().slice(0, 10)}.pdf`,
            {
              landscape: false,
              marginMm: 8,
              quality: 1.0,
              scale: 2
            }
          );
          showToast('បានទាញយកឯកសារ PDF ជោគជ័យ!', 'success');
        }
      } catch (err) {
        console.error('PDF export error:', err);
        showToast('មានបញ្ហាក្នុងការទាញយក PDF សូមសាកល្បងបោះពុម្ពជំនួសវិញ', 'error');
      } finally {
        setIsPdfExporting(false);
      }
    }, 400);
  };

  const handlePrintDocument = () => {
    setShowPdfPreviewModal(true);
    setTimeout(() => {
      printElement('learning-resources-pdf-export', {
        landscape: false,
        pageTitle: 'បញ្ជីធនធានសិក្សា និងថ្នាលឌីជីថល MoEYS'
      });
    }, 300);
  };

  return (
    <div className="space-y-6 font-battambang animate-fade-in pb-12">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ប្រភពធនធានសិក្សាផ្លូវការ MoEYS Official Digital Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-moul tracking-wide leading-relaxed text-amber-300">
              ការសិក្សាផ្សេងៗ & ថ្នាលឌីជីថល MoEYS
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
              បណ្តុំវីដេអូបង្រៀនថ្នាក់ទី១-៦ មុខវិជ្ជាភាសាខ្មែរ & គណិតវិទ្យា ថ្នាលបឋម PLP និងសាលាឌីជីថល រួមជាមួយការបោះឆ្នោតផ្កាយ ៥ ចែករំលែកគន្លឹះបង្រៀន និងការទាញយកជា PDF សម្រាប់ប្រើប្រាស់ក្រៅបណ្តាញ។
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* Download as PDF button in Hero */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfExporting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-lg shadow-amber-900/30 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              title="ទាញយកបញ្ជីធនធានដែលបានចម្រាញ់ជាទម្រង់ PDF សម្រាប់បោះពុម្ព ឬប្រើប្រាស់ក្រៅបណ្តាញ"
            >
              <Download className="w-4 h-4" />
              <span>{isPdfExporting ? 'កំពុងបង្កើត PDF...' : 'ទាញយកជា PDF'}</span>
            </button>

            <a
              href="https://plp.moeys.gov.kh/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackResourceAccess('plp')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
            >
              <Globe className="w-4 h-4" />
              <span>ថ្នាលបឋម PLP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://sala.moeys.gov.kh/kh"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackResourceAccess('sala')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-blue-900 rounded-2xl font-bold text-xs shadow-lg transition-all hover:scale-105"
            >
              <MonitorPlay className="w-4 h-4 text-blue-600" />
              <span>សាលាឌីជីថល</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 1. FEATURE: 'Recently Viewed' Section (៥ ធនធានដែលបានចូលមើលថ្មីៗ) */}
      {resolvedRecentItems.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-moul text-xs sm:text-sm text-slate-100">
                    ធនធានដែលបានបើកមើលថ្មីៗ (Recently Viewed)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                    {resolvedRecentItems.length} / 5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  តាមដាន ៥ តំណភ្ជាប់ចុងក្រោយដែលលោកគ្រូ-អ្នកគ្រូបានចុចចូលមើល ឬទាញយក
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearRecentlyViewed}
              className="px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="សម្អាតប្រវត្តិ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>សម្អាត</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            {resolvedRecentItems.map(item => (
              <div
                key={`recent-${item.id}`}
                className="group p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/60 transition-all duration-200 flex flex-col justify-between gap-2 shadow-2xs hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${item.badgeColor}`}>
                    {item.grade ? `ថ្នាក់ទី${item.grade}` : 'ថ្នាលជាតិ'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {item.accessedAt}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackResourceAccess(item.id)}
                  className="font-bold text-xs text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
                >
                  {item.titleKhmer}
                </a>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px]">
                  <span className="text-slate-400 truncate max-w-[100px]">{item.subjectNameKhmer}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackResourceAccess(item.id)}
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold"
                  >
                    <span>បើក</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FEATURE: 'Recommended for You' Section (ផ្អែកលើចំណូលចិត្ត & Tags ដែលលោកគ្រូ-អ្នកគ្រូបានរក្សាទុក) */}
      <RecommendedResourcesSection
        allResources={allCombinedResources}
        favoriteIds={favoriteIds}
        ratingsMap={ratingsMap}
        teacherNotesMap={teacherNotesMap}
        onToggleFavorite={toggleFavorite}
        onOpenResource={(res) => {
          trackResourceAccess(res.id);
          window.open(res.url, '_blank', 'noopener,noreferrer');
        }}
        onOpenNotesModal={(res) => setActiveNotesResource(res)}
        onOpenQrModal={(res) => handleOpenQrModal(res.titleKhmer, res.url, res.id)}
      />

      {/* Quick Pinned Tray: Saved Resources (ធនធានបានរក្សាទុក) with Bulk CSV Import */}
      {savedFavoriteItems.length > 0 && (
        <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Bookmark className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="font-moul text-xs sm:text-sm text-amber-950">
                  ធនធានដែលបានរក្សាទុក (Saved Resources - {savedFavoriteItems.length})
                </h3>
                <p className="text-[11px] text-amber-800">
                  តំណភ្ជាប់ដែលអ្នកបានកត់ចំណាំ (Pinned) សម្រាប់បើកមើល និងបង្រៀនភ្លាមៗ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk Import CSV Button */}
              <button
                type="button"
                onClick={() => setShowBulkCsvModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-2xs"
                title="នាំចូលបញ្ជីធនធានពីឯកសារ CSV"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>នាំចូល CSV (Bulk Import)</span>
              </button>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs"
                title="នាំចេញបញ្ជីធនធានជា CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>នាំចេញ CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  onlyFavorites
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{onlyFavorites ? 'បង្ហាញទាំងអស់' : 'ចម្រាញ់មើលតែចំណូលចិត្ត'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {savedFavoriteItems.map(fav => (
              <div
                key={fav.id}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-amber-200/90 text-xs shadow-xs hover:border-amber-400 transition-all shrink-0 group"
              >
                <a
                  href={fav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackResourceAccess(fav.id)}
                  className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[200px]">{fav.titleKhmer}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                </a>

                <button
                  type="button"
                  onClick={() => toggleFavorite(fav.id)}
                  className="text-amber-500 hover:text-rose-500 p-1 transition-colors"
                  title="ដកចេញពីបញ្ជីរក្សាទុក"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Search Bar, Category Filters & Tagging System */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Search & Top Action with PDF Export & CSV Import */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកតាមចំណងជើង, មុខវិជ្ជា, ថ្នាក់ទី, ស្លាក Tag, កំណត់ត្រាគ្រូ, ឬគន្លឹះបង្រៀន..."
              className="w-full pl-9 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Bulk CSV Import Button */}
            <button
              type="button"
              onClick={() => setShowBulkCsvModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="នាំចូលធនធានពីឯកសារ CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>នាំចូល CSV</span>
            </button>

            {/* Download as PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfExporting}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="ទាញយកបញ្ជីធនធានដែលបានចម្រាញ់ជាទម្រង់ PDF"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPdfExporting ? 'កំពុងបង្កើត...' : 'ទាញយកជា PDF'}</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrintDocument}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="បោះពុម្ពបញ្ជីធនធាន"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>បោះពុម្ព</span>
            </button>

            {/* Reset all filters */}
            {(searchQuery || selectedGrade !== 'all' || selectedSubject !== 'all' || selectedType !== 'all' || selectedTag !== 'all' || onlyFavorites || onlyHighRated || onlyWithTips || onlyWithNotes) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGrade('all');
                  setSelectedSubject('all');
                  setSelectedType('all');
                  setSelectedTag('all');
                  setOnlyFavorites(false);
                  setOnlyHighRated(false);
                  setOnlyWithTips(false);
                  setOnlyWithNotes(false);
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>កំណត់ឡើងវិញ</span>
              </button>
            )}
            
            <div className="px-3 py-2 bg-blue-50 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold">
              រកឃើញ {filteredResources.length} / {allCombinedResources.length} ធនធាន
            </div>
          </div>
        </div>

        {/* 3. FEATURE: Tagging System Filters (ស្លាក Tag ជំនួយការស្វែងរក) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>ស្លាកសម្គាល់ (Tags)៖</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            ស្លាកទាំងអស់
          </button>

          {AVAILABLE_TAGS.map(tagItem => (
            <button
              key={tagItem.id}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tagItem.id ? 'all' : tagItem.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                selectedTag === tagItem.id
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : tagItem.color
              }`}
            >
              <span>{tagItem.labelKh}</span>
              {selectedTag === tagItem.id && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>

        {/* Filter Categories: Row 1 - Resource Type & Quick Flags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Resource Type */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>ប្រភេទធនធាន៖</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ទាំងអស់ ({ALL_LEARNING_RESOURCES.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('platform')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedType === 'platform'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ថ្នាលជាតិ (PLP & Sala)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedType === 'video'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>វីដេអូបង្រៀនថ្នាក់ទី១-៦</span>
            </button>
          </div>

          {/* Quick Filter Chips: Favorites, Top Rated, Has Tips, Has Notes */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyFavorites
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
              <span>បានរក្សាទុក ({favoriteIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyHighRated(!onlyHighRated)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyHighRated
                  ? 'bg-yellow-500 text-white shadow-xs'
                  : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-yellow-500" />
              <span>ពិន្ទុខ្ពស់ ៤.៨+</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyWithTips(!onlyWithTips)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyWithTips
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>មានគន្លឹះបង្រៀន ({commentsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyWithNotes(!onlyWithNotes)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyWithNotes
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>មានកំណត់ត្រាគ្រូ ({Object.keys(teacherNotesMap).length})</span>
            </button>
          </div>
        </div>

        {/* Filter Categories: Row 2 - Grade Numbers & Subjects */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Grade Number Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1">កម្រិតថ្នាក់៖</span>
            
            <button
              type="button"
              onClick={() => setSelectedGrade('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGrade === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              គ្រប់ថ្នាក់
            </button>

            {[1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedGrade(num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGrade === num
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ថ្នាក់ទី{num}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600 mr-1">មុខវិជ្ជា៖</span>
            
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ទាំងអស់
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubject('khmer')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubject === 'khmer'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ភាសាខ្មែរ</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSubject('math')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubject === 'math'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>គណិតវិទ្យា</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FEATURE: Subtle Hover Animations on Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map(item => {
          const isFav = favoriteIds.includes(item.id);
          const isKhmer = item.subject === 'khmer';
          const isPlatform = item.type === 'platform';
          const { avg: avgRating, count: ratingCount, userVote } = getAverageRating(item.id);
          const commentsCount = commentsList.filter(c => c.resourceId === item.id).length;
          const currentHover = hoverRating[item.id] || 0;
          const teacherNote = teacherNotesMap[item.id];
          const progress = playlistProgressMap[item.id];
          const totalLessons = item.totalLessons || (progress ? progress.totalLessons : (item.type === 'video' ? 30 : 0));
          const completedCount = progress?.completedCount || 0;
          const percentCovered = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

          return (
            <div
              key={item.id}
              className={`group rounded-3xl border-2 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between gap-5 bg-gradient-to-br relative overflow-hidden ${
                item.gradientBg
              } ${
                isPlatform
                  ? 'border-indigo-200/90 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100'
                  : isKhmer
                  ? 'border-rose-200/90 hover:border-rose-400 hover:ring-2 hover:ring-rose-100'
                  : 'border-blue-200/90 hover:border-blue-400 hover:ring-2 hover:ring-blue-100'
              }`}
            >
              {/* Top ambient glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              {/* Card Header & Pin/Favorite */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 ${item.iconBg}`}
                    >
                      {isPlatform ? (
                        item.id === 'plp' ? <BookOpen className="w-5 h-5" /> : <MonitorPlay className="w-5 h-5" />
                      ) : isKhmer ? (
                        <BookOpen className="w-5 h-5" />
                      ) : (
                        <Calculator className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.grade ? `ថ្នាក់ទី${item.grade} • ${item.subjectNameKhmer}` : item.subjectNameKhmer}
                        </span>
                        {isPlatform && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ថ្នាលជាតិ
                          </span>
                        )}
                        {item.id.startsWith('custom-') && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            CSV នាំចូល
                          </span>
                        )}
                      </div>
                      <h3 className="font-moul text-sm sm:text-base text-slate-900 mt-1 leading-snug group-hover:text-blue-900 transition-colors">
                        {item.titleKhmer}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenShareModal(item)}
                      className="p-2 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-white/80 bg-white/50 border border-slate-200/60 hover:scale-105"
                      title="ចែករំលែកតំណភ្ជាប់នេះ (Share)"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-2xl transition-all cursor-pointer ${
                        isFav
                          ? 'text-amber-500 bg-amber-100/90 hover:bg-amber-200 shadow-xs scale-105'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-white/80 bg-white/50 border border-slate-200/60 hover:scale-105'
                      }`}
                      title={isFav ? 'ដកចេញពី Saved Resources' : 'រក្សាទុកទៅ Saved Resources (Sidebar)'}
                    >
                      <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Tags on Resource Card */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    {item.tags.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTag(t)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                          selectedTag === t
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white/70 hover:bg-white text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                )}

                {/* 5-Star Rating System Row */}
                <div className="p-2.5 bg-white/90 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-1.5">
                    {/* 5 Interactive Stars */}
                    <div
                      className="flex items-center gap-0.5 cursor-pointer"
                      onMouseLeave={() => setHoverRating(prev => ({ ...prev, [item.id]: 0 }))}
                    >
                      {[1, 2, 3, 4, 5].map(starNum => {
                        const isFilled = currentHover > 0 ? starNum <= currentHover : starNum <= Math.round(avgRating);
                        return (
                          <button
                            key={starNum}
                            type="button"
                            onMouseEnter={() => setHoverRating(prev => ({ ...prev, [item.id]: starNum }))}
                            onClick={() => handleRateResource(item.id, starNum)}
                            className="p-0.5 text-amber-400 hover:scale-130 transition-transform"
                            title={`បោះឆ្នោត ${starNum} ផ្កាយ`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {avgRating} <span className="text-[11px] text-slate-400 font-normal font-battambang">({ratingCount})</span>
                    </span>
                  </div>

                  {userVote ? (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      ពិន្ទុរបស់អ្នក: {userVote}★
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      ចុច ⭐ ដើម្បីបោះឆ្នោត
                    </span>
                  )}
                </div>

                {/* FEATURE: Visual Progress Indicator for Video Playlists */}
                {totalLessons > 0 && (
                  <div className="p-3 bg-white/95 rounded-2xl border border-blue-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${completedCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>វឌ្ឍនភាពបង្រៀន៖</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono font-bold">
                        <span className="text-blue-700">{completedCount}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600">{totalLessons} មេរៀន</span>
                        <span className="text-xs text-emerald-700 ml-1">({percentCovered}%)</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentCovered}%` }}
                      />
                    </div>

                    {/* Progress Control Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveProgressResource(item)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ListOrdered className="w-3 h-3" />
                        <span>ពិនិត្យបញ្ជីមេរៀន</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickIncrementProgress(item)}
                        disabled={completedCount >= totalLessons}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="កត់ត្រាបន្ថែម +១ មេរៀនដែលបានបង្រៀនចប់"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+១ មេរៀន</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* FEATURE: Teacher Notes Ribbon / Preview */}
                {teacherNote && (
                  <div
                    onClick={() => setActiveNotesResource(item)}
                    className="p-2.5 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 rounded-2xl cursor-pointer transition-colors space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>កំណត់ត្រាវិធីសាស្ត្រគ្រូ</span>
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded-md">
                        {teacherNote.updatedAt.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950 line-clamp-2 italic">
                      «{teacherNote.noteContent.replace(/<[^>]*>?/gm, '')}»
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.descriptionKhmer}
                </p>

                {/* URL preview pill */}
                <div className="p-2 bg-white/80 rounded-xl border border-slate-200/70 flex items-center justify-between text-[11px] font-mono text-slate-700">
                  <span className="truncate pr-2">{item.url}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                    MoEYS
                  </span>
                </div>
              </div>

              {/* Card Footer: Action Links & Teaching Tips Drawer trigger */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200/70 relative z-10">
                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackResourceAccess(item.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                      isPlatform
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : isKhmer
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isPlatform ? <Globe className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    <span>{isPlatform ? 'ចូលទៅកាន់ថ្នាល' : 'ទស្សនាវីដេអូ'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Teacher Note Button */}
                  <button
                    type="button"
                    onClick={() => setActiveNotesResource(item)}
                    className={`p-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                      teacherNote
                        ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="កត់ត្រាវិធីសាស្ត្របង្រៀនផ្ទាល់ខ្លួន (Teacher Note)"
                  >
                    <FileText className={`w-4 h-4 ${teacherNote ? 'text-amber-700' : 'text-slate-600'}`} />
                  </button>

                  {/* Share Quick Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenShareModal(item)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="ចែករំលែក"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(item.url, item.id, item.titleKhmer)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="ចម្លងតំណភ្ជាប់"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenQrModal(item.titleKhmer, item.url, item.id)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="បង្ហាញ QR Code សម្រាប់ស្កេន"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment & Teaching Tips Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCommentDrawerId(item.id);
                    trackResourceAccess(item.id);
                    if (item.grade) {
                      setNewTipGrade(`ថ្នាក់ទី${item.grade}`);
                    }
                  }}
                  className="w-full py-2 px-3 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs group cursor-pointer hover:border-blue-300"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>គន្លឹះបង្រៀន & មតិយោបល់</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800 text-[10px] font-bold">
                    {commentsCount} មតិ
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when filters yield no items */}
      {filteredResources.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-moul text-base text-slate-800">រកមិនឃើញធនធានសិក្សាដែលត្រូវគ្នានឹងលក្ខខណ្ឌស្វែងរក</h4>
            <p className="text-xs text-slate-500">សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬចុចប៊ូតុងកំណត់ឡើងវិញដើម្បីបង្ហាញធនធានទាំងអស់។</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedGrade('all');
              setSelectedSubject('all');
              setSelectedType('all');
              setSelectedTag('all');
              setOnlyFavorites(false);
              setOnlyHighRated(false);
              setOnlyWithTips(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            កំណត់លក្ខខណ្ឌចម្រាញ់ឡើងវិញ
          </button>
        </div>
      )}

      {/* Guide Note Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 sm:p-6 flex items-start gap-4 shadow-xs">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shrink-0 shadow-sm">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 text-xs leading-relaxed text-blue-950">
          <h4 className="font-moul text-sm text-blue-900">សេចក្តីណែនាំសម្រាប់ការប្រើប្រាស់ និងសហការ</h4>
          <p className="text-slate-700">
            • <strong>ធនធានបានបើកមើលថ្មីៗ (Recently Viewed)</strong>៖ ប្រព័ន្ធកត់ត្រា ៥ ធនធានចុងក្រោយដោយស្វ័យប្រវត្តិដើម្បីងាយស្រួលបន្តការរៀនបង្រៀន។
          </p>
          <p className="text-slate-700">
            • <strong>ទាញយកជា PDF (Download PDF)</strong>៖ ចុចប៊ូតុង «ទាញយកជា PDF» ខាងលើ ដើម្បីបោះពុម្ពបញ្ជីធនធានជាមួយ QR Code ទុកបិទក្នុងថ្នាក់ ឬចែកជូនសិស្ស-អាណាព្យាបាល។
          </p>
          <p className="text-slate-700">
            • <strong>ចែករំលែក (Share Links)</strong>៖ ចុចលើរូប Share លើកាតនីមួយៗ ដើម្បីចម្លងតំណភ្ជាប់ ឬផ្ញើទៅកាន់ Telegram / Messenger របស់គ្រូនិងអាណាព្យាបាល។
          </p>
          <p className="text-slate-700">
            • <strong>ស្លាក Tags</strong>៖ ប្រើប្រាស់ស្លាកដូចជា #Interactive #Video #Worksheet ដើម្បីស្វែងរកសម្ភារៈស្របតាមសកម្មភាពក្នុងថ្នាក់រៀន។
          </p>
        </div>
      </div>

      {/* 5. SHARE MODAL DIALOG */}
      {shareModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm text-slate-900">ចែករំលែកធនធានសិក្សា</h3>
                  <p className="text-xs text-slate-500">Share MoEYS Learning Resource</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShareModalItem(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resource Info Card Preview */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${shareModalItem.badgeColor}`}>
                  {shareModalItem.subjectNameKhmer}
                </span>
                {shareModalItem.grade && (
                  <span className="text-[10px] text-slate-500 font-bold">
                    ថ្នាក់ទី {shareModalItem.grade}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-900">{shareModalItem.titleKhmer}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{shareModalItem.descriptionKhmer}</p>
              <div className="text-[11px] font-mono text-blue-600 truncate pt-1">{shareModalItem.url}</div>
            </div>

            {/* Share Options List */}
            <div className="space-y-2">
              {/* Native Web Share API if available */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={() => handleNativeShare(shareModalItem)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>ចែករំលែកតាមកម្មវិធីទូរសព្ទ (Native Share)</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Copy URL */}
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareModalItem.url, shareModalItem.id, shareModalItem.titleKhmer)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                  <span>ចម្លងតែតំណភ្ជាប់</span>
                </button>

                {/* Copy Full Formatted Message for Telegram/Messenger */}
                <button
                  type="button"
                  onClick={async () => {
                    const message = `📚 ធនធានសិក្សាផ្លូវការ MoEYS\n\n📌 ចំណងជើង៖ ${shareModalItem.titleKhmer} (${shareModalItem.titleEnglish})\n📖 មុខវិជ្ជា៖ ${shareModalItem.subjectNameKhmer}${shareModalItem.grade ? ` (ថ្នាក់ទី${shareModalItem.grade})` : ''}\n🔗 តំណភ្ជាប់៖ ${shareModalItem.url}\n\n📝 ការពិពណ៌នា៖ ${shareModalItem.descriptionKhmer}\n\n(ចែករំលែកចេញពីប្រព័ន្ធគ្រប់គ្រងសាលាបឋមសិក្សា)`;
                    await navigator.clipboard.writeText(message);
                    showToast('បានចម្លងសារពិពណ៌នាពេញលេញសម្រាប់ផ្ញើ Telegram/Messenger!', 'success');
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>ចម្លងសារពេញលេញ</span>
                </button>
              </div>

              {/* Direct Telegram & Facebook share links */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareModalItem.url)}&text=${encodeURIComponent(`📚 ${shareModalItem.titleKhmer} - ធនធានសិក្សាផ្លូវការ MoEYS`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-sky-600" />
                  <span>ផ្ញើតាម Telegram</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModalItem.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>ចែករំលែក Facebook</span>
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShareModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teaching Tips / Comment Drawer Modal */}
      {activeCommentDrawerId && activeCommentResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-sm sm:text-base text-slate-900 leading-snug">
                    គន្លឹះបង្រៀន & មតិយោបល់ក្នុងថ្នាក់
                  </h3>
                  <p className="text-xs text-blue-700 truncate max-w-md">
                    {activeCommentResource.titleKhmer}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCommentDrawerId(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Comments List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Form to add a new tip */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-moul text-xs text-slate-800 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    <span>ចែករំលែកគន្លឹះបង្រៀនថ្មី</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    សម្រាប់លោកគ្រូ-អ្នកគ្រូ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ឈ្មោះអ្នកចែករំលែក</label>
                    <input
                      type="text"
                      value={newTipAuthor}
                      onChange={e => setNewTipAuthor(e.target.value)}
                      placeholder="ឧ. អ្នកគ្រូ សែម ស្រីអឿន"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">តួនាទី / បន្ទុកថ្នាក់</label>
                    <input
                      type="text"
                      value={newTipRole}
                      onChange={e => setNewTipRole(e.target.value)}
                      placeholder="ឧ. គ្រូបង្រៀនថ្នាក់ទី១"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ប្រភេទគន្លឹះ</label>
                    <select
                      value={newTipTag}
                      onChange={e => setNewTipTag(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="គន្លឹះបង្រៀន">💡 គន្លឹះបង្រៀន</option>
                      <option value="សកម្មភាពក្នុងថ្នាក់">🎭 សកម្មភាពក្នុងថ្នាក់</option>
                      <option value="ល្បែងសិក្សា">🎲 ល្បែងសិក្សា</option>
                      <option value="កិច្ចការផ្ទះ">📝 កិច្ចការផ្ទះ</option>
                      <option value="មតិទូទៅ">💬 មតិទូទៅ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    ខ្លឹមសារគន្លឹះ ឬរបៀបដែលលោកគ្រូ-អ្នកគ្រូយកទៅបង្រៀនក្នុងថ្នាក់ជាក់ស្តែង៖
                  </label>
                  <textarea
                    rows={3}
                    value={newTipText}
                    onChange={e => setNewTipText(e.target.value)}
                    placeholder="ឧ. ខ្ញុំបានចាក់វីដេអូត្រង់នាទីទី ០៣:២០ ឱ្យសិស្សទស្សនារួចហើយ ខ្ញុំឱ្យសិស្សធ្វើលំហាត់លើក្តារឆ្នួនជាគូ..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddComment(activeCommentResource.id)}
                    disabled={isSubmittingTip || !newTipText.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>បង្ហោះគន្លឹះបង្រៀន</span>
                  </button>
                </div>
              </div>

              {/* List of existing tips */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-moul text-xs text-slate-800">
                    គន្លឹះដែលបានចែករំលែកកន្លងមក ({activeComments.length})
                  </h4>
                </div>

                {activeComments.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Lightbulb className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-slate-500 font-bold">មិនទាន់មានគន្លឹះបង្រៀននៅឡើយទេ</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ក្លាយជាអ្នកដំបូងដែលចែករំលែកវិធីសាស្ត្របង្រៀនសម្រាប់មេរៀននេះ!
                    </p>
                  </div>
                ) : (
                  activeComments.map(comment => (
                    <div
                      key={comment.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                            {comment.authorName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{comment.authorName}</span>
                              <span className="px-2 py-0.2 rounded-full text-[9px] bg-slate-100 text-slate-600 font-bold">
                                {comment.authorRole}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{comment.createdAt}</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {comment.tag}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed pl-10">
                        {comment.content}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 pl-10">
                        <button
                          type="button"
                          onClick={() => handleLikeComment(comment.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>មានប្រយោជន៍ ({comment.likes})</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveCommentDrawerId(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scan Modal */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-moul text-sm text-slate-900">QR Code ធនធានសិក្សា</h3>
              <button
                type="button"
                onClick={() => setQrModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-xs text-blue-900">{qrModalItem.title}</h4>
              <p className="text-[11px] text-slate-500">ស្កេនដើម្បីបើកមើលលើទូរសព្ទដៃ ឬថេប្លេតផ្ទាល់</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <span>កំពុងបង្កើត QR...</span>
                </div>
              )}
            </div>

            <p className="text-[10px] font-mono text-slate-500 truncate px-2">
              {qrModalItem.url}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={qrModalItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>បើកមើល</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setQrModalItem(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      <BulkCsvImportModal
        isOpen={showBulkCsvModal}
        onClose={() => setShowBulkCsvModal(false)}
        onImportResources={handleImportCsvResources}
      />

      {/* Private Teacher Notes Rich Annotation Modal */}
      <TeacherNotesModal
        isOpen={!!activeNotesResource}
        onClose={() => setActiveNotesResource(null)}
        resource={activeNotesResource}
        currentNote={activeNotesResource ? teacherNotesMap[activeNotesResource.id] : undefined}
        onSaveNote={handleSaveTeacherNote}
        onDeleteNote={handleDeleteTeacherNote}
      />

      {/* Multi-part Video Playlist Progress Tracker Modal */}
      <PlaylistProgressModal
        isOpen={!!activeProgressResource}
        onClose={() => setActiveProgressResource(null)}
        resource={activeProgressResource}
        currentProgress={activeProgressResource ? playlistProgressMap[activeProgressResource.id] : undefined}
        onSaveProgress={handleSavePlaylistProgress}
      />

      {/* 4. FEATURE: HIDDEN PRINT/PDF TEMPLATE (Printed A4 Document) */}
      <div className="hidden">
        <div
          id="learning-resources-pdf-export"
          className="p-8 bg-white text-slate-900 space-y-6 max-w-4xl mx-auto font-battambang"
          style={{ width: '210mm', minHeight: '297mm', background: '#ffffff' }}
        >
          {/* Kingdom / MoEYS Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
            <h2 className="font-moul text-base text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</h2>
            <h3 className="font-moul text-sm text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
            <div className="w-24 h-0.5 bg-slate-800 mx-auto my-1" />
            <div className="flex justify-between items-center text-xs pt-2">
              <div className="text-left">
                <p className="font-bold">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                <p className="font-bold text-blue-900">{schoolProfile?.nameKhmer || 'សាលាបឋមសិក្សា'}</p>
              </div>
              <div className="text-right">
                <p>កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('km-KH')}</p>
                <p>ចំនួនធនធាន៖ {filteredResources.length} ធនធាន</p>
              </div>
            </div>
            <h1 className="font-moul text-base text-blue-900 pt-3">
              បញ្ជីធនធានសិក្សា និងថ្នាលឌីជីថល MoEYS ផ្លូវការ
            </h1>
            <p className="text-xs text-slate-600">
              សម្រាប់គាំទ្រការរៀននិងបង្រៀនកម្រិតបឋមសិក្សា (ថ្នាក់ទី១ ដល់ថ្នាក់ទី៦)
            </p>
          </div>

          {/* Resources Table for Print/PDF */}
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-moul text-[11px]">
                <th className="border border-slate-300 p-2 text-center w-10">ល.រ</th>
                <th className="border border-slate-300 p-2 text-left">ឈ្មោះធនធាន / មេរៀន</th>
                <th className="border border-slate-300 p-2 text-center w-24">កម្រិតថ្នាក់</th>
                <th className="border border-slate-300 p-2 text-center w-24">មុខវិជ្ជា</th>
                <th className="border border-slate-300 p-2 text-left">ការពិពណ៌នាសង្ខេប</th>
                <th className="border border-slate-300 p-2 text-center w-20">QR Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((res, index) => {
                const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(res.url)}`;
                return (
                  <tr key={res.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 text-center font-bold font-mono">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-900">
                      <div>{res.titleKhmer}</div>
                      <div className="text-[10px] text-slate-500 font-normal font-mono">{res.url}</div>
                      {res.tags && (
                        <div className="text-[9px] text-blue-700 font-sans mt-0.5">
                          {res.tags.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {res.grade ? `ថ្នាក់ទី${res.grade}` : 'គ្រប់ថ្នាក់'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      {res.subjectNameKhmer}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px] text-slate-700 leading-snug">
                      {res.descriptionKhmer}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <img
                        src={qrImg}
                        alt="QR"
                        className="w-12 h-12 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Teacher Signature & Footer */}
          <div className="pt-6 flex justify-between items-start text-xs">
            <div className="text-center space-y-12">
              <p className="font-bold">បានឃើញ និងឯកភាព</p>
              <p className="font-moul text-xs">{schoolProfile?.directorNameKhmer || 'នាយកសាលា'}</p>
            </div>
            <div className="text-center space-y-12">
              <p className="font-bold">ថ្ងៃទី........ខែ........ឆ្នាំ២០២...</p>
              <p className="font-bold">អ្នករៀបចំ / គ្រូបង្រៀន</p>
              <p className="font-bold text-slate-700">{currentUser?.nameKhmer || '................................'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
