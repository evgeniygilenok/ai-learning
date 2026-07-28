# VPN and Network Engineering Resources

**Last reviewed:** 2026-07-27  
**Review policy:** Recheck tool syntax, current WireGuard guidance, Proxmox behavior, Docker firewall backends, and k3s networking before production labs.

## Knowledge

- [WireGuard: Conceptual Overview](https://www.wireguard.com/)
  The production VPN's core mental model: IP packets are encapsulated over UDP, and public keys are associated with permitted tunnel addresses through cryptokey routing. Use for: architecture and peer policy.
- [WireGuard: Quick Start](https://www.wireguard.com/quickstart/)
  Official interface, key, peer, endpoint, `AllowedIPs`, and keepalive examples. Use for: the production deployment labs after routing fundamentals.
- [WireGuard: Protocol and Cryptography](https://www.wireguard.com/protocol/)
  Official summary of the handshake, rotating session keys, replay handling, and chosen primitives. Use for: understanding what the production implementation supplies.
- [WireGuard Technical Whitepaper](https://www.wireguard.com/papers/wireguard.pdf)
  Detailed protocol, cryptokey routing, handshake, transport, timers, and denial-of-service design. Use for: the advanced protocol-reading lesson, not initial setup.
- [Linux kernel: Universal TUN/TAP device driver](https://docs.kernel.org/networking/tuntap.html)
  Authoritative explanation of how user-space programs read and write IP packets through TUN or Ethernet frames through TAP. Use for: the learning-tunnel implementation.
- [ip-route(8)](https://man7.org/linux/man-pages/man8/ip-route.8.html)
  Upstream-derived manual for inspecting and changing Linux routing tables. Use for: longest-prefix matching, default routes, policy routes, and diagnosis.
- [ip-netns(8)](https://man7.org/linux/man-pages/man8/ip-netns.8.html)
  Upstream-derived manual for Linux network namespaces, including isolated interfaces, routes, and firewall rules. Use for: safe two-host labs on one machine.
- [RFC 8085: UDP Usage Guidelines](https://www.rfc-editor.org/info/rfc8085/)
  Internet Best Current Practice for message size, loss, duplication, reordering, congestion, checksums, and middleboxes. Use for: designing the educational UDP transport honestly.
- [RFC 4787: NAT Behavioral Requirements for Unicast UDP](https://www.rfc-editor.org/info/rfc4787/)
  Standard terminology and behavior for UDP mappings, filtering, timeouts, and hairpinning. Use for: home-router NAT and keepalive diagnosis.
- [RFC 4301: Security Architecture for the Internet Protocol](https://www.rfc-editor.org/info/rfc4301/)
  Standards-track model of protected versus unprotected traffic, tunnel mode, selectors, and security gateways. Use for: comparing VPN architectures and policy boundaries.
- [RFC 6169: Security Concerns with IP Tunneling](https://www.rfc-editor.org/info/rfc6169/)
  Security considerations created by tunnels, including nested traffic and bypassed controls. Use for: threat modeling and firewall placement.
- [NIST SP 800-77 Rev. 1: Guide to IPsec VPNs](https://csrc.nist.gov/pubs/sp/800/77/r1/final)
  Practical, security-focused treatment of network-layer VPN services and deployment choices. Use for: comparing WireGuard with IPsec and writing the capstone security argument.
- [Noise Protocol Framework](https://noiseprotocol.org/noise.html)
  Formal vocabulary and state-machine model for authenticated key exchange patterns; WireGuard uses a Noise-based construction. Use for: learning handshake reasoning without inventing one.
- [Go `chacha20poly1305` package](https://pkg.go.dev/golang.org/x/crypto/chacha20poly1305)
  Maintained AEAD implementation and nonce requirements. Use for: the isolated preshared-key tunnel lab; never copy or invent a cipher.
- [Docker: Networking overview](https://docs.docker.com/engine/network/)
  Official model for container interfaces, gateways, bridge networks, routing, DNS, and masquerading. Use for: reaching selected services through the VPN.
- [Docker: Packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/)
  Current interaction between Docker, IP forwarding, iptables/nftables, NAT, and published ports. Use for: preventing the VPN firewall and Docker rules from silently contradicting each other.
- [K3s: Networking](https://docs.k3s.io/networking)
  Current official entry point for Flannel, dual stack, network policy, Multus, and hybrid networking. Use for: the later home-lab integration stage only.
- [Proxmox VE Administration Guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.pdf)
  Official reference for Linux bridges, VLANs, VM networking, routing, and firewall layers. Use for: placing the production VPN gateway in a dedicated VM.

## Wisdom (Communities)

- [WireGuard IRC and mailing list](https://www.wireguard.com/)
  Primary project community for implementation and advanced operational questions. Search archives first and bring packet captures or exact configuration with secrets removed.
- [Network Engineering Stack Exchange](https://networkengineering.stackexchange.com/)
  Moderated venue for protocol, routing, NAT, MTU, and network-design questions. Use after reducing a problem to a reproducible topology and packet path.
- [Server Fault](https://serverfault.com/)
  Moderated operations community for Linux, firewall, virtualization, and VPN deployment problems in managed environments.

## Gaps

- The exact home-router port-forwarding and firewall procedure cannot be selected until the router model and ISP/CGNAT situation are known.
- The final k3s route and policy design depends on the chosen CNI, pod/service CIDRs, and whether access should terminate at ingress, nodes, services, or pods.
