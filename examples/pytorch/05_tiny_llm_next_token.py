"""Lesson 10: Tiny causal self-attention language model predicting the next token."""

import torch
import torch.nn as nn
import torch.nn.functional as F


class TinyLLM(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, max_len: int) -> None:
        super().__init__()
        self.tok_emb = nn.Embedding(vocab_size, embed_dim)
        self.pos_emb = nn.Embedding(max_len, embed_dim)
        self.q_proj = nn.Linear(embed_dim, embed_dim, bias=False)
        self.k_proj = nn.Linear(embed_dim, embed_dim, bias=False)
        self.v_proj = nn.Linear(embed_dim, embed_dim, bias=False)
        self.ffn = nn.Sequential(
            nn.Linear(embed_dim, embed_dim * 2),
            nn.GELU(),
            nn.Linear(embed_dim * 2, embed_dim),
        )
        self.head = nn.Linear(embed_dim, vocab_size)

    def forward(self, idx: torch.Tensor) -> torch.Tensor:
        _, seq_len = idx.shape
        pos = torch.arange(seq_len, device=idx.device)
        x = self.tok_emb(idx) + self.pos_emb(pos)

        q, k, v = self.q_proj(x), self.k_proj(x), self.v_proj(x)
        scores = (q @ k.transpose(-2, -1)) / (x.size(-1) ** 0.5)
        causal_mask = torch.tril(torch.ones(seq_len, seq_len, device=idx.device))
        scores = scores.masked_fill(causal_mask == 0, float("-inf"))
        attn_out = F.softmax(scores, dim=-1) @ v

        x = x + attn_out
        x = x + self.ffn(x)
        return self.head(x)


def main() -> None:
    torch.manual_seed(1337)
    corpus = "pytorch predicts the next token! " * 8
    chars = sorted(set(corpus))
    stoi = {ch: i for i, ch in enumerate(chars)}
    itos = {i: ch for ch, i in stoi.items()}

    data = torch.tensor([stoi[c] for c in corpus], dtype=torch.long)
    block_size = 24
    inputs = torch.stack([data[i : i + block_size] for i in range(len(data) - block_size - 1)])
    targets = torch.stack([data[i + 1 : i + block_size + 1] for i in range(len(data) - block_size - 1)])

    model = TinyLLM(vocab_size=len(chars), embed_dim=32, max_len=block_size)
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.01)

    for step in range(180):
        logits = model(inputs)
        loss = F.cross_entropy(logits.view(-1, len(chars)), targets.view(-1))
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    print(f"Final next-token loss: {loss.item():.4f}")

    # Generate 40 new characters starting from "pytorch "
    prompt = "pytorch "
    tokens = torch.tensor([[stoi[c] for c in prompt]], dtype=torch.long)
    temperature = 0.7
    with torch.no_grad():
        for _ in range(40):
            context = tokens[:, -block_size:]
            logits = model(context)[:, -1, :] / temperature
            probs = F.softmax(logits, dim=-1)
            next_id = torch.multinomial(probs, num_samples=1)
            tokens = torch.cat([tokens, next_id], dim=1)

    generated = "".join(itos[i] for i in tokens[0].tolist())
    print("Generated text:", repr(generated))


if __name__ == "__main__":
    main()
