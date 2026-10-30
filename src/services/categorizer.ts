export interface CategoryRule {
  category: string;
  keywords: [string, number][];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Graph",
    keywords: [
      ["graph", 5],
      ["node", 3],
      ["edge", 4],
      ["dfs", 5],
      ["bfs", 5],
      ["dijkstra", 5],
      ["bellman", 5],
      ["floyd", 5],
      ["topological", 5],
      ["island", 4],
      ["connected component", 5],
      ["union find", 5],
      ["disjoint set", 5],
      ["cycle", 3],
      ["neighbor", 3],
    ],
  },
  {
    category: "DP",
    keywords: [
      ["dynamic programming", 5],
      ["dp[", 5],
      ["dp =", 4],
      ["memo", 4],
      ["tabulation", 4],
      ["knapsack", 5],
      ["fibonacci", 4],
      ["lcs", 5],
      ["lis", 5],
      ["edit distance", 5],
      ["coin change", 5],
      ["max subarray", 4],
      ["partition", 3],
    ],
  },
  {
    category: "Trees",
    keywords: [
      ["tree", 5],
      ["bst", 5],
      ["root", 4],
      ["leaf", 4],
      ["inorder", 5],
      ["preorder", 5],
      ["postorder", 5],
      ["trie", 5],
      ["segment tree", 5],
      ["fenwick", 5],
      ["avl", 5],
      ["treenode", 5],
      ["lca", 5],
    ],
  },
  {
    category: "Heap / Priority Queue",
    keywords: [
      ["heap", 5],
      ["heapq", 5],
      ["priority queue", 5],
      ["min heap", 5],
      ["max heap", 5],
      ["heappush", 5],
      ["heappop", 5],
      ["k largest", 4],
      ["k smallest", 4],
    ],
  },
  {
    category: "Sliding Window",
    keywords: [
      ["sliding window", 5],
      ["window size", 4],
      ["two pointer", 4],
      ["left, right", 3],
      ["shrink", 3],
      ["expand", 3],
    ],
  },
  {
    category: "Binary Search",
    keywords: [
      ["binary search", 5],
      ["bisect", 5],
      ["mid =", 4],
      ["lo, hi", 4],
      ["left, right", 3],
      ["sorted array", 3],
      ["search rotated", 5],
    ],
  },
  {
    category: "Linked Lists",
    keywords: [
      ["listnode", 5],
      ["linked list", 5],
      ["next.next", 5],
      ["dummy", 4],
      ["reverse list", 5],
      ["slow, fast", 4],
      ["cycle detection", 5],
    ],
  },
  {
    category: "Backtracking",
    keywords: [
      ["backtrack", 5],
      ["permutation", 4],
      ["combination", 4],
      ["subset", 4],
      ["n-queens", 5],
      ["sudoku", 5],
      ["pruning", 3],
    ],
  },
  {
    category: "Greedy",
    keywords: [
      ["greedy", 5],
      ["interval", 4],
      ["meeting rooms", 5],
      ["activity selection", 5],
      ["jump game", 5],
      ["gas station", 5],
    ],
  },
  {
    category: "Hashing",
    keywords: [
      ["hashmap", 5],
      ["hash map", 5],
      ["counter", 4],
      ["frequency", 3],
      ["defaultdict", 4],
      ["seen", 3],
      ["visited", 3],
      ["anagram", 4],
    ],
  },
  {
    category: "Strings",
    keywords: [
      ["string", 4],
      ["char", 3],
      ["substring", 4],
      ["palindrome", 5],
      ["regex", 4],
      ["parse", 3],
      ["encode", 3],
      ["decode", 3],
      ["roman", 4],
      ["wildcard", 4],
    ],
  },
  {
    category: "Arrays",
    keywords: [
      ["array", 3],
      ["subarray", 4],
      ["nums", 3],
      ["matrix", 4],
      ["rotate", 3],
      ["spiral", 4],
      ["prefix sum", 5],
      ["difference array", 5],
    ],
  },
  {
    category: "Math",
    keywords: [
      ["math", 4],
      ["prime", 5],
      ["gcd", 5],
      ["lcm", 5],
      ["modulo", 4],
      ["bit manipulation", 5],
      ["xor", 4],
      ["power", 3],
      ["sqrt", 4],
    ],
  },
];

export class CategorizerService {
  public static categorize(title: string, code: string, tags?: string[]): string {
    const titleLower = title.toLowerCase();
    const codeLower = code.toLowerCase();

    // If LeetCode provides topic tags, use them as strong hints
    if (tags && tags.length > 0) {
      const tagsLower = tags.map((t) => t.toLowerCase());
      for (const rule of CATEGORY_RULES) {
        for (const [kw] of rule.keywords) {
          if (tagsLower.some((tag) => tag.includes(kw))) {
            return rule.category;
          }
        }
      }
    }

    const scores: Record<string, number> = {};
    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const [kw, weight] of rule.keywords) {
        if (titleLower.includes(kw)) {
          score += weight * 2; // Title is a strong signal
        }
        if (codeLower.includes(kw)) {
          score += weight;
        }
      }
      if (score > 0) {
        scores[rule.category] = score;
      }
    }

    const categories = Object.keys(scores);
    if (categories.length === 0) {
      return "Misc";
    }

    // Get top scorer
    let topCategory = categories[0];
    let topScore = scores[topCategory];
    for (const cat of categories) {
      if (scores[cat] > topScore) {
        topCategory = cat;
        topScore = scores[cat];
      }
    }

    // Common problems that shouldn't be DP
    if (topCategory === "DP" && ["two sum", "three sum", "k sum"].includes(titleLower)) {
      return scores["Hashing"] ? "Hashing" : scores["Arrays"] ? "Arrays" : topCategory;
    }

    return topCategory;
  }
}
