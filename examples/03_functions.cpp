#include <iostream>

int add(int first, int second) {
    return first + second;
}

double celsius_to_fahrenheit(double celsius) {
    return celsius * 9.0 / 5.0 + 32.0;
}

int main() {
    std::cout << "3 + 4 = " << add(3, 4) << '\n';
    std::cout << "20 C = " << celsius_to_fahrenheit(20.0) << " F\n";
}
