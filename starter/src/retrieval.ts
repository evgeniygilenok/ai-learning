export type Chunk = { id: string; sourceId: string; title: string; text: string; tenantId: string; allowedRoles: string[]; effectiveDate: string };
export type RetrievedChunk = Chunk & { score: number };

// Stage 2 replaces this lexical baseline with measured retrieval while preserving the ACL check.
export function retrieve(query: string, chunks: Chunk[], identity: { tenantId: string; roles: string[] }): RetrievedChunk[] {
  const terms = new Set(query.toLowerCase().split(/\W+/).filter(Boolean));
  return chunks
    .filter((chunk) => chunk.tenantId === identity.tenantId && chunk.allowedRoles.some((role) => identity.roles.includes(role)))
    .map((chunk) => ({ ...chunk, score: chunk.text.toLowerCase().split(/\W+/).filter((term) => terms.has(term)).length }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score);
}
