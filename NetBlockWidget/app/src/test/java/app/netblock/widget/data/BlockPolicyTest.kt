package app.netblock.widget.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class BlockPolicyTest {

    @Test
    fun toggleOnMeansBlockedOnlyWhenVpnIsReallyRunning() {
        assertTrue(BlockPolicy.actuallyBlocked(true, true, true, true))
        assertFalse(BlockPolicy.actuallyBlocked(false, true, true, true))
        assertFalse(BlockPolicy.actuallyBlocked(true, false, true, true))
        assertFalse(BlockPolicy.actuallyBlocked(true, true, false, true))
        assertFalse(BlockPolicy.actuallyBlocked(true, true, true, false))
    }

    @Test
    fun statusLineUsesRealVpnState() {
        assertEquals("VPN is off — blocking inactive", BlockPolicy.statusLine(false, 4))
        assertEquals("1 app blocked", BlockPolicy.statusLine(true, 1))
        assertEquals("2 apps blocked", BlockPolicy.statusLine(true, 2))
        assertEquals("0 apps blocked", BlockPolicy.statusLine(true, 0))
    }

    @Test
    fun widgetLabelsMatchToggleContract() {
        assertEquals("ON", BlockPolicy.widgetToggleLabel(true))
        assertEquals("OFF", BlockPolicy.widgetToggleLabel(false))
        assertEquals("VPN: ON", BlockPolicy.vpnMasterLabel(true))
        assertEquals("VPN: OFF", BlockPolicy.vpnMasterLabel(false))
    }

    @Test
    fun defaultPackagesMatchSpec() {
        val map = ManagedApps.defaults.associate { it.id to it.defaultPackage }
        assertEquals("com.instagram.android", map[ManagedApps.INSTAGRAM])
        assertEquals("com.facebook.katana", map[ManagedApps.FACEBOOK])
        assertEquals("org.telegram.messenger", map[ManagedApps.TELEGRAM])
        assertEquals("com.whatsapp", map[ManagedApps.WHATSAPP])
    }
}
