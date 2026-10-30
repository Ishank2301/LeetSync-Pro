export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "Solved" | "Review" | "Mastered";

export interface SubmissionItem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  language: string;
  github_url: string;
  synced_at: string;
  code?: string;
  url?: string;
  tags?: string[];
  status?: ProblemStatus;
  notes?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  isFavorite?: boolean;
  lastReviewedAt?: string;
}

export interface StatsData {
  total: number;
  difficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  categories: Record<string, number>;
  languages: Record<string, number>;
  solved_titles: string[];
  history: SubmissionItem[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastSolvedDate: string;
  };
  dailyActivity: Record<string, number>; // date 'YYYY-MM-DD' -> count
}

export interface SubmissionPayload {
  title: string;
  code: string;
  language: string;
  difficulty: Difficulty;
  url?: string;
  tags?: string[];
  notes?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface SyncResponse {
  status: "success" | "error";
  message: string;
  category: string;
  github_url: string;
  filePath?: string;
}

export interface BulkSyncResult {
  status: "completed" | "error";
  synced: number;
  skipped: number;
  errors: number;
  details: {
    title: string;
    status: "synced" | "skipped" | "error";
    reason?: string;
    github_url?: string;
  }[];
}

export interface ExtensionSyncPreferences {
  submitOnlyNew: boolean;
  keepMultipleSubmissions: boolean;
  addSubmissionNote: boolean;
  lastSyncStatus: {
    success: boolean;
    message: string;
    timestamp: number;
  } | null;
}

export interface AppSettings {
  githubRepo: string;
  githubToken: string;
  branch: string;
  folderStructure: "difficulty" | "category";
  leetcodeUsername: string;
  leetcodeSession: string;
  preferences: ExtensionSyncPreferences;
}
