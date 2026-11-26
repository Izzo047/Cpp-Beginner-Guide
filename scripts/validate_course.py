from pathlib import Path
import re
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
LESSON_FILES = (
    ROOT / "lessons" / "01-foundations.md",
    ROOT / "lessons" / "02-core-cpp.md",
    ROOT / "lessons" / "03-algorithms-systems.md",
    ROOT / "lessons" / "04-engineering-capstone.md",
)


def main():
    lesson_ids = []
    for path in LESSON_FILES:
        text = path.read_text(encoding="utf-8")
        ids = [int(value) for value in re.findall(r"^## Lesson (\d+) ", text, re.MULTILINE)]
        outcomes = re.findall(r"^\*\*By the end, you can:\*\*", text, re.MULTILINE)
        if len(ids) != len(outcomes):
            raise SystemExit(
                f"{path.relative_to(ROOT)}: found {len(ids)} lessons and "
                f"{len(outcomes)} learning outcomes"
            )
        lesson_ids.extend(ids)

    if sorted(lesson_ids) != list(range(1, 49)):
        raise SystemExit(f"Expected lesson IDs 1–48 exactly once; found {lesson_ids}")

    markdown_files = [
        ROOT / "README.md",
        ROOT / "COLLEGE_ROADMAP.md",
        *sorted((ROOT / "lessons").glob("*.md")),
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

    print("Validated 48 ordered lessons, 48 learning outcomes, and local Markdown links.")


if __name__ == "__main__":
    main()
