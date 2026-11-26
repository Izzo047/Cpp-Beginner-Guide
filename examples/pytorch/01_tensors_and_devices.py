"""Lesson 4: First PyTorch tensors, shapes, dtypes, and devices."""

import torch


def main() -> None:
    print("PyTorch version:", torch.__version__)

    # 1. Create a 2x3 floating-point tensor
    x = torch.tensor(
        [
            [1.0, 2.0, 3.0],
            [4.0, 5.0, 6.0],
        ]
    )
    print("x:\n", x)
    print("shape :", x.shape)
    print("dtype :", x.dtype)
    print("device:", x.device)

    # 2. Matrix multiplication: (2, 3) @ (3, 2) -> (2, 2)
    gram = x @ x.T
    print("\nx @ x.T shape:", gram.shape)
    print(gram)

    # 3. Move to GPU automatically if CUDA (or Apple MPS) is available
    if torch.cuda.is_available():
        device = "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"

    x_dev = x.to(device)
    print("\nMoved tensor to:", x_dev.device)


if __name__ == "__main__":
    main()
