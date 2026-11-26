# Stage 03 — Bending Space: Curves & Images

## Lesson 7 — Beyond Straight Lines: Curves & Activation Functions

**By the end, you can:** explain why pure linear layers cannot learn curves, add `ReLU` activation functions inside `nn.Sequential`, and train PyTorch to fit `y = x²`.

**Core idea:** Stacking ten straight lines still gives a straight line; adding a simple bend called an **activation function** (like `ReLU`) lets neural networks approximate any curve.

### Why straight lines hit a wall

If Layer 1 computes `2x + 1` and Layer 2 multiplies that by `3`, you just get `6x + 3` — still a flat straight line! No matter how many `nn.Linear` layers you stack, without a non-linear bend between them, your model can never fit a parabola like `y = x²` or a wave like `sin(x)`.

### Enter `ReLU` (the simplest bend in AI)

**ReLU** (Rectified Linear Unit) does one ridiculously simple thing:

```text
ReLU(z) = max(0, z)   -> negative numbers become 0; positive numbers stay unchanged
```

When you put a hidden layer of neurons with `ReLU` between them, each neuron creates a tiny hinge/corner at a different spot. Add 16 or 32 hinges together and their sum bends smoothly into curves!

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(1, 32),   # 1 input -> 32 hidden lines
    nn.ReLU(),          # bend every negative part flat
    nn.Linear(32, 1),   # combine the 32 hinges into 1 curve prediction
)
```

### Bend a curve yourself

Toggle between **Linear Only** and **Hidden Layer + ReLU** below to see how adding hidden neurons lets the model hug `y = x²`.

::widget[curve-lab]

Runnable file: [`03_learn_curves.py`](../../examples/pytorch/03_learn_curves.py).

**Trap:** Putting `nn.ReLU()` on the *very last* output layer when predicting negative numbers — `ReLU` clamps everything below zero to `0.0`, chopping off half your answers!

**Practice:** Run `03_learn_curves.py` and swap `nn.ReLU()` for `nn.GELU()` or `nn.Tanh()`. Which one produces the smoothest curve on `y = x²`?

## Lesson 8 — Seeing the World: Images as Tensors

**By the end, you can:** describe how grayscale and RGB images map to `[B, C, H, W]` tensors and explain why spatial neighborhood matters.

**Core idea:** To PyTorch, an image is not a picture — it is a 3D or 4D grid of pixel brightness numbers between `0.0` and `1.0`.

### Pixels are just numbers in a tensor

- A **grayscale** `28x28` digit has shape `[1, 28, 28]` (1 color channel, 28 high, 28 wide).
- A **color RGB** `64x64` photo has shape `[3, 64, 64]` (Red, Green, Blue channels).
- A **batch** of 16 color photos has shape **`[16, 3, 64, 64]`**, written **`[B, C, H, W]`**:
  - `B` = Batch size (how many images at once)
  - `C` = Channels (`1` or `3`)
  - `H` = Height in pixels
  - `W` = Width in pixels

### Why flattening hurts vision

If you squash a `64x64` image into one giant 1D list of `4,096` numbers and feed it to `nn.Linear`, pixels that sit right above or below each other get pulled far apart. Worse, shifting a cat 2 pixels to the right makes every single input number move to a different index!

We need a layer that scans **local patches** anywhere in the image.

**Trap:** Confusing channel order! Standard image files often store `[H, W, C]` (channels last), whereas PyTorch `Conv2d` strictly requires **`[B, C, H, W]`** (channels first).

**Practice:** Calculate the total number of floats inside one batch tensor of shape `[32, 3, 128, 128]`.

## Lesson 9 — Convolutions & Building a Mini Image Classifier

**By the end, you can:** explain how a `Conv2d` filter slides over pixels to find edges and shapes, and build a working CNN image classifier in PyTorch.

**Core idea:** A **Convolutional Neural Network (CNN)** slides tiny learnable `3x3` pattern scanners (**kernels**) across an image to spot edges first, then shapes, then whole objects.

### How a `3x3` filter sees

Think of a `3x3` kernel as a mini magnifying glass with 9 learned weights. As it slides across the image:

- Early `nn.Conv2d` layers learn simple **vertical/horizontal edge detectors**.
- Deeper `Conv2d` layers combine edges into **corners, circles, and textures**.
- `nn.MaxPool2d(2)` shrinks width and height by half, keeping the strongest feature signals and cutting computation by 4x.
- Finally, `nn.Flatten()` + `nn.Linear` turns those detected features into class scores (logits).

```python
import torch.nn as nn

cnn = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3, padding=1),  # [B, 1, 16, 16] -> [B, 8, 16, 16]
    nn.ReLU(),
    nn.MaxPool2d(2),                            # -> [B, 8, 8, 8]
    nn.Conv2d(8, 16, kernel_size=3, padding=1), # -> [B, 16, 8, 8]
    nn.ReLU(),
    nn.MaxPool2d(2),                            # -> [B, 16, 4, 4]
    nn.Flatten(),                               # -> [B, 256]
    nn.Linear(16 * 4 * 4, 2),                   # 2 classes: e.g. cross vs box
)
```

Notice we use `nn.CrossEntropyLoss()` for multi-class image labels instead of `MSELoss`. It expects raw output scores (**logits**) directly — do not apply Softmax before passing logits into `CrossEntropyLoss`.

Runnable file: [`04_mini_cnn_images.py`](../../examples/pytorch/04_mini_cnn_images.py) (generates its own synthetic `16x16` images so it runs offline in seconds).

**Trap:** Calculating the wrong flattened size for `nn.Linear(...)` after `MaxPool2d` layers. Always print `x.shape` on a dummy batch `torch.randn(1, 1, 16, 16)` before guessing the number!

**Practice:** Run `04_mini_cnn_images.py` and check its test accuracy on unseen noisy crosses and squares.
