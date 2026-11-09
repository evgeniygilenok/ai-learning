# 02. SQL and data modeling

18 hours. Turn operational rules into a schema and answer useful questions without corrupting their meaning. Requires module 01.

## Lesson 1. Put invariants in the database

Model tenants, accounts, tickets, ticket events, and sync runs. Decide whether an identifier is global or source-local. Use composite uniqueness when a ticket ID is only unique within a tenant and source. Make foreign keys preserve that same scope. A tenant column on every table is insufficient if a ticket can still reference another tenant's account. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

Worked example:

```sql
CREATE TABLE account (
  tenant_id text NOT NULL,
  account_id text NOT NULL,
  PRIMARY KEY (tenant_id, account_id)
);
CREATE TABLE ticket (
  tenant_id text NOT NULL,
  source text NOT NULL,
  ticket_id text NOT NULL,
  account_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'pending', 'closed')),
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, source, ticket_id),
  FOREIGN KEY (tenant_id, account_id)
    REFERENCES account (tenant_id, account_id)
);
```

This teaches key scope. It is not the complete app schema. Try inserting a ticket whose account belongs to a different tenant and inspect the failure.

## Lesson 2. Queries have a grain

State what one result row means before writing SQL. Joining tickets to events multiplies rows. Counting after that join can count events when you intended tickets. Aggregate at the right grain, and test with an account that has zero tickets and a ticket with multiple events.

Use GROUP BY when reducing rows and window functions when keeping row identity while calculating a rank or aggregate across a partition. Add deterministic tie-breakers when selecting the latest or oldest records. [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html)

Write five queries: unresolved tickets by tenant, accounts with no unresolved tickets, oldest three tickets per account, latest event per ticket, and daily counts by event time. For each, write a tiny fixture whose expected answer you can compute by hand.

## Lesson 3. A query plan explains work

EXPLAIN describes the selected plan. EXPLAIN ANALYZE runs the statement and reports observed execution information. Use a disposable database for experiments, especially with writes. Compare estimated and actual row counts, loops, scans, and buffer work. Planner cost is not elapsed milliseconds. An index also consumes storage and write effort. [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)

Seed 100,000 tickets with a reproducible distribution. Measure a tenant-filtered recent-ticket query before and after a composite index. Explain why the column order matches the predicate and ordering. Also measure an unfiltered query where a sequential scan may be reasonable.

## Lab and failure drill

Apply schema changes through migrations, not manual edits. Add a nullable field, backfill it, validate it, and then enforce the intended constraint. Record how old application code behaves during the transition.

Introduce a join that doubles a dashboard count. First identify the row grain. Repair the query and add the smallest fixture that detects the error. Then introduce a slow query by changing data distribution. Compare the plan and observations before proposing an index.

## Mastery gate

Deliver the schema, migration history, five tested queries, and two query plans with interpretation. Explain one integrity rule that belongs in a constraint. Diagnose a wrong aggregate and a slow query. Transfer the design to a second source whose identifiers collide with the first.

Questions: Can a correct foreign key still permit a tenant mismatch? Why can a query become slower after adding an index? How does a window function differ from GROUP BY?

## Answer guide

A foreign key on account_id alone can lose tenant scope. An index is not necessarily useful for a broad scan and adds maintenance work. A window function computes across related rows while retaining the selected row grain. Good evidence includes result correctness and a causal explanation of the measured work.

Ask the tutor to challenge your schema with a record that violates one of your assumed invariants.
