# Notes

- Learner goals: deep networking knowledge, secure home-network access, a personal VPN server, and portfolio proof.
- Starting point recorded 2026-07-27: not yet comfortable with Linux, IP routing, sockets, or cryptography.
- Expected environment: macOS workstation/client and a future server running Proxmox, k3s, and Docker.
- Teaching default: short, detailed lessons with interactive packet models, commands that reveal real state, and failure-first labs.
- Implementation default: Go for the isolated learning tunnel because it keeps UDP, concurrency, binary framing, and Linux deployment visible without a large framework.
- Production default: WireGuard in a small dedicated Proxmox VM. Route to selected LAN/container/cluster destinations; do not place the custom learning tunnel on the public Internet.
- Confirm later: weekly time budget, home-router model, whether the ISP uses carrier-grade NAT, LAN subnet plan, and whether remote clients need home-LAN-only or full-tunnel Internet egress.
