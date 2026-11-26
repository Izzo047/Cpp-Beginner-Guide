# Stage 04 — Modern Frontier: LLMs

## Lesson 10 — How LLMs Actually Work

**By the end, you can:** connect every concept in this guide (`x`, weights, matrix multiplication, ReLU/GELU, and next-step prediction) to explain how Large Language Models generate text.

**Core idea:** An LLM like ChatGPT or Claude is still just a prediction machine from Lesson 1 — except instead of predicting `y = x + 1`, it predicts the **probability of the very next token**.

### Everything comes full circle

When you send a prompt to an LLM, there is no secret human in a box. The entire pipeline is built from the exact PyTorch ingredients you already learned:

1. **Tokens (text -> integer IDs):** Text is chopped into chunks called **tokens** (words or sub-words) and mapped to IDs in a vocabulary table, like `[15496, 995]`.
2. **Embeddings (`nn.Embedding`):** Each token ID looks up a row of learned numbers — turning a plain ID into a rich coordinate vector in meaning-space (similar words end up near each other).
3. **Self-Attention (context mixing):** The secret sauce of the **Transformer** architecture. Every token asks every earlier token *"are you relevant to me right now?"* using matrix multiplications (`Q @ K.T`) and blends their information together. For example, in *"The bat flew out of the cave"*, attention connects *"bat"* to *"flew"* and *"cave"*, not baseball!
4. **MLP / Feed-Forward Layers (`nn.Linear` + `GELU`):** Just like Lesson 7's curve bender, each token passes through linear + activation layers to refine its representation.
5. **Next-Token Prediction (`nn.Linear` -> Softmax):** A final linear layer scores every word in the entire vocabulary. Softmax turns scores into probabilities (`"sun": 72%`, `"moon": 18%`, ...), and **temperature** controls how adventurous or predictable the pick is.

```text
"The sky is"
   -> [Token IDs]
   -> [Embeddings]
   -> [Attention + Linear/GELU Blocks x N]
   -> [Vocab Scores]
   -> Next-token guess: "blue" (0.78), "dark" (0.14), ...
```

### Build a tiny next-token Transformer in PyTorch

You do not need a billion-dollar cluster to see next-token prediction in action. [`05_tiny_llm_next_token.py`](../../examples/pytorch/05_tiny_llm_next_token.py) trains a miniature causal self-attention model right on your CPU in a couple of seconds until it predicts repeating character patterns token by token.

```python
# Causal self-attention mask ensures token i can only look at tokens <= i
mask = torch.tril(torch.ones(T, T))
scores = (Q @ K.transpose(-2, -1)) / (head_dim ** 0.5)
scores = scores.masked_fill(mask == 0, float("-inf"))
weights = torch.softmax(scores, dim=-1)
out = weights @ V
```

**Trap:** Thinking an LLM "knows facts" the way a SQL database does. It predicts plausible continuations based on patterns baked into its weights — which is why it can hallucinate confidently when uncertain.

### Residual anomaly detected in vocabulary slot 255

Sometimes unaligned tokens slip out of the embedding matrix during sampling. Whatever you do, leave corrupted token `0xFF` un-decoded.

::widget[rogue-token]

**Practice:** Run `05_tiny_llm_next_token.py`, change the training phrase string, and watch how sampling temperature (`0.2` vs `1.5`) changes the generated continuation.
