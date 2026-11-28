# Stage 01 — AI & Math Intuition

## Lesson 1 — What Is AI? Predictions, ML vs. Deep Learning

**By the end, you can:** explain AI as prediction, tell traditional machine learning apart from deep learning, and compare CPUs, NVIDIA CUDA GPUs, Google TPUs, and AMD ROCm GPUs in one line each.

**Core idea:** Artificial intelligence is not magic or consciousness — at its core, AI is a prediction engine that turns numbers in into useful guesses out.

### AI is just predictions

Strip away the sci-fi hype and almost every AI system does one job: you hand it an **input** (an image, a sentence, yesterday's temperature), and it outputs a **prediction** (is this a cat, what word comes next, will it rain tomorrow?).

Instead of a programmer hand-writing `if/else` rules for every edge case, we show a computer thousands of examples and let it tune its own internal math rules until its guesses stop being terrible.

### Two main ways to build prediction machines

1. **Traditional Machine Learning (ML):** Best for neat tables of numbers (spreadsheets, house prices, churn scores). You pick meaningful features by hand (like square footage or bedrooms) and feed them to classic algorithms such as linear regression, decision trees, or random forests. In Python, this is mostly done with **`scikit-learn`**.
2. **Deep Learning & Neural Networks:** Best for messy, unstructured data like pixels, audio waves, and raw text. Instead of you hand-picking features, you stack layers of simple math units (**neural networks**) that learn their own features automatically from raw data. That is what **PyTorch** is built for.

```text
Traditional ML (scikit-learn):  raw data -> human picks features -> tree / regression -> prediction
Deep Learning  (PyTorch):       raw data -> stacked neural layers learn features    -> prediction
```

### Hardware showdown: where does the math run?

Neural networks do millions or billions of tiny multiplications in parallel, so hardware matters:

| Chip / Platform | One-line summary |
| --- | --- |
| **CPU** | General-purpose brain in every PC/phone; great for small experiments and data prep, slow on giant neural nets. |
| **NVIDIA GPU (CUDA)** | Thousands of parallel math cores powered by NVIDIA's CUDA software; the undisputed standard for AI training. |
| **Google TPU** | Custom Google chip (ASIC) engineered strictly to blast giant matrix multiplications at cloud scale. |
| **AMD GPU (ROCm)** | AMD's high-core-count GPU challenger using ROCm, an open-source rival to CUDA supported by PyTorch. |

**Trap:** Thinking you need an expensive CUDA GPU to learn PyTorch. Every single chapter and script in this guide runs fast right on your normal CPU.

**Practice:** Name one problem suited for `scikit-learn` (traditional ML) and one suited for PyTorch (deep learning), and explain why in one sentence each.

## Lesson 2 — The Main Characters: Inputs, Weights, Biases & Predictions

**By the end, you can:** name the four main characters in a neural network (`x`, `w`, `b`, `y_hat`) and explain how turning parameters changes a prediction.

**Core idea:** A model makes predictions by multiplying inputs by **weights**, adding a **bias**, and adjusting those tunable **parameters** until its predicted output (`y_hat`) matches the real answer (`y`).

### Meet the cast

Every neural network — from a 2-number line predictor up to a frontier LLM — is built around the same main characters:

- **Input (`x`):** The raw clue you feed the model (hours studied, pixel brightness, or tokens so far).
- **True Output (`y`):** The real ground-truth answer from your dataset that you want the model to match.
- **Predicted Output (`y_hat` / `ŷ`):** The model's current guess. Early on, `y_hat` is wildly wrong.
- **Weights (`w`):** Dials that control *how strongly* each input pushes the prediction up or down. Negative weight means "flip or push down"; near-zero weight means "ignore this input".
- **Bias (`b`):** A baseline offset dial added after multiplying by weights — like the starting head start even when `x = 0`.
- **Parameters:** The collective name for all tunable **weights and biases** inside a model. When someone says "a 7-billion-parameter model", they just mean 7 billion `w` and `b` numbers.

### The knob-turning analogy

Think of the simplest possible neuron as a single equation:

```text
y_hat = w * x + b
```

Suppose the real hidden rule in the world is `y = 2 * x + 1`. You feed `x = 3`, so the true answer is `y = 7`.

If your model starts with random guesses `w = 0.5` and `b = 0.0`, it predicts `y_hat = 0.5 * 3 + 0 = 1.5`. Too low! Training simply nudges `w` and `b` slightly upward, tries again, measures the error (`y - y_hat`), and repeats until `w` settles near `2` and `b` settles near `1`.

> A neural network does not "understand" concepts — it adjusts billions of `w` and `b` knobs until the error drops.

**Trap:** Confusing `y` (the real answer from data) with `y_hat` (what the model predicted). Always keep track of which one is truth and which one is a guess.

**Practice:** Grab a scrap note and compute `y_hat = w * x + b` by hand for `x = 4`, `w = 1.5`, `b = -1`. If the true `y` is `7`, should `w` or `b` move up or down?

## Lesson 3 — Matrices & Matrix Multiplication Without the Fear

**By the end, you can:** read matrix shapes `(rows x cols)`, trace a dot product by hand, and explain why PyTorch packs numbers into matrices instead of Python loops.

**Core idea:** A matrix is just a tidy grid of numbers, and matrix multiplication lets a GPU compute thousands of `weight * input` pairs in one blazing-fast hardware instruction.

### Why grids beat single numbers

Real inputs are rarely just one number. An email might have 500 clues; a tiny photo has `28 * 28 = 784` pixels. Writing 784 separate `w1 * x1 + w2 * x2 + ...` lines would be unbearable and slow.

Instead, we pack inputs into a **vector** (1D list) or **matrix** (2D grid of rows and columns) — and in PyTorch, any 1D, 2D, 3D, or N-dimensional grid is called a **tensor**.

### How matrix multiplication actually works

To multiply matrix `A` of shape `(M, K)` by matrix `B` of shape `(K, N)`:

1. The inner dimensions **must match** (`K == K`). Think of it like dominoes snapping together.
2. You slide across each **row** of `A`, down each **column** of `B`, multiply matching pairs, and add them up (a **dot product**).
3. The result has shape `(M, N)`.

```text
Input batch (2 samples, 3 features)  @  Weights (3 features -> 2 outputs)  =  Output (2, 2)

  [ 1  2  3 ]                           [ 10  1 ]                            [ 1*10+2*20+3*30 , ... ]
  [ 4  5  6 ]             @             [ 20  0 ]             =              [ 4*10+5*20+6*30 , ... ]
                                        [ 30 -1 ]
```

In Python and PyTorch, the `@` operator performs matrix multiplication cleanly: `outputs = inputs @ weights + bias`.

### Why GPUs love `@`

Every cell in the output matrix is completely independent of every other cell. An NVIDIA CUDA GPU, AMD ROCm GPU, or Google TPU can compute all output cells simultaneously across thousands of cores instead of waiting on a slow Python `for` loop.

**Trap:** Swapping the order (`A @ B` vs `B @ A`) or forgetting the inner dimension rule. In PyTorch, `RuntimeError: mat1 and mat2 shapes cannot be multiplied` almost always means your `K` dimensions don't match.

**Practice:** Can a `(4, 3)` matrix multiply a `(3, 2)` matrix? What shape comes out? What happens if you try `(3, 2) @ (4, 3)`?
