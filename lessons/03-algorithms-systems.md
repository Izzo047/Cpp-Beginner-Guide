# Phase 3 — Algorithms, Systems, and Modern C++

## Lesson 30 — Searching and sorting

**By the end, you can:** select a search or sort method, state its preconditions, and compare its time and space trade-offs.

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{8, 2, 5, 2};
std::sort(values.begin(), values.end());  // ascending
bool found = std::binary_search(values.begin(), values.end(), 5);
```

Binary search requires a sorted range and takes logarithmic comparisons. `std::sort` is the normal choice for general in-memory sorting; it is not stable. `std::stable_sort` preserves the order of equivalent items at additional possible cost. Learn insertion sort and merge sort to understand invariants and complexity; use standard algorithms in production.

**Trap:** Binary-searching unsorted data is a logic error. A comparator must consistently order every pair.

**Practice:** Sort records by score, then by name as a tie-breaker. Test equal scores and duplicate records.

## Lesson 31 — Trees, heaps, and hashing

**By the end, you can:** compare ordered trees, heaps, and hash tables by the operations and guarantees they provide.

```cpp
#include <functional>
#include <queue>
#include <string>
#include <unordered_map>

std::priority_queue<int, std::vector<int>, std::greater<int>> smallest_first;
smallest_first.push(8);
smallest_first.push(3);
int smallest = smallest_first.top(); // 3

std::unordered_map<std::string, int> visits;
++visits["home"];
```

A balanced search tree keeps keys ordered with operations typically `O(log n)`. A heap supports `top`, insertion, and removal in logarithmic time, but is not fully sorted. Hash tables have average constant-time operations under good hashing and load, but worst-case behavior can be linear.

**Trap:** Hash iteration order is not a stable presentation order. Sort keys or use an ordered map when output order matters.

**Practice:** Count words with a hash map, then display the ten most frequent using a min-heap or sorted vector.

## Lesson 32 — Graphs and graph algorithms

**By the end, you can:** model a problem as a graph and choose a traversal or shortest-path method that fits its edges.

```cpp
#include <queue>
#include <vector>

std::vector<std::vector<int>> graph{{1, 2}, {0, 3}, {0}, {1}};
std::vector<int> distance(graph.size(), -1);
std::queue<int> pending;
distance[0] = 0;
pending.push(0);

while (!pending.empty()) {
    int node = pending.front();
    pending.pop();
    for (int neighbor : graph[node]) {
        if (distance[neighbor] == -1) {
            distance[neighbor] = distance[node] + 1;
            pending.push(neighbor);
        }
    }
}
```

This adjacency-list representation and breadth-first search find shortest edge-count distances in an unweighted graph. Depth-first search explores deeply and is useful for components, cycles, and traversal. Dijkstra's algorithm handles nonnegative edge weights; it is not correct for negative weights. Topological ordering applies to directed acyclic graphs.

**Trap:** Decide whether edges are directed, weighted, and whether disconnected vertices exist before selecting an algorithm.

**Practice:** Model cities and roads. Compare BFS for equal-cost roads with Dijkstra for different nonnegative travel times.

## Lesson 33 — Algorithm design paradigms

**By the end, you can:** recognize brute force, divide and conquer, greedy, dynamic programming, and backtracking approaches and justify a choice.

```cpp
// Dynamic programming: ways to climb n steps using 1 or 2 steps.
long long ways(int n) {
    if (n < 0) return 0;
    long long previous = 1;
    long long current = 1;
    for (int step = 2; step <= n; ++step) {
        long long next = previous + current;
        previous = current;
        current = next;
    }
    return n == 0 ? 1 : current;
}
```

Brute force enumerates candidates. Divide-and-conquer splits and combines. Greedy algorithms make locally preferred choices and need a correctness argument. Dynamic programming stores results for overlapping subproblems; define a state, recurrence, base case, and evaluation order. Backtracking explores choices and prunes impossible partial solutions.

**Trap:** A greedy approach that works on examples is not necessarily optimal. Find a proof or a counterexample.

**Practice:** Solve coin change for a particular denomination system using greedy, then create a denomination set where greedy fails and solve with dynamic programming.

## Lesson 34 — Modern C++ language features

**By the end, you can:** use common modern C++ facilities and check that your chosen language mode and toolchain support them.

```cpp
#include <optional>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

std::optional<int> parse_score(std::string_view text);

std::vector<std::pair<std::string, int>> scores{{"Ada", 98}};
for (const auto& [name, score] : scores) {
    // structured binding names the pair members
}
```

C++17 added structured bindings, `std::optional`, `std::variant`, `std::string_view`, and `std::filesystem`. A `string_view` is non-owning: its source must outlive it. C++20 adds concepts, ranges, `std::span`, and coroutines. C++23 adds further library/language refinements; check compiler support before relying on them.

**Trap:** A modern feature is not automatically better. Prefer a simple, clear C++17 solution if a project has a C++17 baseline.

**Practice:** Return `optional<int>` from a parser; show that it distinguishes “no valid score” from a score of zero.

### Useful standard-library areas to explore

The standard library also has tools for everyday problems outside containers and algorithms:

```cpp
#include <random>

std::mt19937 engine{std::random_device{}()};
std::uniform_int_distribution<int> die{1, 6};
int roll = die(engine);
```

Use a fixed engine seed in repeatable tests, and never use this generator for security tokens. Use `std::chrono::steady_clock` to measure elapsed time; use calendar/time-zone facilities only after checking the language and library version your compiler supports. `<regex>` can match regular text patterns, but is not a substitute for a parser for nested languages.

**Mastery check:** Add a seeded random simulation, measure it with `steady_clock`, and report the seed, input size, compiler mode, and build type so another student can reproduce the run.

## Lesson 35 — Advanced templates and compile-time programming

**By the end, you can:** read constrained templates, reason about forwarding, and choose a compile-time technique only when it simplifies a real interface.

```cpp
#include <concepts>

template <std::integral T>
T doubled(T value) {
    return value + value;
}

constexpr int cube(int value) {
    return value * value * value;
}

static_assert(cube(3) == 27);
```

Concepts constrain template arguments and improve diagnostics. `constexpr` permits evaluation at compile time when inputs and operations allow it; it does not mean every call must be compile-time. `if constexpr` discards a branch during template instantiation. Type traits inspect or transform type properties.

Template specialization and metaprogramming can be powerful but increase compile time and complexity. Prefer ordinary functions and standard-library facilities until compile-time abstraction solves a concrete problem.

**Trap:** `static_assert` checks a compile-time condition; it does not validate runtime input.

**Practice:** Constrain a numeric template to integral types, then try calling it with `std::string` and read the diagnostic.

### Forwarding and template diagnostics

Once ordinary templates and references are comfortable, study forwarding references and overload resolution. `std::forward` preserves whether the caller supplied an lvalue or rvalue; it does not create ownership or make a dangling reference safe.

```cpp
#include <string>
#include <utility>

void inspect(const std::string&) { /* borrow */ }
void inspect(std::string&&) { /* accept a temporary */ }

template <typename T>
void relay(T&& value) {
    inspect(std::forward<T>(value));
}
```

Also learn how argument-dependent lookup finds functions in argument-associated namespaces, and how type traits, `decltype`, SFINAE, and concepts affect overload selection. Prefer concepts for new constrained interfaces; use SFINAE mainly to understand older libraries and diagnostics.

**Mastery check:** Call `relay` with a named string and a temporary string. Predict the selected overload and explain why `std::move` and `std::forward` are not synonyms.

## Lesson 36 — Concurrency fundamentals

**By the end, you can:** identify a data race, protect shared state, and ensure thread and resource lifetimes are safe.

```cpp
#include <mutex>
#include <thread>

int total = 0;
std::mutex total_mutex;

void add_one() {
    std::lock_guard<std::mutex> lock(total_mutex);
    ++total;
}

int main() {
    std::thread first(add_one);
    std::thread second(add_one);
    first.join();
    second.join();
}
```

Without synchronization, concurrent writes to `total` create a data race and undefined behavior. A mutex protects a critical section; RAII unlocks it even if control exits early. A process has its own address space; threads in one process share memory.

Join every joinable thread before its owning data disappears. Avoid holding locks while calling unknown code. Deadlock can result when locks are acquired in inconsistent order.

`std::atomic<T>` can make specific operations on a single value atomic:

```cpp
#include <atomic>

std::atomic<int> completed{0};
++completed;
```

Atomicity does not make several related variables a consistent transaction. Start with mutexes and their clear invariants; study memory ordering and lock-free algorithms only when a measured design requires them.

**Trap:** “It usually works” does not make a data race safe.

**Practice:** Remove the mutex, run a high-iteration counter, and use ThreadSanitizer if supported. Restore synchronization and compare.

## Lesson 37 — Asynchronous and parallel work

**By the end, you can:** collect asynchronous results, propagate task failures, and measure whether parallel work is worthwhile.

```cpp
#include <future>

int expensive_calculation(int value) {
    return value * value;
}

int main() {
    auto result = std::async(std::launch::async, expensive_calculation, 12);
    int answer = result.get(); // waits; propagates an exception from the task
}
```

`std::future` represents a result that may become available later. `get()` retrieves it once and rethrows task exceptions. Parallel work helps only when task cost exceeds scheduling and synchronization overhead. Thread pools reuse a bounded number of worker threads; cancellation and shutdown need explicit design.

**Trap:** Launching one thread per tiny item may be slower and can exhaust system resources.

**Practice:** Split a large sum into chunks, compare sequential and parallel versions, and measure multiple runs with release builds.

## Lesson 38 — Computer architecture and performance

**By the end, you can:** relate memory access patterns to performance and support an optimization claim with a repeatable measurement.

```cpp
// Usually cache-friendly: sequential access to contiguous vector elements.
long long total = 0;
for (int value : values) total += value;
```

CPUs fetch data through registers and cache levels before RAM. Sequential access often benefits from locality. Pointer-heavy structures can cause cache misses. Branch prediction, alignment, vectorization, and memory bandwidth can matter, but their effects depend on workload and hardware.

Objects can include padding to satisfy alignment requirements, so `sizeof(T)` may exceed the sum of member sizes. Object layout and padding are not a portable file format. Inspect layouts only with implementation-specific tools, and serialize fields explicitly.

Profile representative workloads before optimizing. Benchmark release builds, warm up when relevant, repeat measurements, and report compiler, flags, input size, and hardware. Measure latency and throughput separately.

**Trap:** A microbenchmark that the optimizer can remove or that uses unrealistic data does not represent application performance.

**Practice:** Compare sequential scans of a vector and a linked list at multiple sizes; profile and explain the result rather than guessing.

## Lesson 39 — Operating systems and program execution

**By the end, you can:** explain how a process uses operating-system services and distinguish source compatibility from ABI compatibility.

```text
program arguments: argv
environment: PATH, HOME/USERPROFILE
process result: exit code
```

The operating system schedules processes and threads, manages virtual address spaces and files, and provides services through system calls. A program's working directory affects relative paths. Static libraries are included at link time; dynamic libraries are loaded separately and create runtime dependencies. ABI compatibility concerns binary interfaces such as calling conventions, object layout, and symbol names.

Standard C++ provides portable abstractions for many tasks; process management and low-level handles often require platform APIs or libraries.

**Trap:** Source-level compatibility does not guarantee binary ABI compatibility across compilers or library versions.

**Practice:** Run a child command from a shell, inspect its exit code, and compare the result from a different working directory.

## Lesson 40 — Networking and distributed-program basics

**By the end, you can:** describe a client/server exchange and design for framing, timeouts, partial failure, and untrusted input.

```text
GET /status HTTP/1.1
Host: example.invalid
Connection: close
```

Networking has partial failures: a connection may fail, a read may return only part of a message, or a peer may stop responding. TCP provides an ordered byte stream, not application messages; your protocol must define framing. UDP sends datagrams without the same delivery guarantees. HTTP defines request/response semantics on top of transport protocols.

Production clients need timeouts, bounded retries, response-size limits, validation, and clear error handling. Use a maintained library rather than writing platform-specific socket code as a first networking project.

**Trap:** Never trust data from a network, even if it came from a familiar service.

**Practice:** Use a documented HTTP client library to request a public status endpoint; handle timeout, non-success status, and malformed response.

## Lesson 41 — Security and robust programming

**By the end, you can:** identify common memory, input-validation, resource-exhaustion, and concurrency risks in a code review.

```cpp
bool valid_index(std::size_t index, std::size_t size) {
    return index < size;
}

// SQL: bind user input as a parameter; do not concatenate it into the query.
// SELECT name FROM users WHERE id = ?
```

Check boundaries before indexing, validate external input, bound memory/time use, and handle integer conversions carefully. Undefined behavior can undermine security as well as correctness. Use established cryptographic libraries; do not invent cryptography. Protect secrets, grant least privilege, and update dependencies.

Threat modeling asks what you protect, who could attack it, entry points, and mitigations. Fuzzing supplies many generated inputs; sanitizers detect some classes of memory and concurrency defects.

**Trap:** Escaping strings manually is not a substitute for parameterized database queries or context-aware output encoding.

**Practice:** Review a parser for out-of-bounds access, integer overflow, unbounded input, and unclear failure handling.

## Lesson 42 — Third integrated project

**By the end, you can:** plan a bounded program that handles invalid work, failure, resource limits, and safe shutdown.

Build a bounded task-processing program: accept jobs, validate them, process independently, and report results. Add concurrency only after a correct sequential version exists.

Plan ownership and shutdown before launching workers. Put a maximum on queued jobs and response sizes. Use tests for empty input, invalid jobs, failure during processing, and shutdown while work is pending.

**Practice extension:** Add a network client or persistent storage as one isolated module. Document timeout, retry, and failure behavior.
