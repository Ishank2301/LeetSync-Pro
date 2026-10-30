import { BulkSyncResult, Difficulty } from "../types";
import { CategorizerService } from "./categorizer";
import { GithubService } from "./githubService";
import { StatsService } from "./statsService";

export interface MockProblem {
  title: string;
  difficulty: Difficulty;
  language: string;
  tags: string[];
  code: string;
  slug: string;
}

const BULK_SAMPLE_POOL: MockProblem[] = [
  {
    title: "Trapping Rain Water",
    difficulty: "Hard",
    language: "cpp",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    slug: "trapping-rain-water",
    code: `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int left_max = 0, right_max = 0;
        int ans = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= left_max) left_max = height[left];
                else ans += left_max - height[left];
                left++;
            } else {
                if (height[right] >= right_max) right_max = height[right];
                else ans += right_max - height[right];
                right--;
            }
        }
        return ans;
    }
};`,
  },
  {
    title: "Word Break",
    difficulty: "Medium",
    language: "python3",
    tags: ["Array", "Hash Table", "String", "Dynamic Programming", "Trie", "Memoization"],
    slug: "word-break",
    code: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        dp = [False] * (len(s) + 1)
        dp[0] = True
        for i in range(1, len(s) + 1):
            for j in range(i):
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break
        return dp[len(s)]`,
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    language: "python3",
    tags: ["Tree", "Breadth-First Search", "Binary Tree"],
    slug: "binary-tree-level-order-traversal",
    code: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:
        if not root:
            return []
        res = []
        queue = collections.deque([root])
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level)
        return res`,
  },
  {
    title: "Merge Intervals",
    difficulty: "Medium",
    language: "python3",
    tags: ["Array", "Sorting"],
    slug: "merge-intervals",
    code: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
        return merged`,
  },
  {
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    language: "cpp",
    tags: ["Two Pointers", "String", "Dynamic Programming"],
    slug: "longest-palindromic-substring",
    code: `class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        if (n <= 1) return s;
        int start = 0, max_len = 1;
        auto expand = [&](int l, int r) {
            while (l >= 0 && r < n && s[l] == s[r]) {
                if (r - l + 1 > max_len) {
                    start = l;
                    max_len = r - l + 1;
                }
                l--; r++;
            }
        };
        for (int i = 0; i < n; i++) {
            expand(i, i);
            expand(i, i + 1);
        }
        return s.substr(start, max_len);
    }
};`,
  },
  {
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    language: "python3",
    tags: ["Array", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Quickselect"],
    slug: "kth-largest-element-in-an-array",
    code: `import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        return heapq.nlargest(k, nums)[-1]`,
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    language: "typescript",
    tags: ["String", "Stack"],
    slug: "valid-parentheses",
    code: `function isValid(s: string): boolean {
    const stack: string[] = [];
    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
};`,
  },
  {
    title: "Lowest Common Ancestor of a Binary Tree",
    difficulty: "Medium",
    language: "python3",
    tags: ["Tree", "Depth-First Search", "Binary Tree"],
    slug: "lowest-common-ancestor-of-a-binary-tree",
    code: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left if left else right`,
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    language: "cpp",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    slug: "median-of-two-sorted-arrays",
    code: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int lo = 0, hi = m;
        while (lo <= hi) {
            int mid1 = (lo + hi) / 2;
            int mid2 = (m + n + 1) / 2 - mid1;
            int maxLeft1 = (mid1 == 0) ? INT_MIN : nums1[mid1 - 1];
            int minRight1 = (mid1 == m) ? INT_MAX : nums1[mid1];
            int maxLeft2 = (mid2 == 0) ? INT_MIN : nums2[mid2 - 1];
            int minRight2 = (mid2 == n) ? INT_MAX : nums2[mid2];
            if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
                if ((m + n) % 2 == 0) {
                    return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2.0;
                } else {
                    return max(maxLeft1, maxLeft2);
                }
            } else if (maxLeft1 > minRight2) {
                hi = mid1 - 1;
            } else {
                lo = mid1 + 1;
            }
        }
        return 0.0;
    }
};`,
  },
];

export class BulkSyncService {
  private githubService: GithubService;

  constructor(githubService?: GithubService) {
    this.githubService = githubService || new GithubService();
  }

  public async run(limit: number = 20): Promise<BulkSyncResult> {
    const existing = StatsService.getStats();
    const existingTitles = new Set(existing.solved_titles);

    const candidates = BULK_SAMPLE_POOL.slice(0, Math.min(limit, BULK_SAMPLE_POOL.length));
    const details: BulkSyncResult["details"] = [];
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const prob of candidates) {
      if (existingTitles.has(prob.title)) {
        skipped++;
        details.push({
          title: prob.title,
          status: "skipped",
          reason: "already_synced",
        });
        continue;
      }

      try {
        // Small delay to simulate realistic sync batching
        await new Promise((resolve) => setTimeout(resolve, 350));

        const category = CategorizerService.categorize(prob.title, prob.code, prob.tags);
        const { githubUrl } = await this.githubService.pushSubmission({
          title: prob.title,
          code: prob.code,
          language: prob.language,
          difficulty: prob.difficulty,
          category,
          url: `https://leetcode.com/problems/${prob.slug}/`,
          tags: prob.tags,
        });

        StatsService.recordSubmission(
          prob.title,
          prob.difficulty,
          category,
          prob.language,
          githubUrl
        );

        existingTitles.add(prob.title);
        synced++;
        details.push({
          title: prob.title,
          status: "synced",
          github_url: githubUrl,
        });
      } catch (err: unknown) {
        errors++;
        details.push({
          title: prob.title,
          status: "error",
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return {
      status: errors > 0 && synced === 0 ? "error" : "completed",
      synced,
      skipped,
      errors,
      details,
    };
  }
}
