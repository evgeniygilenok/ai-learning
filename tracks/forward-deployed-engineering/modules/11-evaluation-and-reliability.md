# 11. Evaluation and operational quality

22 hours. Decide what improved, what broke, and what the evidence cannot establish. Requires modules 07 to 10.

## Lesson 1. Turn a workflow requirement into an oracle

Evaluate separate failure boundaries: input validation, retrieval, answer support, tool selection, authorization, and final effect. Use deterministic checks for verifiable properties such as citation existence, schema validity, and tenant access. Use human judgments for subjective quality. Use model graders only with a task-specific rubric and calibration against human judgments. [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)

Create cases with ID, input, expected evidence, allowed effects, disallowed effects, slice, and rubric. Split development and held-out cases before tuning. Keep near-duplicate cases in the same split. A generated test case is a candidate until someone verifies its expected answer.

For the final course gate, use at least 100 reviewed cases: 60 for development and 40 held out. Include typical requests, missing evidence, version conflicts, unauthorized requests, injection attempts, and retry/recovery cases. This is an instructional minimum, not a proof of production safety. Small slices remain uncertain.

## Lesson 2. A score needs a denominator and uncertainty

Worked example: 45 passes in 50 cases is 90% observed success. Under an independent Bernoulli sampling model, a 95% Wilson interval is approximately 78.6% to 95.7%. That interval does not repair a biased dataset or correlated cases. NIST describes the Wilson method for proportions. [NIST confidence intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

Compare candidate and baseline on the same cases. Keep per-case outcomes, not just an overall score. Resample paired cases together when estimating a difference; SciPy documents paired bootstrap sampling. Correlated cases may need resampling by their shared unit, such as document or account. Repeat model runs on a fixed subset to expose run-to-run variation. [SciPy bootstrap](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html)

Calibrate a judge on at least 30 human-reviewed outputs, recording disagreements and failure categories. Inspect false passes as well as overall agreement. If a judge approves a tenant leak, deterministic access controls still reject the case. Keep grader model, prompt, and rubric versions alongside results.

## Lesson 3. Quality includes time, cost, and failure

Record end-to-end success, abstention, timeout, tool failure, latency distribution, and cost per completed workflow. Include failed attempts and retries in cost accounting. Report retrieval and generation separately when that helps diagnose the bottleneck. Histograms support aggregate latency analysis, with bucket choices affecting the precision of quantile estimates. [Prometheus histograms](https://prometheus.io/docs/practices/histograms/)

Do not average p95 values across instances or runs. Aggregate the underlying observations or compatible histogram buckets before estimating a combined percentile. Keep the load profile and sample count next to a latency claim.

Build a local JSONL evaluation runner before choosing a hosted evaluation product. The official OpenAI guide currently includes an Evals-platform deprecation notice. Its evaluation principles remain useful, while that hosted platform is not a course dependency. Check the current notice before selecting any hosted tooling.

## Lab and failure drill

Run a baseline and two targeted iterations with a frozen configuration for each. Save outputs, scores, usage, and failure categories. Re-run the held-out set only after choosing the candidate, and disclose any later tuning on it.

Introduce an "improvement" that raises average quality but fails on unanswerable cases or increases duplicate-action risk. Make the release gate catch it. Use deterministic offline tests on every change and a budgeted model-backed suite on relevant changes and release candidates. Record the configured spend limit.

## Mastery gate

Deliver the dataset, split policy, judge calibration, per-slice report, baseline plus two iterations, uncertainty explanation, and CI gate. Transfer the evaluation to a new tenant with different vocabulary. Distinguish what the old test set still covers from what needs new labels.

Questions: Can 100% on ten cases prove reliability? Why keep a held-out split? What does a lower cost per request hide?

## Answer guide

A small curated set has limited coverage and sampling precision. A held-out split checks against tuning to known cases. Cheap requests may fail or require repeated attempts, so cost per successful workflow can move in the opposite direction. A release decision needs failure severity as well as averages.

Ask the tutor to find one claim in your report stronger than the available evidence.
