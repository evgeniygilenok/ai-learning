# Mission: VPN and Network Engineering

## Why
Build deep, practical networking knowledge while creating secure remote access to a Proxmox-based home lab. Finish with both a production-grade personal VPN built from audited components and a portfolio project that demonstrates how tunneling works internally.

## Success looks like
- Trace and explain a packet through routing, a virtual interface, encryption, UDP transport, NAT, firewall policy, forwarding, and the return path.
- Diagnose common failures involving subnets, routes, DNS, NAT, MTU, stateful firewalls, Docker bridges, and k3s networking.
- Implement a Linux-only learning VPN in Go using TUN, UDP, an established AEAD library, replay protection, tests, and an isolated namespace lab.
- Operate WireGuard in a dedicated Proxmox VM for secure remote access to the home LAN and explicitly allowed Docker or k3s services.
- Produce a reproducible portfolio case study with architecture, threat model, packet captures, failure drills, security decisions, and operating runbook.

## Constraints
- Begin from limited comfort with Linux, IP routing, sockets, and cryptography.
- Use short lessons with immediate experiments, diagrams, quizzes, and observable gates.
- Default the educational implementation to Go on Linux; use the Mac as a client and workstation.
- Keep the learning tunnel isolated and treat WireGuard, not custom protocol code, as the production security boundary.
- Design for a future Proxmox server that may also host Docker and k3s.

## Out of scope
- Inventing cryptographic primitives or claiming a custom VPN protocol is production-secure.
- Operating a commercial anonymity or traffic-resale service.
- Exposing the Proxmox management interface directly to the public Internet.
- Kubernetes overlay-network internals before IP routing, NAT, firewalling, and TUN fundamentals are demonstrated.
