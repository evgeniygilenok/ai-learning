import type { WorkflowState } from "./workflow.ts";

export interface StateStore {
  load(runId: string): Promise<WorkflowState | undefined>;
  save(state: WorkflowState): Promise<void>;
}

export class InMemoryStateStore implements StateStore {
  #runs = new Map<string, WorkflowState>();
  async load(runId: string) { return this.#runs.get(runId); }
  async save(state: WorkflowState) { this.#runs.set(state.runId, structuredClone(state)); }
}
