from pathlib import Path
import re
import sys
import zipfile


ROOT = Path(__file__).resolve().parents[1]
MIN_PLAY_TARGET_SDK = 36
PACKAGE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (
    ROOT / "android" / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
)


def main():
    if not PACKAGE.is_file():
        raise SystemExit(f"Android package not found: {PACKAGE}")
    if PACKAGE.suffix.lower() not in {".apk", ".aab"}:
        raise SystemExit(f"Expected an APK or Android App Bundle: {PACKAGE}")

    gradle_config = (ROOT / "android" / "app" / "build.gradle").read_text(encoding="utf-8")
    target_sdk = re.search(r"^\s*targetSdk\s+(\d+)\s*$", gradle_config, re.MULTILINE)
    if not target_sdk or int(target_sdk.group(1)) < MIN_PLAY_TARGET_SDK:
        raise SystemExit(
            f"Google Play phone submissions require target API {MIN_PLAY_TARGET_SDK} or newer."
        )

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

    is_bundle = PACKAGE.suffix.lower() == ".aab"
    asset_root = "base/assets" if is_bundle else "assets"
    dex_entry = "base/dex/classes.dex" if is_bundle else "classes.dex"
    with zipfile.ZipFile(PACKAGE) as archive:
        entries = set(archive.namelist())
        required = {
            f"{asset_root}/index.html",
            f"{asset_root}/styles.css",
            f"{asset_root}/app.js",
            f"{asset_root}/COLLEGE_ROADMAP.md",
            f"{asset_root}/lessons/01-foundations.md",
            f"{asset_root}/lessons/04-engineering-capstone.md",
            dex_entry,
        }
        if is_bundle:
            required.update({"BundleConfig.pb", "base/manifest/AndroidManifest.xml"})
        missing = required - entries
        if missing:
            raise SystemExit(f"Android package is missing required content: {sorted(missing)}")
        if any(name.startswith(f"{asset_root}/.git/") for name in entries):
            raise SystemExit("Android package must not contain Git repository metadata.")
        native_libraries = [
            name for name in entries
            if name.endswith(".so") and name.startswith(("lib/", "base/lib/"))
        ]
        if native_libraries:
            raise SystemExit(
                "Native libraries need a 16 KB page-size compatibility review before release: "
                f"{native_libraries}"
            )

        phase_names = {
            "01-foundations.md",
            "02-core-cpp.md",
            "03-algorithms-systems.md",
            "04-engineering-capstone.md",
        }
        lesson_ids = []
        for name in phase_names:
            asset = f"{asset_root}/lessons/{name}"
            if asset not in entries:
                raise SystemExit(f"Android package is missing lesson source: {asset}")
            text = archive.read(asset).decode("utf-8")
            lesson_ids.extend(
                int(value) for value in re.findall(r"^## Lesson (\d+) ", text, re.MULTILINE)
            )
        if sorted(lesson_ids) != list(range(1, 49)):
            raise SystemExit(f"Android package does not contain all 48 ordered lessons: {lesson_ids}")

    package_type = "App Bundle" if is_bundle else "APK"
    print(f"Verified offline Android {package_type} with all 48 lessons: {PACKAGE.name}")


if __name__ == "__main__":
    main()
