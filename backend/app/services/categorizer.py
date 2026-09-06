from typing import List, Tuple


# Each entry: (category, [(keyword, weight), ...])
# Higher weight = stronger signal. Title matches are boosted x2.
CATEGORY_RULES: List[Tuple[str, List[Tuple[str, int]]]] = [
    (
        "Graph",
        [
            ("graph", 5),
            ("node", 3),
            ("edge", 4),
            ("dfs", 5),
            ("bfs", 5),
            ("dijkstra", 5),
            ("bellman", 5),
            ("floyd", 5),
            ("topological", 5),
            ("island", 4),
            ("connected component", 5),
            ("union find", 5),
            ("disjoint set", 5),
            ("cycle", 3),
            ("neighbor", 3),
        ],
    ),
    (
        "DP",
        [
            ("dynamic programming", 5),
            ("dp[", 5),
            ("dp =", 4),
            ("memo", 4),
            ("tabulation", 4),
            ("knapsack", 5),
            ("fibonacci", 4),
            ("lcs", 5),
            ("lis", 5),
            ("edit distance", 5),
            ("coin change", 5),
            ("max subarray", 4),
            ("partition", 3),
        ],
    ),
    (
        "Trees",
        [
            ("tree", 5),
            ("bst", 5),
            ("root", 4),
            ("leaf", 4),
            ("inorder", 5),
            ("preorder", 5),
            ("postorder", 5),
            ("trie", 5),
            ("segment tree", 5),
            ("fenwick", 5),
            ("avl", 5),
            ("treenode", 5),
            ("lca", 5),
        ],
    ),
    (
        "Heap / Priority Queue",
        [
            ("heap", 5),
            ("heapq", 5),
            ("priority queue", 5),
            ("min heap", 5),
            ("max heap", 5),
            ("heappush", 5),
            ("heappop", 5),
            ("k largest", 4),
            ("k smallest", 4),
        ],
    ),
    (
        "Sliding Window",
        [
            ("sliding window", 5),
            ("window size", 4),
            ("two pointer", 4),
            ("left, right", 3),
            ("shrink", 3),
            ("expand", 3),
        ],
    ),
    (
        "Binary Search",
        [
            ("binary search", 5),
            ("bisect", 5),
            ("mid =", 4),
            ("lo, hi", 4),
            ("left, right", 3),
            ("sorted array", 3),
            ("search rotated", 5),
        ],
    ),
    (
        "Linked Lists",
        [
            ("listnode", 5),
            ("linked list", 5),
            ("next.next", 5),
            ("dummy", 4),
            ("reverse list", 5),
            ("slow, fast", 4),
            ("cycle detection", 5),
        ],
    ),
    (
        "Backtracking",
        [
            ("backtrack", 5),
            ("permutation", 4),
            ("combination", 4),
            ("subset", 4),
            ("n-queens", 5),
            ("sudoku", 5),
            ("pruning", 3),
        ],
    ),
    (
        "Greedy",
        [
            ("greedy", 5),
            ("interval", 4),
            ("meeting rooms", 5),
            ("activity selection", 5),
            ("jump game", 5),
            ("gas station", 5),
        ],
    ),
    (
        "Hashing",
        [
            ("hashmap", 5),
            ("hash map", 5),
            ("counter", 4),
            ("frequency", 3),
            ("defaultdict", 4),
            ("seen", 3),
            ("visited", 3),
            ("anagram", 4),
        ],
    ),
    (
        "Strings",
        [
            ("string", 4),
            ("char", 3),
            ("substring", 4),
            ("palindrome", 5),
            ("regex", 4),
            ("parse", 3),
            ("encode", 3),
            ("decode", 3),
            ("roman", 4),
            ("wildcard", 4),
        ],
    ),
    (
        "Arrays",
        [
            ("array", 3),
            ("subarray", 4),
            ("nums", 3),
            ("matrix", 4),
            ("rotate", 3),
            ("spiral", 4),
            ("prefix sum", 5),
            ("difference array", 5),
        ],
    ),
    (
        "Math",
        [
            ("math", 4),
            ("prime", 5),
            ("gcd", 5),
            ("lcm", 5),
            ("modulo", 4),
            ("bit manipulation", 5),
            ("xor", 4),
            ("power", 3),
            ("sqrt", 4),
        ],
    ),
]


class CategorizerService:
    @staticmethod
    def categorize(title: str, code: str, tags: list[str] | None = None) -> str:
        """
        Weighted keyword scoring across title (2x boost) and code body.
        Returns the highest-scoring category, or 'Misc' if no signal.

        Phase 2 (Future): Replace/augment with an AST parser + lightweight
        LLM classifier to handle novel patterns and aliased variable names.
        """
        title_lower = title.lower()
        code_lower = code.lower()

        # If LeetCode provides topic tags, use them as strong hints
        if tags:
            tags_lower = [t.lower() for t in tags]
            for category, keywords in CATEGORY_RULES:
                for kw, _ in keywords:
                    if any(kw in tag for tag in tags_lower):
                        return category

        scores: dict[str, int] = {}
        for category, keywords in CATEGORY_RULES:
            score = 0
            for kw, weight in keywords:
                if kw in title_lower:
                    score += weight * 2  # Title is a strong signal
                if kw in code_lower:
                    score += weight
            if score > 0:
                scores[category] = score

        if not scores:
            return "Misc"

        # Get top scorer, but apply heuristics to avoid misclassification
        top_category = max(scores, key=lambda k: scores[k])
        top_score = scores[top_category]

        # Common problems that shouldn't be DP
        if top_category == "DP" and title_lower in ["two sum", "three sum", "k sum"]:
            # These are really Hashing or Arrays problems
            return scores.get("Hashing", scores.get("Arrays", top_category))

        return top_category
