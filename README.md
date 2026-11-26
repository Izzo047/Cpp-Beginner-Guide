# Learn C++: A Beginner's Guide

This folder is a practical path from your first C++ program to small, complete projects. Work through the lessons in order, type the examples yourself, and change them to see what happens. You do not need prior programming experience.

## Before you start: what C++ is

C++ is a standardized programming language used to describe computations and data. A compiler translates your source code into a program your operating system can run. The C++ standard library supplies common tools such as strings, vectors, algorithms, file handling, and threads. C++ is related to C, but it is a separate language; this course teaches C++.

C++ supports several styles, including procedural, object-oriented, and generic programming. It is used in games, graphics, embedded devices, scientific software, and system software where performance and control matter. Those strengths come with a learning curve, so this course begins with small programs and explains types, errors, and object lifetimes before moving to advanced topics.

For a complete college-level sequence, source-by-source coverage review, and topic crosswalk, follow the [College-Level C++ Roadmap](COLLEGE_ROADMAP.md).

## Interactive learning site

Open the course as a searchable, progress-tracking webpage: from this folder, run `python -m http.server 8000`, then visit `http://localhost:8000` in your browser. Keep the terminal open while using the site. The page loads the lesson Markdown files locally, so do not open `index.html` directly from disk. No packages or internet connection are required. Progress, bookmarks, and study notes are saved only in the browser on this device.

## Android app

The Android app packages the course for offline reading. From this folder, open a terminal and run:

```powershell
Set-Location .\android
.\gradlew.bat :app:assembleDebug
```

The debug APK is written to `android\app\build\outputs\apk\debug\app-debug.apk`. Android Studio can also open the `android` folder and build the app. A release APK is built and signed by GitHub Actions when a `v*` tag is pushed; the source course files are copied into the APK during each build.

The debug APK is for testing, not public distribution. It uses Android's development signing key; published releases use the private upload key you configure below. The GitHub workflow explicitly accepts the Android SDK package licenses through Android's SDK setup action so it can install the build tools.

Before publishing an Android release, create a private upload key and keep its keystore file backed up somewhere secure and outside this repository:

```powershell
keytool -genkeypair -v -keystore "$HOME\fieldnotes-release-key.jks" -alias fieldnotes -keyalg RSA -keysize 3072 -validity 10000
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\fieldnotes-release-key.jks")) | Set-Clipboard
```

In the GitHub repository, add these Actions secrets under **Settings → Secrets and variables → Actions**: `ANDROID_KEYSTORE_BASE64` (the copied output), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`fieldnotes`), and `ANDROID_KEY_PASSWORD`. Never commit the keystore or put its passwords in workflow files. Losing the private key prevents signing updates that Android accepts over an existing installation.

## GitHub repository and downloads

The public source repository is [`Izzo047/Cpp-Beginner-Guide`](https://github.com/Izzo047/Cpp-Beginner-Guide). Push a version tag such as `v1.0.0` to trigger the release workflow. Releases publish a Windows ZIP with `Fieldnotes.exe` and its course files. A signed Android APK is also published when all four signing secrets above are configured; otherwise, the Android release is explicitly skipped and the Windows release still completes.

The Windows app needs Microsoft Edge and .NET Framework 4.x. The executable serves the course folder locally, so lesson edits appear after refreshing the app; the Android APK is a snapshot and must be rebuilt to include course updates.

## Mobile security

The Android app does not request Internet or file-storage permissions. Its WebView loads bundled course assets through `WebViewAssetLoader`, blocks network and file access, and opens tapped HTTPS references in the device browser. App data is excluded from Android backup. See [SECURITY.md](SECURITY.md) for the controls and their limitations; no app can be guaranteed unhackable.

## Desktop app

Double-click `Fieldnotes.exe` in this folder or use the **Fieldnotes - C++ Learning Studio** shortcut on your desktop. Keep `Fieldnotes.exe` in this folder: the app serves `index.html`, styles, scripts, lessons, and examples directly from beside the executable, so folder edits appear the next time you open or refresh the app. You do not need to rebuild the executable when changing lesson content or the webpage.

The app opens in a Microsoft Edge app window and runs a small local-only web server while open. To rebuild the launcher after changing `desktop-app\FieldnotesLauncher.cs`, run `powershell -ExecutionPolicy Bypass -File .\build-app.ps1` from this folder. Progress, bookmarks, and notes are stored in the app's local browser profile on this device.

## What you will learn

By the end of the full path, you should be able to explain how C++ programs are built, write tested multi-file applications, choose data structures and algorithms, manage resources safely, and describe the systems concepts that affect your program.

## 1. Set up a C++ compiler

A compiler translates C++ source code into a program your computer can run. On Windows, choose one of these:

- **Visual Studio:** Install Visual Studio Community and select the **Desktop development with C++** workload. Create a Console App project and run it with the Run button.
- **Visual Studio Code:** Install a C++ compiler (for example, MinGW-w64), then install Microsoft's **C/C++** extension. The extension helps edit and debug code; the compiler does the actual compiling.

To check whether a compiler is available, open a terminal and try `g++ --version` or `clang++ --version`. For Microsoft's compiler, open a **Developer Command Prompt for Visual Studio** and run `cl`.

If you use `g++`, open the terminal in this folder and compile an example like this:

```powershell
g++ -std=c++20 -Wall -Wextra -Wpedantic examples/01_hello_world.cpp -o hello.exe
.\hello.exe
```

For Microsoft's compiler, run these commands from a Developer Command Prompt:

```text
cl /std:c++20 /EHsc /W4 examples\01_hello_world.cpp
01_hello_world.exe
```

If a command is not recognized, the compiler is not installed or its command prompt is not configured. Fix that before moving on.

## 2. A good way to study

For each lesson:

1. Read the goal and the explanation.
2. Type the example instead of only copying it.
3. Compile and run it.
4. Change one thing and predict what will happen before running it again.
5. Complete the practice task without looking at a solution.
6. If it fails, read the first compiler error and fix that one first.

Keep your practice programs in a separate `practice` folder so you can experiment without changing the examples.

## 3. Lesson path

### Lesson 1 — Your first program

**Goal:** Understand the smallest useful C++ program.

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, C++!\n";
    return 0;
}
```

- `#include <iostream>` makes standard input/output tools available.
- `int main()` is where the program starts.
- `std::cout` prints text; `\n` starts a new line.
- Braces `{}` mark a block. Most statements end with `;`.
- `return 0;` means the program finished successfully.

**Try it:** Change the message, print your name on a second line, and add a comment with `//`.

Runnable file: [`examples/01_hello_world.cpp`](examples/01_hello_world.cpp).

### Lesson 2 — Values, variables, and operators

A variable is a named place to store a value. C++ is statically typed: each variable has a type.

```cpp
int score = 0;                    // whole number
double temperature = 18.5;        // decimal number
bool is_ready = true;             // true or false
char grade = 'A';                 // one character
std::string city = "Toronto";     // text
const int days_in_week = 7;       // cannot be reassigned
```

Include `<string>` when using `std::string`. Use double quotes for text and single quotes for one `char`.

Common arithmetic operators are `+`, `-`, `*`, `/`, and `%` (remainder). For integers, `7 / 2` is `3`; use `7.0 / 2.0` to get `3.5`. Comparisons include `==`, `!=`, `<`, `>`, `<=`, and `>=`. Use `=` to assign and `==` to compare.

**Try it:** Store two numbers, print their sum and product, then calculate their average as a `double`.

### Lesson 3 — Input and decisions

Use `std::cin` to read simple values. Use `if`, `else if`, and `else` to choose what happens.

```cpp
#include <iostream>

int main() {
    int age = 0;
    std::cout << "How old are you? ";

    if (!(std::cin >> age)) {
        std::cout << "Please enter a whole number.\n";
        return 1;
    }

    if (age >= 18) {
        std::cout << "You are an adult.\n";
    } else {
        std::cout << "You are under 18.\n";
    }
}
```

The `!` means “not”; `&&` means “and”; `||` means “or”. A `switch` is useful when comparing one value with several exact options.

**Try it:** Ask for a temperature and print whether it is below freezing, comfortable, or hot. Decide and document the ranges you use.

Runnable file: [`examples/02_input_and_decisions.cpp`](examples/02_input_and_decisions.cpp).

### Lesson 4 — Repeating work with loops

Use a `for` loop when you know how many repetitions you need. Use a `while` loop when you repeat until a condition changes.

```cpp
for (int number = 1; number <= 5; ++number) {
    std::cout << number << '\n';
}

int countdown = 3;
while (countdown > 0) {
    std::cout << countdown << '\n';
    --countdown;
}
```

`++number` increases a value by one; `--countdown` decreases it by one. Make sure a loop's condition will eventually become false, or it may never stop.

**Try it:** Print the multiplication table for a number from 1 to 10. Then ask for numbers until the user enters `0`, and print their total.

### Lesson 5 — Functions

A function gives a reusable name to a task. Give it a return type, a name, and parameters.

```cpp
int add(int first, int second) {
    return first + second;
}

int main() {
    std::cout << add(3, 4) << '\n';
}
```

`int` before `add` is its return type. The values in parentheses are parameters. Use `void` if the function does not return a value. A variable declared inside a function is local to that function.

**Try it:** Write functions that convert Celsius to Fahrenheit and return the larger of two integers. Test each with at least three inputs.

Runnable file: [`examples/03_functions.cpp`](examples/03_functions.cpp).

### Lesson 6 — Text and collections

Use `std::string` for text, `std::array` for a fixed-size collection, and `std::vector` for a collection that can grow.

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores{80, 95, 72};
    scores.push_back(88);

    for (int score : scores) {
        std::cout << score << '\n';
    }
}
```

Include `<vector>` to use `std::vector`. Collection positions (indexes) start at `0`, so the first item is at index `0`. Check a collection's size before indexing into it.

**Try it:** Read five scores into a vector, find the highest score and calculate the average. Test with different scores.

Runnable file: [`examples/04_collections.cpp`](examples/04_collections.cpp).

### Lesson 7 — References and pointers

A reference is another name for an existing variable. Pass by reference when a function should change the caller's value or avoid copying a large object.

```cpp
void add_bonus(int& score) {
    score += 10;
}
```

A pointer stores an address. It can be empty (`nullptr`), so check it before using `*pointer` to access its value. Pointers are useful, but they require care. Prefer standard-library types such as `std::string` and `std::vector` for owning data; do not use `new` and `delete` in beginner exercises.

**Try it:** Write one function that doubles an integer using a reference. Call it and print the value before and after.

### Lesson 8 — Classes and objects

A class groups data and functions that work together. An object is a value created from a class.

```cpp
#include <iostream>
#include <string>

class Greeter {
public:
    explicit Greeter(std::string name) : name_(name) {}

    void say_hello() const {
        std::cout << "Hello, " << name_ << "!\n";
    }

private:
    std::string name_;
};

int main() {
    Greeter greeter("Alex");
    greeter.say_hello();
}
```

`public` members can be used by other code. `private` members are kept inside the class. The constructor (`Greeter(...)`) sets up an object. The `const` after `say_hello()` says that this function does not change the object.

**Try it:** Create a `Book` class with a title and page count. Add a function that prints a short description.

Runnable file: [`examples/05_classes.cpp`](examples/05_classes.cpp).

### Lesson 9 — Files and error handling

Use `<fstream>` to read or write files. Always check whether opening a file succeeded.

```cpp
#include <fstream>
#include <iostream>

int main() {
    std::ofstream output("notes.txt");
    if (!output) {
        std::cerr << "Could not open notes.txt for writing.\n";
        return 1;
    }
    output << "Practice a little every day.\n";
}
```

`std::cerr` is for error messages. C++ also has exceptions, but first learn to check return values and stream state. If reading user input fails, report it and recover or stop clearly.

**Try it:** Write three to-do items to a file, then make a second program that reads and prints the file.

## 4. Practice projects

Build these in order. Start small, test each feature, then add the next one.

1. **Number quiz:** Generate or choose a secret number, ask the player to guess, and give “too high” or “too low” hints. Limit the number of tries.
2. **Calculator:** Ask for two numbers and an operator. Handle division by zero and invalid input.
3. **Grade tracker:** Store several grades in a vector and show the count, highest, lowest, and average.
4. **To-do list:** Add, list, and remove tasks. Then save and reload tasks using a file.
5. **Book catalog:** Create a `Book` class and store several books in a vector. Let the user search by title.

For each project, write down the expected inputs and outputs first. Test normal input, boundary values (such as `0` or an empty list), and invalid input.

## 5. Common beginner errors

- **Missing `;`:** Most declarations and statements need a semicolon.
- **Mismatched braces or parentheses:** Check that every `{` has a `}` and every `(` has a `)`.
- **Using `=` instead of `==`:** Assignment changes a value; equality compares two values.
- **Integer division:** `5 / 2` gives `2`; use a floating-point operand for a decimal result.
- **Uninitialized variables:** Give variables a starting value, such as `int count = 0;`.
- **Index out of range:** A vector of size 3 has indexes `0`, `1`, and `2`.
- **Infinite loops:** Check that the loop changes something used in its condition.
- **Confusing compiler errors:** Start with the first error; later errors may be consequences of it.

Compile with warnings enabled (`-Wall -Wextra -Wpedantic` for `g++`). Warnings are useful clues even when a program compiles.

## 6. Self-check

Before moving on, make sure you can do these without copying an example:

- Explain what `main`, `#include`, `std::cout`, and `std::cin` do.
- Choose an appropriate type and initialize a variable.
- Use an `if` statement and a loop.
- Write and call a function with parameters and a return value.
- Store multiple values in a vector and visit each value.
- Describe the difference between a class and an object.
- Compile, run, and fix a simple program with a compiler error.

Keep practicing by making small programs. Read compiler messages carefully, test your assumptions, and add one feature at a time.
