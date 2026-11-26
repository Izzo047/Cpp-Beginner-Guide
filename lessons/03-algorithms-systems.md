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

- **Insertion sort:** `O(n²)` worst case and `O(1)` extra memory; simple and effective for tiny or nearly sorted data.
- **Merge sort:** `O(n log n)` time and usually `O(n)` extra memory; can be stable.
- **`std::sort`:** `O(n log n)` comparisons and usually `O(log n)` stack; fast general-purpose choice, but not stable.

```text
sorted values: [2, 4, 7, 9, 12, 15, 20]
search for 12:
             middle=9 -> keep right half
                           middle=15 -> keep left half
                                       found 12
```

Binary search repeatedly discards the half that cannot contain the target. Its sorted-input precondition is essential; if the range is not sorted by the same ordering, this narrowing argument is invalid.

Use linear search for unsorted data, binary search for sorted data, and `std::lower_bound` when you need the insertion position in sorted data. Sorting has a cost, so do not sort solely to perform one search unless the workload justifies it.

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

```text
ordered map:      keys are traversed in sorted order
heap:             [highest-priority item] at top; rest only partially ordered
hash table:       key -> bucket -> value; collisions handled inside bucket
```

Choose a tree when ordered traversal and predictable logarithmic operations matter, a heap when repeatedly retrieving one priority item matters, and a hash table when fast average key lookup matters more than ordering. Tree nodes and hash buckets both cost additional memory compared with a compact vector.

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

Common graph representations:

- **Adjacency list:** `vector<vector<int>>`; memory `O(V + E)`, good for sparse graphs and neighbor iteration.
- **Adjacency matrix:** `vector<vector<bool>>` or a numeric matrix; memory `O(V²)`, fast edge-presence checks, useful for dense/small graphs.
- **Edge list:** store `(from, to, weight)` records; simple to read and useful for algorithms that process all edges.

Here `V` is the number of vertices and `E` the number of edges. For an undirected graph, each edge usually appears in both endpoint lists. Choose a representation from the graph size and operations.

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

- **Brute force:** try every key in a small search space. It is simple and reliable, but often grows exponentially.
- **Divide and conquer:** merge sort splits work cleanly, though combining results can need extra memory.
- **Greedy:** selecting the earliest-finishing compatible activity is fast, but correctness needs a proof.
- **Dynamic programming:** minimum coins for arbitrary denominations reuses subproblem answers, at the cost of state/memory design.
- **Backtracking:** generate valid permutations and prune impossible paths; worst-case work can still be exponential.

```text
ways(n) = ways(n - 1) + ways(n - 2)

ways(5)
  /   \
ways(4) ways(3)       naive recursion repeats these subproblems
   \     /
   cached results     dynamic programming computes each state once
```

For dynamic programming, specify what a state means before writing the recurrence. Memoization stores results during recursion; tabulation fills a table in a deliberate order. Both avoid repeating overlapping work, but the table may use more memory than a carefully compressed implementation.

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

Use a feature from the project's chosen standard deliberately: C++17 `optional` models a possibly absent value; C++20 concepts express template requirements; C++20 `span` is a non-owning view of contiguous elements. Newer syntax improves expression, but raises the minimum compiler/library version and can make code less portable to older toolchains.

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

`constexpr` functions can be evaluated at compile time when called with compile-time inputs, and can also run normally at runtime. `consteval` (C++20) requires compile-time evaluation. `constinit` (C++20) requires static initialization of a variable but does not make the variable immutable. Use `static_assert` to reject a program when a compile-time condition is false.

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

```text
Thread A: lock -> read total -> add 1 -> write total -> unlock
Thread B: wait -------------------------------> lock -> update -> unlock
                    shared total
```

Only one thread at a time executes the protected update, so the read/modify/write sequence cannot interleave with another update protected by the same mutex. Every access that participates in the shared invariant must follow the same synchronization rule.

Join every joinable thread before its owning data disappears. Avoid holding locks while calling unknown code. Deadlock can result when locks are acquired in inconsistent order.

`std::atomic<T>` can make specific operations on a single value atomic:

```cpp
#include <atomic>

std::atomic<int> completed{0};
++completed;
```

Atomicity does not make several related variables a consistent transaction. Start with mutexes and their clear invariants; study memory ordering and lock-free algorithms only when a measured design requires them.

Synchronization choices have different scopes:

- `std::mutex` protects a multi-step invariant or compound shared state.
- `std::atomic<T>` protects atomic operations on one suitable value.
- `std::condition_variable` lets a thread wait for a predicate to become true.
- `std::jthread` (C++20) joins automatically and supports cooperative stop requests.

Atomics can be efficient but are not automatically simpler or faster; mutexes are often the clearest correct choice. Always define which thread owns each object and ensure workers stop before that object is destroyed.

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

Use `std::async` for a small number of independent tasks with a future result, a thread pool for many tasks where bounded reusable workers matter, and standard parallel algorithms when the operation maps naturally to a library algorithm and the implementation supports it. Parallelism adds scheduling cost and makes shared mutable state harder to reason about; begin with sequential code and measure before adding it.

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

```text
CPU registers <-> L1 cache <-> L2/L3 cache <-> main memory
    fastest          |                         largest capacity
                     +-- each level is farther/slower
```

This is a conceptual hierarchy, not a promise of exact sizes or speeds. A contiguous vector scan often uses cache lines well; following unrelated pointers can require more memory fetches. Structure data around the access pattern only after profiling identifies a bottleneck.

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

A process is an isolated running program with its own virtual address space; threads within it share that address space. A program is the executable file, while a process is one running instance. Static linking places library code into the executable; dynamic linking loads shared libraries at runtime, often reducing duplication but adding runtime deployment dependencies.

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

```text
client --request bytes--> server
client <--response bytes-- server
       (TCP preserves order, not message boundaries)
```

Protocols must define message boundaries, such as a length prefix or delimiter with escaping. TCP is a reliable ordered byte stream when a connection works; UDP preserves datagram boundaries but does not guarantee delivery or ordering. Choose based on application requirements, not on the assumption that one is universally better.

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

Review risks by boundary: validate untrusted input, keep resource use bounded, use RAII for cleanup, avoid data races, and use parameterized database queries. Sanitizers and fuzz tests are helpful detection tools, not proofs of safety; review dependencies and error paths as well as the happy path.

**Trap:** Escaping strings manually is not a substitute for parameterized database queries or context-aware output encoding.

**Practice:** Review a parser for out-of-bounds access, integer overflow, unbounded input, and unclear failure handling.

## Lesson 42 — Third integrated project

**By the end, you can:** plan a bounded program that handles invalid work, failure, resource limits, and safe shutdown.

Build a bounded task-processing program: accept jobs, validate them, process independently, and report results. Add concurrency only after a correct sequential version exists.

```text
input -> validate -> bounded queue -> workers -> result/error report
                         |                         |
                    reject overload          preserve task identity
```

Bound both the number of queued tasks and the size/cost of each task. A sequential implementation is easier to debug and often adequate; workers can improve throughput for independent expensive jobs, but require safe shutdown, result association, and error propagation.

Plan ownership and shutdown before launching workers. Put a maximum on queued jobs and response sizes. Use tests for empty input, invalid jobs, failure during processing, and shutdown while work is pending.

**Practice extension:** Add a network client or persistent storage as one isolated module. Document timeout, retry, and failure behavior.
