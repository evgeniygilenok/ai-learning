# 06. Identity, authorization, and tenant isolation

18 hours. Make access rules survive direct API calls, workers, retrieval, and tool execution. Requires modules 02, 03, and 05.

## Lesson 1. Identify the token and its intended recipient

OAuth delegates access. OpenID Connect adds an identity layer and ID tokens. An ID token for a client is not a generic access token for any API. Trace browser, identity provider, application, and downstream resource server. Explain the issuer, audience, expiry, and scopes relevant to each token. [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)

Use a maintained identity implementation with authorization-code flow and PKCE where applicable. Follow the current OAuth security guidance and the provider's documented validation. Do not copy an outdated password-flow tutorial into this system. [OAuth security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)

Worked example: a validly signed token has an audience for another service. Signature validity alone does not make it acceptable here. Write the expected rejection before configuring the identity library.

## Lesson 2. Authorization is a decision over an action and resource

Define operator and administrator roles, then add resource ownership and tenant membership. Derive the trusted tenant from verified identity and membership, rather than a browser-supplied tenant_id. Check authorization on reads, writes, exports, background jobs, and tools. Hiding a button supplies no server-side protection.

Create a policy matrix covering role, tenant, resource state, and action. A worker runs with a service identity, but each job must retain the intended tenant and delegated authority. Recheck when executing a delayed job because permissions may have changed.

Use database row security as defense in depth where it fits. PostgreSQL table owners and BYPASSRLS roles have important exceptions. Test through the actual application database role, not a superuser session. Use transaction-scoped tenant context carefully with connection pools. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Lesson 3. Trust does not come from document wording

Policy documents, tickets, and tool results can contain instructions aimed at the model. Treat them as data. A prompt instruction is insufficient to enforce a permission rule. Enforce allowed operations and data access in code, restrict outbound destinations, and log decisions without exposing credentials. OWASP describes both direct and indirect prompt injection. [OWASP prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

Before adding AI, draw where credentials, user inputs, source data, and proposed actions cross trust boundaries. Decide what data may be logged and how a deletion propagates into derived stores.

## Lab and failure drill

Create two tenants with overlapping ticket IDs and different policy documents. Implement login and both roles. Test direct object-reference changes, token audience mismatch, expired identity, cross-tenant foreign keys, pooled-connection reuse, and a queued action after membership removal.

Introduce a missing tenant predicate in a read path. Detect it using a test that asserts both the returned response and the data passed toward the model. Repair the policy at the narrowest reliable enforcement point, then check other routes using it.

## Mastery gate

Deliver the token-flow diagram, policy matrix, negative access tests, threat model, and sanitized audit event examples. Prove that a tenant cannot read another tenant's data through the API, search, job, or tool routes. Transfer the policy to an administrator who can manage users but cannot read ticket contents.

Questions: Does a valid JWT establish permission? Is filtering an answer after generation sufficient for data isolation? Why can a row-security test pass under one role and fail under another?

## Answer guide

Authentication supplies verified identity under a protocol. Authorization still needs action/resource policy. Data that reaches a model has already crossed the confidentiality boundary even if the final answer hides it. Database role privileges can bypass policies, so test the role used in production.

Ask the tutor to find an access route missing from your policy matrix.
