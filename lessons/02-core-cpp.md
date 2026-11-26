# Phase 2 — Core C++ and Data Structures

## Lesson 13 — Scope, storage, and lifetime

**By the end, you can:** distinguish a name's scope from an object's lifetime and identify when a reference would dangle.

```cpp
int& broken() {
    int local = 42;
    return local; // Wrong: local's lifetime ends when the function returns.
}

int value() {
    int local = 42;
    return local; // Correct: return the value.
}
```

Scope answers where a name can be used; lifetime answers when the object exists. An automatic local usually exists until its block ends. A static local exists for the program's lifetime and retains its value between calls. Global objects also have static storage duration, but can introduce initialization-order and hidden-dependency problems.

References and pointers must not outlive the objects they refer to. Use local ownership and return values or owning objects.

**Trap:** A valid-looking address does not prove the object is still alive.

**Practice:** Write a function returning a `std::string` by value, then explain why returning a reference to its local string is unsafe.

## Lesson 14 — Pointers, references, and memory model

**By the end, you can:** read and write through a valid pointer, compare pointers with references, and state who owns an object.

```cpp
int score = 90;
int* pointer = &score;       // pointer stores score's address
int& alias = score;          // reference is another name for score
const int* read_only = &score;

if (pointer != nullptr) {
    *pointer += 1;
}
```

`&object` obtains an address; `*pointer` accesses the pointed-to object. A pointer can be null or reassigned; a reference must be initialized and cannot be reseated. `const int*` prevents changing the value through that pointer. `int* const` prevents changing the pointer itself.

A raw pointer usually does not own the object. State who owns an object and how long it lives. Pointer arithmetic is only valid within an array object and one position past its end; dereferencing that one-past pointer is invalid.

**Trap:** Never dereference null, dangling, or out-of-bounds pointers.

**Practice:** Write a function that receives a pointer to an optional integer; return an error or use `std::optional` when absent instead of dereferencing blindly.

## Lesson 15 — Resource management and RAII

**By the end, you can:** explain how RAII releases resources and choose values, containers, or smart pointers for ownership.

```cpp
#include <fstream>
#include <memory>

int main() {
    std::ifstream input("scores.txt"); // File closes when input is destroyed.
    auto values = std::make_unique<int[]>(10); // Ownership is automatic.
}
```

RAII binds resource acquisition to object construction and release to destruction. It works for files, memory, locks, and many system handles. `std::unique_ptr<T>` expresses one owner; `std::shared_ptr<T>` shares ownership through reference counting; `std::weak_ptr<T>` observes a shared object without extending its lifetime.

Choose the simplest ownership model. Prefer values and containers first, then `unique_ptr` for dynamic exclusive ownership. Shared ownership should be deliberate because it can obscure lifetime; cycles of `shared_ptr` prevent destruction.

**Trap:** A raw pointer returned by `.get()` from a smart pointer is non-owning; do not delete it.

**Practice:** Replace a manually allocated array in a toy program with `std::vector`, and explain which cleanup code disappeared.

## Lesson 16 — Classes and encapsulation

**By the end, you can:** protect a class invariant with a constructor and a small public interface.

```cpp
class BankAccount {
public:
    explicit BankAccount(int opening_cents) : cents_(opening_cents) {
        if (opening_cents < 0) throw std::invalid_argument("negative balance");
    }

    void deposit(int cents) {
        if (cents <= 0) throw std::invalid_argument("deposit must be positive");
        cents_ += cents;
    }

    int balance_cents() const { return cents_; }

private:
    int cents_;
};
```

A class protects an invariant: here the balance cannot become negative through the public API, and deposits must be positive. The constructor establishes valid initial state. A `const` member function promises not to modify ordinary members. `explicit` prevents accidental implicit conversion from an integer to an account.

Prefer storing money as integer minor units rather than binary floating point. A real financial application also needs overflow rules, currency, rounding policy, and audited operations.

**Trap:** Public data lets callers bypass validation and break invariants.

**Practice:** Add `withdraw`, reject invalid amounts, and test exact-balance withdrawal and overdraw.

## Lesson 17 — Copying and moving objects

**By the end, you can:** distinguish copying from moving and explain why the Rule of Zero is the safest default.

```cpp
#include <memory>
#include <string>
#include <utility>

std::string original = "report";
std::string copy = original;             // independent value
std::string moved = std::move(original); // permits resources to transfer

auto owner = std::make_unique<int>(7);
auto new_owner = std::move(owner);       // unique_ptr cannot be copied
```

Copying makes a logically independent value. Moving allows a type to transfer resources efficiently; `std::move` itself does not move anything, it enables move operations. A moved-from standard-library object remains valid but its value is generally unspecified; assign to it or destroy it.

The Rule of Zero says use members that already manage their resources so the compiler-generated special members are correct. Write custom copy/move/destructor operations only when the class truly owns a resource that its members do not manage.

**Trap:** Do not use an object after `std::move` as if its old contents were guaranteed.

**Practice:** Put strings in a vector, pass one by value and one by `const&`, and compare the interface clarity and copying needs.

## Lesson 18 — Operators, conversions, and enums

**By the end, you can:** design unsurprising operators and choose an enum or type-safe variant for a domain value.

```cpp
enum class Direction { north, south, east, west };

struct Meters {
    double value;
    explicit Meters(double amount) : value(amount) {}
};

Meters operator+(Meters left, Meters right) {
    return Meters(left.value + right.value);
}
```

`enum class` prevents enumerator names from leaking into the surrounding scope and avoids implicit conversion to integers. Overload an operator only when its behavior matches the familiar meaning. Keep conversions explicit when they could lose information or change meaning.

For unit-sensitive code, distinct types like `Meters` and `Seconds` prevent accidental mixing better than using `double` for everything. Define validation and overflow behavior in real domain types.

**Trap:** An overloaded `+` that performs network I/O or changes unrelated state surprises readers.

**Practice:** Define a `Celsius` type and a conversion function to Fahrenheit; prevent implicit construction from a raw `double`.

### Structures, unions, and tagged alternatives

A `struct` can hold several independent values. A `union` overlays its members in the same storage, so only one member is active at a time; reading or changing the wrong member can violate lifetime rules. It is a low-level tool, not a smaller replacement for a class.

For a value that may be one of several alternatives, use `std::variant` and let the type track the active alternative:

```cpp
#include <iostream>
#include <variant>

using Reading = std::variant<int, double>;

Reading reading = 21;
std::visit([](const auto& value) {
    std::cout << value << '\n';
}, reading);
```

`std::variant` requires C++17 or later. Prefer it to a hand-managed union unless you have a specific low-level representation requirement.

**Mastery check:** Compare `struct`, `enum class`, `union`, and `std::variant`: what state does each represent, and how does the program know which value is valid?

## Lesson 19 — Inheritance and runtime polymorphism

**By the end, you can:** use virtual dispatch safely and decide when composition is simpler than inheritance.

```cpp
#include <memory>
#include <vector>

struct Shape {
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

struct Square final : Shape {
    explicit Square(double side) : side_(side) {}
    double area() const override { return side_ * side_; }
private:
    double side_;
};
```

The pure virtual `area` makes `Shape` abstract. `override` asks the compiler to verify a matching virtual function. A virtual destructor is essential when deleting derived objects through a base pointer. Runtime polymorphism lets code use a common interface while behavior depends on the dynamic type.

Public inheritance should model substitutability (“is-a”). For other relationships, composition is often simpler. Avoid slicing by storing derived objects by value in a base-type container; use references or owning smart pointers when polymorphism is needed.

**Trap:** A base class without a virtual destructor is unsafe to destroy through a base pointer.

**Practice:** Add `Circle`, store `std::unique_ptr<Shape>` objects, and total their areas.

## Lesson 20 — Templates and generic programming

**By the end, you can:** write a small reusable template and state the operations its type arguments must support.

```cpp
template <typename T>
T larger(T left, T right) {
    return left < right ? right : left;
}

auto result = larger(4, 9); // T is deduced as int
```

A template describes code parameterized by types or values. The compiler instantiates a specialization when it sees a use. The operations used inside a template impose requirements on its type arguments; document those requirements or express them with C++20 concepts.

Templates are generally defined in headers because the compiler needs the definition at the point of instantiation. Error messages may point deep into a template; reduce the example and check the required operations.

**Trap:** Generic code is not automatically reusable; overly broad templates can create unclear constraints and diagnostics.

**Practice:** Write a template function that returns the number of elements satisfying a predicate, then constrain it with a concept if using C++20.

## Lesson 21 — Standard containers and iterators

**By the end, you can:** select a container from required operations and account for iterator invalidation.

```cpp
#include <map>
#include <unordered_map>
#include <vector>

std::vector<int> sequence{3, 1, 4};             // contiguous order
std::map<std::string, int> ordered{{"Ada", 1}}; // keys sorted
std::unordered_map<std::string, int> lookup;    // hash lookup
```

Use `vector` for most sequences: it is compact and cache-friendly. `map` keeps keys ordered and offers logarithmic operations. `unordered_map` usually offers average constant-time lookup but has no key ordering and can degrade with collisions. `list` supports stable iterators and local insertion/removal but has poor locality and no constant-time indexing.

Iterators generalize traversal. Container mutations have container-specific invalidation rules; consult the reference before retaining iterators or references across mutation.

**Trap:** Choosing a linked list because insertion is “always O(1)” ignores locating the insertion point and memory/cache costs.

**Practice:** Model a word-frequency table with `unordered_map`, then print the results sorted by word using a `map`.

## Lesson 22 — Standard algorithms and lambdas

**By the end, you can:** express common collection work with standard algorithms and write safe predicates and captures.

```cpp
#include <algorithm>
#include <numeric>
#include <vector>

std::vector<int> values{5, 1, 4, 1};
std::sort(values.begin(), values.end());
const int total = std::accumulate(values.begin(), values.end(), 0);
const auto ones = std::count_if(values.begin(), values.end(),
                                [](int value) { return value == 1; });
```

Standard algorithms express intent and handle iterator ranges. Most ranges are half-open: include `begin`, exclude `end`. A lambda is an unnamed callable; captures decide which surrounding values it can access. Capture by value when an independent snapshot is desired; capture by reference only when the referenced object outlives the lambda's use.

Sorting comparators must provide a strict weak ordering. For C++20, ranges versions can improve readability and compose with views; views may be lazy and often refer to their source, so source lifetime matters.

**Trap:** `std::remove` rearranges elements but does not shrink a vector; use the erase-remove idiom or C++20 `std::erase`.

**Practice:** Remove all negative values, sort the remaining values descending, and compute their sum.

## Lesson 23 — Error handling

**By the end, you can:** choose between a status, optional value, variant, or exception and preserve cleanup during failure.

```cpp
#include <optional>
#include <string>
#include <variant>

std::optional<int> parse_small_positive(int value) {
    if (value <= 0 || value > 100) return std::nullopt;
    return value;
}

using Result = std::variant<int, std::string>;
```

Use a return value for ordinary expected outcomes, `optional` when a result may simply be absent, and `variant` when exactly one of several alternatives is present. Exceptions are useful for failures that cannot be handled locally or for constructor failures; RAII ensures cleanup while exceptions unwind.

Catch exceptions where the program can add context or recover. Do not catch and ignore errors. Document what failures callers must expect.

**Trap:** Exceptions should not be used as normal loop control, and `noexcept` is a guarantee with consequences, not a speed switch.

**Practice:** Parse a menu selection into a result that distinguishes valid choice, malformed input, and out-of-range input.

## Lesson 24 — Files, streams, and serialization

**By the end, you can:** check file and stream state, handle malformed input, and explain why raw object bytes are not a portable format.

```cpp
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream input("names.txt");
    if (!input) {
        std::cerr << "Cannot open names.txt\n";
        return 1;
    }
    for (std::string line; std::getline(input, line);) {
        std::cout << line << '\n';
    }
}
```

Streams report open and read failures through state. `std::filesystem::path` represents paths portably. Text formats are inspectable but need escaping and clear rules; binary formats require explicit layout, endianness, and version choices. Never serialize a C++ object by dumping its raw memory and assume it is portable.

Use a maintained JSON/CSV library for nontrivial formats. Distinguish parse errors, missing fields, invalid values, and I/O errors.

**Trap:** File paths are interpreted relative to the process working directory, not necessarily the source-file directory.

**Practice:** Read a list of integer scores, reject malformed lines, and report both the line number and the problem.

## Lesson 25 — Data structures

**By the end, you can:** describe the operations and costs of common abstract data types and select a suitable standard container.

```cpp
#include <queue>
#include <stack>
#include <vector>

std::stack<int> undo_history;           // last in, first out
std::queue<int> print_jobs;             // first in, first out
std::priority_queue<int> urgent_scores; // largest item first by default
std::vector<int> contiguous_values;     // random access
```

An abstract data type describes operations, not storage. A stack offers push/pop/top; a queue offers enqueue/dequeue/front. A hash table maps keys using a hash plus collision resolution. A tree organizes hierarchical or ordered data; a heap supports efficient access to the highest-priority item.

Learn implementations to understand invariants and complexity, but normally use standard-library containers. Pick a structure from operations and guarantees, not from its name alone.

**Trap:** A heap is not a fully sorted collection; it only guarantees its priority element is at the top.

**Practice:** Simulate browser back navigation with a stack and print jobs with a queue. State each operation's expected complexity.

## Lesson 26 — Recursion and complexity

**By the end, you can:** prove a recursive process terminates and compare its time and extra-space costs with an iterative version.

```cpp
long long factorial(int n) {
    if (n < 0) throw std::invalid_argument("negative input");
    if (n <= 1) return 1;            // base case
    return n * factorial(n - 1);     // smaller subproblem
}
```

Every recursive solution needs a base case and progress toward it. Each call consumes stack space. Factorial recursion uses `O(n)` calls/space; an iterative version can use `O(1)` extra space. The numeric result also overflows for sufficiently large `n`.

Big-O describes an upper growth rate, not exact seconds. `O(log n)` grows slowly, `O(n)` linearly, `O(n log n)` commonly for efficient comparison sorting, and `O(n²)` quadratically. Amortized analysis averages a sequence of operations over the sequence, not random inputs.

**Trap:** A recursive algorithm can be logically correct and still exhaust the call stack or overflow its result type.

**Practice:** Write iterative and recursive sums from 1 through `n`; state their time and auxiliary-space complexity.

## Lesson 27 — Multi-file programs and build systems

**By the end, you can:** organize a small multi-file program, explain a common linker error, and build it with CMake.

```cpp
// math_utils.h
#pragma once
int add(int left, int right);

// math_utils.cpp
#include "math_utils.h"
int add(int left, int right) { return left + right; }
```

A header declares an interface; a source file defines non-template functions. Include guards prevent duplicate inclusion in one translation unit. The One Definition Rule constrains how entities are defined across the program. Linker errors often mean a declaration has no matching definition or a definition appears more than once.

A minimal CMake project:

```cmake
cmake_minimum_required(VERSION 3.20)
project(LearningApp LANGUAGES CXX)
add_executable(app main.cpp math_utils.cpp)
target_compile_features(app PRIVATE cxx_std_20)
```

**Trap:** Do not put non-inline function definitions in a header included by multiple source files.

The preprocessor runs before C++ compilation. `#include` inserts declarations from headers, and `#if`/`#ifdef` can select code for a platform or build configuration. Macros are textual substitution without normal type checking or scope; prefer `constexpr`, templates, and inline functions when they express the same intent.

**Practice:** Split a calculator into `main.cpp`, `operations.h`, and `operations.cpp`, then build it from a new build directory.

## Lesson 28 — Testing and code quality

**By the end, you can:** choose useful unit and integration tests and describe what warnings, static analysis, and sanitizers can catch.

```cpp
int add(int a, int b) { return a + b; }

void test_add() {
    if (add(2, 3) != 5) throw std::runtime_error("add failed");
    if (add(-1, 1) != 0) throw std::runtime_error("add failed at zero");
}
```

Unit tests check small units; integration tests check components together; end-to-end tests exercise user-visible flows. Make tests deterministic and independent. Test behavior, not private implementation details. Use a test framework for larger suites.

Warnings, formatters, static analysis, and code review catch different classes of problems. AddressSanitizer can detect many memory errors; UndefinedBehaviorSanitizer detects many undefined operations; ThreadSanitizer can help find data races. Availability depends on compiler/platform.

**Trap:** A test suite passing proves only the tested cases; it cannot prove the absence of all defects.

**Practice:** Add tests for empty, one-item, duplicate, and boundary inputs to a function you wrote.

## Lesson 29 — Second integrated project

**By the end, you can:** deliver a documented multi-file application with persistence, automated tests, and an explained data-structure choice.

Build a library catalog with `Book` values stored in a container. Add search, add/remove, file persistence, and validation. Separate storage, domain rules, and user interaction so each can be tested independently.

Suggested structure:

```text
catalog/
  CMakeLists.txt
  include/catalog/book.h
  src/book.cpp
  src/main.cpp
  tests/book_tests.cpp
```

Write a clean-build instruction such as `cmake -S . -B build` followed by `cmake --build build`. Add a test target and explain the container choice.

**Practice extension:** Add duplicate-title handling and a migration/version field to the saved format. Test corrupted and missing files.
