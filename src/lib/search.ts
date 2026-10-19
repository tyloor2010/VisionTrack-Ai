/** Pure search & filter-builder logic (unit-tested). */

/** Simple subsequence fuzzy match; returns a score (higher = better) or -1 for no match. */
export function fuzzyScore(query: string, target: string): number {
  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t.includes(q)) return 100 - t.indexOf(q);
  let ti = 0, score = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    score += Math.max(1, 10 - (found - ti));
    ti = found + 1;
  }
  return score;
}

export type Operator = "is" | "isNot" | "contains" | "gt" | "lt";
export type FilterRule = { field: string; op: Operator; value: string };
export type FilterGroup = { comb: "and" | "or"; rules: FilterRule[] };

export function matchRule(rule: FilterRule, row: Record<string, unknown>): boolean {
  const raw = row[rule.field];
  if (raw === undefined || raw === null) return false;
  const v = rule.value.trim().toLowerCase();
  const s = String(raw).toLowerCase();
  switch (rule.op) {
    case "is": return s === v;
    case "isNot": return s !== v;
    case "contains": return s.includes(v);
    case "gt": return Number(raw) > Number(rule.value);
    case "lt": return Number(raw) < Number(rule.value);
  }
}

/** A group matches when ALL (and) or ANY (or) of its rules match. Empty group matches everything. */
export function matchGroup(group: FilterGroup, row: Record<string, unknown>): boolean {
  if (group.rules.length === 0) return true;
  return group.comb === "and" ? group.rules.every((r) => matchRule(r, row)) : group.rules.some((r) => matchRule(r, row));
}

export function applyGroups(groups: FilterGroup[], row: Record<string, unknown>): boolean {
  return groups.every((g) => matchGroup(g, row));
}

export type SavedView = { id: string; name: string; target: "cases" | "alerts" | "cameras"; groups: FilterGroup[]; pinned: boolean };
