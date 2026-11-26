# Security notes

Fieldnotes is an educational app, not a security product. No app can be guaranteed unhackable. The Android version uses defense in depth to keep the course isolated from device files and network content:

- The APK bundles the course files and serves them inside the app with AndroidX `WebViewAssetLoader`; it does not use `file://` URLs.
- The manifest requests no `INTERNET`, storage, camera, microphone, contacts, or location permission. WebView network loads, file access, content-provider access, mixed content, geolocation, and JavaScript-created windows are disabled.
- AndroidX contributes one package-scoped signature permission for its non-exported dynamic receiver; it is not a user-granted device capability and does not prompt at install.
- JavaScript is enabled only because the first-party course UI needs it. The app exposes no JavaScript-to-native bridge and disables WebView debugging.
- The course Content Security Policy permits only same-origin scripts and content. Secure external links are handed to the device browser only after the learner taps them; other schemes are blocked.
- App data is excluded from Android backup. Progress and notes stay in the app's local browser storage.
- The Windows launcher binds its content server to loopback, checks the Host and Origin headers, rejects cross-site fetches and hidden files, and serves only course-friendly file types.

These controls reduce exposure but do not protect a rooted or compromised device, repair a vulnerable operating system/WebView, or make malicious modifications safe. Keep Android and its WebView provider updated. Report suspected vulnerabilities through GitHub's private vulnerability reporting feature rather than a public issue.
