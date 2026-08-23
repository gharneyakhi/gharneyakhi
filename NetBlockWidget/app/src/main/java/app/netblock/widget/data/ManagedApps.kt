package app.netblock.widget.data

data class ManagedApp(
    val id: String,
    val displayName: String,
    val defaultPackage: String,
)

object ManagedApps {
    const val INSTAGRAM = "instagram"
    const val FACEBOOK = "facebook"
    const val TELEGRAM = "telegram"
    const val WHATSAPP = "whatsapp"

    val defaults: List<ManagedApp> = listOf(
        ManagedApp(INSTAGRAM, "Instagram", "com.instagram.android"),
        ManagedApp(FACEBOOK, "Facebook", "com.facebook.katana"),
        ManagedApp(TELEGRAM, "Telegram", "org.telegram.messenger"),
        ManagedApp(WHATSAPP, "WhatsApp", "com.whatsapp"),
    )

    fun byId(id: String): ManagedApp =
        defaults.firstOrNull { it.id == id }
            ?: error("Unknown managed app id: $id")
}
