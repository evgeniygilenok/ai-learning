# 09. Retrieval and permission-safe RAG

20 hours. Determine whether the right evidence reaches the answerer. Requires modules 02, 04, 06, and 08.

## Lesson 1. Search is an experiment

Start with document IDs, versions, sections, tenant ownership, effective dates, and deletion behavior. A chunk needs enough metadata to identify and authorize its source. Keep a source-to-chunk mapping so an update or deletion can invalidate derived records.

Build lexical search first. PostgreSQL text search provides normalized documents, queries, and ranking tools. Use it as a concrete baseline, particularly for exact product terms and identifiers. [PostgreSQL text search](https://www.postgresql.org/docs/current/textsearch-intro.html)

Add embeddings only as a measured alternative. Similarity indicates proximity under an embedding representation, rather than truth or permission. Compare lexical, vector, and combined retrieval on the same labeled queries. Change one major factor at a time: chunking, retrieval method, top-k, or reranking.

## Lesson 2. Label relevance before measuring it

Create query-to-relevant-document judgments. Define what counts as a relevant unit, such as a source section rather than an arbitrary chunk. Deduplicate equivalent chunks so your metric does not reward repetition.

Course definitions: recall@k is the number of relevant units retrieved in the first k divided by the total labeled relevant units. Reciprocal rank is 1 divided by the position of the first relevant result, or 0 if absent. Average it over the fixed query set for MRR. Report unanswerable queries separately because recall has no relevant-item denominator there.

Worked example: three source sections answer a query, and the first five results contain two of them. Recall@5 is 2/3. If the first relevant section ranks third, reciprocal rank is 1/3. These retrieval metrics do not measure whether the final answer uses the evidence correctly.

## Lesson 3. Isolate data before constructing context

Apply trusted tenant and resource-access constraints before any result enters model context or a reranker. Do not retrieve cross-tenant content and rely on the final prompt to hide it. Inspect the actual query plan and returned candidate set. PostgreSQL row-security rules depend on database role. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

Approximate vector search introduces a separate recall issue. In pgvector, filtering and approximate indexing can produce too few matching results, and index settings affect the trade-off. Begin with an exact baseline, then measure any approximate index against it. Database execution details do not relax the application confidentiality boundary. [pgvector filtering and indexing](https://github.com/pgvector/pgvector#filtering)

Carry source IDs and versions into the answer. Verify that each citation exists, was permitted, and supports its attached claim. Separate missing evidence from answer-generation failure. Test conflicting versions and "no evidence" cases.

## Lab and failure drill

Seed 100 synthetic policy sections across two tenants, including obsolete versions, near-duplicates, and exact identifiers. Label 40 development queries and reserve 20 different queries for final evaluation. Include answerable and unanswerable cases.

Compare lexical and vector retrieval, then one justified combination. Report recall@5, MRR, permission failures, and end-to-end answer support separately. Delete a source document and prove its chunks stop appearing. Inject the wrong tenant filter and catch leakage before a provider request is made.

## Mastery gate

Deliver relevance labels, reproducible search runs, error categories, access tests, citation checks, and the deletion test. Explain why one retrieval method won on a particular slice. Transfer the setup to exact account codes that semantic search handles poorly.

Questions: Can high recall coexist with a wrong answer? Does top-k similarity establish confidence? What does an empty filtered result prove?

## Answer guide

The generator can misuse correct evidence. Similarity is a retrieval score whose interpretation depends on the model and corpus. An empty result can mean no authorized evidence, a retrieval failure, or an indexing issue. Diagnose those separately.

Ask the tutor to classify five failures before suggesting a new vector database.
