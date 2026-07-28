# AI Agent Component Inventory

Review date: 2026-07-27  
Inventory version: `1.0-template`  
Fixture: offline `northstar-demo` / `redwood-demo`; no live credentials, network, or external effects

## Release inventory

Replace every `REPLACE` value and attach an SBOM/lockfile before a release decision. A missing component, digest, owner, license, or provenance record fails closed.

| ID | Component and role | Version / immutable pin | Provenance and integrity | Authority / data | Owner | Drift action |
| --- | --- | --- | --- | --- | --- | --- |
| C-01 | Application/orchestrator | commit `REPLACE` | reviewed repository; signed commit/build attestation `REPLACE` | coordinates one tenant/run; no ambient tool rights | App | block candidate |
| C-02 | Model endpoint | exact snapshot `REPLACE` or alias + resolved ID/time | provider record and request ID | sees minimum envelope; cannot authorize | App | rerun full gate |
| C-03 | System prompt/task graph | `sha256:REPLACE` | reviewed source in repository | control plane; write-protected from model/content | Policy | disable changed graph |
| C-04 | Authorization policy + decision clock + provenance resolver | policy `sha256:REPLACE`; clock implementation/config `sha256:REPLACE`; resolver/policy/config `sha256:REPLACE` | tests + two-person review; clock source/monotonicity assumptions; authoritative source map and canonicalization vectors | fresh expiry; final tool/object/action/tenant decision; classification bound to exact payload/tool/destination/tenant/run/digest/lineage | Policy | fail every effect on missing/non-finite clock, resolver failure, or pin drift |
| C-05 | Tool manifest/schemas | `sha256:REPLACE` | canonical exported manifest | exposes only named fake adapters | Tool owner | reject unknown/drifted tool |
| C-06 | Fake support/procurement adapters | commit `REPLACE` | local source + dependency lock | synthetic reads/drafts/effects only | Tool owner | quarantine adapter |
| C-07 | MCP protocol/client/server | stable `2025-11-25`; SDK `REPLACE` | official spec; package lock/SBOM | stdio or authenticated scoped transport; no token passthrough | Platform | disable on protocol/tool-list drift |
| C-08 | Retrieval/memory store | schema/index `REPLACE` | fixture digest + migration record | tenant/purpose/TTL scoped synthetic data | Data | quarantine and rebuild |
| C-09 | Sandbox/runtime image | digest `sha256:REPLACE` | trusted registry/signature/SBOM | profile in `agent-sandbox-profile.md` | Platform | stop launch |
| C-10 | Eval cases/runner/scorers | case/lock/rubric digests `REPLACE` | repository + calibration evidence | synthetic input and redacted output only | Security | invalidate gate |
| C-11 | Logging/evidence sink | schema/redaction `REPLACE` | append-only/tamper-evident setting record | opaque IDs and decisions; no secrets/raw hostile text | Ops | pause release if telemetry incomplete |

## MCP and integration review

- Pin the negotiated protocol version, SDK package, server command/image, tool/resource/prompt manifests, schema, and transport configuration. Treat the MCP `2026-07-28` release candidate as emerging until final status and compatible SDK support are independently confirmed.
- Obtain server/workload identity from trusted configuration or verified transport, never model arguments. Validate token issuer, audience/resource, scope, tenant, subject, expiry, and proof; never pass an inbound token downstream.
- Validate descriptions and outputs as untrusted data. Diff tool lists/schemas at startup and runtime; new or changed capabilities stay disabled pending review.
- For every fetched URL, validate canonical scheme/host/port, resolved IP class, redirects, size, content type, and data egress policy. The course uses a no-socket fake transport.
- Local servers receive only explicit read-only synthetic mounts, no home/SSH/cloud config, container socket, devices, or inherited secrets.

## Supplier and update record

| Change | Reason/source | Security delta | Tests required | Reviewer | Decision/date |
| --- | --- | --- | --- | --- | --- |
| `REPLACE` | release/advisory/maintenance link | permissions, schema, behavior, data, transitive dependencies | manifest diff, authorization, injection, sandbox, benign utility | `REPLACE` | approve/reject; `REPLACE` |

## Acceptance checklist

- [ ] Direct and transitive packages, models, prompts, skills, MCP servers, tools, images, datasets, and scorers are present with exact pins or explicitly labeled moving.
- [ ] Source, maintainer, license, signature/attestation, vulnerability/advisory review, permissions, data flow, network destinations, owner, and rollback are recorded.
- [ ] Build verifies hashes/signatures and lock/SBOM; runtime verifies the canonical manifest, clock implementation/configuration, and provenance resolver/policy/configuration and denies drift.
- [ ] Known-good prior pins and compatible migrations are recoverable; rollback never deletes incident evidence.
- [ ] Any exception has an owner, compensating control, expiry, and release-blocking trigger.
