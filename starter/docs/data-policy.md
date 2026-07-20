# Data and Memory Policy

For prompts, outputs, chunks, embeddings, Qdrant payloads, files, traces, evals, caches, Postgres workflow checkpoints, MCP audit records, and memories, define purpose, minimization, provenance, visibility, encryption, retention, deletion, redaction, export, and incident handling. Diagnostic evidence must not become indefinite content storage.

Course runs use synthetic data only. Structured triage requests set provider storage off. Stateful Responses API tool continuations may retain synthetic response state so `previous_response_id` can resume; document the provider retention setting before using any non-synthetic domain. OTLP export removes prompt/content/authorization attributes and should use opaque run IDs. Qdrant deletion must remove every point derived from a source; Postgres deletion must cover checkpoints by thread/user purpose; MCP logs must never contain bearer tokens or client secrets.
