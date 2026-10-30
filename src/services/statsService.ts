import { Difficulty, ProblemStatus, StatsData, SubmissionItem } from "../types";

const STORAGE_KEY = "leetsync_pro_stats_v2";

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const NOW = new Date();
const ONE_DAY = 24 * 3600 * 1000;

const INITIAL_PROBLEMS: SubmissionItem[] = [
  {
    id: "sub-1",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Hashing",
    language: "cpp",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Easy/Two_Sum.cpp",
    synced_at: new Date(NOW.getTime() - ONE_DAY * 14).toISOString(),
    url: "https://leetcode.com/problems/two-sum/",
    tags: ["Array", "Hash Table"],
    status: "Mastered",
    notes: "One-pass hash table map storing number -> index complement.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    isFavorite: true,
    code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int comp = target - nums[i];
            if (seen.count(comp)) return {seen[comp], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
  },
  {
    id: "sub-2",
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked Lists",
    language: "python3",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Easy/Reverse_Linked_List.py",
    synced_at: new Date(NOW.getTime() - ONE_DAY * 10).toISOString(),
    url: "https://leetcode.com/problems/reverse-linked-list/",
    tags: ["Linked List", "Recursion"],
    status: "Mastered",
    notes: "Standard prev, curr, next pointer iteration or recursion.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    isFavorite: false,
    code: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev`,
  },
  {
    title: "Climbing Stairs",
    id: "sub-3",
    difficulty: "Easy",
    category: "DP",
    language: "javascript",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Easy/Climbing_Stairs.js",
    synced_at: new Date(NOW.getTime() - ONE_DAY * 7).toISOString(),
    url: "https://leetcode.com/problems/climbing-stairs/",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    status: "Solved",
    notes: "Fibonacci recurrence f(n) = f(n-1) + f(n-2). Space optimized to 2 variables.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    isFavorite: false,
    code: `function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`,
  },
  {
    id: "sub-4",
    title: "Course Schedule",
    difficulty: "Medium",
    category: "Graph",
    language: "python3",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Medium/Course_Schedule.py",
    synced_at: new Date(NOW.getTime() - ONE_DAY * 4).toISOString(),
    url: "https://leetcode.com/problems/course-schedule/",
    tags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    status: "Review",
    notes: "Kahn's topological sort using indegrees queue, or 3-state DFS cycle detection.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    isFavorite: true,
    code: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for course, pre in prerequisites:
            adj[pre].append(course)
            indegree[course] += 1
        q = collections.deque([i for i in range(numCourses) if indegree[i] == 0])
        count = 0
        while q:
            node = q.popleft()
            count += 1
            for nxt in adj[node]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    q.append(nxt)
        return count == numCourses`,
  },
  {
    id: "sub-5",
    title: "Coin Change",
    difficulty: "Medium",
    category: "DP",
    language: "cpp",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Medium/Coin_Change.cpp",
    synced_at: new Date(NOW.getTime() - ONE_DAY * 2).toISOString(),
    url: "https://leetcode.com/problems/coin-change/",
    tags: ["Array", "Dynamic Programming", "Breadth-First Search"],
    status: "Review",
    notes: "Bottom-up unbounded knapsack dp[a] = min(dp[a], dp[a - c] + 1). Initialize with amount+1.",
    timeComplexity: "O(amount * coins.length)",
    spaceComplexity: "O(amount)",
    isFavorite: true,
    code: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; ++a) {
            for (int c : coins) {
                if (a - c >= 0) dp[a] = min(dp[a], dp[a - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
  },
  {
    id: "sub-6",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graph",
    language: "python3",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Medium/Number_of_Islands.py",
    synced_at: new Date(NOW.getTime() - ONE_DAY * 1).toISOString(),
    url: "https://leetcode.com/problems/number-of-islands/",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    status: "Solved",
    notes: "Sink visited islands by mutating grid in-place to '0' during 4-directional DFS traversal.",
    timeComplexity: "O(m * n)",
    spaceComplexity: "O(m * n)",
    isFavorite: true,
    code: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid: return 0
        m, n = len(grid), len(grid[0])
        count = 0
        def dfs(r, c):
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    dfs(i, j)
                    count += 1
        return count`,
  },
  {
    id: "sub-7",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    category: "Arrays",
    language: "cpp",
    github_url: "https://github.com/Ishank2301/LeetSync-Pro/blob/main/solutions/Hard/Trapping_Rain_Water.cpp",
    synced_at: NOW.toISOString(),
    url: "https://leetcode.com/problems/trapping-rain-water/",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    status: "Solved",
    notes: "Two-pointer approach maintaining leftMax and rightMax bounds with O(1) auxiliary space.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    isFavorite: true,
    code: `class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = height.size() - 1;
        int lMax = 0, rMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else water += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else water += rMax - height[r];
                r--;
            }
        }
        return water;
    }
};`,
  },
];

function recalculateStats(history: SubmissionItem[]): StatsData {
  const solvedTitles = new Set<string>();
  const diffCount = { Easy: 0, Medium: 0, Hard: 0 };
  const catCount: Record<string, number> = {};
  const langCount: Record<string, number> = {};
  const dailyActivity: Record<string, number> = {};

  for (const item of history) {
    if (!solvedTitles.has(item.title)) {
      solvedTitles.add(item.title);
      diffCount[item.difficulty] = (diffCount[item.difficulty] || 0) + 1;
      catCount[item.category] = (catCount[item.category] || 0) + 1;
    }
    langCount[item.language] = (langCount[item.language] || 0) + 1;

    if (item.synced_at) {
      const d = new Date(item.synced_at);
      const key = formatDateKey(d);
      dailyActivity[key] = (dailyActivity[key] || 0) + 1;
    }
  }

  // Calculate streaks
  const datesSorted = Object.keys(dailyActivity).sort();
  let currentStreak = 0;
  let longestStreak = 0;

  if (datesSorted.length > 0) {
    const todayKey = formatDateKey(new Date());
    const yesterday = new Date(Date.now() - ONE_DAY);
    const yesterdayKey = formatDateKey(yesterday);

    // check if current streak is active (solved today or yesterday)
    let checkDate = dailyActivity[todayKey] ? new Date() : dailyActivity[yesterdayKey] ? yesterday : null;

    if (checkDate) {
      while (true) {
        const key = formatDateKey(checkDate);
        if (dailyActivity[key]) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - ONE_DAY);
        } else {
          break;
        }
      }
    }

    // Longest streak
    let tempStreak = 0;
    let prevTimestamp = 0;
    for (const dateStr of datesSorted) {
      const ts = new Date(dateStr).getTime();
      if (prevTimestamp === 0) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((ts - prevTimestamp) / ONE_DAY);
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevTimestamp = ts;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  return {
    total: solvedTitles.size,
    difficulty: diffCount,
    categories: catCount,
    languages: langCount,
    solved_titles: Array.from(solvedTitles),
    history,
    streak: {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastSolvedDate: datesSorted[datesSorted.length - 1] || "",
    },
    dailyActivity,
  };
}

export class StatsService {
  private static load(): StatsData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.history)) {
          return recalculateStats(parsed.history);
        }
      }
    } catch (e) {
      console.error("Failed to load stats", e);
    }

    // Initialize with rich seed data
    const initial = recalculateStats(INITIAL_PROBLEMS);
    this.save(initial);
    return initial;
  }

  private static save(data: StatsData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save stats", e);
    }
  }

  public static getStats(): StatsData {
    return this.load();
  }

  public static recordSubmission(
    title: string,
    difficulty: Difficulty,
    category: string,
    language: string = "python3",
    githubUrl: string = "",
    syncedAt?: string,
    extra?: Partial<SubmissionItem>
  ): StatsData {
    const data = this.load();
    const item: SubmissionItem = {
      id: "sub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      title,
      difficulty,
      category,
      language,
      github_url: githubUrl,
      synced_at: syncedAt || new Date().toISOString(),
      status: extra?.status || "Solved",
      notes: extra?.notes || "",
      timeComplexity: extra?.timeComplexity || "",
      spaceComplexity: extra?.spaceComplexity || "",
      isFavorite: extra?.isFavorite || false,
      tags: extra?.tags || [],
      code: extra?.code || "",
      url: extra?.url || "",
    };

    const newHistory = [...data.history, item];
    const updated = recalculateStats(newHistory);
    this.save(updated);
    return updated;
  }

  public static updateProblem(id: string, updates: Partial<SubmissionItem>): StatsData {
    const data = this.load();
    const newHistory = data.history.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    const updated = recalculateStats(newHistory);
    this.save(updated);
    return updated;
  }

  public static deleteProblem(id: string): StatsData {
    const data = this.load();
    const newHistory = data.history.filter((item) => item.id !== id);
    const updated = recalculateStats(newHistory);
    this.save(updated);
    return updated;
  }

  public static reset(): StatsData {
    const blank = recalculateStats([]);
    this.save(blank);
    return blank;
  }

  public static restoreSeed(): StatsData {
    const initial = recalculateStats(INITIAL_PROBLEMS);
    this.save(initial);
    return initial;
  }

  public static exportJSON(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  }

  public static importJSON(jsonStr: string): StatsData {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed.history)) {
      throw new Error("Invalid stats backup format: missing history array");
    }
    const updated = recalculateStats(parsed.history);
    this.save(updated);
    return updated;
  }
}
