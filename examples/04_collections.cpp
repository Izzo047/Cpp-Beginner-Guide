#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores{80, 95, 72};
    scores.push_back(88);

    int total = 0;
    int highest = scores.front();

    for (int score : scores) {
        total += score;
        if (score > highest) {
            highest = score;
        }
    }

    const double average =
        static_cast<double>(total) / static_cast<double>(scores.size());
    std::cout << "Number of scores: " << scores.size() << '\n';
    std::cout << "Highest score: " << highest << '\n';
    std::cout << "Average score: " << average << '\n';
}
