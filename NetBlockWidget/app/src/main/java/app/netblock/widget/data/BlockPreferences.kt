package app.netblock.widget.data

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit

/**
 * On-device persistence for toggle state, VPN intent, and overridable package names.
 * SharedPreferences is used so the widget, boot receiver and VPN service can read
 * the same store without a running Activity.
 */
class BlockPreferences(context: Context) {

    private val appContext = context.applicationContext
    private val prefs: SharedPreferences =
        appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var vpnEnabled: Boolean
        get() = prefs.getBoolean(KEY_VPN_ENABLED, false)
        set(value) = prefs.edit { putBoolean(KEY_VPN_ENABLED, value) }

    var onboardingDone: Boolean
        get() = prefs.getBoolean(KEY_ONBOARDING, false)
        set(value) = prefs.edit { putBoolean(KEY_ONBOARDING, value) }

    fun isBlocked(appId: String): Boolean = prefs.getBoolean(keyBlocked(appId), false)

    fun setBlocked(appId: String, blocked: Boolean) {
        prefs.edit { putBoolean(keyBlocked(appId), blocked) }
    }

    fun toggleBlocked(appId: String): Boolean {
        val next = !isBlocked(appId)
        setBlocked(appId, next)
        return next
    }

    fun packageNameOf(app: ManagedApp): String {
        val override = prefs.getString(keyPackage(app.id), null)?.trim()
        return if (override.isNullOrEmpty()) app.defaultPackage else override
    }

    fun packageNameOf(appId: String): String = packageNameOf(ManagedApps.byId(appId))

    fun setPackageName(appId: String, packageName: String) {
        val trimmed = packageName.trim()
        prefs.edit {
            if (trimmed.isEmpty() || trimmed == ManagedApps.byId(appId).defaultPackage) {
                remove(keyPackage(appId))
            } else {
                putString(keyPackage(appId), trimmed)
            }
        }
    }

    fun snapshot(): List<AppRule> = ManagedApps.defaults.map { app ->
        AppRule(
            id = app.id,
            displayName = app.displayName,
            packageName = packageNameOf(app),
            defaultPackage = app.defaultPackage,
            blocked = isBlocked(app.id),
        )
    }

    fun blockedPackageNames(): List<String> =
        snapshot().filter { it.blocked }.map { it.packageName }

    fun blockedCount(): Int = snapshot().count { it.blocked }

    fun register(listener: SharedPreferences.OnSharedPreferenceChangeListener) {
        prefs.registerOnSharedPreferenceChangeListener(listener)
    }

    fun unregister(listener: SharedPreferences.OnSharedPreferenceChangeListener) {
        prefs.unregisterOnSharedPreferenceChangeListener(listener)
    }

    companion object {
        const val PREFS_NAME = "netblock_prefs"
        const val KEY_VPN_ENABLED = "vpn_enabled"
        private const val KEY_ONBOARDING = "onboarding_done"

        fun keyBlocked(id: String) = "blocked_$id"
        fun keyPackage(id: String) = "package_$id"
    }
}

data class AppRule(
    val id: String,
    val displayName: String,
    val packageName: String,
    val defaultPackage: String,
    val blocked: Boolean,
)
