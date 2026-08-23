package app.netblock.widget.ui

import android.app.Application
import android.content.SharedPreferences
import androidx.lifecycle.AndroidViewModel
import app.netblock.widget.data.AppRule
import app.netblock.widget.data.BlockPolicy
import app.netblock.widget.data.BlockPreferences
import app.netblock.widget.data.isPackageInstalled
import app.netblock.widget.vpn.VpnController
import app.netblock.widget.vpn.VpnError
import app.netblock.widget.vpn.VpnRuntime
import app.netblock.widget.vpn.VpnRuntimeState
import app.netblock.widget.widget.NetBlockWidgetProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class AppRowState(
    val rule: AppRule,
    val installed: Boolean,
    val actuallyBlocked: Boolean,
)

data class UiState(
    val onboardingDone: Boolean = false,
    val vpnWanted: Boolean = false,
    val vpnRunning: Boolean = false,
    val permissionGranted: Boolean = false,
    val rows: List<AppRowState> = emptyList(),
    val statusLine: String = "",
    val lastError: VpnError? = null,
    val screen: Screen = Screen.Main,
)

enum class Screen { Main, Settings }

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = BlockPreferences(application)
    private val _ui = MutableStateFlow(UiState())
    val ui: StateFlow<UiState> = _ui.asStateFlow()

    private val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, _ ->
        refresh()
    }

    init {
        prefs.register(listener)
        refresh()
    }

    override fun onCleared() {
        prefs.unregister(listener)
        super.onCleared()
    }

    fun refresh(runtime: VpnRuntimeState = VpnRuntime.state.value) {
        _ui.value = buildState(runtime)
    }

    fun finishOnboarding() {
        prefs.onboardingDone = true
        refresh()
    }

    fun setBlocked(appId: String, blocked: Boolean) {
        prefs.setBlocked(appId, blocked)
        if (prefs.vpnEnabled) {
            VpnController.reload(getApplication())
        }
        NetBlockWidgetProvider.refreshAll(getApplication())
        refresh()
    }

    fun setPackageName(appId: String, packageName: String) {
        prefs.setPackageName(appId, packageName)
        if (prefs.vpnEnabled) {
            VpnController.reload(getApplication())
        }
        NetBlockWidgetProvider.refreshAll(getApplication())
        refresh()
    }

    fun resetPackage(appId: String) {
        setPackageName(appId, "")
    }

    fun requestStartVpn() {
        VpnController.start(getApplication())
        NetBlockWidgetProvider.refreshAll(getApplication())
        refresh()
    }

    fun stopVpn() {
        VpnController.stop(getApplication())
        NetBlockWidgetProvider.refreshAll(getApplication())
        refresh()
    }

    fun onVpnPermissionResult(granted: Boolean) {
        VpnRuntime.markPermission(granted)
        if (granted) {
            VpnController.start(getApplication())
        } else {
            BlockPreferences(getApplication()).vpnEnabled = false
            VpnRuntime.markStopped(error = VpnError.PERMISSION_DENIED, permissionGranted = false)
        }
        NetBlockWidgetProvider.refreshAll(getApplication())
        refresh()
    }

    fun openSettings() {
        _ui.value = _ui.value.copy(screen = Screen.Settings)
    }

    fun openMain() {
        _ui.value = _ui.value.copy(screen = Screen.Main)
    }

    private fun buildState(runtime: VpnRuntimeState): UiState {
        val app = getApplication<Application>()
        val rows = prefs.snapshot().map { rule ->
            val installed = app.isPackageInstalled(rule.packageName)
            AppRowState(
                rule = rule,
                installed = installed,
                actuallyBlocked = BlockPolicy.actuallyBlocked(
                    vpnRunning = runtime.running,
                    permissionGranted = runtime.permissionGranted,
                    blocked = rule.blocked,
                    installed = installed,
                ),
            )
        }
        val effective = rows.count { it.actuallyBlocked }
        return UiState(
            onboardingDone = prefs.onboardingDone,
            vpnWanted = prefs.vpnEnabled,
            vpnRunning = runtime.running,
            permissionGranted = runtime.permissionGranted,
            rows = rows,
            statusLine = BlockPolicy.statusLine(runtime.running, effective),
            lastError = runtime.lastError,
            screen = _ui.value.screen,
        )
    }
}
