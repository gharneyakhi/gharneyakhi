# NetBlock Widget

A real, installable Android firewall that cuts internet for **Instagram**, **Facebook**, **Telegram** and **WhatsApp** from a home-screen widget — without root.

Toggle **ON = Block Internet**. Other apps on the phone keep Wi-Fi and mobile data.

Nothing leaves the device. There is no account, no analytics, no remote VPN server.

## Architecture first

Read [ARCHITECTURE.md](ARCHITECTURE.md) before the UI. The short version:

Android `VpnService` does **not** put a UID on TUN packets, so a userspace “inspect every packet” firewall is the wrong tool. NetBlock uses the official per-app API:

```
VpnService.Builder.addAllowedApplication(blockedPackage)
```

Only blocked apps are pulled into a local TUN. Their packets are drained and dropped. Everyone else uses the real network. Package names are overridable in Settings.

## Open in Android Studio

1. Android Studio Ladybug / Koala or newer, JDK 17, Android SDK 35.
2. **File → Open** and select this `NetBlockWidget` folder (not the parent web repo).
3. Let Gradle sync.
4. Run on a device or emulator (API 26+).

First launch explains the local VPN, then Android’s system VPN consent sheet appears. Until that sheet is accepted, the app **will not** claim that anything is blocked.

## Build from the CLI

```bash
cd NetBlockWidget
# create local.properties with sdk.dir=/path/to/Android/Sdk if needed
./gradlew assembleDebug assembleRelease test
```

APKs:

- `app/build/outputs/apk/debug/app-debug.apk`
- `app/build/outputs/apk/release/app-release.apk`
- `dist/NetBlock.apk` (copied by CI after a successful build)

## Widget

Long-press the home screen → Widgets → **NetBlock**.

Four rows plus `VPN: ON/OFF`. Tapping a row flips that app without opening the activity. If VPN permission has never been granted, the widget opens the app so Android can show the consent sheet.

## Tests (required scenarios)

See [TEST_NOTES.md](TEST_NOTES.md). Logic for toggle semantics is covered by JVM unit tests:

```bash
./gradlew :app:testDebugUnitTest
```

Device tests 1–9 need a phone or emulator with the four apps (or any stand-in whose package name you set in Settings).

## Privacy

- No network calls from this app.
- No login.
- Packets of blocked apps are discarded, never parsed or stored.
- Settings live in `SharedPreferences` on the device.

## Limits (not hidden)

- Only one VPN can run on Android. Another VPN app will prevent `establish()`.
- Do **not** enable system “Block connections without VPN” (lockdown). That would also kill Chrome and every other app, because those apps are intentionally *outside* our TUN.
- Cloned / Lite / work-profile copies use different package names — edit them in Settings.
- After reboot Android may delay restarting a VPN. We try (`BOOT_COMPLETED`); if the OEM blocks it, open the app once.

## Package names (defaults, overridable)

| App | Default package |
|---|---|
| Instagram | `com.instagram.android` |
| Facebook | `com.facebook.katana` |
| Telegram | `org.telegram.messenger` |
| WhatsApp | `com.whatsapp` |

Application id: `app.netblock.widget`  
minSdk 26 / targetSdk 35 / compileSdk 35
