import { DatabaseSync } from "node:sqlite";
import { randomUUID, createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { WorkflowState } from "./workflow.ts";
import type { ToolContext, ToolExecutionStore, ToolResult } from "./tools.ts";
import type { RetrievedChunk } from "./retrieval.ts";

export type PracticeConfig = {
  mode: "fake" | "real";
  model: string;
  maxCalls: number;
  maxAttempts: number;
  batchSize: number;
  spendCeiling: number;
  inputPrice: number;
  outputPrice: number;
  scopes: string[];
};
export type PracticeJob = {
  eventId: string;
  request: string;
  transferId: string;
  context: ToolContext;
  evidence: RetrievedChunk[];
  config: PracticeConfig;
  state: WorkflowState;
  calls: number;
  attempts: number;
  nextAttemptAt: number;
  decision?: "approve" | "reject";
  decisionBy?: string;
  error?: string;
  cancelled?: boolean;
  reservedUsd: number;
};

/** The effects table IS the synthetic effect. No remote write occurs. */
export class PracticeStore {
  readonly db: DatabaseSync;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY, payload TEXT NOT NULL, body TEXT NOT NULL,
        owner TEXT, lease_until INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS effects (key TEXT PRIMARY KEY, body TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS budget (id INTEGER PRIMARY KEY CHECK(id=1), reserved REAL NOT NULL);
      INSERT OR IGNORE INTO budget VALUES (1, 0);`);
  }
  close() { this.db.close(); }
  transaction<T>(run: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try { const result = run(); this.db.exec("COMMIT"); return result; }
    catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  enqueue(job: PracticeJob): PracticeJob {
    const payload = createHash("sha256").update(JSON.stringify([job.request, job.transferId])).digest("hex");
    return this.transaction(() => {
      const existing = this.db.prepare("SELECT payload, body FROM jobs WHERE id=?").get(job.eventId);
      if (existing) {
        if (existing.payload !== payload) throw new Error("Event ID already belongs to a different case");
        return JSON.parse(String(existing.body));
      }
      this.db.prepare("INSERT INTO jobs(id,payload,body) VALUES (?,?,?)").run(job.eventId, payload, JSON.stringify(job));
      return job;
    });
  }
  load(id: string): PracticeJob {
    const row = this.db.prepare("SELECT body FROM jobs WHERE id=?").get(id);
    if (!row) throw new Error(`Unknown case ${id}`);
    return JSON.parse(String(row.body));
  }
  list(): PracticeJob[] {
    return this.db.prepare("SELECT body FROM jobs ORDER BY rowid").all().map(row => JSON.parse(String(row.body)));
  }
  effects(): ToolResult[] {
    return this.db.prepare("SELECT body FROM effects ORDER BY key").all().map(row => JSON.parse(String(row.body)));
  }
  claim(id: string, now = Date.now()): string {
    const owner = randomUUID();
    const result = this.db.prepare("UPDATE jobs SET owner=?, lease_until=? WHERE id=? AND (owner IS NULL OR lease_until<=?)")
      .run(owner, now + 300_000, id, now);
    if (!result.changes) throw new Error("Case is busy; wait for its five-minute lease to expire after a crash");
    return owner;
  }
  assertOwner(id: string, owner: string) {
    const row = this.db.prepare("SELECT owner,lease_until FROM jobs WHERE id=?").get(id);
    if (row?.owner !== owner || Number(row.lease_until) <= Date.now()) throw new Error("Worker lease expired or changed");
  }
  save(job: PracticeJob, owner: string) {
    this.transaction(() => {
      this.assertOwner(job.eventId, owner);
      this.db.prepare("UPDATE jobs SET body=?, lease_until=? WHERE id=?").run(JSON.stringify(job), Date.now() + 300_000, job.eventId);
    });
  }
  release(id: string, owner: string) {
    this.db.prepare("UPDATE jobs SET owner=NULL,lease_until=0 WHERE id=? AND owner=?").run(id, owner);
  }
  decide(id: string, decision: "approve" | "reject", actor: string): PracticeJob {
    const owner = this.claim(id);
    try {
      const job = this.load(id);
      if (job.cancelled || job.state.status !== "awaiting-approval") throw new Error("Only a pending proposal can receive a decision");
      if (job.decision && job.decision !== decision) throw new Error("Decision already recorded; submit a new case to change it");
      job.decision = decision;
      job.decisionBy = actor;
      this.save(job, owner);
      return job;
    } finally { this.release(id, owner); }
  }
  cancel(id: string): PracticeJob {
    const owner = this.claim(id);
    try {
      const job = this.load(id);
      if (["complete", "rejected"].includes(job.state.status)) throw new Error("Completed cases cannot be cancelled");
      job.cancelled = true;
      job.state.finalText = "Cancelled by the local operator. Existing effects remain recorded.";
      this.save(job, owner);
      return job;
    } finally { this.release(id, owner); }
  }
  reserve(job: PracticeJob, owner: string, amount: number) {
    this.transaction(() => {
      this.assertOwner(job.eventId, owner);
      if (job.calls >= job.config.maxCalls) throw new Error("Application call budget exhausted");
      const total = Number(this.db.prepare("SELECT reserved FROM budget WHERE id=1").get()!.reserved);
      if (total + amount > job.config.spendCeiling) throw new Error("Local estimated spend ceiling reached");
      job.calls++;
      job.reservedUsd += amount;
      this.db.prepare("UPDATE budget SET reserved=? WHERE id=1").run(total + amount);
      this.db.prepare("UPDATE jobs SET body=?,lease_until=? WHERE id=?").run(JSON.stringify(job), Date.now() + 300_000, job.eventId);
    });
  }
  executionStore(id: string, owner: string): ToolExecutionStore {
    return {
      get: key => {
        this.assertOwner(id, owner);
        const row = this.db.prepare("SELECT body FROM effects WHERE key=?").get(key);
        return row ? JSON.parse(String(row.body)) : undefined;
      },
      set: (key, result) => this.transaction(() => {
        this.assertOwner(id, owner);
        this.db.prepare("INSERT INTO effects(key,body) VALUES (?,?)").run(key, JSON.stringify(result));
      })
    };
  }
}
