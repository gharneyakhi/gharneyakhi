package app.netblock.widget.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import app.netblock.widget.MainActivity
import app.netblock.widget.data.BlockPreferences
import app.netblock.widget.data.ManagedApps
import app.netblock.widget.vpn.VpnController

class WidgetActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val prefs = BlockPreferences(context)
        when (intent.action) {
            ACTION_TOGGLE_APP -> {
                val id = intent.getStringExtra(EXTRA_APP_ID) ?: return
                runCatching { ManagedApps.byId(id) }.getOrNull() ?: return
                prefs.toggleBlocked(id)
                if (prefs.vpnEnabled) {
                    if (VpnController.hasPermission(context)) {
                        VpnController.reload(context)
                    } else {
                        openApp(context, requestVpn = true)
                    }
                }
                NetBlockWidgetProvider.refreshAll(context)
            }

            ACTION_TOGGLE_VPN -> {
                if (prefs.vpnEnabled) {
                    VpnController.stop(context)
                    NetBlockWidgetProvider.refreshAll(context)
                } else {
                    if (VpnController.hasPermission(context)) {
                        VpnController.start(context)
                    } else {
                        openApp(context, requestVpn = true)
                    }
                    NetBlockWidgetProvider.refreshAll(context)
                }
            }
        }
    }

    private fun openApp(context: Context, requestVpn: Boolean) {
        val launch = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            if (requestVpn) putExtra(MainActivity.EXTRA_REQUEST_VPN, true)
        }
        context.startActivity(launch)
    }

    companion object {
        const val ACTION_TOGGLE_APP = "app.netblock.widget.action.TOGGLE_APP"
        const val ACTION_TOGGLE_VPN = "app.netblock.widget.action.TOGGLE_VPN"
        const val EXTRA_APP_ID = "app_id"
    }
}
