package app.netblock.widget.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColors = darkColorScheme(
    primary = Teal,
    onPrimary = Color(0xFF003822),
    primaryContainer = TealContainer,
    onPrimaryContainer = Teal,
    secondary = Color(0xFF9BB0C7),
    onSecondary = Color(0xFF0E1620),
    error = BlockRed,
    onError = Color(0xFF3B0000),
    errorContainer = Color(0xFF4A1818),
    onErrorContainer = BlockRed,
    background = DarkBackground,
    onBackground = DarkOn,
    surface = DarkSurface,
    onSurface = DarkOn,
    surfaceVariant = DarkSurfaceHigh,
    onSurfaceVariant = DarkMuted,
    outline = DarkOutline,
    outlineVariant = Color(0xFF2A3038),
)

private val LightColors = lightColorScheme(
    primary = TealDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD4F5E7),
    onPrimaryContainer = Color(0xFF043024),
    secondary = Color(0xFF3E5163),
    onSecondary = Color.White,
    error = BlockRedDark,
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    background = LightBackground,
    onBackground = LightOn,
    surface = LightSurface,
    onSurface = LightOn,
    surfaceVariant = LightSurfaceHigh,
    onSurfaceVariant = LightMuted,
    outline = LightOutline,
    outlineVariant = Color(0xFFE4E7EC),
)

@Composable
fun NetBlockTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colors = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }

    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content,
    )
}
