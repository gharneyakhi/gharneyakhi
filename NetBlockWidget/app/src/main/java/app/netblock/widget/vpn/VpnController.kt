package app.netblock.widget.vpn

import android.content.Context
import android.content.Intent
import android.net.VpnService
import androidx.core.content.ContextCompat
import app.netblock.widget.data.BlockPreferences

object VpnController {

    fun prepareIntent(context: Context): Intent? = VpnService.prepare(context)

    fun hasPermission(context: Context): Boolean = VpnService.prepare(context) == null

    fun start(context: Context) {
        val prefs = BlockPreferences(context)
        prefs.vpnEnabled = true
        if (!hasPermission(context)) {
            VpnRuntime.markPermission(false)
            return
        }
        VpnRuntime.markPermission(true)
        ContextCompat.startForegroundService(context, intent(context, NetBlockVpnService.ACTION_START))
    }

    fun stop(context: Context) {
        BlockPreferences(context).vpnEnabled = false
        val running = Intent(context, NetBlockVpnService::class.java).apply {
            action = NetBlockVpnService.ACTION_STOP
        }
        // Must go through startForegroundService because Android 12+ may have
        // started us as a FGS; the service calls startForeground then stops.
        ContextCompat.startForegroundService(context, running)
    }

    fun reload(context: Context) {
        if (!BlockPreferences(context).vpnEnabled) return
        if (!hasPermission(context)) {
            VpnRuntime.markPermission(false)
            return
        }
        ContextCompat.startForegroundService(context, intent(context, NetBlockVpnService.ACTION_RELOAD))
    }

    fun startIfEnabled(context: Context) {
        if (BlockPreferences(context).vpnEnabled) start(context)
    }

    private fun intent(context: Context, action: String): Intent =
        Intent(context, NetBlockVpnService::class.java).apply { this.action = action }
}
