# Required tests

Internal model: `blocked = true` means Toggle **ON** means **no internet**.

The UI always shows `ON = Block Internet` so this cannot be read backwards.

| # | Setup | Expected | How the architecture guarantees it |
|---|---|---|---|
| 1 | Instagram Block = ON, VPN on | Instagram has no internet | Instagram’s package is the (or one) `addAllowedApplication` target. Its sockets land on the dummy TUN and are dropped. |
| 2 | Instagram Block = OFF, VPN on | Instagram has internet again | Package is removed from the allowed set on `ACTION_RELOAD`. Instagram is no longer in the VPN and uses Wi-Fi / mobile normally. |
| 3 | Instagram = ON, Telegram = OFF | Instagram blocked, Telegram online | Independent allowed-set membership. **Note:** the brief said “both should have internet”, which contradicts the ON=block rule and the worked example in the same brief. Implementation follows the rule and the example, not that one line. |
| 4 | Instagram = ON, Telegram = ON | Both offline | Both packages are allowed into the TUN. |
| 5 | Instagram = ON, Chrome not listed | Chrome still online | Chrome is never passed to `addAllowedApplication`, so it never enters the TUN. |
| 6 | VPN Stop | Every app back to normal | TUN is closed, service stops, the system default network returns for everyone. |
| 7 | Phone restart | Toggles survive | `SharedPreferences`. VPN is restarted from `BootReceiver` only if the user left it on **and** Android still grants `VpnService.prepare() == null`. Some OEMs refuse a silent VPN start; the stored toggles still survive. |
| 8 | Wi-Fi | Blocked app cannot use Wi-Fi | The TUN is device-wide, not transport-specific. Allowed apps lose the real Wi-Fi network. |
| 9 | Mobile data | Blocked app cannot use mobile | Same as 8 for the cellular network. |

## What we run in CI / unit tests

`BlockPolicyTest` locks the toggle contract so the UI cannot claim a block when the VPN is down, permission is missing, or the app is not installed.

A full packet-level run of tests 1–9 needs a physical device or emulator with those apps installed. This sandbox has no Android emulator, so those runs are specified here rather than faked.

## Known Android limits (honest)

- Another VPN already connected → `establish()` returns null → UI shows “Another VPN is active”, and we do **not** pretend apps are blocked.
- System lockdown (“Block connections without VPN”) would also blackhole apps we intentionally left *outside* the TUN. The Settings screen warns against it.
- A few OEM system apps can bypass a userspace VPN. We cannot close that without root.
- There is a tens-of-milliseconds window while the TUN is rebuilt on reload.
