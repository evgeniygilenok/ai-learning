import { createHash } from "node:crypto";

export type Chunk = { id: string; sourceId: string; title: string; text: string; tenantId: string; allowedRoles: string[]; effectiveDate: string };
export type RetrievedChunk = Chunk & { score: number };
export type RetrievalIdentity = { tenantId: string; roles: string[] };

// Stage 2 keeps this deterministic lexical path as the minimum-viable baseline.
export function retrieve(query: string, chunks: Chunk[], identity: RetrievalIdentity): RetrievedChunk[] {
  const terms = new Set(query.toLowerCase().split(/\W+/).filter(Boolean));
  return chunks
    .filter((chunk) => chunk.tenantId === identity.tenantId && chunk.allowedRoles.some((role) => identity.roles.includes(role)))
    .map((chunk) => ({ ...chunk, score: chunk.text.toLowerCase().split(/\W+/).filter((term) => terms.has(term)).length }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score);
}

export interface EmbeddingProvider {
  embed(inputs: string[]): Promise<number[][]>;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly #apiKey: string;
  readonly #model: string;
  readonly #baseUrl: string;
  readonly #fetch: typeof fetch;

  constructor(options: { apiKey: string; model?: string; baseUrl?: string; fetch?: typeof fetch }) {
    if (!options.apiKey.trim()) throw new Error("OPENAI_API_KEY is required to create real embeddings");
    this.#apiKey = options.apiKey;
    this.#model = options.model ?? "text-embedding-3-small";
    this.#baseUrl = (options.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.#fetch = options.fetch ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): OpenAIEmbeddingProvider {
    return new OpenAIEmbeddingProvider({
      apiKey: env.OPENAI_API_KEY ?? "",
      model: env.OPENAI_EMBEDDING_MODEL,
      baseUrl: env.OPENAI_BASE_URL
    });
  }

  async embed(inputs: string[]): Promise<number[][]> {
    const response = await this.#fetch(`${this.#baseUrl}/embeddings`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.#apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: this.#model, input: inputs, encoding_format: "float" }),
      signal: AbortSignal.timeout(30_000)
    });
    const payload = await response.json().catch(() => ({})) as {
      data?: Array<{ index: number; embedding: number[] }>;
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(payload.error?.message ?? `Embedding request failed with HTTP ${response.status}`);
    return [...(payload.data ?? [])].sort((a, b) => a.index - b.index).map((item) => item.embedding);
  }
}

export class QdrantVectorStore {
  readonly #url: string;
  readonly #apiKey?: string;
  readonly #collection: string;
  readonly #fetch: typeof fetch;

  constructor(options: { url: string; apiKey?: string; collection?: string; fetch?: typeof fetch }) {
    if (!options.url.trim()) throw new Error("QDRANT_URL is required for Stage 5 retrieval");
    this.#url = options.url.replace(/\/$/, "");
    this.#apiKey = options.apiKey;
    this.#collection = options.collection ?? "regulated_support_chunks";
    this.#fetch = options.fetch ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): QdrantVectorStore {
    return new QdrantVectorStore({
      url: env.QDRANT_URL ?? "",
      apiKey: env.QDRANT_API_KEY,
      collection: env.QDRANT_COLLECTION
    });
  }

  async ensureCollection(vectorSize: number): Promise<void> {
    const existing = await this.#request(`/collections/${this.#collection}`, { method: "GET" }, [200, 404]);
    if (existing.status === 200) return;
    await this.#request(`/collections/${this.#collection}`, {
      method: "PUT",
      body: JSON.stringify({ vectors: { size: vectorSize, distance: "Cosine" } })
    });
  }

  async upsert(chunks: Chunk[], vectors: number[][]): Promise<void> {
    if (chunks.length !== vectors.length || !vectors[0]?.length) throw new Error("Each chunk needs one non-empty vector");
    await this.ensureCollection(vectors[0].length);
    await this.#request(`/collections/${this.#collection}/points?wait=true`, {
      method: "PUT",
      body: JSON.stringify({
        points: chunks.map((chunk, index) => ({ id: pointIdFor(chunk.id), vector: vectors[index], payload: chunk }))
      })
    });
  }

  async search(vector: number[], identity: RetrievalIdentity, limit = 5): Promise<RetrievedChunk[]> {
    if (!identity.roles.length) return [];
    const response = await this.#request(`/collections/${this.#collection}/points/query`, {
      method: "POST",
      body: JSON.stringify({
        query: vector,
        limit,
        with_payload: true,
        filter: {
          must: [
            { key: "tenantId", match: { value: identity.tenantId } },
            { key: "allowedRoles", match: { any: identity.roles } }
          ]
        }
      })
    });
    const payload = await response.json() as { result?: { points?: Array<{ score: number; payload: Chunk }> } };
    return (payload.result?.points ?? []).map((point) => ({ ...point.payload, score: point.score }));
  }

  async #request(path: string, init: RequestInit, accepted = [200]): Promise<Response> {
    const response = await this.#fetch(`${this.#url}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(this.#apiKey ? { "api-key": this.#apiKey } : {}),
        ...(init.headers ?? {})
      },
      signal: AbortSignal.timeout(20_000)
    });
    if (!accepted.includes(response.status)) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Qdrant request failed with HTTP ${response.status}: ${detail.slice(0, 300)}`);
    }
    return response;
  }
}

export async function retrieveWithQdrant(
  query: string,
  identity: RetrievalIdentity,
  embeddings: EmbeddingProvider,
  store: QdrantVectorStore,
  limit = 5
): Promise<RetrievedChunk[]> {
  const [vector] = await embeddings.embed([query]);
  return store.search(vector, identity, limit);
}

function pointIdFor(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const joined = hex.join("");
  return `${joined.slice(0, 8)}-${joined.slice(8, 12)}-${joined.slice(12, 16)}-${joined.slice(16, 20)}-${joined.slice(20)}`;
}
