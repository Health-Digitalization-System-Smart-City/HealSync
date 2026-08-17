// Tool-call recorder (Phase 2, PRD §19–§20 "Evidence / Source awareness").
//
// Each tool reports which facts it fetched so the assistant can attach
// server-side `sources` to its answer ("Based on: getBranchPerformance …").
// Sources are recorded by the tools themselves — the LLM never fabricates
// them (the model cannot claim a tool it did not call).

export type ToolCallRecord = {
  tool: string;
  description: string;
};

export type ToolCallRecorder = (tool: string, description: string) => void;

export function createToolCallRecorder(): {
  record: ToolCallRecorder;
  records: ToolCallRecord[];
} {
  const records: ToolCallRecord[] = [];
  return {
    record: (tool, description) => records.push({ tool, description }),
    records,
  };
}

/** Deduplicates recorded tool calls, preserving first-seen order. */
export function dedupeToolRecords(
  records: ToolCallRecord[],
): ToolCallRecord[] {
  const seen = new Set<string>();
  const out: ToolCallRecord[] = [];
  for (const record of records) {
    if (seen.has(record.tool)) continue;
    seen.add(record.tool);
    out.push(record);
  }
  return out;
}
