package app.netblock.widget.boot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import app.netblock.widget.data.BlockPreferences
import app.netblock.widget.vpn.VpnController
import app.netblock.widget.widget.NetBlockWidgetProvider

/**
 * Restarts the local VPN after reboot or an app update, only if the user left
 * it enabled. We never try to bypass Android's VPN / background limits.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        if (action != Intent.ACTION_BOOT_COMPLETED &&
            action != Intent.ACTION_MY_PACKAGE_REPLACED
        ) {
            return
        }
        val prefs = BlockPreferences(context)
        if (prefs.vpnEnabled && VpnController.hasPermission(context)) {
            VpnController.start(context)
        }
        NetBlockWidgetProvider.refreshAll(context)
    }
}
