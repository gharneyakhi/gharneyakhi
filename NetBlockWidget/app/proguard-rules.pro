# Keep the VPN service and widget entry points. They are referenced from the manifest.
-keep class app.netblock.widget.vpn.NetBlockVpnService { *; }
-keep class app.netblock.widget.widget.NetBlockWidgetProvider { *; }
-keep class app.netblock.widget.widget.WidgetActionReceiver { *; }
-keep class app.netblock.widget.boot.BootReceiver { *; }
-keep class app.netblock.widget.MainActivity { *; }
-keep class app.netblock.widget.NetBlockApp { *; }

-dontwarn javax.lang.model.**
