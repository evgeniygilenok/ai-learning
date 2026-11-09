# 04. Data ingestion and reconciliation

16 hours. Turn messy source data into a trustworthy operational view. Requires modules 02 to 03.

## Lesson 1. Preserve the source and define the canonical record

Store raw input with its source identity, received time, source version where available, and parsing result. Transform it into a canonical ticket representation. Keep the original value when normalization changes meaning. "Unknown", "absent", and "empty" may need different representations.

Design the lab around two contracts: raw records are inspectable, and canonical records satisfy explicit constraints. PostgreSQL constraints enforce row-level integrity rules, while cross-source reconciliation remains application work. [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

Worked example: the API says pending, while a later-arriving CSV says open. Received time alone cannot establish business order. Choose the authoritative source per field or compare reliable source versions. If neither is available, expose the conflict and reconcile. Do not invent a "latest wins" guarantee.

## Lesson 2. A checkpoint is a claim about completed work

Suppose records 101 to 200 have been fetched. The worker stores half, then crashes. A checkpoint of 200 would silently lose the remaining half. A checkpoint of 100 replays work. Replay is acceptable only if the writes are idempotent or deduplicated.

If canonical updates and their checkpoint live in the same PostgreSQL database, commit the intended batch and checkpoint atomically. Transactions group local changes; they do not make the source API participate in that transaction. [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

Handle deletes explicitly. Use source tombstones, a source reconciliation pass, or another documented mechanism. Absence from one incomplete page is not proof of deletion. For timestamp-based sync, use an overlap window and stable tie-breaker where the source contract supports them. Test late records rather than assuming wall clocks are synchronized.

## Lesson 3. Reconciliation catches what delivery guarantees miss

An event transport can redeliver messages. Amazon SQS documents at-least-once behavior for standard queues, which is a useful concrete example. Your chosen transport has its own contract. [SQS delivery behavior](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)

Reconciliation compares source and destination state over a defined scope. Count records, identify missing IDs, compare versions, and inspect rejected rows. A count match alone can hide one missing and one duplicated record. Track successful sync time, source-data age, rejection counts, and unresolved conflicts.

Define three lab invariants: replay does not create a second canonical ticket, a rejected record is visible, and a completed checkpoint never skips an uncommitted batch. They are design choices you must test.

## Lab and failure drill

Import 1,000 synthetic tickets from a paginated API and 200 overlapping CSV records. Deliver 100 webhook updates, including duplicates and older versions. Insert five bad records and three deletes. Write an expected-state fixture independently of the transformation code.

Crash between a canonical write and a progress update. Restart and compare the entire resulting state with the uninterrupted run. Then rename a source field. Quarantine or version the change, repair the mapping, and replay only the affected inputs.

## Mastery gate

Deliver raw/canonical schemas, a field-ownership table, replay tests, checkpoint recovery evidence, and a reconciliation report. Explain the difference between delivery success, valid parsing, and correct business state. Transfer the connector to a source with late updates and no reliable ordering key. State the remaining correctness limit plainly.

Questions: Why is arrival time a weak ordering rule? When can advancing a checkpoint lose data? Can equal source and destination counts prove equality?

## Answer guide

Network delay can reverse arrival order. A progress marker must not claim work that failed to commit. Equal counts do not identify which records exist or whether their fields match. Reconciliation is necessary even when an event receiver reports no errors.

Ask the tutor to review a disagreement between your source contract and your synchronization assumptions.
