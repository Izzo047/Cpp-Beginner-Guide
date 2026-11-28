# Stage 02 — First PyTorch Models

## Lesson 4 — Python Check & Your First Tensors

**By the end, you can:** confirm the basic Python skills needed before coding PyTorch, create tensors, and inspect their `.shape`, `.dtype`, and `.device`.

**Core idea:** A PyTorch **tensor** looks like a Python list or NumPy array, except it knows how to track gradients and jump onto a GPU with one method call.

### Before you code: know basic Python first

> **Prerequisite check:** You should know **basic Python** before proceeding with the code chapters! Make sure you are comfortable with variables, `for` loops, functions (`def`), lists, `import`, and basic `class` syntax. If those look alien, pause for a weekend Python crash course first — PyTorch is written in Python, not magic.

### Installing and creating tensors

Install PyTorch from a terminal (`pip install torch`), then start creating grids of numbers:

```python
import torch

x = torch.tensor([[1.0, 2.0, 3.0],
                  [4.0, 5.0, 6.0]])

print("shape:", x.shape)    # torch.Size([2, 3]) -> 2 rows, 3 cols
print("dtype:", x.dtype)    # torch.float32
print("device:", x.device)  # cpu (or cuda:0)
```

Three properties solve 80% of beginner PyTorch bugs:

- **`.shape`** tells you the dimensions (`[batch, features]` or `[batch, channels, height, width]`).
- **`.dtype`** tells you the number type. Neural network weights usually want `torch.float32`, while class labels or token IDs want `torch.long` (`int64`).
- **`.device`** tells you whether the tensor lives in CPU RAM or GPU VRAM (`cuda`).

### Moving tensors across devices

```python
device = "cuda" if torch.cuda.is_available() else "cpu"
x = x.to(device)
```

Both your **model** and your **input tensor** must live on the same device. Mixing a CPU tensor with a CUDA model crashes immediately.

Runnable file: [`01_tensors_and_devices.py`](../../examples/pytorch/01_tensors_and_devices.py).

**Trap:** Creating an integer tensor like `torch.tensor([1, 2, 3])` and trying to compute gradients on it — PyTorch only differentiates floating-point tensors (`float32`, `float16`, `bfloat16`).

**Practice:** Run `01_tensors_and_devices.py` (or type the snippet above) and print the shape of `x @ x.T`. Why does `.T` (transpose) make the shapes compatible?

## Lesson 5 — Teaching AI to Learn y = x + 1

**By the end, you can:** build and train a real PyTorch model from scratch that learns the rule `y = x + 1` purely from input/output examples.

**Core idea:** Instead of programming `return x + 1`, we give PyTorch `x` (inputs) and `y` (answers), let a tiny `nn.Linear(1, 1)` model make predictions `y_hat`, and let gradient descent discover `weight ≈ 1.0` and `bias ≈ 1.0` on its own.

### Setting up the problem

Here `x` is the input, `y` is the real target (`x + 1`), and `y_hat` is the model's predicted output:

```python
import torch
import torch.nn as nn

# Training data: x is input, y is the true output (x + 1)
x = torch.tensor([[1.0], [2.0], [3.0], [4.0]])
y = torch.tensor([[2.0], [3.0], [4.0], [5.0]])

# Model with 1 weight (w) and 1 bias (b): y_hat = w * x + b
model = nn.Linear(1, 1)
loss_fn = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(200):
    y_hat = model(x)                  # 1. Predict
    loss = loss_fn(y_hat, y)          # 2. Measure error
    optimizer.zero_grad()             # 3. Clear old gradients
    loss.backward()                   # 4. Compute new gradients
    optimizer.step()                  # 5. Nudge w and b

print("Predicted for x=10:", model(torch.tensor([[10.0]])).item())
```

Notice what just happened: we **never** wrote `+ 1` anywhere inside `model`. Yet after 200 quick passes through the loop, `model.weight` converges to `~1.0`, `model.bias` converges to `~1.0`, and feeding `x = 10` predicts `~11.0`!

### Try it live right here

Turn the weight (`w`) and bias (`b`) knobs yourself, or click **Auto-Train** to watch gradient descent snap onto `y = x + 1`. (Warning: keep the learning rate sensible unless you want to destabilize the neural net.)

::widget[linear-trainer]

Runnable file: [`02_learn_x_plus_1.py`](../../examples/pytorch/02_learn_x_plus_1.py).

**Trap:** Passing a 1D tensor `[1.0, 2.0, 3.0, 4.0]` into `nn.Linear(1, 1)` instead of a 2D column `[[1.0], [2.0], [3.0], [4.0]]` (`shape [4, 1]`). `nn.Linear` always expects `[batch_size, num_features]`.

**Practice:** Change the target rule in `02_learn_x_plus_1.py` to `y = 3 * x - 2`, re-run it, and verify the trained weight and bias settle near `3.0` and `-2.0`.

## Lesson 6 — The Training Loop & How Gradients Work

**By the end, you can:** explain what each of the 5 training-loop lines does, describe gradients as downhill slopes, and spot learning-rate failure modes.

**Core idea:** Almost every deep learning model — from `y = x + 1` to giant image and language models — trains with the exact same 5-step loop powered by `autograd`.

### The 5-step PyTorch heartbeat

```text
1. y_hat = model(x)          -> Forward pass: make a prediction
2. loss = loss_fn(y_hat, y)  -> Loss: score how wrong y_hat is
3. optimizer.zero_grad()     -> Reset leftover gradient numbers from last step
4. loss.backward()           -> Autograd: trace blame backward to every w & b
5. optimizer.step()          -> Update w and b slightly in the downhill direction
```

### What is a gradient, really?

Imagine standing blindfolded on a foggy mountain where altitude = **loss (error)**. You feel the slope under your boots:

- If the slope tilts up to the right, stepping **left** takes you downhill.
- That slope is the **gradient**. `loss.backward()` computes the exact slope for every weight and bias automatically using calculus (the chain rule), so you never do derivatives by hand.
- **Learning rate (`lr`)** is your stride length:
  - Too small (`0.00001`): takes forever to reach the valley.
  - Just right (`0.01`–`0.05` for simple problems, or `1e-3` with `Adam`): smooth descent.
  - Too big (`1.0+`): you overshoot the valley wildly, bounce higher each step, and crash into **`NaN`** (Not a Number).

### Why `zero_grad()` is mandatory

PyTorch **adds** new gradients onto `.grad` by default instead of overwriting them (useful for fancy tricks like gradient accumulation). If you forget `optimizer.zero_grad()`, old gradients pile up and steer your weights in crazy directions.

**Trap:** Forgetting `optimizer.zero_grad()` or letting the learning rate run too high until loss prints `nan`.

**Practice:** Comment out `optimizer.zero_grad()` in `02_learn_x_plus_1.py` for one test run and watch what happens to the loss curve, then restore it.
