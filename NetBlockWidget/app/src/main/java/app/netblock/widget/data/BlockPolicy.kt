package app.netblock.widget.data

/**
 * Pure rules used by the UI, widget, notification and unit tests.
 * [blocked] is the user toggle: true means "ON = Block Internet".
 */
object BlockPolicy {

    fun actuallyBlocked(
        vpnRunning: Boolean,
        permissionGranted: Boolean,
        blocked: Boolean,
        installed: Boolean,
    ): Boolean = vpnRunning && permissionGranted && blocked && installed

    fun statusLine(vpnRunning: Boolean, blockedCount: Int): String {
        if (!vpnRunning) return "VPN is off — blocking inactive"
        val noun = if (blockedCount == 1) "app" else "apps"
        return "$blockedCount $noun blocked"
    }

    fun widgetToggleLabel(blocked: Boolean): String = if (blocked) "ON" else "OFF"

    fun vpnMasterLabel(running: Boolean): String = if (running) "VPN: ON" else "VPN: OFF"
}
