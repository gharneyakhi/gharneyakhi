package app.netblock.widget

import android.app.Application
import app.netblock.widget.notify.Notifications
import app.netblock.widget.vpn.VpnController
import app.netblock.widget.vpn.VpnRuntime

class NetBlockApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Notifications.ensureChannel(this)
        VpnRuntime.markPermission(VpnController.hasPermission(this))
    }
}
