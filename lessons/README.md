# Worked Lessons

These companion notes expand the 48 lessons in [`../COLLEGE_ROADMAP.md`](../COLLEGE_ROADMAP.md). Each lesson states an outcome, explains the central idea, demonstrates it, points out a common trap, and gives independent practice. Examples are teaching slices: add the required headers and a `main` function when one is not shown.

## Study order

1. [Phase 1 — Programming foundations](01-foundations.md)
2. [Phase 2 — Core C++ and data structures](02-core-cpp.md)
3. [Phase 3 — Algorithms, systems, and modern C++](03-algorithms-systems.md)
4. [Phase 4 — Engineering and capstone](04-engineering-capstone.md)

The course baseline is C++20. Use C++23 features only after checking your compiler and standard library support. C++26 draft features are optional and can change before broad implementation support. For code examples, compile with warnings and the intended language mode, for example:

```powershell
g++ -std=c++20 -Wall -Wextra -Wpedantic source.cpp -o program.exe
.\program.exe
```

Compiler support differs. If a C++20 feature is unavailable, use a newer compiler; do not silently change the whole course to an older language mode. Many early examples are compatible with C++17, but later lessons intentionally teach C++20 concepts and ranges. Do not copy code blindly: predict its behavior, run it, test edge cases, and explain the result.

## How to get real understanding

For each lesson, complete its practice prompt and then:

- Read the learning goal and define unfamiliar terms in your own words.
- Trace each example by hand before compiling it; write down predicted output and state.
- Explain what each important line does without reading the notes.
- Change an input or assumption and predict the result first.
- Test empty, smallest, largest reasonable, and invalid inputs.
- Use a debugger or a small test when the result surprises you.
- Write down what the example does not handle yet.
- Revisit the idea the next day and a week later; solve a new problem without looking at the worked example.

The [roadmap's publisher reading map](../COLLEGE_ROADMAP.md#recommended-publisher-reading-map) pairs beginner books and advanced references with the course stages. These notes provide a strong route through undergraduate-level foundations, not literally every feature, library, platform API, or research topic in C++. Continue with the relevant standard/library documentation and specialization electives.
