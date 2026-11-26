from pathlib import Path
import re
import sys
import zipfile


ROOT = Path(__file__).resolve().parents[1]
APK = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (
    ROOT / "android" / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
)


def main():
    if not APK.is_file():
        raise SystemExit(f"APK not found: {APK}")

    activity = (ROOT / "android" / "app" / "src" / "main" / "java"
                / "com" / "izzo047" / "fieldnotes" / "MainActivity.java").read_text(encoding="utf-8")
    if 'ASSET_HOST + "/assets/index.html"' not in re.sub(r"\s+", " ", activity):
        raise SystemExit("Android start URL does not match the packaged asset root.")

    manifest = (ROOT / "android" / "app" / "src" / "main" / "AndroidManifest.xml").read_text(encoding="utf-8")
    if "android.permission.INTERNET" in manifest or "uses-permission" in manifest:
        raise SystemExit("The Android app must not request device permissions.")
    if "settings.setBlockNetworkLoads(true)" not in activity:
        raise SystemExit("The Android WebView must block network loads.")
    if "settings.setAllowFileAccess(false)" not in activity:
        raise SystemExit("The Android WebView must deny file access.")
    if "settings.setAllowContentAccess(false)" not in activity:
        raise SystemExit("The Android WebView must deny content-provider access.")
    if "addJavascriptInterface" in activity:
        raise SystemExit("The Android app must not expose a JavaScript-to-native bridge.")

    with zipfile.ZipFile(APK) as archive:
        entries = set(archive.namelist())
        required = {
            "assets/index.html",
            "assets/styles.css",
            "assets/app.js",
            "assets/COLLEGE_ROADMAP.md",
            "assets/lessons/01-foundations.md",
            "assets/lessons/04-engineering-capstone.md",
            "classes.dex",
        }
        missing = required - entries
        if missing:
            raise SystemExit(f"APK is missing required content: {sorted(missing)}")
        if any(name.startswith("assets/.git/") for name in entries):
            raise SystemExit("APK must not contain Git repository metadata.")

        phase_names = {
            "01-foundations.md",
            "02-core-cpp.md",
            "03-algorithms-systems.md",
            "04-engineering-capstone.md",
        }
        lesson_ids = []
        for name in phase_names:
            asset = f"assets/lessons/{name}"
            if asset not in entries:
                raise SystemExit(f"APK is missing lesson source: {asset}")
            text = archive.read(asset).decode("utf-8")
            lesson_ids.extend(
                int(value) for value in re.findall(r"^## Lesson (\d+) ", text, re.MULTILINE)
            )
        if sorted(lesson_ids) != list(range(1, 49)):
            raise SystemExit(f"APK does not contain all 48 ordered lessons: {lesson_ids}")

    print(f"Verified offline APK with all 48 lessons: {APK.name}")


if __name__ == "__main__":
    main()
