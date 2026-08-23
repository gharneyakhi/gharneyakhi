package app.netblock.widget.ui

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import app.netblock.widget.ui.theme.NetBlockTheme
import app.netblock.widget.vpn.VpnRuntime
import kotlinx.coroutines.flow.collectLatest

@Composable
fun NetBlockAppUi(
    state: UiState,
    viewModel: MainViewModel,
    onRequestVpnPermission: () -> Unit,
) {
    LaunchedEffect(Unit) {
        VpnRuntime.state.collectLatest { viewModel.refresh(it) }
    }

    NetBlockTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            if (!state.onboardingDone) {
                OnboardingScreen(
                    onContinue = {
                        viewModel.finishOnboarding()
                        onRequestVpnPermission()
                    },
                    onSkip = { viewModel.finishOnboarding() },
                )
            } else {
                Crossfade(targetState = state.screen, label = "screen") { screen ->
                    when (screen) {
                        Screen.Main -> MainScreen(
                            state = state,
                            onToggleApp = viewModel::setBlocked,
                            onToggleVpn = { enable ->
                                if (enable) onRequestVpnPermission() else viewModel.stopVpn()
                            },
                            onOpenSettings = viewModel::openSettings,
                        )
                        Screen.Settings -> SettingsScreen(
                            state = state,
                            onBack = viewModel::openMain,
                            onSavePackage = viewModel::setPackageName,
                            onResetPackage = viewModel::resetPackage,
                        )
                    }
                }
            }
        }
    }
}
