# AI Threat Model

Last framework review: 2026-07-20. Map the actual system to OWASP Top 10 for LLM Applications 2025 and NIST AI RMF Govern/Map/Measure/Manage.

Include prompt injection, sensitive disclosure, supply chain, poisoning, improper output handling, excessive agency, system-prompt leakage, vector/embedding weaknesses, misinformation, unbounded consumption, plus MCP confused-deputy, token-passthrough, SSRF, local-server, session, consent, and scope-minimization risks.

| Asset / trust boundary | Misuse case | Prevention | Detection | Response | Residual risk |
| --- | --- | --- | --- | --- | --- |
| Tool execution | Injected document requests a write | Policy and approval outside model | Audit rejected request | Block and review trace | TBD |
| MCP tenant boundary | Client/model supplies a different tenant and asks the server to act with its own authority | Bind tenant to trusted server session and compare requested resource tenant | Denied MCP audit with actor/session and no content | Fail closed, revoke session, review client config | Local client compromise still requires host controls |
| MCP scope | Model adds an approval/scope-like argument or invokes draft under read-only scope | Strict schema; server-owned scopes and write mode | Unknown-argument or missing-scope denial | Keep write disabled; review prompt/tool exposure | Social engineering of the human approver |
| MCP replay | Client repeats an approved write after acknowledgement loss | Required idempotency key and stored result | Replayed status with same audit/effect identity | Return prior result, do not execute again | Store retention must cover retry window |
| Hosted trace export | Credentials or raw prompt content leaves the app | Redaction allowlist and secret headers outside spans | Backend field inspection and export-error alert | Disable export, rotate token, delete affected trace if supported | Metadata can still be sensitive; minimize run IDs |
