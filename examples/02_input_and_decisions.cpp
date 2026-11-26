#include <iostream>

int main() {
    int age = 0;
    std::cout << "How old are you? ";

    if (!(std::cin >> age)) {
        std::cerr << "Please enter a whole number.\n";
        return 1;
    }

    if (age < 0) {
        std::cout << "Age cannot be negative.\n";
    } else if (age >= 18) {
        std::cout << "You are an adult.\n";
    } else {
        std::cout << "You are under 18.\n";
    }
}
