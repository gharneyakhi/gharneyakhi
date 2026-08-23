# Build the installable APK

This folder is a complete Android Studio project. The sandbox that authored
it cannot reach `dl.google.com` / Maven Central, so the APK is produced on
**your** machine (or any GitHub runner that can see those hosts).

## Fastest path — Android Studio

1. Install [Android Studio](https://developer.android.com/studio) (Ladybug or newer).
2. **File → Open** → select the `NetBlockWidget` directory.
3. Let Gradle download the SDK (compileSdk **35**) and sync.
4. Plug in a phone with USB debugging, or start an emulator (API 26+).
5. **Run ▶**. Studio installs a signed debug APK.

To export an APK: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.  
Output: `app/build/outputs/apk/debug/app-debug.apk`

That file is installable (`adb install -r app-debug.apk` or open it on the phone).

## CLI

```bash
cd NetBlockWidget
echo "sdk.dir=$HOME/Android/Sdk" > local.properties   # adjust if needed
chmod +x gradlew
./gradlew :app:testDebugUnitTest assembleDebug assembleRelease
```

- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- Release APK (debug-signed so it installs): `app/build/outputs/apk/release/app-release.apk`

Copy either one to `dist/NetBlock.apk` if you want a stable path.

## First run on the phone

1. Android will ask to allow an app from this source (sideload).
2. Open **NetBlock** → read the local-VPN explanation → **Allow local VPN**.
3. Accept the system VPN consent sheet. Until you do, the app will **not**
   claim that anything is blocked.
4. Long-press the home screen → Widgets → **NetBlock**.
5. Flip Instagram / Facebook / Telegram / WhatsApp. **ON = Block Internet**.
6. Leave **VPN: ON**.

If a row says `Not installed`, that app is missing or uses a different
package name — fix it in Settings.
