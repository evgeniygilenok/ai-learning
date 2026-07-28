# Agent Sandbox Profile

Review date: 2026-07-27  
Profile version: `1.0-template`  
Scope: synthetic procurement/support fixture only

## Safety and boundary statement

Use a disposable local worker, inert canaries, fake credentials, synthetic files, in-process adapters, and a fake transport that opens no socket. Do not attempt host escape, mount personal directories, expose a container-engine socket, contact a real endpoint, or put a live secret in the lab. A shared-kernel container is not a complete security boundary; move higher-impact work to a reviewed VM/microVM or dedicated worker.

## Required effective profile

```yaml
runtime: { privileged: false, runAsNonRoot: true, allowPrivilegeEscalation: false }
kernel: { capabilitiesDrop: [ALL], capabilitiesAdd: [], seccomp: RuntimeDefault }
namespaces: { hostPID: false, hostIPC: false, hostNetwork: false }
filesystem: { root: readOnly, home: none, devices: none, containerSocket: none }
mounts:
  - { path: /task/input, mode: ro, source: synthetic }
  - { path: /task/output, mode: rw, emptyAtStart: true }
  - { path: /tmp, mode: tmpfs, maxMiB: 16 }
process: { entrypoint: pinned-application, generalShell: false, packageInstall: false }
network: { ingress: deny, egress: deny, dns: deny, broker: fake-no-socket }
secrets: { ambient: deny, liveValues: forbidden, modelVisible: false }
budgets: { wallSeconds: 30, pids: 32, memoryMiB: 256, diskMiB: 32, outputMiB: 4, toolCalls: 8, retries: 1, concurrency: 1 }
```

Pin the OS/runtime, architecture, image digest, entrypoint, seccomp/AppArmor/SELinux policy, admission/policy-engine version, and this profile digest. Fail startup if a required control is unsupported; do not silently fall back to privileged, writable-root, or network-open execution.

## Tool, egress, and data rules

| Surface | Default | Only permitted exception | Evidence |
| --- | --- | --- | --- |
| Tools/process | No shell, interpreter, installer, browser, arbitrary HTTP, or unknown executable | Named adapter with strict schema, tenant/action policy, timeout/output cap | Unknown tool/field/executable and child/PID tests |
| Filesystem | Read-only root; no home, SSH, cloud config, device, engine socket, or broad source mount | One read-only input and empty task-scoped output | Mount inventory; denied write/traversal/symlink tests |
| Network | No ingress/egress/DNS | Course: no-socket fake only; production exception needs scheme/host/IP/port/method/redirect/data policy | Fake outbox remains empty for denied cases |
| Secrets/data | No value in image, env, prompt, file, log, memory, or model-visible output | Opaque task-scoped handle injected directly into one adapter | Canary/DLP scans across every sink |
| Resources | Hard per-task limits and cancellation | No automatic budget increase | Limit test, bounded children, quarantined partial output, cleanup proof |

An allowlisted destination is not permission to send all data. Validate the final resolved destination at connection time and every redirect, then authorize tenant, purpose, recipient, byte budget, and the data class issued by a trusted application resolver for the exact final payload and source lineage. Received/model-provided labels are claims only; absent, mismatched, malformed, or downgraded provenance denies. Scan every resolved egress field after canonicalization/normalization for exact and encoded canaries as defense in depth. In this lab, test only policy strings and a fake transport—never follow the URL.

## Safe verification matrix

| Case | Expected result and oracle |
| --- | --- |
| Approved input -> declared output | Allowed within limits; only the expected schema-valid file exists |
| Root/input write, outside read, traversal, escaping symlink | Denied; sentinel absent and mount state unchanged |
| Root UID, privilege, capability, host namespace/device/socket | Rejected before launch; effective runtime inspection matches profile |
| Unknown executable or excess children | Denied/stopped; bounded process tree and completed cancellation |
| Arbitrary/redirected/private/link-local URL or DNS drift | Denied; fake transport records zero sends |
| Exact or encoded/normalized canary in any final resolved request field/output/log at an allowed fake destination | DLP blocks the sink and evidence is redacted; canary stays in fixture; destination policy does not mask the result |
| Missing/forged/downgraded provenance or lineage/digest mismatch | Preparation or egress denied; fake transport records zero sends |
| Time/memory/disk/output/tool/retry limit | One terminal state; descendants cancel; partial output quarantines; next workspace is empty |

## Review record

- Effective-profile command/config evidence (redacted): `REPLACE`
- Platform deviations and stronger-isolation trigger: `REPLACE`
- Image/profile/policy/provenance-resolver digests: `sha256:REPLACE`
- Test report and owner: `REPLACE`
- Decision: `not release-ready until every REPLACE is resolved`
