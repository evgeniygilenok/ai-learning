export type WorkflowStatus = "triage" | "research" | "awaiting-approval" | "execute" | "complete" | "rejected";
export type WorkflowState = { runId: string; status: WorkflowStatus; approved: boolean; completedEffectIds: string[] };

export function nextState(state: WorkflowState, event: "researched" | "approve" | "reject" | "executed"): WorkflowState {
  const transitions: Record<WorkflowStatus, Partial<Record<typeof event, WorkflowStatus>>> = {
    triage: {}, research: { researched: "awaiting-approval" }, "awaiting-approval": { approve: "execute", reject: "rejected" }, execute: { executed: "complete" }, complete: {}, rejected: {}
  };
  const status = transitions[state.status][event];
  if (!status) throw new Error(`Invalid transition: ${state.status} + ${event}`);
  return { ...state, status, approved: event === "approve" ? true : state.approved };
}
