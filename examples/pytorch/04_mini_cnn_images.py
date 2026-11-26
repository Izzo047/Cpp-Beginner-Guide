"""Lesson 9: Offline mini CNN classifying synthetic 16x16 'plus' vs 'box' images."""

import torch
import torch.nn as nn


def make_dataset(num_samples: int = 240) -> tuple[torch.Tensor, torch.Tensor]:
    images = torch.zeros(num_samples, 1, 16, 16)
    labels = torch.zeros(num_samples, dtype=torch.long)

    for idx in range(num_samples):
        kind = idx % 2
        labels[idx] = kind
        if kind == 0:
            # Class 0: Draw a '+' cross near the center
            images[idx, 0, 7:9, 3:13] = 1.0
            images[idx, 0, 3:13, 7:9] = 1.0
        else:
            # Class 1: Draw a hollow square box
            images[idx, 0, 3:13, 3:5] = 1.0
            images[idx, 0, 3:13, 11:13] = 1.0
            images[idx, 0, 3:5, 3:13] = 1.0
            images[idx, 0, 11:13, 3:13] = 1.0

    # Add mild random sensor noise so the CNN must generalize
    images = (images + 0.25 * torch.rand_like(images)).clamp(0.0, 1.0)
    return images, labels


def main() -> None:
    torch.manual_seed(0)
    train_x, train_y = make_dataset(240)
    test_x, test_y = make_dataset(60)

    model = nn.Sequential(
        nn.Conv2d(1, 8, kernel_size=3, padding=1),
        nn.ReLU(),
        nn.MaxPool2d(2),
        nn.Conv2d(8, 16, kernel_size=3, padding=1),
        nn.ReLU(),
        nn.MaxPool2d(2),
        nn.Flatten(),
        nn.Linear(16 * 4 * 4, 2),
    )

    loss_fn = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    for epoch in range(25):
        logits = model(train_x)
        loss = loss_fn(logits, train_y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    with torch.no_grad():
        test_logits = model(test_x)
        preds = test_logits.argmax(dim=1)
        acc = (preds == test_y).float().mean().item() * 100.0

    print(f"Final train loss: {loss.item():.4f}")
    print(f"Unseen noisy test accuracy: {acc:.1f}% (0=plus, 1=box)")


if __name__ == "__main__":
    main()
