# C++ from First Principles: College-Level Roadmap

This is a structured path from no programming experience to the core knowledge expected of an undergraduate who can build and explain substantial C++ programs. It starts by explaining what C++ is, how a program becomes something a computer can run, and how C++ differs from C; it then covers the language, computer science, and software engineering.

There is no single syllabus that every college requires. Courses differ by institution and specialization, so this roadmap marks **core** material separately from **electives**. It is intentionally broad; a student should be able to explain, implement, test, and compare the core topics rather than memorize every library function.

## How to use this roadmap

- Follow the phases in order. Later topics depend on earlier ones.
- Use C++20 as the course baseline, C++23 where your compiler and standard library support it, and treat C++26 material as optional until compiler support is dependable. Check the [C++ compiler support table](https://en.cppreference.com/w/cpp/compiler_support) before relying on newer features.
- For each lesson, read the topics, write a small program, test normal and edge cases, and explain the result in your own words.
- Keep code under version control. Build projects from the command line as well as from an IDE.
- For every project, write a short README with build instructions, expected behavior, design decisions, and known limitations.

The [worked lesson examples](lessons/README.md) expand all 48 lessons with explanations, code or command examples, common mistakes, and exercises. A single course cannot literally cover every detail of the C++ standard library or every specialty, so use the roadmap's electives and official reference material for deeper study.

## First principles: what C++ is

**C++ is a standardized, general-purpose programming language.** A program is a set of precise instructions and data descriptions. A C++ compiler translates source files according to a selected language standard; the standard library supplies common building blocks such as strings, containers, algorithms, input/output, and concurrency. The compiler is a tool that implements the language, not the language itself.

C++ is **statically typed**: types are checked as code is compiled. It supports procedural programming, object-oriented programming, and generic programming, and lets programmers work at both high and low levels. C++ is related historically to C, but they are distinct languages; C++ is not simply “C with classes,” and valid C source is not always valid C++.

A typical native build follows this path:

1. **Write source** in one or more `.cpp` files and include declarations from headers.
2. **Preprocess** directives such as `#include`.
3. **Compile** each translation unit and diagnose language/type errors.
4. **Assemble and link** object files and libraries into an executable.
5. **Run** the executable; the operating system starts it, supplies arguments/resources, and receives its exit status.

That model explains why an editor, compiler, linker, executable, and runtime are different things. Some toolchains combine stages or target virtual machines, so this is the usual workflow—not a rule that every implementation uses identical tools.

People choose C++ when they need performance, control over resources, broad platform support, or close interaction with hardware—for example in games, graphics, embedded systems, scientific software, and infrastructure. Those strengths come with costs: a large language, complex build/tooling choices, and rules about types, object lifetime, and memory that must be learned carefully.

The published standards progress through C++98/03, C++11/14, C++17, C++20, and C++23; compiler support arrives feature by feature. Make C++20 the course baseline, learn C++23 additions as supported, and treat C++26 drafts as changing material rather than required beginner knowledge.

**New to programming?** The source review and publisher books below are optional. Start with [Lesson 1: What C++ is](lessons/01-foundations.md) and follow the phases in order.

## Source review and course alignment

The supplied resources were cross-checked for topic coverage, not copied. The course examples and explanations remain original; when a tutorial's wording or advice is dated, prefer the current C++ standard/library documentation and verify behavior with a compiler.

| Resource | Coverage found | How it informs this course and its limits |
|---|---|---|
| [GeeksforGeeks C++](https://www.geeksforgeeks.org/cpp/c-plus-plus/) | Fundamentals, pointers and dynamic allocation, OOP, templates, STL containers/iterators/algorithms, exceptions, and threads/synchronization. | Useful breadth and practice prompts. Its overview does not replace a systematic study of object lifetime, language rules, complexity, or safe ownership. |
| [C++ Notes for Professionals (PDF)](https://dspace.sxcjpr.edu.in/jspui/bitstream/123456789/696/1/c%2B%2Bnotes-for-professionals.pdf) | A 708-page reference organized into 146 chapters, spanning compilation, expressions and bit operations, arrays/iterators, streams/files, OOP, templates, STL, value categories, RAII, concurrency, undefined behavior, testing, debugging, profiling, and refactoring. | Provides a broad lookup list for advanced topics. It is a compiled reference, not a paced textbook; confirm version-sensitive or subtle claims against current documentation. |
| [avinashtare/CPP-Notes](https://github.com/avinashtare/CPP-Notes) | Repository folders progress from setup, syntax, I/O, types, operators, control flow, arrays, structures/unions/enums, pointers, and functions through OOP/classes/methods. | Reinforces a beginner-friendly sequence and practice exercises. The supplied repository tree is an introductory set of notes, not a complete college-level C++ or computer-science curriculum. |
| [IISc C++ tutorial PDF](https://cds.iisc.ac.in/wp-content/uploads/DS286.AUG2016.Lab2_.cpp_tutorial.pdf) | Its 40 chapters cover setup, language fundamentals, storage/scope, operators, functions, arrays/strings, pointers/references, data structures, classes/inheritance, overloading/polymorphism, files, exceptions, dynamic memory, templates, preprocessing, multithreading, STL, and standard-library topics. | Useful lab-style breadth, including topics easy to omit from a short introduction. The filename dates it to 2016, so treat it as a legacy tutorial rather than guidance on current language/library facilities. |
| [W3Schools C++ tutorial](https://www.w3schools.com/cpp/) | The indexed syllabus runs from setup, syntax, variables, types, operators, strings, decisions, loops, arrays, structures, and enums through references, pointers, functions, scope, recursion, OOP, inheritance, polymorphism, virtual functions, templates, and exceptions. | A concise sequence for core syntax and OOP. Direct page retrieval was blocked during this review, so this alignment uses the indexed syllabus rather than a full page-by-page audit. |
| [LinkedIn handwritten-notes post](https://www.linkedin.com/posts/sakshiku945_c-complete-handwritten-notes-activity-7279020822244052992-CjJl) | The public post description mentions syntax/types, OOP, inheritance/polymorphism, STL, pointers/memory management, problem solving, and best practices. | The attached handwritten pages were not accessible in the public page response; only the description could be assessed. No claims are made about unseen pages. |
| [Computer Science Books repository](https://github.com/Mohammed-3tef/Computer_Science_Books/tree/main) | Its file listing includes titles such as *Modern C++ for Absolute Beginners*, *C++ How to Program*, *Problem Solving with C++*, *Introduction to Algorithms* (4th ed.), and books on systems, databases, operating systems, and networking. | Used file names and subject categories as a catalog only. The repository's [MIT license](https://github.com/Mohammed-3tef/Computer_Science_Books/blob/main/LICENSE.md) does not by itself establish rights for the separate publisher books in its PDF folders; this course does not copy or redistribute those PDFs. Use publisher or library copies. |

### Coverage strengthened after the review

- Make bitwise operators and bit masks explicit, and compare C-style arrays, `std::array`, `std::vector`, structures, enums, and unions with safer alternatives.
- Deepen the route from overloads and iterators into templates, type traits, forwarding, value categories, and standard-library tools.
- Treat preprocessing, language-version differences, object layout, undefined behavior, concurrency, testing, debugging, and profiling as engineering topics—not just syntax.
- Start with a clear language/compiler/standard-library model, then carry that mental model through all 48 lessons using outcomes, examples, pitfalls, and practice.
- Keep specialty subjects as electives rather than prerequisites for every C++ student.

## Recommended publisher reading map

Reviewed 2026-11-26. These books play different roles; no one book covers every topic, and it is not practical or necessary to read every C++ book. Use the course notes as the main guided path, then choose books by goal. Titles link to publisher/official pages; buy, borrow, or access them through a library rather than relying on unauthorized PDF copies.

| Learning need | Book and publisher | How to use it |
|---|---|---|
| Learn programming from zero | [Programming: Principles and Practice Using C++, 3rd ed.](https://www.pearson.com/en-us/subject-catalog/p/programmingprinciples-and-practices-using-c/P200000012061/9780138308643) — Addison-Wesley/Pearson, 2024; C++20/23. | A full beginner-to-intermediate teaching text. Read alongside Phases 1–2; it emphasizes solving problems, errors, classes, input/output, containers, and algorithms. |
| Friendly modern-language introduction | [Modern C++ for Absolute Beginners, 3rd ed.](https://link.springer.com/book/9798868835506) — Apress/Springer Nature. | An additional beginner explanation and Standard Library introduction. Its publisher page lists C++26 material; treat draft-era features as optional and check compiler support. |
| Concise language/library overview | [A Tour of C++, 3rd ed.](https://www.pearson.com/en-us/subject-catalog/p/tour-of-c-a/P200000002116/9780136823544) — Addison-Wesley/Pearson, 2022; C++20. | A compact survey for readers who already know basic programming; use it to revisit language design and major library components, not as the first book for a new programmer. |
| Broad professional practice | [Professional C++, 6th ed.](https://www.wiley.com/en-be/Professional%20C%20%20,%206th%20Edition-p-9781394193189) — Wiley, 2024; C++23. | Use after the fundamentals for language depth, testing/debugging, design, performance, and pitfalls. |
| Modern recipes and features | [Modern C++ Programming Cookbook, 3rd ed.](https://www.packtpub.com/en-sg/product/modern-c-programming-cookbook-9781835080542) — Packt, 2024; C++20/23. | Look up practical examples for modern language/library features, filesystem, regular expressions, testing, and concurrency. It is not a replacement for learning the concepts first. |
| Design and abstractions | [C++ Software Design](https://www.oreilly.com/library/view/c-software-design/9781098113155/copyright-page01.html) — O'Reilly, 2022. | Read around Lessons 16, 19, 43, and the capstone when you can already write small classes and programs. |
| Rigorous algorithms | [Introduction to Algorithms, 4th ed.](https://mitpress.mit.edu/9780262367509/introduction-to-algorithms/) — MIT Press, 2022. | A deeper reference for Lessons 25–33. Work selected exercises; it is intentionally more mathematical than the introductory course. |
| Systems foundations | [Computer Systems: A Programmer's Perspective, 3rd ed.](https://www.pearson.com/en-us/subject-catalog/p/computer-systems-a-programmers-perspective/P200000003479/9780138105396) — Pearson, 2023. | Use for architecture, memory, linking, and performance in Lessons 27 and 38–39. It assumes programming experience and a Unix-like environment. |
| Concurrency specialization | [C++ Concurrency in Action, 2nd ed.](https://www.manning.com/books/c-plus-plus-concurrency-in-action-second-edition) — Manning, 2019; C++17. | A focused advanced text for Lessons 36–37. Its core reasoning remains useful; pair it with current language/library documentation for later-standard changes. |

### Living references

- [C++ Core Guidelines](https://github.com/isocpp/CppCoreGuidelines): evolving advice on interfaces, resource management, safety, and concurrency.
- [cppreference compiler support](https://en.cppreference.com/w/cpp/compiler_support): check whether a compiler and library implement a feature before using it.
- [C++ working papers (WG21)](https://www.open-std.org/jtc1/sc22/wg21/): use for standards work in progress, not as a beginner textbook.

## Phase 1 — Programming foundations

**Outcome:** Write, compile, test, and debug small procedural programs.

### Lesson 1 — What C++ is, computers, and development tools

- What programming is; what a program, data, and algorithm mean.
- C++ as a standardized, statically typed, compiled, multi-paradigm language; language versus compiler versus standard library.
- How C++ relates to—but differs from—the C programming language.
- Typical source-to-executable path: preprocess, compile, assemble, link, then run under the operating system.
- Why choose C++, what it is used for, and the trade-offs of control, performance, and language complexity.
- Source code, compiler, linker, executable, runtime, and exit codes.
- Files, folders, paths, command-line arguments, working directories, environment variables.
- Editor versus IDE; terminal basics; compiler diagnostics.
- Version control with Git: repository, status, diff, commit, branch, remote, pull, and push.
- Safe workflow: save work, inspect changes, and never expose credentials in a repository.

### Lesson 2 — First C++ program and translation

- `#include`, `main`, statements, blocks, comments, namespaces, `std::`.
- Standard output and standard error with `std::cout` and `std::cerr`.
- Compile and run; source files versus object files and executables.
- Translation stages: preprocessing, compilation, assembly, linking (conceptual introduction).
- Compiler warnings and language-standard flags.

### Lesson 3 — Types, objects, and expressions

- Fundamental types: `bool`, character types, signed and unsigned integers, floating-point types.
- Initialization forms; declarations and definitions; type deduction with `auto`.
- Literals, arithmetic, comparison, logical, bitwise, shift, assignment, and increment operators.
- Precedence and associativity; integer division, conversions, overflow, and floating-point limits.
- `const`, `constexpr`, and why types and initialization matter.
- Narrowing conversions, signedness, and bit masks for representing independent flags.

### Lesson 4 — Input, output, and validation

- Formatted input and output with streams; manipulators and formatting.
- Reading numbers and words; basic line input with `std::getline`.
- Stream state, failed input, clearing an error state, and discarding invalid input.
- User prompts, validation loops, clear errors, and exit status.
- Difference between syntactically valid input and input that makes sense for the program.

### Lesson 5 — Decisions and Boolean logic

- `if`, `else if`, `else`, and `switch`.
- Comparisons, compound conditions, short-circuit evaluation.
- Truth tables, De Morgan's laws, nested conditions, and avoiding overly complex conditions.
- Boundary conditions and input partitions for testing.

### Lesson 6 — Iteration

- `while`, `do-while`, and `for`; range-based `for`.
- Counters, sentinels, accumulators, nested loops, and loop invariants (introductory).
- `break` and `continue`; when they improve or obscure code.
- Infinite loops, off-by-one errors, and termination reasoning.

### Lesson 7 — Functions and decomposition

- Declaration, definition, call, parameters, return values, and `void`.
- Local scope, lifetime, global state, and name lookup basics.
- Pass by value, reference, and `const` reference.
- Function overloading, default arguments, and preconditions/postconditions.
- Decomposition, cohesion, naming, and avoiding functions that do too many jobs.

### Lesson 8 — Strings and text

- `std::string`, concatenation, comparison, size, indexing, and iteration.
- Character processing and `<cctype>`; whitespace and line input.
- Text encoding basics: bytes, ASCII, Unicode, UTF-8, and why a character is not always one byte.
- Parsing and formatting values; handling empty or malformed text.

### Lesson 9 — Arrays and dynamic sequences

- C-style arrays at a conceptual level; `std::array` for fixed-size sequences.
- `std::vector` for dynamic sequences; size, capacity, insertion, removal, and iteration.
- Simple aggregates with `struct`; distinguish a collection of fields from a sequence.
- `std::span` as a non-owning view in C++20; it does not extend the lifetime of its elements.
- Indexing versus checked access; valid index ranges.
- Iterator and reference invalidation when a vector changes.
- Choosing a sequence representation from the problem requirements; know why raw arrays and unions need extra care.

### Lesson 10 — Algorithms and problem solving

- Turn a problem statement into inputs, outputs, constraints, and smaller tasks.
- Pseudocode, tracing, test cases, and incremental implementation.
- Linear search, counting, minimum/maximum, accumulation, and simple sorting.
- Preconditions, postconditions, invariants, and examples as specifications.
- Complexity intuition: work and memory grow with input size.

### Lesson 11 — Debugging and testing basics

- Read compiler errors from the first diagnostic; distinguish compile, link, and runtime failures.
- Use a debugger: breakpoints, stepping, call stack, watch variables, and inspecting state.
- Assertions and small deterministic tests.
- Reproduce a bug, narrow it down, fix its cause, and add a regression test.
- Undefined behavior: what it means and why an apparently working run proves nothing.

### Lesson 12 — First integrated project

- Build a console application such as a number game, calculator, or grade tracker.
- Use functions, input validation, decisions, loops, and a collection.
- Organize code into logical functions; test normal, boundary, and invalid input.
- Deliverable: source code, build/run instructions, test cases, and a short design explanation.

## Phase 2 — Core C++ and data structures

**Outcome:** Design multi-file programs, manage object lifetimes safely, and select suitable data structures.

### Lesson 13 — Scope, storage, and lifetime

- Automatic, static, and dynamic storage duration; object lifetime.
- Scope and name visibility; local, namespace, and class scope.
- Initialization, destruction, and lifetime extension rules at a practical level.
- Dangling references, use-after-lifetime, and returning references safely.

### Lesson 14 — Pointers, references, and memory model

- Addresses, pointers, dereferencing, `nullptr`, and pointer validity.
- References versus pointers; const-qualified pointers and references.
- Stack and heap as a useful model, plus its limits; object representation and alignment overview.
- Arrays and pointer arithmetic concepts; bounds and ownership hazards.
- Prefer standard containers and references when raw pointers are not needed.

### Lesson 15 — Resource management and RAII

- Resource Acquisition Is Initialization (RAII): tie resource lifetime to object lifetime.
- Constructors, destructors, deterministic cleanup, and exception safety introduction.
- Resource examples: memory, files, locks, and handles.
- Smart pointers: `std::unique_ptr`, `std::shared_ptr`, `std::weak_ptr`; ownership and cycles.
- Why manual `new`/`delete` should generally be avoided in application code.

### Lesson 16 — Classes and encapsulation

- Class versus object; data members, member functions, `public`, `private`, and `protected`.
- Constructors, member initializer lists, default values, and `explicit`.
- Class invariants and validation at the boundary.
- `const` member functions, `this`, static members, and accessors.
- Composition and designing a small, clear public interface.

### Lesson 17 — Copying and moving objects

- Copy construction, copy assignment, move construction, and move assignment.
- Lvalues, rvalues, and `std::move` as a cast indicating that resources may be moved.
- Rule of Zero, Rule of Five, and when a custom special member is required.
- Value semantics and the cost/benefit of copies.
- Avoiding self-assignment bugs and maintaining invariants after operations.

### Lesson 18 — Operators, conversions, and enums

- Appropriate operator overloading for user-defined types.
- Conversion constructors, conversion functions, `explicit`, and narrowing.
- `enum` and `enum class` for enumerations; prefer scoped enums in new interfaces.
- Unions as overlapping storage and their active-member/lifetime constraints; prefer `std::variant` for a type-safe choice of alternatives.
- Comparisons and stream output for domain types.
- Avoid surprising implicit conversions and operators that mislead readers.

### Lesson 19 — Inheritance and runtime polymorphism

- Base and derived classes; public inheritance models “is-a”.
- Virtual functions, overriding, `override`, abstract classes, and interfaces.
- Virtual destructors and safe destruction through a base pointer.
- Dynamic dispatch versus static dispatch; object slicing.
- Prefer composition unless runtime substitutability is actually needed.

### Lesson 20 — Templates and generic programming

- Function and class templates; type and non-type parameters.
- Template argument deduction and instantiation.
- Generic code, requirements on types, and compile-time diagnostics.
- Variadic templates and fold expressions (overview).
- C++20 concepts and `requires` clauses to state template requirements.

### Lesson 21 — Standard library containers and iterators

- `std::vector`, `std::array`, `std::deque`, `std::list` and their trade-offs.
- `std::stack`, `std::queue`, and `std::priority_queue` adaptors.
- Ordered and unordered associative containers: `std::map`, `std::set`, `std::unordered_map`, `std::unordered_set`.
- Iterator categories, iterator invalidation, and iterator-based ranges.
- Container selection by access pattern, ordering, insertion cost, memory, and guarantees.

### Lesson 22 — Standard algorithms and lambdas

- `<algorithm>` and `<numeric>`: `find`, `count`, `sort`, `transform`, `copy`, `remove_if`, `accumulate`.
- Iterators as algorithm boundaries; half-open ranges `[first, last)`.
- Lambda syntax, captures, parameters, return types, and lifetime of captured objects.
- Predicates, comparators, strict weak ordering, and common sorting mistakes.
- C++20 ranges and views: composition, laziness, and lifetime considerations.

### Lesson 23 — Error handling

- Return values, status types, exceptions, and when each is appropriate.
- `try`, `catch`, `throw`, standard exception types, and exception safety guarantees.
- RAII during stack unwinding; avoid swallowing exceptions or catching everything without a reason.
- `std::optional` for a possibly absent value; `std::variant` for one-of-several types.
- Error messages that help a caller recover or a user understand what happened.

### Lesson 24 — Files, streams, and serialization

- Text and binary streams; `std::ifstream`, `std::ofstream`, `std::fstream`.
- Open modes, stream state, line-by-line processing, and file errors.
- Paths with `std::filesystem`; portable path handling.
- Serialization versus raw object memory; schema and versioning concepts.
- CSV/JSON use cases and why production formats should use a reputable library.

### Lesson 25 — Data structures

- Abstract data types and representation invariants.
- Stacks, queues, deques, linked lists, hash tables, trees, heaps, and graphs.
- Implement a simple linked list and hash table for learning; use standard containers in ordinary production code.
- Tree traversal, binary search trees, balancing concepts, collision handling, and load factor.
- Trade-offs in time, memory, ordering, and implementation complexity.

### Lesson 26 — Recursion and complexity

- Base case, recursive case, call stack, and termination.
- Recursive and iterative solutions; depth and stack-overflow risk.
- Big-O, Big-Theta, and Big-Omega as growth descriptions; worst, average, and best cases.
- Time complexity, space complexity, amortized analysis, and recurrence intuition.
- Analyze vector growth, searching, sorting, trees, and hash tables.

### Lesson 27 — Multi-file programs and build systems

- Header/source separation, declarations versus definitions, and include guards or `#pragma once`.
- One Definition Rule (ODR), linkage, namespaces, and common linker errors.
- Preprocessing and conditional compilation; prefer typed C++ facilities over function-like macros.
- Compile translation units and link a complete executable.
- CMake basics: targets, sources, include paths, compiler features, and build directories.
- Dependencies, reproducible builds, Debug/Release configurations, and generated files.

### Lesson 28 — Testing and code quality

- Unit, integration, and end-to-end testing; test doubles overview.
- Arrange/act/assert; deterministic tests; edge cases and regression tests.
- Test frameworks (for example, GoogleTest) and test discovery.
- Static analysis, compiler warnings, formatting, code review, and documentation.
- Sanitizers: AddressSanitizer, UndefinedBehaviorSanitizer, and ThreadSanitizer where supported.

### Lesson 29 — Second integrated project

- Build a multi-file application such as a library catalog, expense tracker, or text-based game.
- Use classes, standard containers, algorithms, files, error handling, and automated tests.
- Add CMake, Git history, documentation, and a clean build from a fresh directory.
- Deliverable: a short design note explaining data structures, ownership, errors, tests, and trade-offs.

## Phase 3 — Algorithms, systems, and modern C++

**Outcome:** Reason about performance and correctness, understand how a program interacts with a system, and write safe concurrent code.

### Lesson 30 — Searching and sorting

- Linear and binary search; preconditions for binary search.
- Insertion, selection, merge, and quicksort concepts; use standard algorithms in real code.
- Stable versus unstable sorting; comparison requirements.
- Complexity, memory use, and choosing an algorithm for constraints.
- Benchmarking methodology and why timing tiny examples is misleading.

### Lesson 31 — Trees, heaps, and hashing

- Binary trees, traversal orders, binary search trees, balanced-tree purpose.
- Heaps and priority queues.
- Hash functions, collisions, chaining/open addressing concepts, and load factor.
- Ordered versus unordered maps/sets; expected versus worst-case behavior.
- Choosing structures using real query/update requirements.

### Lesson 32 — Graphs and graph algorithms

- Directed/undirected, weighted/unweighted graphs; adjacency list and matrix.
- Breadth-first search, depth-first search, connected components, cycle detection.
- Topological ordering and shortest paths (Dijkstra; negative-edge caveats).
- Minimum spanning tree concepts (Kruskal or Prim).
- Complexity relative to vertices and edges; modeling real problems as graphs.

### Lesson 33 — Algorithm design paradigms

- Brute force and pruning; divide and conquer.
- Greedy algorithms and how to justify a greedy choice.
- Dynamic programming: states, transitions, memoization, tabulation.
- Backtracking and constraint search.
- Randomized algorithms and correctness/performance trade-offs (overview).

### Lesson 34 — Modern C++ language features

- `auto`, range-based loops, structured bindings, `nullptr`, and uniform initialization.
- Move semantics, smart pointers, lambdas, and standard library algorithms in everyday code.
- `constexpr`, `consteval`, and `constinit` at a practical level.
- C++17 features: `std::optional`, `std::variant`, `std::string_view`, filesystem, structured bindings.
- C++20 features: concepts, ranges, modules overview, coroutines overview, and `std::span`.
- Read feature support tables; do not assume every compiler implements the latest standard.

### Lesson 35 — Advanced templates and compile-time programming

- Template specialization, partial specialization, and overload resolution basics.
- Type traits, `std::is_*`, `std::conditional`, `decltype`, and `if constexpr`.
- Concepts, constraints, and readable template interfaces.
- Argument-dependent lookup, SFINAE as a legacy technique, forwarding references, and perfect forwarding (advanced reading).
- Compile-time computation with `constexpr`; limits and compile-time cost.
- Template metaprogramming overview; use only when simpler runtime or generic code is insufficient.

### Lesson 36 — Concurrency fundamentals

- Processes versus threads; data races and shared mutable state.
- `std::thread`, joining, detaching hazards, and `std::jthread` where available.
- Mutexes, `std::lock_guard`, `std::scoped_lock`, condition variables.
- Atomics and memory ordering as an advanced topic; use synchronization primitives before hand-written lock-free code.
- Deadlock, starvation, race conditions, and safe ownership across threads.

### Lesson 37 — Asynchronous and parallel work

- Tasks, futures, promises, `std::async`, and thread pools conceptually.
- Work partitioning, synchronization costs, false sharing, and oversubscription.
- Parallel algorithms and execution policies when supported.
- Cancellation, timeouts, shutdown, exception propagation, and resource limits.
- Measure parallel speedup; parallelism does not guarantee faster execution.

### Lesson 38 — Computer architecture and performance

- CPU, registers, cache hierarchy, RAM, storage, and I/O.
- Locality, cache lines, branch prediction, alignment, and data-oriented design.
- Stack frames, calling conventions, virtual memory, and process address spaces (overview).
- Object representation, alignment, padding, and why raw bytes are not a portable serialization format.
- Profile before optimizing; distinguish latency, throughput, and memory use.
- Benchmark repeatably; avoid undefined behavior and compiler-optimization pitfalls.

### Lesson 39 — Operating systems and program execution

- Processes, threads, scheduling, synchronization, virtual memory, and files.
- System calls and the boundary between user space and kernel space.
- Environment variables, exit codes, signals/termination concepts, and permissions.
- Dynamic libraries, static libraries, ABI, symbol visibility, and binary compatibility.
- Platform APIs and portability boundaries; use standard C++ where possible.

### Lesson 40 — Networking and distributed-program basics

- Client/server, IP addresses, ports, DNS, sockets, and TCP versus UDP.
- HTTP request/response, status codes, timeouts, retries, and connection failures.
- Encoding, serialization formats, protocol versioning, and message framing.
- Latency, partial reads/writes, resource limits, and unreliable networks.
- Use maintained networking libraries; never assume received data is trustworthy.

### Lesson 41 — Security and robust programming

- Bounds safety, integer overflow, lifetime errors, undefined behavior, and race conditions.
- Validate and constrain external input; avoid unsafe parsing and unbounded resource use.
- Secret handling, least privilege, secure defaults, and dependency updates.
- Threat modeling basics; distinguish memory safety, correctness, and security.
- Defensive testing with fuzzing and sanitizers; respond to vulnerabilities responsibly.

### Lesson 42 — Third integrated project

- Build a multi-threaded or network-aware application only if the previous material is solid.
- Include a documented architecture, clear ownership, input validation, automated tests, and failure handling.
- Profile one meaningful workload and explain the measured result.
- Deliverable: reproducible build, test instructions, security considerations, and performance notes.

## Phase 4 — Software engineering and capstone

**Outcome:** Plan, build, review, and deliver a maintainable C++ application as a team or independently.

### Lesson 43 — Design and architecture

- Requirements, user stories, constraints, and acceptance criteria.
- Modules, interfaces, dependency direction, cohesion, coupling, and separation of concerns.
- SOLID principles as design heuristics, not rules to apply mechanically.
- Composition, dependency injection, design by contract, and API stability.
- Common patterns: Strategy, Observer, Factory, Adapter, RAII guard; when not to use a pattern.

### Lesson 44 — Git collaboration and code review

- Branches, commits, merge/rebase concepts, conflicts, tags, and releases.
- Small, reviewable changes and meaningful commit messages.
- Pull-request review, constructive feedback, issue tracking, and ownership of decisions.
- Ignore generated files and build outputs; manage secrets and licenses correctly.
- Recovering safely from mistakes without destroying shared history.

### Lesson 45 — Continuous integration and release

- Automated build, tests, formatting/linting, and static analysis on every change.
- CI pipelines, build matrices, compiler versions, and platform-specific checks.
- Packaging, version numbers, release notes, artifacts, and dependency management.
- Reproducibility, clean builds, and deployment configuration.
- Observability basics: logs, actionable errors, metrics, and diagnostics.

### Lesson 46 — Database and persistence fundamentals

- Relational data, tables, keys, constraints, indexes, and basic SQL.
- Transactions, atomicity, consistency, isolation, and durability concepts.
- Database access from C++; parameterized queries and resource lifetime.
- Schema changes, migrations, backup, and recovery.
- Choose storage based on the problem; do not store secrets as plain text.

### Lesson 47 — Capstone planning and implementation

- Choose a bounded problem; define audience, features, constraints, and success criteria.
- Draw module boundaries and model data before implementation.
- Build a small vertical slice first, then deliver features incrementally.
- Track issues, test continuously, review code, document decisions, and manage scope.
- Include non-functional requirements: reliability, security, performance, accessibility, and usability.

### Lesson 48 — Capstone verification and presentation

- Clean build on a second machine or fresh environment.
- Automated tests, edge cases, failure paths, and security review checklist.
- Profiling evidence for any performance claims.
- User documentation, API/build documentation, known limitations, and future work.
- Demonstrate the program and explain architecture, trade-offs, failures discovered, and lessons learned.

## Core mathematics and computer-science knowledge

These are not all C++ language lessons, but they are important for a college-level computer-science foundation:

- **Discrete mathematics:** logic, sets, relations, functions, proof by induction, recurrence relations, combinatorics, and graphs.
- **Algorithm analysis:** asymptotic notation, correctness arguments, time/space trade-offs, and lower-bound intuition.
- **Data representation:** binary and hexadecimal, signed integers, floating point, character encoding, and endianness.
- **Computer organization:** Boolean logic, arithmetic, memory hierarchy, instruction execution, and basic assembly concepts.
- **Operating systems:** processes, threads, memory, scheduling, synchronization, files, and system calls.
- **Databases:** relational modeling, SQL, indexes, constraints, and transactions.
- **Networking:** layered protocols, addressing, TCP/UDP, HTTP, and failure modes.
- **Professional practice:** technical writing, collaboration, ethical use of software, licensing, privacy, and accessibility.

## Electives — choose based on your goal

These are valuable areas, but not every C++ student needs all of them. Complete the common core first.

- **Embedded and real-time:** microcontrollers, interrupts, peripherals, fixed memory, deterministic timing, RTOS, and hardware debugging.
- **Game development and graphics:** linear algebra, game loops, rendering pipeline, GPU concepts, asset management, and physics.
- **Scientific computing:** numerical analysis, linear algebra, precision/error, parallel computing, and scientific libraries.
- **High-performance computing:** distributed memory, MPI, GPU programming, vectorization, and performance modeling.
- **Finance and low-latency systems:** profiling, allocation control, cache behavior, concurrency, and risk-aware testing.
- **Compilers and language tools:** lexing, parsing, ASTs, type checking, optimization, code generation, and compiler toolchains.
- **Advanced security:** secure coding, fuzzing, binary analysis, threat modeling, and memory-safety research.
- **GUI and application development:** event loops, UI state, accessibility, localization, and platform toolkits.
- **C++ modules and library engineering:** API/ABI compatibility, packaging, versioning, module interfaces, and documentation.

## Completion checklist

A student who completes the core should be able to:

- Build a multi-file C++ project from a clean checkout using a documented build system.
- Explain object lifetime, ownership, RAII, value/reference semantics, and common undefined behavior.
- Use standard containers and algorithms appropriately and justify the choice.
- Implement and analyze common data structures and algorithms.
- Write tests, debug failures, use compiler warnings, and interpret sanitizer results.
- Use templates and modern C++ features without making code needlessly complex.
- Explain basic operating-system, architecture, networking, and database concepts relevant to their project.
- Collaborate with Git, review code, document decisions, and deliver a maintainable project.

The roadmap is a learning map, not a claim that one checklist guarantees professional mastery. Revisit topics in increasingly complex projects and consult the documentation for the exact C++ standard and libraries you use.
