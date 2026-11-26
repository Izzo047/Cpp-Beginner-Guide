"""Lesson 5: Teaching a neural network to learn y = x + 1 from examples."""

import torch
import torch.nn as nn


def main() -> None:
    torch.manual_seed(42)

    # x = input, y = true output (hidden rule: y = x + 1)
    x = torch.tensor([[1.0], [2.0], [3.0], [4.0], [5.0]])
    y = torch.tensor([[2.0], [3.0], [4.0], [5.0], [6.0]])

    # Single neuron: y_hat = w * x + b
    model = nn.Linear(1, 1)
    loss_fn = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.04)

    for epoch in range(250):
        y_hat = model(x)            # 1. Predict
        loss = loss_fn(y_hat, y)    # 2. Measure error
        optimizer.zero_grad()       # 3. Clear old gradients
        loss.backward()             # 4. Backpropagate gradients
        optimizer.step()            # 5. Update weight and bias

        if (epoch + 1) % 50 == 0:
            w = model.weight.item()
            b = model.bias.item()
            print(f"Epoch {epoch + 1:3d} | loss={loss.item():.6f} | w={w:.4f} | b={b:.4f}")

    # Test on numbers the model never saw during training
    test_x = torch.tensor([[10.0], [42.0], [-5.0]])
    with torch.no_grad():
        preds = model(test_x)

    print("\nPredictions on unseen inputs:")
    for val, pred in zip(test_x.squeeze(1).tolist(), preds.squeeze(1).tolist()):
        print(f"  x={val:5.1f} -> predicted={pred:6.3f} (expected={val + 1:5.1f})")


if __name__ == "__main__":
    main()
