import { ActivityLogItem, ActivityLogComment } from '../types';
import { getStoredActivities, saveActivitiesToStorage } from './activityTracker';

const ACTIVITY_COMMENTS_STORAGE_KEY = 'phnom_pom_activity_comments_map';

/**
 * Get all comments mapped by logId
 */
export function getCommentsMap(): Record<string, ActivityLogComment[]> {
  try {
    const saved = localStorage.getItem(ACTIVITY_COMMENTS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load comments map', e);
  }
  return {};
}

/**
 * Save comments map to local storage
 */
export function saveCommentsMap(map: Record<string, ActivityLogComment[]>): void {
  try {
    localStorage.setItem(ACTIVITY_COMMENTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save comments map', e);
  }
}

/**
 * Get comments for a specific log item
 */
export function getCommentsForLog(logId: string, item?: ActivityLogItem): ActivityLogComment[] {
  const map = getCommentsMap();
  if (map[logId] && map[logId].length > 0) {
    return map[logId];
  }
  if (item?.comments && item.comments.length > 0) {
    return item.comments;
  }
  return [];
}

/**
 * Add a new comment to an activity log item
 */
export function addCommentToLog(
  logId: string,
  text: string,
  authorName: string = 'គណៈគ្រប់គ្រងសាលា',
  authorRole: string = 'នាយកសាលា/រដ្ឋបាល'
): { comment: ActivityLogComment; updatedLogs: ActivityLogItem[] } {
  const newComment: ActivityLogComment = {
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorName,
    authorRole,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  // 1. Update Map
  const map = getCommentsMap();
  const existingForLog = map[logId] || [];
  map[logId] = [newComment, ...existingForLog];
  saveCommentsMap(map);

  // 2. Update Logs in Storage
  const storedLogs = getStoredActivities();
  const updatedLogs = storedLogs.map(item => {
    if (item.id === logId) {
      return {
        ...item,
        comments: map[logId]
      };
    }
    return item;
  });
  saveActivitiesToStorage(updatedLogs);

  return { comment: newComment, updatedLogs };
}

/**
 * Delete a comment from a log item
 */
export function deleteCommentFromLog(
  logId: string,
  commentId: string
): { updatedLogs: ActivityLogItem[] } {
  const map = getCommentsMap();
  if (map[logId]) {
    map[logId] = map[logId].filter(c => c.id !== commentId);
    saveCommentsMap(map);
  }

  const storedLogs = getStoredActivities();
  const updatedLogs = storedLogs.map(item => {
    if (item.id === logId) {
      return {
        ...item,
        comments: map[logId] || []
      };
    }
    return item;
  });
  saveActivitiesToStorage(updatedLogs);

  return { updatedLogs };
}

/**
 * Enriches activity logs with their stored comments
 */
export function enrichLogsWithComments(logs: ActivityLogItem[]): ActivityLogItem[] {
  const map = getCommentsMap();
  return logs.map(item => {
    const comments = map[item.id] || item.comments || [];
    return {
      ...item,
      comments
    };
  });
}
