# Phase 1 — Programming Foundations

## Lesson 1 — What C++ is, computers, and development tools

**By the end, you can:** explain what C++ is, distinguish it from C, and describe how source code becomes a running program.

**Core idea:** C++ is a language for describing computations and data. A compiler translates a C++ program into a form a computer can execute; a terminal lets you run that compiler and inspect the files and results.

### Programming and the C++ language

A **program** is a precise set of instructions that transforms input into output or changes some state. A **programming language** gives people rules for writing those instructions. C++ is standardized by ISO and implemented by compilers such as GCC, Clang, and Microsoft Visual C++; the compiler is not the language itself.

C++ is **statically typed**, so the compiler checks many type mistakes before the program runs. It is also multi-paradigm: you can write step-by-step procedures, group behavior and data in classes, or write generic algorithms that work with many types. The standard library provides reusable tools such as `std::string`, `std::vector`, algorithms, file streams, and threads.

C++ grew out of work related to C, but they are separate languages with different rules and libraries. C++ adds abstractions such as classes, templates, references, and a much larger standard library; code valid in C is not automatically valid C++. This course teaches C++, not a combined C/C++ dialect.

### From source code to a running program

For a typical native program, the toolchain processes source in stages:

1. The **preprocessor** handles directives such as `#include`.
2. The **compiler** checks and translates each source file.
3. The **assembler** produces object files containing machine-level code.
4. The **linker** combines object files and libraries into an executable.
5. The **operating system** starts the program and reports its exit code.

Tools may combine stages, but the distinctions help identify errors: a compiler diagnostic points to a source-language problem, a linker diagnostic points to unresolved or duplicate definitions, and a runtime failure happens after launch.

```text
source (.cpp) -> preprocessor -> compiler -> assembler -> object file(s)
                                                        + libraries
                                                            |
                                                         linker
                                                            |
                                                        executable
                                                            |
                                                    operating system
```

The advantage of this staged toolchain is that large programs can be split into files and compiled separately. The trade-off is that there are more places a build can fail; identify the stage before changing code at random.

When a native program runs, the operating system loads it, gives it access to resources, and schedules its instructions on the CPU. Working data lives in memory while the program runs. You do not need to understand processor design yet; the important idea is that the CPU executes the compiled program, not the C++ source text directly.

### Why learn C++?

C++ is used where performance, predictable resource use, broad platform support, or hardware access matters: games and graphics, embedded devices, scientific computing, browsers, and system software. The same control can make programs complex: the language has many features, and programmers must reason carefully about types, object lifetime, and ownership. Modern C++ libraries and RAII reduce many manual-memory hazards, but do not remove the need to understand them.

Choosing C++ does not automatically make a program fast. Performance depends on the algorithm, data structures, implementation, compiler settings, and workload; measure before claiming an optimization.

Your editor helps write code; an IDE may combine editing, building, and debugging; the compiler translates code; and the terminal runs commands. Learning what each tool does makes it easier to follow a course tutorial or diagnose a failed build.

**When C++ fits:** it offers direct control, mature libraries, and predictable performance opportunities, but has a steeper learning curve and more responsibility around lifetime and correctness than many higher-level languages. Choose it for the constraints of the project, not just because it is considered fast.

```powershell
Get-Location
Get-ChildItem
g++ --version
```

`Get-Location` shows the current working directory, `Get-ChildItem` lists its files, and `g++ --version` checks whether one compiler is available. If the last command is not recognized, install a C++ compiler before trying to build a program. Version control appears later in the course. An editor, compiler, and debugger are different tools even when an IDE presents them together.

**Trap:** A command that works in one folder may fail in another because its relative paths use the current directory.

**Practice:** In your own words, explain what C++ is and how it differs from C. Then create a practice folder, write down its full path, and use `Get-Location` and `Get-ChildItem` to inspect it.

**Self-check:** Point to which part is the language, compiler, standard library, source file, executable, and operating system in one program run.

For optional books matched to your experience level, see the roadmap's [recommended publisher reading map](../COLLEGE_ROADMAP.md#recommended-publisher-reading-map).

## Lesson 2 — First C++ program and translation

**By the end, you can:** write, compile, and run a small program and distinguish source, compiler, linker, and runtime errors.

```cpp
#include <iostream>

int main() {
    std::cout << "First line\n";
    std::cerr << "Diagnostics go here\n";
    return 0;
}
```

Follow one value through the program: source text describes operations, compilation translates those operations, and execution produces output. Changing the source does not change an already-built executable until you compile again.

The preprocessor handles directives such as `#include`; the compiler translates each translation unit; the linker combines object code and libraries. `main` is the program entry point. `std::cout` is ordinary output, `std::cerr` is diagnostic output, and a zero exit code conventionally means success.

Compile using `g++ -std=c++20 -Wall -Wextra -Wpedantic file.cpp -o app.exe`, then run `.\app.exe`. Compile errors concern source translation; linker errors commonly mean a definition or library is missing; runtime errors happen after launch.

```text
compile-time: syntax/type error -> compiler cannot build object code
link-time:    missing/duplicate definition -> executable cannot be assembled
run-time:     program starts, then encounters a failure or wrong behavior
```

Compiler diagnostics, linker diagnostics, and runtime output call for different investigations. Save the first useful error, identify its stage, then make one focused correction.

**Trap:** A file named `.cpp` is not itself an executable, and an editor extension does not replace a compiler.

**Practice:** Intentionally remove a semicolon, compile, read the first diagnostic, restore it, then print two lines.

## Lesson 3 — Types, objects, and expressions

**By the end, you can:** choose and initialize basic types, predict common conversions, and explain why undefined behavior is not a reliable result.

```cpp
#include <iostream>

int main() {
    int completed = 7;
    double hours = 2.5;
    bool passed = completed >= 5;
    const double average_per_hour = completed / hours;
    std::cout << passed << " " << average_per_hour << '\n';
}
```

An object has a type, a value, a lifetime, and storage. `int` represents integers, `double` approximates real numbers, and `bool` is true or false. `const` prevents modification through that name. Initialization gives an object its first value; prefer initializing immediately.

Common built-in type families include integral types (`bool`, `char`, `int` and their signed/unsigned variants), floating-point types (`float`, `double`, `long double`), and `void` for “no value.” Library types such as `std::string` represent richer concepts. Pick a type that matches the domain; do not use a floating-point type for an exact count or money amount.

```cpp
int attempts = 3;                  // count
double distance_km = 2.5;         // approximate measurement
bool is_complete = false;         // yes/no state
std::string learner = "Ada";      // owned text
```

`7 / 2` is integer division and yields `3`; `7.0 / 2` yields `3.5`. Converting a floating-point value to an integer discards the fractional part. Signed integer overflow is undefined behavior; unsigned arithmetic wraps modulo its range. Floating point cannot represent every decimal exactly.

**Trap:** `=` assigns; `==` compares. Do not assume a cast makes a value safe or representable.

**Practice:** Print the quotient and remainder of two integers. Then compute a decimal average without integer division.

### Bitwise operations and masks

Bitwise operators work on the individual bits of integer values. They are useful for compact flags and low-level formats, but they are not substitutes for ordinary Boolean logic.

```cpp
unsigned int flags = 0u;
constexpr unsigned int visible = 1u << 0;
constexpr unsigned int selected = 1u << 1;

flags |= visible;                         // turn on one flag
if ((flags & visible) != 0) {             // test one flag
    flags |= selected;
}
flags &= ~selected;                       // turn off one flag
```

Use unsigned operands and keep every shift count below the number of value bits in the left operand. For ordinary application state, separate `bool` members or an `enum class` may be clearer than bit masks.

**Mastery check:** Explain the difference between `&&` and `&`, then make a three-flag example that can independently set, test, and clear each flag.

## Lesson 4 — Input, output, and validation

**By the end, you can:** read user input, detect stream failure, validate both format and meaning, and report errors clearly.

```cpp
#include <iostream>
#include <string>

int main() {
    int quantity = 0;
    std::cout << "Quantity: ";
    if (!(std::cin >> quantity)) {
        std::cerr << "Enter a whole number.\n";
        return 1;
    }

    std::string name;
    std::cout << "Name: ";
    std::getline(std::cin >> std::ws, name);
    std::cout << name << " ordered " << quantity << '\n';
}
```

Stream extraction reports failure by changing the stream's state. Validate both the format and the domain: an integer can parse successfully but still be a negative quantity. `std::ws` consumes leading whitespace before `getline`, useful after formatted input.

```text
characters from user -> parse type -> validate allowed range -> use value
       "abc"              fails             not reached          stop/retry
       "-4"               succeeds          fails                stop/retry
       "4"                succeeds          succeeds             continue
```

Parsing answers “does this look like an integer?” Validation answers “is this integer allowed here?” Both checks matter.

For interactive recovery, clear a failed stream with `std::cin.clear()` and discard the bad line with `std::cin.ignore(...)`; then prompt again. Use `<limits>` and `std::numeric_limits<std::streamsize>::max()` for the ignore limit.

**Trap:** `operator>>` stops at whitespace; `getline` reads the rest of a line. Mixing them without handling the newline often appears to skip a prompt.

**Practice:** Ask for a positive menu choice, reject text and out-of-range numbers, and retry until valid.

## Lesson 5 — Decisions and Boolean logic

**By the end, you can:** turn requirements into readable conditions and test their boundaries.

```cpp
if (temperature < 0) {
    std::cout << "freezing\n";
} else if (temperature < 25) {
    std::cout << "mild\n";
} else {
    std::cout << "warm\n";
}

if (age >= 18 && has_id) {
    std::cout << "both conditions are true\n";
}
```

Conditions evaluate to `bool`. `&&` is true only when both sides are true; `||` is true when at least one is true; `!` negates. Short-circuiting means the right side is not evaluated when the left already determines the result. This can guard a later operation, such as `index < values.size() && values[index] == target`.

Use `if`/`else` for ranges or complex conditions, `switch` for a small set of exact integral or enum choices, and the conditional operator (`condition ? a : b`) only for a short value choice. For example, `const auto label = passed ? "pass" : "retry";`. The conditional operator can become hard to read when nested; use an `if` statement instead.

**Trap:** Boundary overlap and gaps create bugs. For ranges, test just below, exactly at, and just above each cutoff.

**Practice:** Classify a score as invalid, failing, passing, or excellent; write down the exact boundaries first.

## Lesson 6 — Iteration

**By the end, you can:** choose a loop form, show that it makes progress, and reason about when it stops.

```cpp
int total = 0;
int value = 0;
while (std::cin >> value && value != 0) {
    total += value;
}
std::cout << "Total: " << total << '\n';

for (int row = 1; row <= 3; ++row) {
    for (int column = 1; column <= row; ++column) {
        std::cout << '*';
    }
    std::cout << '\n';
}
```

A loop needs initialization, a condition, and progress toward termination. A `for` loop places these together; a `while` loop is useful when the number of repetitions depends on input. A range-based loop visits each element without manually tracking an index.

A loop invariant is a statement that remains true at each iteration and helps prove correctness. For a running sum, the invariant can say that `total` equals the sum of all values read so far.

Choose by how repetition is controlled:

- `for (int i = 0; i < count; ++i)` when a counter or known range controls repetition.
- `while (condition)` when the condition is checked before each iteration and the count is unknown.
- `do { ... } while (condition);` when the body must run at least once, such as a menu prompt.
- `for (const auto& item : items)` to visit every element without manual index management.

The `do` loop's main benefit is guaranteeing one execution; its main risk is that beginners may overlook the condition at the bottom. Keep loop progress visible and test the zero-iteration case.

**Trap:** `i <= size` is usually wrong for a collection indexed from zero; the last valid index is `size - 1`. Prefer range-based loops unless an index is needed.

**Practice:** Read scores until `-1`, then print count, total, and average. Handle the case where no scores were entered.

## Lesson 7 — Functions and decomposition

**By the end, you can:** split a problem into named functions and choose parameters and return values that make data flow clear.

```cpp
int largest(int first, int second) {
    return first < second ? second : first;
}

void add_bonus(int& score) {
    score += 5;
}

void print_name(const std::string& name) {
    std::cout << name << '\n';
}
```

Parameters describe inputs. A return value communicates a result. Passing by value makes a copy; a non-const reference allows modification; a `const` reference avoids copying while preventing modification through that parameter. For small built-in types, pass by value is usually simplest.

A function should have one clear responsibility. Keep local state local, use descriptive names, and specify preconditions when callers must meet them. Function declarations can appear before definitions when a program is split into files.

```text
caller values -> parameters -> function body -> return value -> caller continues
                  (inputs)                     (result)
```

For example, `largest(4, 9)` passes two values into the function and returns `9`. A `void` function has no return value; it communicates through an intended side effect such as printing or changing an object passed by reference.

- **By value:** `int twice(int value)` is ideal for small values or an independent copy.
- **By `const T&`:** `void print(const std::string& text)` reads a larger object without copying.
- **By `T&`:** `void reset(int& value)` promises to change an existing caller-owned object.
- **By `T*`:** `void inspect(const int* value)` can represent an optional object; check for `nullptr`.

Prefer the simplest form that expresses the contract. A pointer can represent “not provided” with `nullptr`; a reference cannot. A non-const reference signals mutation, so do not use it just to avoid writing a return value.

**Trap:** Returning a reference to a local variable creates a dangling reference. Return by value for local results.

**Practice:** Write `is_even`, `to_fahrenheit`, and `clamp_score`; test negative, boundary, and ordinary values.

## Lesson 8 — Strings and text

**By the end, you can:** process owned text safely and explain why UTF-8 bytes are not always the same as visible characters.

```cpp
#include <cctype>
#include <iostream>
#include <string>

int main() {
    std::string word = "C++";
    word += " basics";
    std::cout << word.size() << ": " << word << '\n';

    std::string line;
    std::getline(std::cin, line);
    for (unsigned char ch : line) {
        std::cout << static_cast<char>(std::toupper(ch));
    }
}
```

`std::string` owns a sequence of bytes and manages its memory. It supports concatenation, comparison, indexing, and iteration. The `std::toupper` family expects either `EOF` or a value representable as `unsigned char`; converting first avoids undefined behavior for negative `char` values.

UTF-8 encodes Unicode text using one to four bytes per code point. `string.size()` counts bytes, not necessarily visible characters. Correct user-visible character counting needs Unicode-aware library support.

For C++ text, common choices include a string literal (`"hello"`, whose type is an array of `const char`), `std::string` for owned, changeable bytes, and `std::string_view` for a non-owning read-only view (C++17). Use a view only while its source stays alive; a dangling view is unsafe. `std::wstring` is not a universal Unicode solution because its encoding and width depend on the platform.

**Trap:** A `char` is not always one complete human-perceived character. Do not use byte indexing to edit arbitrary UTF-8 text.

**Practice:** Read a full line, count ASCII letters and spaces, and explain what your program does with non-ASCII input.

## Lesson 9 — Arrays and dynamic sequences

**By the end, you can:** choose a fixed or growing sequence, check access, and avoid using invalidated vector references.

```cpp
#include <array>
#include <iostream>
#include <vector>

int main() {
    std::array<int, 3> fixed{4, 5, 6};
    std::vector<int> growing{10, 20};
    growing.push_back(30);

    for (int value : fixed) std::cout << value << ' ';
    for (std::size_t i = 0; i < growing.size(); ++i) {
        std::cout << growing.at(i) << ' ';
    }
}
```

`std::array<T, N>` has a fixed size known at compile time. `std::vector<T>` stores a contiguous dynamic sequence and grows with `push_back`. `at()` checks bounds and throws `std::out_of_range`; `operator[]` does not check. `size()` counts elements, while `capacity()` describes reserved storage.

When a vector reallocates, pointers, references, and iterators into it may become invalid. Do not keep one across an operation that may grow the vector.

Choose a sequence by its size and behavior:

- `std::array<T, N>`: fixed number of elements, inline storage, no resizing.
- `std::vector<T>`: resizable, contiguous elements, fast indexing; growth may relocate elements.
- Built-in `T[N]`: fixed-size low-level array; it does not carry its length when passed to a function.

```text
array<int, 3>  [4][5][6]        fixed slots
vector<int>    [10][20][30]     contiguous now; may move when it grows
```

```text
vector size = 3, capacity = 4
index:       0   1   2   unused
storage:    [10][20][30][    ]
```

Size counts constructed elements; capacity is allocated room before another growth may require reallocation. Reserved capacity is not permission to access an index at or beyond `size()`.

For most variable-length sequences choose `vector`; use `array` when the size is part of the type and fixed by design.

An array is a sequence; a `struct` groups named fields that describe one record:

```cpp
#include <string>
#include <vector>

struct Score {
    std::string student;
    int points;
};

std::vector<Score> scores{{"Ada", 98}, {"Linus", 91}};
```

**Mastery check:** Explain which type you would choose for 100 scores, a fixed RGB triple, and one student's name-plus-score record. State who owns the elements and whether the size can change.

**Trap:** An empty vector has no first element; calling `front()` on it is invalid.

**Practice:** Store five scores, calculate their average, then add a sixth and repeat without hard-coding the size.

## Lesson 10 — Algorithms and problem solving

**By the end, you can:** turn a specification into a small algorithm, test edge cases, and estimate how work grows with input size.

```cpp
int find_index(const std::vector<int>& values, int target) {
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (values[i] == target) return static_cast<int>(i);
    }
    return -1;
}
```

This linear search checks items in order. If there are `n` items, its worst-case number of comparisons grows proportionally to `n`, written `O(n)`. Before coding, state the input, output, constraints, and behavior when the target is absent. Trace a small example by hand.

The common search choices have different preconditions:

- Linear search works on unsorted data and is simple: worst case `O(n)`.
- Binary search needs sorted data and takes `O(log n)` comparisons, but sorting first also has a cost.
- Hash lookup is often average `O(1)` when you already need a key-to-value table, but uses extra memory and has collision-dependent worst cases.

For a tiny collection, linear search is often the clearest and fastest overall. Prefer the standard algorithms or containers so their preconditions are explicit.

Turn a solution into smaller steps: validate input, compute, format output. Keep a simple reference implementation when optimizing so results can be compared.

**Trap:** Do not optimize before correctness is tested. For large containers, prefer standard algorithms such as `std::find` where appropriate.

**Practice:** Find the first repeated value in a vector. Write test cases for empty, one-element, no-repeat, and repeated inputs.

## Lesson 11 — Debugging and testing basics

**By the end, you can:** reproduce a failure, use a debugger or test to isolate it, and add a regression check.

```cpp
#include <cassert>

int square(int value) {
    return value * value;
}

int main() {
    assert(square(0) == 0);
    assert(square(3) == 9);
}
```

A test compares actual behavior with an expected result. A debugger lets you stop at a breakpoint, step line by line, inspect variables, and examine the call stack. Reproduce the issue with the smallest input, then form a hypothesis and test it.

`assert` is useful for programmer assumptions during development, but may be disabled in release builds. It is not input validation. For user input, return a clear error or recover.

Tests have complementary roles: a unit test checks one function, an integration test checks cooperating pieces, and a regression test preserves a fix for a previously observed bug. A boundary test focuses on edges such as an empty collection or maximum value. A test does not prove all inputs are correct, so combine targeted tests with review and tools.

**Trap:** If a crash disappears in a different build, the bug may still exist; undefined behavior is not reliably reproducible.

**Practice:** Introduce an off-by-one error in a small loop, find it with a debugger, fix it, and add a test for the last element.

## Lesson 12 — First integrated project

**By the end, you can:** combine input, decisions, functions, and a collection into a small tested console application.

Build a grade tracker with a menu:

```text
1) Add score
2) List scores
3) Show average
4) Quit
```

Build it in small vertical steps:

```text
read one choice -> validate -> perform one action -> show result
       ^                                      |
       +----------- repeat until quit --------+
```

First get one score in and out of a vector; then add validation, average calculation, and the menu. This makes failures easier to locate than writing the whole program before the first run.

Plan separate functions such as `read_menu_choice`, `add_score`, `print_scores`, and `calculate_average`. Store scores in `std::vector<int>`. Define the valid score range and what the average of an empty list means before writing the code.

Test valid input, invalid text, out-of-range scores, an empty list, and repeated menu use. Keep the menu loop in `main` or a dedicated controller function; do not put all logic into one enormous function.

**Practice extension:** Persist scores in a text file, but first complete the in-memory version and test it.
# Phase 1 — Programming Foundations

## Lesson 1 — What C++ is, computers, and development tools

**By the end, you can:** explain what C++ is, distinguish it from C, and describe how source code becomes a running program.

**Core idea:** C++ is a language for describing computations and data. A compiler translates a C++ program into a form a computer can execute; a terminal lets you run that compiler and inspect the files and results.

### Programming and the C++ language

A **program** is a precise set of instructions that transforms input into output or changes some state. A **programming language** gives people rules for writing those instructions. C++ is standardized by ISO and implemented by compilers such as GCC, Clang, and Microsoft Visual C++; the compiler is not the language itself.

C++ is **statically typed**, so the compiler checks many type mistakes before the program runs. It is also multi-paradigm: you can write step-by-step procedures, group behavior and data in classes, or write generic algorithms that work with many types. The standard library provides reusable tools such as `std::string`, `std::vector`, algorithms, file streams, and threads.

C++ grew out of work related to C, but they are separate languages with different rules and libraries. C++ adds abstractions such as classes, templates, references, and a much larger standard library; code valid in C is not automatically valid C++. This course teaches C++, not a combined C/C++ dialect.

### From source code to a running program

For a typical native program, the toolchain processes source in stages:

1. The **preprocessor** handles directives such as `#include`.
2. The **compiler** checks and translates each source file.
3. The **assembler** produces object files containing machine-level code.
4. The **linker** combines object files and libraries into an executable.
5. The **operating system** starts the program and reports its exit code.

Tools may combine stages, but the distinctions help identify errors: a compiler diagnostic points to a source-language problem, a linker diagnostic points to unresolved or duplicate definitions, and a runtime failure happens after launch.

When a native program runs, the operating system loads it, gives it access to resources, and schedules its instructions on the CPU. Working data lives in memory while the program runs. You do not need to understand processor design yet; the important idea is that the CPU executes the compiled program, not the C++ source text directly.

### Why learn C++?

C++ is used where performance, predictable resource use, broad platform support, or hardware access matters: games and graphics, embedded devices, scientific computing, browsers, and system software. The same control can make programs complex: the language has many features, and programmers must reason carefully about types, object lifetime, and ownership. Modern C++ libraries and RAII reduce many manual-memory hazards, but do not remove the need to understand them.

Choosing C++ does not automatically make a program fast. Performance depends on the algorithm, data structures, implementation, compiler settings, and workload; measure before claiming an optimization.

Your editor helps write code; an IDE may combine editing, building, and debugging; the compiler translates code; and the terminal runs commands. Learning what each tool does makes it easier to follow a course tutorial or diagnose a failed build.

```powershell
Get-Location
Get-ChildItem
g++ --version
```

`Get-Location` shows the current working directory, `Get-ChildItem` lists its files, and `g++ --version` checks whether one compiler is available. If the last command is not recognized, install a C++ compiler before trying to build a program. Version control appears later in the course. An editor, compiler, and debugger are different tools even when an IDE presents them together.

**Trap:** A command that works in one folder may fail in another because its relative paths use the current directory.

**Practice:** In your own words, explain what C++ is and how it differs from C. Then create a practice folder, write down its full path, and use `Get-Location` and `Get-ChildItem` to inspect it.

**Self-check:** Point to which part is the language, compiler, standard library, source file, executable, and operating system in one program run.

For optional books matched to your experience level, see the roadmap's [recommended publisher reading map](../COLLEGE_ROADMAP.md#recommended-publisher-reading-map).

## Lesson 2 — First C++ program and translation

**By the end, you can:** write, compile, and run a small program and distinguish source, compiler, linker, and runtime errors.

```cpp
#include <iostream>

int main() {
    std::cout << "First line\n";
    std::cerr << "Diagnostics go here\n";
    return 0;
}
```

The preprocessor handles directives such as `#include`; the compiler translates each translation unit; the linker combines object code and libraries. `main` is the program entry point. `std::cout` is ordinary output, `std::cerr` is diagnostic output, and a zero exit code conventionally means success.

Compile using `g++ -std=c++20 -Wall -Wextra -Wpedantic file.cpp -o app.exe`, then run `.\app.exe`. Compile errors concern source translation; linker errors commonly mean a definition or library is missing; runtime errors happen after launch.

**Trap:** A file named `.cpp` is not itself an executable, and an editor extension does not replace a compiler.

**Practice:** Intentionally remove a semicolon, compile, read the first diagnostic, restore it, then print two lines.

## Lesson 3 — Types, objects, and expressions

**By the end, you can:** choose and initialize basic types, predict common conversions, and explain why undefined behavior is not a reliable result.

```cpp
#include <iostream>

int main() {
    int completed = 7;
    double hours = 2.5;
    bool passed = completed >= 5;
    const double average_per_hour = completed / hours;
    std::cout << passed << " " << average_per_hour << '\n';
}
```

An object has a type, a value, a lifetime, and storage. `int` represents integers, `double` approximates real numbers, and `bool` is true or false. `const` prevents modification through that name. Initialization gives an object its first value; prefer initializing immediately.

`7 / 2` is integer division and yields `3`; `7.0 / 2` yields `3.5`. Converting a floating-point value to an integer discards the fractional part. Signed integer overflow is undefined behavior; unsigned arithmetic wraps modulo its range. Floating point cannot represent every decimal exactly.

**Trap:** `=` assigns; `==` compares. Do not assume a cast makes a value safe or representable.

**Practice:** Print the quotient and remainder of two integers. Then compute a decimal average without integer division.

### Bitwise operations and masks

Bitwise operators work on the individual bits of integer values. They are useful for compact flags and low-level formats, but they are not substitutes for ordinary Boolean logic.

```cpp
unsigned int flags = 0u;
constexpr unsigned int visible = 1u << 0;
constexpr unsigned int selected = 1u << 1;

flags |= visible;                         // turn on one flag
if ((flags & visible) != 0) {             // test one flag
    flags |= selected;
}
flags &= ~selected;                       // turn off one flag
```

Use unsigned operands and keep every shift count below the number of value bits in the left operand. For ordinary application state, separate `bool` members or an `enum class` may be clearer than bit masks.

**Mastery check:** Explain the difference between `&&` and `&`, then make a three-flag example that can independently set, test, and clear each flag.

## Lesson 4 — Input, output, and validation

**By the end, you can:** read user input, detect stream failure, validate both format and meaning, and report errors clearly.

```cpp
#include <iostream>
#include <string>

int main() {
    int quantity = 0;
    std::cout << "Quantity: ";
    if (!(std::cin >> quantity)) {
        std::cerr << "Enter a whole number.\n";
        return 1;
    }

    std::string name;
    std::cout << "Name: ";
    std::getline(std::cin >> std::ws, name);
    std::cout << name << " ordered " << quantity << '\n';
}
```

Stream extraction reports failure by changing the stream's state. Validate both the format and the domain: an integer can parse successfully but still be a negative quantity. `std::ws` consumes leading whitespace before `getline`, useful after formatted input.

For interactive recovery, clear a failed stream with `std::cin.clear()` and discard the bad line with `std::cin.ignore(...)`; then prompt again. Use `<limits>` and `std::numeric_limits<std::streamsize>::max()` for the ignore limit.

**Trap:** `operator>>` stops at whitespace; `getline` reads the rest of a line. Mixing them without handling the newline often appears to skip a prompt.

**Practice:** Ask for a positive menu choice, reject text and out-of-range numbers, and retry until valid.

## Lesson 5 — Decisions and Boolean logic

**By the end, you can:** turn requirements into readable conditions and test their boundaries.

```cpp
if (temperature < 0) {
    std::cout << "freezing\n";
} else if (temperature < 25) {
    std::cout << "mild\n";
} else {
    std::cout << "warm\n";
}

if (age >= 18 && has_id) {
    std::cout << "both conditions are true\n";
}
```

Conditions evaluate to `bool`. `&&` is true only when both sides are true; `||` is true when at least one is true; `!` negates. Short-circuiting means the right side is not evaluated when the left already determines the result. This can guard a later operation, such as `index < values.size() && values[index] == target`.

Use `switch` for a small set of exact integral or enum values. Use ranges with `if`/`else` for intervals. Write conditions so their intent is easy to review.

**Trap:** Boundary overlap and gaps create bugs. For ranges, test just below, exactly at, and just above each cutoff.

**Practice:** Classify a score as invalid, failing, passing, or excellent; write down the exact boundaries first.

## Lesson 6 — Iteration

**By the end, you can:** choose a loop form, show that it makes progress, and reason about when it stops.

```cpp
int total = 0;
int value = 0;
while (std::cin >> value && value != 0) {
    total += value;
}
std::cout << "Total: " << total << '\n';

for (int row = 1; row <= 3; ++row) {
    for (int column = 1; column <= row; ++column) {
        std::cout << '*';
    }
    std::cout << '\n';
}
```

A loop needs initialization, a condition, and progress toward termination. A `for` loop places these together; a `while` loop is useful when the number of repetitions depends on input. A range-based loop visits each element without manually tracking an index.

A loop invariant is a statement that remains true at each iteration and helps prove correctness. For a running sum, the invariant can say that `total` equals the sum of all values read so far.

**Trap:** `i <= size` is usually wrong for a collection indexed from zero; the last valid index is `size - 1`. Prefer range-based loops unless an index is needed.

**Practice:** Read scores until `-1`, then print count, total, and average. Handle the case where no scores were entered.

## Lesson 7 — Functions and decomposition

**By the end, you can:** split a problem into named functions and choose parameters and return values that make data flow clear.

```cpp
int largest(int first, int second) {
    return first < second ? second : first;
}

void add_bonus(int& score) {
    score += 5;
}

void print_name(const std::string& name) {
    std::cout << name << '\n';
}
```

Parameters describe inputs. A return value communicates a result. Passing by value makes a copy; a non-const reference allows modification; a `const` reference avoids copying while preventing modification through that parameter. For small built-in types, pass by value is usually simplest.

A function should have one clear responsibility. Keep local state local, use descriptive names, and specify preconditions when callers must meet them. Function declarations can appear before definitions when a program is split into files.

**Trap:** Returning a reference to a local variable creates a dangling reference. Return by value for local results.

**Practice:** Write `is_even`, `to_fahrenheit`, and `clamp_score`; test negative, boundary, and ordinary values.

## Lesson 8 — Strings and text

**By the end, you can:** process owned text safely and explain why UTF-8 bytes are not always the same as visible characters.

```cpp
#include <cctype>
#include <iostream>
#include <string>

int main() {
    std::string word = "C++";
    word += " basics";
    std::cout << word.size() << ": " << word << '\n';

    std::string line;
    std::getline(std::cin, line);
    for (unsigned char ch : line) {
        std::cout << static_cast<char>(std::toupper(ch));
    }
}
```

`std::string` owns a sequence of bytes and manages its memory. It supports concatenation, comparison, indexing, and iteration. The `std::toupper` family expects either `EOF` or a value representable as `unsigned char`; converting first avoids undefined behavior for negative `char` values.

UTF-8 encodes Unicode text using one to four bytes per code point. `string.size()` counts bytes, not necessarily visible characters. Correct user-visible character counting needs Unicode-aware library support.

**Trap:** A `char` is not always one complete human-perceived character. Do not use byte indexing to edit arbitrary UTF-8 text.

**Practice:** Read a full line, count ASCII letters and spaces, and explain what your program does with non-ASCII input.

## Lesson 9 — Arrays and dynamic sequences

**By the end, you can:** choose a fixed or growing sequence, check access, and avoid using invalidated vector references.

```cpp
#include <array>
#include <iostream>
#include <vector>

int main() {
    std::array<int, 3> fixed{4, 5, 6};
    std::vector<int> growing{10, 20};
    growing.push_back(30);

    for (int value : fixed) std::cout << value << ' ';
    for (std::size_t i = 0; i < growing.size(); ++i) {
        std::cout << growing.at(i) << ' ';
    }
}
```

`std::array<T, N>` has a fixed size known at compile time. `std::vector<T>` stores a contiguous dynamic sequence and grows with `push_back`. `at()` checks bounds and throws `std::out_of_range`; `operator[]` does not check. `size()` counts elements, while `capacity()` describes reserved storage.

When a vector reallocates, pointers, references, and iterators into it may become invalid. Do not keep one across an operation that may grow the vector.

An array is a sequence; a `struct` groups named fields that describe one record:

```cpp
#include <string>
#include <vector>

struct Score {
    std::string student;
    int points;
};

std::vector<Score> scores{{"Ada", 98}, {"Linus", 91}};
```

**Mastery check:** Explain which type you would choose for 100 scores, a fixed RGB triple, and one student's name-plus-score record. State who owns the elements and whether the size can change.

**Trap:** An empty vector has no first element; calling `front()` on it is invalid.

**Practice:** Store five scores, calculate their average, then add a sixth and repeat without hard-coding the size.

## Lesson 10 — Algorithms and problem solving

**By the end, you can:** turn a specification into a small algorithm, test edge cases, and estimate how work grows with input size.

```cpp
int find_index(const std::vector<int>& values, int target) {
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (values[i] == target) return static_cast<int>(i);
    }
    return -1;
}
```

This linear search checks items in order. If there are `n` items, its worst-case number of comparisons grows proportionally to `n`, written `O(n)`. Before coding, state the input, output, constraints, and behavior when the target is absent. Trace a small example by hand.

Turn a solution into smaller steps: validate input, compute, format output. Keep a simple reference implementation when optimizing so results can be compared.

**Trap:** Do not optimize before correctness is tested. For large containers, prefer standard algorithms such as `std::find` where appropriate.

**Practice:** Find the first repeated value in a vector. Write test cases for empty, one-element, no-repeat, and repeated inputs.

## Lesson 11 — Debugging and testing basics

**By the end, you can:** reproduce a failure, use a debugger or test to isolate it, and add a regression check.

```cpp
#include <cassert>

int square(int value) {
    return value * value;
}

int main() {
    assert(square(0) == 0);
    assert(square(3) == 9);
}
```

A test compares actual behavior with an expected result. A debugger lets you stop at a breakpoint, step line by line, inspect variables, and examine the call stack. Reproduce the issue with the smallest input, then form a hypothesis and test it.

`assert` is useful for programmer assumptions during development, but may be disabled in release builds. It is not input validation. For user input, return a clear error or recover.

**Trap:** If a crash disappears in a different build, the bug may still exist; undefined behavior is not reliably reproducible.

**Practice:** Introduce an off-by-one error in a small loop, find it with a debugger, fix it, and add a test for the last element.

## Lesson 12 — First integrated project

**By the end, you can:** combine input, decisions, functions, and a collection into a small tested console application.

Build a grade tracker with a menu:

```text
1) Add score
2) List scores
3) Show average
4) Quit
```

Plan separate functions such as `read_menu_choice`, `add_score`, `print_scores`, and `calculate_average`. Store scores in `std::vector<int>`. Define the valid score range and what the average of an empty list means before writing the code.

Test valid input, invalid text, out-of-range scores, an empty list, and repeated menu use. Keep the menu loop in `main` or a dedicated controller function; do not put all logic into one enormous function.

**Practice extension:** Persist scores in a text file, but first complete the in-memory version and test it.
