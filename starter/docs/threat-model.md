# AI Threat Model

Last framework review: 2026-07-17. Map the actual system to OWASP Top 10 for LLM Applications 2025 and NIST AI RMF Govern/Map/Measure/Manage.

Include prompt injection, sensitive disclosure, supply chain, poisoning, improper output handling, excessive agency, system-prompt leakage, vector/embedding weaknesses, misinformation, unbounded consumption, plus MCP confused-deputy, token-passthrough, SSRF, local-server, session, consent, and scope-minimization risks.

| Asset / trust boundary | Misuse case | Prevention | Detection | Response | Residual risk |
| --- | --- | --- | --- | --- | --- |
| Tool execution | Injected document requests a write | Policy and approval outside model | Audit rejected request | Block and review trace | TBD |
