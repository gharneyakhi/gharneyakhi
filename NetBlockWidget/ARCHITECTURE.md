# NetBlock — VPN Architecture

This document is the technical design for the local, no-root, per-app internet firewall.
It was written **before** the UI was built.

## Goal

Independently cut or restore internet for four apps (Instagram, Facebook, Telegram,
WhatsApp) from a home-screen widget and from the main screen.

- Toggle **ON** → that app has **no internet** (`blocked = true`)
- Toggle **OFF** → that app has **normal internet** (`blocked = false`)
- Other apps on the phone (Chrome, system services, …) must keep working
- Must work on Wi-Fi **and** mobile data
- Must **not** require root
- Must **not** send traffic to a remote VPN / proxy / DNS filter
- Must **not** be a fake UI

## Why not packet-level UID filtering?

`VpnService` delivers **raw IP packets** on a TUN file descriptor. Those packets do
**not** carry the Android UID of the sending app.

The classic NetGuard approach maps `(src IP, src port)` → UID via `/proc/net/tcp`
(and friends). On modern Android that path is:

- complex (full userspace IPv4/IPv6 + TCP/UDP state machine)
- battery-heavy (every packet of every app is inspected)
- increasingly blocked by SELinux / `CONNECTIVITY_INTERNAL` restrictions
- fragile across OEM kernels

So a “inspect every packet, look up UID, drop or forward” engine is the **wrong**
architecture for this product.

## Official Android API for per-app VPN

`VpnService.Builder` exposes two mutually exclusive APIs (they cannot be combined):

| API | Effect |
|---|---|
| `addAllowedApplication(pkg)` | **Only** these apps are routed into the TUN. Everyone else uses the real network. |
| `addDisallowedApplication(pkg)` | These apps **bypass** the TUN. Everyone else is captured. |

UID matching is done **inside the kernel / ConnectivityService**, which is exactly
where Android already knows the owning UID of a socket. That is the supported,
battery-efficient way to do per-app control.

## Chosen design: blackhole VPN for blocked apps only

```
┌─────────────────────────────────────────────────────────────┐
│                        Android device                       │
│                                                             │
│   Instagram (blocked) ──┐                                   │
│   Facebook  (blocked) ──┼──► TUN 10.255.255.1  ── DROP     │
│                         │    (NetBlockVpnService)           │
│   Telegram  (allowed) ──┤                                   │
│   WhatsApp  (allowed) ──┼──► real Wi-Fi / mobile ── INTERNET│
│   Chrome / others    ───┘                                   │
└─────────────────────────────────────────────────────────────┘
```

When the VPN is running:

1. Build a local TUN (`10.255.255.1/32` + unique IPv6 ULA).
2. Route `0.0.0.0/0` and `::/0` into the TUN so IPv4 **and** IPv6 are captured.
3. Call `addAllowedApplication()` for every **installed** package whose
   `blocked == true`.
4. Never write a packet back to the TUN and never open an upstream socket.
   A small blocking reader thread **drains and discards** bytes so the kernel
   buffer cannot stall the blocked apps in a half-open state.
5. Apps that are not in the allowed list are **not** in the VPN at all, so the
   system gives them the normal default network (Wi-Fi or mobile).

This is a **local** VPN: no server, no account, no DNS rewrite, no HTTP proxy,
no hosts file, no root.

### Why IPv6 is required

If we only add an IPv4 address/route, a blocked app can leak over IPv6 on dual-stack
networks. The builder therefore always adds an IPv6 address and `::/0`.

### Why we do not add a working DNS server

Blocked apps must not resolve or connect. We do not configure a real resolver on
the TUN. Their DNS and TCP/UDP packets all land on the dummy interface and die.

### Empty block list

`addAllowedApplication()` with **zero** packages means “capture **every** app”,
which would blackhole the whole phone. If the VPN is ON and nothing is blocked,
the service allows **only our own package** into the TUN (we generate no user
traffic). Everyone else keeps the real network. The persistent notification still
shows `0 apps blocked`.

### Reloading the block list without killing the process

`Builder.establish()` must be called again when the allowed set changes.
`NetBlockVpnService` handles `ACTION_RELOAD`:

1. Stop the drain thread.
2. Close the old `ParcelFileDescriptor`.
3. Build a new TUN with the current block list.
4. Keep the same foreground service / notification (updated count).

The process stays alive. There is a very short window (tens of milliseconds)
during the swap where a blocked app might sneak a packet out. This is an Android
limitation, not something we hide.

## Toggle semantics (internal model)

```kotlin
data class AppRule(
    val id: String,            // "instagram"
    val packageName: String,   // default com.instagram.android, user-overridable
    val blocked: Boolean,      // true  == Toggle ON  == no internet
)
```

UI copy next to every switch: **ON = Block Internet**.

Effective block (what actually happens):

```
actuallyBlocked = vpnRunning && vpnPermissionGranted && blocked && appInstalled
```

If the user refuses the VPN permission, toggles stay stored but the UI **must
not** claim the app is blocked.

## Service lifecycle

```
Main / Widget / Boot / Notification
        │
        ▼
 VpnController.start|stop|reload
        │
        ▼
 NetBlockVpnService  (foreground, type=specialUse)
        │
        ├─ VpnService.prepare() already granted?  → establish()
        ├─ prepare() needed?                      → open MainActivity
        ├─ establish() == null                    → ANOTHER_VPN / denied
        └─ onRevoke()                             → user tore the VPN down
```

- `START_STICKY` so Android can restart us after a crash.
- `onRevoke()` clears `vpnRunning`, updates the widget, and does **not** pretend
  apps are still blocked.
- Persistent low-importance notification: `NetBlock is active` + `N apps blocked`,
  actions **Open App** and **Stop VPN**.

## Persistence

`SharedPreferences` (`netblock_prefs`), not a server:

| Key | Meaning |
|---|---|
| `vpn_enabled` | User wants the VPN on |
| `blocked_<id>` | Toggle for that managed app |
| `package_<id>` | Override package name |
| `onboarding_done` | First-run flow completed |

Survives process death and reboot. After `BOOT_COMPLETED` a receiver starts the
foreground service **only if** `vpn_enabled == true`. Android may still delay or
refuse a VPN start until the user unlocks the device; that is disclosed, not
worked around.

## Widget

A real `AppWidgetProvider` (not a shortcut). Clicks send explicit broadcasts to
`WidgetActionReceiver`, which writes preferences and calls `VpnController.reload()`.
If VPN permission has never been granted, the widget opens the activity instead
of lying.

## Battery

- No polling loops, no periodic widget updates (`updatePeriodMillis = 0`).
- Only blocked apps’ packets ever hit userspace, and they are discarded on a
  blocking `read()`.
- Notification channel importance is `LOW`.
- No analytics, no network of our own.

## What this architecture cannot do (honest limits)

1. **Another VPN cannot run at the same time.** Android allows one `VpnService`.
2. **Always-on “Block connections without VPN” (lockdown)** would also kill
   Chrome and every other app, because those apps are intentionally *outside*
   our TUN. The UI warns about this. Always-on *without* lockdown is fine.
3. **Work profile / cloned / dual apps** use different package names or UIDs.
   The user can edit the package name in Settings.
4. **Facebook Messenger / Lite / Instagram Lite** are different packages.
   Only the configured package is blocked.
5. **OEM system apps** sometimes bypass the VPN. We cannot fix that without root.
6. **Very early boot** (before our process starts) is unprotected.
7. **WebView / Custom Tabs** traffic belongs to the host app (e.g. Chrome),
   not to Instagram.

None of these are silently ignored in the UI.

## Mapping to the required tests

| Test | Expected with this architecture |
|---|---|
| 1 Instagram ON | Instagram UID is the only (or one of the) allowed apps → blackholed |
| 2 Instagram OFF | Instagram not in allowed list → real network |
| 3 Instagram ON, Telegram OFF | Instagram blocked, Telegram has internet (spec example; the written “both have internet” line contradicts the ON=block rule and is treated as a typo) |
| 4 both ON | both packages allowed into TUN → both blackholed |
| 5 Instagram ON, Chrome not in list | Chrome never enters the TUN → Chrome works |
| 6 VPN Stop | `close()` TUN, `stopSelf()` → everyone back to normal |
| 7 reboot | prefs survive; we *try* to restart the VPN after boot |
| 8 / 9 Wi-Fi and mobile | the TUN is bound to the device, not to one transport |

## Privacy

No telemetry. No accounts. Packets of blocked apps are read only to be thrown
away. Packet payloads are never parsed, logged, or stored.
