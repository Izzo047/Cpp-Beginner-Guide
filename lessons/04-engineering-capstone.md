# Phase 4 — Engineering and Capstone

## Lesson 43 — Design and architecture

**By the end, you can:** turn requirements into cohesive modules and explain the trade-offs behind each boundary.

```cpp
#include <functional>

using DiscountPolicy = std::function<int(int price_cents)>;

int final_price(int price_cents, const DiscountPolicy& discount) {
    return discount(price_cents);
}
```

Requirements describe what users need and the constraints that matter. Split a system into cohesive modules with small interfaces. Keep dependencies flowing toward stable abstractions. SOLID principles can help identify design pressure, but applying every pattern mechanically adds complexity.

Composition combines objects to build behavior. Dependency injection supplies a collaborator from the outside, making tests easier. Patterns such as Strategy, Observer, Factory, and Adapter are names for recurring structures, not mandatory ingredients.

```text
presentation -> application/domain rules -> persistence interface
                         ^
                  tests / injected collaborators
```

Keep related behavior together and dependencies explicit. A layered structure helps when it isolates changes and enables testing, but too many tiny interfaces make a small program harder to navigate. Start with the simplest module boundaries that reflect likely changes.

**Trap:** An architecture diagram does not make a system maintainable if the code boundaries are unclear.

**Practice:** For a grade tracker, define modules for input, grade rules, persistence, and presentation. State what each module may depend on.

## Lesson 44 — Git collaboration and code review

**By the end, you can:** make reviewable changes with Git and give feedback that checks correctness, tests, safety, and scope.

```powershell
git status
git diff
git switch -c add-score-validation
git add src
git commit -m "Validate score input"
git fetch
git log --oneline --graph --decorate
```

A branch isolates a line of work. Commits should be small enough to review and describe one logical change. A merge combines histories; a rebase replays commits and changes their identifiers. Resolve conflicts by understanding both changes, not by blindly choosing one side.

Use a feature branch for work that needs review or isolation; commit small logical checkpoints; merge when the change is accepted. Rebase can make a private branch's history linear, but rewrites commit IDs, so avoid rebasing commits others are already using. Pull requests provide a place to discuss code, tests, and design before integration.

Review correctness, tests, error handling, security, readability, and scope. Ask questions respectfully and explain the reason for requested changes.

**Trap:** Inspect `git status` and `git diff` before committing or pushing; generated files and secrets should not be included accidentally.

**Practice:** Make a branch, change one function, add a test, inspect the diff, commit, and merge it into your practice branch.

## Lesson 45 — Continuous integration and release

**By the end, you can:** automate a clean build and tests and describe what a release needs beyond a successful local run.

```yaml
name: C++ checks
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cmake -S . -B build
      - run: cmake --build build --parallel
      - run: ctest --test-dir build --output-on-failure
```

Continuous integration runs the same checks automatically for changes. A healthy pipeline builds from a clean checkout, runs tests, and reports failures clearly. A build matrix can cover multiple compilers and standards. Releases need version numbers, notes, artifacts, and dependency/runtime requirements.

Useful pipeline stages include configure/build, unit tests, integration tests, static checks, and packaging. Run quick feedback first and slower checks later. Continuous delivery can prepare a releasable artifact automatically; continuous deployment goes further and publishes changes automatically. Choose the release process appropriate to the project's risk and approval needs.

Pin and review third-party actions in production workflows according to your organization's security policy. Do not put secrets in workflow source.

**Trap:** A green CI job only proves the configured checks passed on that runner and configuration.

**Practice:** Add a workflow to a sample project, deliberately break a test, and confirm the pipeline reports failure.

## Lesson 46 — Database and persistence fundamentals

**By the end, you can:** model related records, protect them with constraints, and use transactions and parameterized queries.

```sql
CREATE TABLE scores (
    id INTEGER PRIMARY KEY,
    student_name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100)
);

SELECT student_name, score FROM scores WHERE score >= ?;
```

Relational databases organize records into tables. Primary keys identify rows; foreign keys relate tables; constraints protect valid data; indexes speed selected lookups at storage/update cost. Transactions group changes so they commit or roll back together. ACID describes atomicity, consistency, isolation, and durability.

In C++, use a maintained database library and parameterized queries. Use migrations for schema changes and backups for recovery. Never assume a write succeeded without checking the result.

Common database choices include an embedded database such as SQLite for a local single-file application, a client/server relational database for concurrent networked applications, and a document store when document-shaped access fits the workload. These are trade-offs, not a hierarchy: consider concurrency, deployment, transactions, query needs, and operations before choosing.

**Trap:** Building SQL by concatenating user input creates injection risk.

**Practice:** Design tables for books and authors, explain the relationship, and write queries for lookup and insertion.

## Lesson 47 — Capstone planning and implementation

**By the end, you can:** define a small, testable project scope and deliver it incrementally as a vertical slice.

Write a one-page proposal before coding:

```text
Problem:
Users:
Must-have behavior:
Out of scope:
Inputs and failure cases:
Data model:
Success tests:
```

Choose a bounded project that solves a real problem. Build a vertical slice first: one complete path from input through logic to output. Then add features incrementally, keep the application runnable, and track decisions and risks.

Turn requirements into acceptance examples:

```text
Given an empty catalog
When a valid book is added
Then the book appears in the list and can be found by its identifier
```

Keep must-have behavior separate from optional polish. Each acceptance test should name observable behavior; avoid requirements such as “make it user-friendly” unless you define what a user can actually do.

**Trap:** “Build a complete social network/game engine” is not a useful one-semester scope. Reduce it to a measurable slice.

**Practice:** Estimate tasks, define acceptance tests, identify one security risk and one performance risk, and write down what you will not build.

## Lesson 48 — Capstone verification and presentation

**By the end, you can:** demonstrate a reproducible build, test evidence, known limitations, and the reasoning behind your design.

```text
Fresh checkout
  -> documented configure/build command succeeds
  -> tests pass
  -> sample usage matches documentation
  -> invalid inputs fail safely
  -> known limitations are disclosed
```

Verify from a clean environment rather than relying on your IDE's cached build. Test the main path, boundaries, error paths, and recovery. Use profiling evidence for performance claims. Document setup, usage, architecture, trade-offs, dependencies, and limitations.

Verification evidence has different strengths: a clean build confirms documented setup; automated tests check selected behavior; manual exploration can reveal usability issues; profiling measures specific workloads. None alone proves the entire program correct. Record what you tested and what remains untested so a reader can judge the evidence.

In a presentation, explain the user problem, design, data structures, ownership, tests, major failures found, and what you would improve next. Distinguish measured results from assumptions.

**Trap:** A demo that works only on the developer's machine is not a reproducible delivery.

**Practice:** Ask a classmate to build and use the project from the README without your help; revise unclear instructions.
