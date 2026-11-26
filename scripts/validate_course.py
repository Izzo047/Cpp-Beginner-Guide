from pathlib import Path
import re
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
CPP_LESSON_FILES = (
    ROOT / "lessons" / "01-foundations.md",
    ROOT / "lessons" / "02-core-cpp.md",
    ROOT / "lessons" / "03-algorithms-systems.md",
    ROOT / "lessons" / "04-engineering-capstone.md",
)
PYTORCH_LESSON_FILES = (
    ROOT / "lessons" / "pytorch" / "01-ai-and-math.md",
    ROOT / "lessons" / "pytorch" / "02-first-models.md",
    ROOT / "lessons" / "pytorch" / "03-curves-and-vision.md",
    ROOT / "lessons" / "pytorch" / "04-llms.md",
)


def validate_track(name, files, expected_count):
    lesson_ids = []
    for path in files:
        if not path.is_file():
            raise SystemExit(f"Missing {name} lesson file: {path.relative_to(ROOT)}")
        text = path.read_text(encoding="utf-8")
        ids = [int(value) for value in re.findall(r"^## Lesson (\d+) — ", text, re.MULTILINE)]
        outcomes = re.findall(r"^\*\*By the end, you can:\*\*", text, re.MULTILINE)
        if len(ids) != len(outcomes):
            raise SystemExit(
                f"{path.relative_to(ROOT)}: found {len(ids)} lessons and "
                f"{len(outcomes)} learning outcomes"
            )
        lesson_ids.extend(ids)

    expected_ids = list(range(1, expected_count + 1))
    if sorted(lesson_ids) != expected_ids:
        raise SystemExit(
            f"Expected {name} lesson IDs 1–{expected_count} exactly once; found {lesson_ids}"
        )


def main():
    validate_track("C++", CPP_LESSON_FILES, 48)
    validate_track("PyTorch", PYTORCH_LESSON_FILES, 10)

    markdown_files = [
        ROOT / "README.md",
        ROOT / "COLLEGE_ROADMAP.md",
        *sorted((ROOT / "lessons").glob("*.md")),
        *sorted((ROOT / "lessons" / "pytorch").glob("*.md")),
    ]
    broken_links = []
    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        for href in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
            parsed = urlsplit(href)
            if parsed.scheme or not parsed.path:
                continue
            destination = (path.parent / parsed.path).resolve()
            if not destination.exists():
                broken_links.append((path.relative_to(ROOT), href))

    if broken_links:
        details = "\n".join(f"{path}: {href}" for path, href in broken_links)
        raise SystemExit(f"Broken local Markdown links:\n{details}")

    print(
        "Validated 48 C++ lessons, 10 PyTorch lessons, 58 learning outcomes, "
        "and all local Markdown links."
    )


if __name__ == "__main__":
    main()
