import { readFile } from "node:fs/promises";
import { OpenAIEmbeddingProvider, QdrantVectorStore, retrieveWithQdrant, type Chunk } from "./retrieval.ts";

const chunks = JSON.parse(await readFile(new URL("../data/documents.json", import.meta.url), "utf8")) as Chunk[];
const embeddings = OpenAIEmbeddingProvider.fromEnv();
const store = QdrantVectorStore.fromEnv();
const vectors = await embeddings.embed(chunks.map((chunk) => `${chunk.title}\n${chunk.text}`));
await store.upsert(chunks, vectors);

const results = await retrieveWithQdrant(
  "How long can a transfer remain pending?",
  { tenantId: "demo-bank", roles: ["support-agent"] },
  embeddings,
  store
);
console.log(JSON.stringify({ event: "qdrant.search.complete", sourceIds: results.map((result) => result.sourceId), results }, null, 2));
