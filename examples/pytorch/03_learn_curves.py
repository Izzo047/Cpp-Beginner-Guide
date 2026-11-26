"""Lesson 7: Using hidden layers + ReLU to learn a non-linear curve (y = x^2)."""

import torch
import torch.nn as nn


def main() -> None:
    torch.manual_seed(7)

    # 41 evenly spaced points from -2.0 to 2.0
    x = torch.linspace(-2.0, 2.0, 41).unsqueeze(1)
    y = x ** 2

    # Hidden layer with ReLU bends straight lines into a parabola
    model = nn.Sequential(
        nn.Linear(1, 32),
        nn.ReLU(),
        nn.Linear(32, 32),
        nn.ReLU(),
        nn.Linear(32, 1),
    )

    loss_fn = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.02)

    for epoch in range(600):
        y_hat = model(x)
        loss = loss_fn(y_hat, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 150 == 0:
            print(f"Epoch {epoch + 1:3d} | MSE loss = {loss.item():.5f}")

    test_points = torch.tensor([[-1.5], [0.0], [1.25], [1.8]])
    with torch.no_grad():
        preds = model(test_points)

    print("\nCurve predictions vs true x^2:")
    for pt, pred in zip(test_points.squeeze(1).tolist(), preds.squeeze(1).tolist()):
        print(f"  x={pt:5.2f} -> predicted={pred:6.3f} (true={pt ** 2:6.3f})")


if __name__ == "__main__":
    main()
