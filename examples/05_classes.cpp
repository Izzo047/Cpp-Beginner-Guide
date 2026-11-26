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
