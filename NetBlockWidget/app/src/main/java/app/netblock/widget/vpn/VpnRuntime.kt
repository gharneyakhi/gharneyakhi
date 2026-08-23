package app.netblock.widget.vpn

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class VpnError {
    PERMISSION_DENIED,
    ANOTHER_VPN,
    ESTABLISH_FAILED,
    STOPPED_UNEXPECTEDLY,
}

data class VpnRuntimeState(
    val running: Boolean = false,
    val permissionGranted: Boolean = false,
    val effectiveBlockedCount: Int = 0,
    val lastError: VpnError? = null,
)

/**
 * Process-wide state so Compose, the widget and the notification can all
 * observe the real VPN, not the user's last toggle.
 */
object VpnRuntime {
    private val _state = MutableStateFlow(VpnRuntimeState())
    val state: StateFlow<VpnRuntimeState> = _state.asStateFlow()

    @Synchronized
    fun update(transform: (VpnRuntimeState) -> VpnRuntimeState) {
        _state.value = transform(_state.value)
    }

    fun markRunning(blockedCount: Int) {
        update {
            it.copy(
                running = true,
                permissionGranted = true,
                effectiveBlockedCount = blockedCount,
                lastError = null,
            )
        }
    }

    fun markStopped(error: VpnError? = null, permissionGranted: Boolean? = null) {
        update {
            it.copy(
                running = false,
                effectiveBlockedCount = 0,
                lastError = error,
                permissionGranted = permissionGranted ?: it.permissionGranted,
            )
        }
    }

    fun markPermission(granted: Boolean) {
        update {
            it.copy(
                permissionGranted = granted,
                lastError = if (granted) it.lastError else VpnError.PERMISSION_DENIED,
            )
        }
    }
}
