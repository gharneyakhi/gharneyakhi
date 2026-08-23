package app.netblock.widget.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import app.netblock.widget.MainActivity
import app.netblock.widget.R
import app.netblock.widget.data.AppRule
import app.netblock.widget.data.BlockPolicy
import app.netblock.widget.data.BlockPreferences
import app.netblock.widget.data.isPackageInstalled
import app.netblock.widget.vpn.VpnController
import app.netblock.widget.vpn.VpnRuntime

class NetBlockWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        val views = buildViews(context)
        for (id in appWidgetIds) {
            appWidgetManager.updateAppWidget(id, views)
        }
    }

    companion object {
        fun refreshAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, NetBlockWidgetProvider::class.java),
            )
            if (ids.isEmpty()) return
            manager.updateAppWidget(ids, buildViews(context))
        }

        private fun buildViews(context: Context): RemoteViews {
            val prefs = BlockPreferences(context)
            val running = VpnRuntime.state.value.running && VpnController.hasPermission(context)
            val rules = prefs.snapshot()
            val blockedCount = rules.count { it.blocked && context.isPackageInstalled(it.packageName) }

            val views = RemoteViews(context.packageName, R.layout.widget_netblock)
            views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_name))
            views.setTextViewText(
                R.id.widget_status,
                BlockPolicy.statusLine(running, blockedCount),
            )
            views.setTextViewText(R.id.widget_hint, context.getString(R.string.toggle_hint))

            bindRow(context, views, rules[0], R.id.row_name_0, R.id.row_sub_0, R.id.row_toggle_0)
            bindRow(context, views, rules[1], R.id.row_name_1, R.id.row_sub_1, R.id.row_toggle_1)
            bindRow(context, views, rules[2], R.id.row_name_2, R.id.row_sub_2, R.id.row_toggle_2)
            bindRow(context, views, rules[3], R.id.row_name_3, R.id.row_sub_3, R.id.row_toggle_3)

            views.setTextViewText(R.id.vpn_button, BlockPolicy.vpnMasterLabel(running))
            views.setInt(
                R.id.vpn_button,
                "setBackgroundResource",
                if (running) R.drawable.widget_vpn_on else R.drawable.widget_vpn_off,
            )
            views.setOnClickPendingIntent(
                R.id.vpn_button,
                broadcast(context, 100, WidgetActionReceiver.ACTION_TOGGLE_VPN, null),
            )
            views.setOnClickPendingIntent(R.id.widget_header, activity(context))
            return views
        }

        private fun bindRow(
            context: Context,
            views: RemoteViews,
            rule: AppRule,
            nameId: Int,
            subId: Int,
            toggleId: Int,
        ) {
            val installed = context.isPackageInstalled(rule.packageName)
            views.setTextViewText(nameId, rule.displayName)
            if (!installed) {
                views.setViewVisibility(subId, View.VISIBLE)
                views.setTextViewText(
                    subId,
                    context.getString(R.string.not_installed_short, rule.displayName),
                )
            } else {
                views.setViewVisibility(subId, View.GONE)
            }
            views.setTextViewText(toggleId, BlockPolicy.widgetToggleLabel(rule.blocked))
            views.setInt(
                toggleId,
                "setBackgroundResource",
                if (rule.blocked) R.drawable.widget_toggle_on else R.drawable.widget_toggle_off,
            )
            views.setOnClickPendingIntent(
                toggleId,
                broadcast(
                    context,
                    rule.id.hashCode(),
                    WidgetActionReceiver.ACTION_TOGGLE_APP,
                    rule.id,
                ),
            )
        }

        private fun broadcast(
            context: Context,
            requestCode: Int,
            action: String,
            appId: String?,
        ): PendingIntent {
            val intent = Intent(context, WidgetActionReceiver::class.java).apply {
                this.action = action
                if (appId != null) putExtra(WidgetActionReceiver.EXTRA_APP_ID, appId)
            }
            return PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
        }

        private fun activity(context: Context): PendingIntent {
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            return PendingIntent.getActivity(
                context,
                10,
                intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
        }
    }
}
