package app.netblock.widget.vpn

import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.ServiceCompat
import app.netblock.widget.data.BlockPreferences
import app.netblock.widget.data.isPackageInstalled
import app.netblock.widget.notify.Notifications
import app.netblock.widget.widget.NetBlockWidgetProvider
import java.io.FileInputStream
import java.io.IOException
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Local blackhole VPN.
 *
 * Blocked apps are added with [Builder.addAllowedApplication] so only their
 * sockets are routed into this TUN. Packets are drained and discarded. Every
 * other app on the device keeps the real Wi-Fi / mobile network.
 */
class NetBlockVpnService : VpnService() {

    private val lock = Any()
    private var tunInterface: ParcelFileDescriptor? = null
    private var drainThread: Thread? = null
    private val stopping = AtomicBoolean(false)

    override fun onCreate() {
        super.onCreate()
        Notifications.ensureChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        // Always promote to foreground first. Android 8+ / 12+ / 14 kill an
        // FGS that does not call startForeground promptly, including STOP.
        val previewCount = BlockPreferences(this).blockedCount()
        startAsForeground(previewCount)

        return when (action) {
            ACTION_STOP -> {
                BlockPreferences(this).vpnEnabled = false
                tearDown(markUnexpected = false)
                VpnRuntime.markStopped(permissionGranted = VpnController.hasPermission(this))
                NetBlockWidgetProvider.refreshAll(this)
                stopForegroundCompat()
                stopSelf()
                START_NOT_STICKY
            }

            ACTION_RELOAD -> {
                if (!BlockPreferences(this).vpnEnabled) {
                    tearDown(markUnexpected = false)
                    stopForegroundCompat()
                    stopSelf()
                    START_NOT_STICKY
                } else {
                    val ok = establishTun()
                    if (!ok) {
                        stopForegroundCompat()
                        stopSelf()
                        START_NOT_STICKY
                    } else {
                        START_STICKY
                    }
                }
            }

            else -> {
                BlockPreferences(this).vpnEnabled = true
                val ok = establishTun()
                if (!ok) {
                    stopForegroundCompat()
                    stopSelf()
                    START_NOT_STICKY
                } else {
                    START_STICKY
                }
            }
        }
    }

    override fun onRevoke() {
        super.onRevoke()
        BlockPreferences(this).vpnEnabled = false
        tearDown(markUnexpected = false)
        VpnRuntime.markStopped(error = VpnError.STOPPED_UNEXPECTEDLY, permissionGranted = false)
        NetBlockWidgetProvider.refreshAll(this)
        stopForegroundCompat()
        stopSelf()
    }

    override fun onDestroy() {
        tearDown(markUnexpected = BlockPreferences(this).vpnEnabled)
        if (BlockPreferences(this).vpnEnabled && !stopping.get()) {
            VpnRuntime.markStopped(error = VpnError.STOPPED_UNEXPECTEDLY)
        }
        NetBlockWidgetProvider.refreshAll(this)
        super.onDestroy()
    }

    private fun establishTun(): Boolean {
        if (!VpnController.hasPermission(this)) {
            VpnRuntime.markStopped(error = VpnError.PERMISSION_DENIED, permissionGranted = false)
            NetBlockWidgetProvider.refreshAll(this)
            return false
        }

        val prefs = BlockPreferences(this)
        val wanted = prefs.snapshot()
            .filter { it.blocked }
            .map { it.packageName }
            .distinct()

        val installedBlocked = wanted.filter { isPackageInstalled(it) }

        synchronized(lock) {
            closeTunLocked()

            val builder = Builder()
                .setSession(SESSION)
                .setMtu(MTU)
                .setBlocking(true)
                .addAddress(IPV4_ADDR, 32)
                .addAddress(IPV6_ADDR, 128)
                .addRoute("0.0.0.0", 0)
                .addRoute("::", 0)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                builder.setMetered(false)
            }

            var allowed = 0
            if (installedBlocked.isEmpty()) {
                // Zero allowed apps would capture the entire device. Pin the
                // TUN to ourselves so everyone else keeps the real network.
                try {
                    builder.addAllowedApplication(packageName)
                    allowed = 0
                } catch (e: PackageManager.NameNotFoundException) {
                    Log.e(TAG, "Could not allow self", e)
                    VpnRuntime.markStopped(error = VpnError.ESTABLISH_FAILED, permissionGranted = true)
                    NetBlockWidgetProvider.refreshAll(this)
                    return false
                }
            } else {
                for (pkg in installedBlocked) {
                    try {
                        builder.addAllowedApplication(pkg)
                        allowed += 1
                    } catch (e: PackageManager.NameNotFoundException) {
                        Log.w(TAG, "Skip missing package $pkg", e)
                    }
                }
                if (allowed == 0) {
                    try {
                        builder.addAllowedApplication(packageName)
                    } catch (_: PackageManager.NameNotFoundException) {
                        VpnRuntime.markStopped(error = VpnError.ESTABLISH_FAILED, permissionGranted = true)
                        NetBlockWidgetProvider.refreshAll(this)
                        return false
                    }
                }
            }

            val pfd = try {
                builder.establish()
            } catch (t: Throwable) {
                Log.e(TAG, "establish() threw", t)
                null
            }

            if (pfd == null) {
                // Permission vanished, or another VPN owns the stack.
                val error = if (VpnController.hasPermission(this)) {
                    VpnError.ANOTHER_VPN
                } else {
                    VpnError.PERMISSION_DENIED
                }
                VpnRuntime.markStopped(error = error, permissionGranted = error != VpnError.PERMISSION_DENIED)
                NetBlockWidgetProvider.refreshAll(this)
                return false
            }

            tunInterface = pfd
            startDrainerLocked(pfd)
            startAsForeground(allowed)
            VpnRuntime.markRunning(allowed)
            NetBlockWidgetProvider.refreshAll(this)
            return true
        }
    }

    private fun startDrainerLocked(pfd: ParcelFileDescriptor) {
        val thread = Thread({
            val fd = pfd.fileDescriptor
            val input = FileInputStream(fd)
            val buffer = ByteArray(32767)
            try {
                while (!Thread.currentThread().isInterrupted) {
                    val read = try {
                        input.read(buffer)
                    } catch (_: IOException) {
                        break
                    }
                    if (read < 0) break
                    // Drop. This is the firewall.
                }
            } finally {
                runCatching { input.close() }
            }
        }, "netblock-tun-drain")
        thread.isDaemon = true
        drainThread = thread
        thread.start()
    }

    private fun tearDown(markUnexpected: Boolean) {
        stopping.set(true)
        synchronized(lock) {
            closeTunLocked()
        }
        if (markUnexpected) {
            VpnRuntime.markStopped(error = VpnError.STOPPED_UNEXPECTEDLY)
        }
    }

    private fun closeTunLocked() {
        val thread = drainThread
        drainThread = null
        val pfd = tunInterface
        tunInterface = null
        runCatching { pfd?.close() }
        thread?.interrupt()
        if (thread != null && thread != Thread.currentThread()) {
            runCatching { thread.join(400) }
        }
    }

    private fun startAsForeground(blockedCount: Int) {
        val notification = Notifications.build(this, blockedCount)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ServiceCompat.startForeground(
                this,
                Notifications.NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
            )
        } else {
            startForeground(Notifications.NOTIFICATION_ID, notification)
        }
    }

    private fun stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(Service.STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
    }

    companion object {
        private const val TAG = "NetBlockVpn"
        const val ACTION_START = "app.netblock.widget.action.START"
        const val ACTION_STOP = "app.netblock.widget.action.STOP"
        const val ACTION_RELOAD = "app.netblock.widget.action.RELOAD"
        const val SESSION = "NetBlock"
        const val MTU = 1280
        const val IPV4_ADDR = "10.255.255.1"
        const val IPV6_ADDR = "fd00:1:fd00:1:fd00:1:fd00:1"
    }
}
