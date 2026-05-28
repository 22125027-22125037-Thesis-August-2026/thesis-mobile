package com.thesisapp.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import androidx.core.content.ContextCompat
import com.thesisapp.MainActivity
import com.thesisapp.R
import com.thesisapp.widget.data.WidgetPrefs
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

object MoodWidgetRenderer {

    fun renderAll(context: Context) {
        val mgr = AppWidgetManager.getInstance(context)
        val ids = mgr.getAppWidgetIds(ComponentName(context, MoodWidgetProvider::class.java))
        if (ids.isEmpty()) return
        render(context, mgr, ids)
    }

    fun render(context: Context, mgr: AppWidgetManager, widgetIds: IntArray) {
        val snapshot = WidgetPrefs.getSnapshot(context)
        for (widgetId in widgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_mood)
            bindContent(context, views, snapshot)
            bindTap(context, views, snapshot)
            mgr.updateAppWidget(widgetId, views)
        }
    }

    private fun bindContent(context: Context, views: RemoteViews, snap: WidgetPrefs.WidgetSnapshot) {
        val isAuthed = !snap.authToken.isNullOrBlank()

        if (!isAuthed) {
            views.setInt(R.id.widget_root, "setBackgroundResource", R.drawable.widget_bg_default)
            views.setImageViewResource(R.id.widget_mood_icon, R.drawable.ic_mood_default)
            views.setInt(R.id.widget_mood_icon, "setColorFilter", 0)
            views.setTextViewText(R.id.widget_mood_label, "")
            views.setTextViewText(R.id.widget_streak_text, "")
            views.setTextViewText(R.id.widget_motivational_text, context.getString(R.string.widget_not_authed))
            val dimmed = ContextCompat.getColor(context, R.color.widget_emoji_dimmed)
            views.setTextColor(R.id.widget_motivational_text, dimmed)
            return
        }

        val today = LocalDate.now()
        val todayStr = today.toString()

        val loggedToday = when {
            snap.lastMoodAtMs > 0L -> Instant.ofEpochMilli(snap.lastMoodAtMs)
                .atZone(ZoneId.systemDefault()).toLocalDate() == today
            else -> snap.streakAsOf == todayStr && snap.streakCount > 0
        }

        // Background — tinted by last mood
        views.setInt(R.id.widget_root, "setBackgroundResource", bgResForTag(snap.lastMoodTag))

        // Mood icon + label
        if (!snap.lastMoodTag.isNullOrBlank()) {
            views.setImageViewResource(R.id.widget_mood_icon, iconResForTag(snap.lastMoodTag))
            views.setInt(R.id.widget_mood_icon, "setColorFilter", 0)
            val tintColor = ContextCompat.getColor(context, tintColorResForTag(snap.lastMoodTag))
            views.setTextViewText(R.id.widget_mood_label, context.getString(labelResForTag(snap.lastMoodTag)))
            views.setTextColor(R.id.widget_mood_label, tintColor)
        } else {
            views.setImageViewResource(R.id.widget_mood_icon, R.drawable.ic_mood_default)
            views.setInt(R.id.widget_mood_icon, "setColorFilter", 0)
            val dimmed = ContextCompat.getColor(context, R.color.widget_emoji_dimmed)
            views.setTextViewText(R.id.widget_mood_label, context.getString(R.string.widget_no_entry_yet))
            views.setTextColor(R.id.widget_mood_label, dimmed)
        }

        // Streak
        val streakActive = snap.streakAsOf == todayStr && snap.streakCount > 0
        val streakColor = ContextCompat.getColor(
            context,
            if (streakActive) R.color.widget_streak_active else R.color.widget_text_muted,
        )
        val streakText = when {
            snap.streakCount <= 0 -> context.getString(R.string.widget_streak_none)
            streakActive -> context.getString(R.string.widget_streak_active, snap.streakCount)
            else -> context.getString(R.string.widget_streak_inactive, snap.streakCount)
        }
        views.setTextViewText(R.id.widget_streak_text, streakText)
        views.setTextColor(R.id.widget_streak_text, streakColor)

        // CTA
        val cta = motivationalText(context, snap, loggedToday)
        views.setTextViewText(R.id.widget_motivational_text, cta)
        views.setTextColor(
            R.id.widget_motivational_text,
            ContextCompat.getColor(context, R.color.widget_text_secondary),
        )
    }

    private fun bindTap(context: Context, views: RemoteViews, snap: WidgetPrefs.WidgetSnapshot) {
        val target = if (!snap.authToken.isNullOrBlank()) "diary-new" else "login"
        views.setOnClickPendingIntent(R.id.widget_root, openAppPendingIntent(context, target))
    }

    private fun motivationalText(
        context: Context,
        snap: WidgetPrefs.WidgetSnapshot,
        loggedToday: Boolean,
    ): String {
        if (snap.lastMoodTag.isNullOrBlank()) return context.getString(R.string.widget_cta_first)
        if (loggedToday) {
            return if (snap.streakCount >= 2) {
                context.getString(R.string.widget_cta_streak, snap.streakCount)
            } else {
                context.getString(R.string.widget_cta_logged_today)
            }
        }
        return when (snap.lastMoodTag.uppercase()) {
            "EXCELLENT", "GOOD" -> context.getString(R.string.widget_cta_good_yesterday)
            "NEUTRAL" -> context.getString(R.string.widget_cta_neutral_yesterday)
            else -> context.getString(R.string.widget_cta_bad_yesterday)
        }
    }

    private fun bgResForTag(tag: String?): Int = when (tag?.uppercase()) {
        "TERRIBLE" -> R.drawable.widget_bg_terrible
        "BAD" -> R.drawable.widget_bg_bad
        "NEUTRAL" -> R.drawable.widget_bg_neutral
        "GOOD" -> R.drawable.widget_bg_good
        "EXCELLENT" -> R.drawable.widget_bg_excellent
        else -> R.drawable.widget_bg_default
    }

    private fun iconResForTag(tag: String): Int = when (tag.uppercase()) {
        "TERRIBLE" -> R.drawable.ic_mood_terrible
        "BAD" -> R.drawable.ic_mood_bad
        "NEUTRAL" -> R.drawable.ic_mood_neutral
        "GOOD" -> R.drawable.ic_mood_good
        "EXCELLENT" -> R.drawable.ic_mood_excellent
        else -> R.drawable.ic_mood_neutral
    }

    private fun tintColorResForTag(tag: String): Int = when (tag.uppercase()) {
        "TERRIBLE" -> R.color.widget_emoji_tint_terrible
        "BAD" -> R.color.widget_emoji_tint_bad
        "NEUTRAL" -> R.color.widget_emoji_tint_neutral
        "GOOD" -> R.color.widget_emoji_tint_good
        "EXCELLENT" -> R.color.widget_emoji_tint_excellent
        else -> R.color.widget_emoji_tint_neutral
    }

    private fun labelResForTag(tag: String): Int = when (tag.uppercase()) {
        "TERRIBLE" -> R.string.widget_mood_terrible
        "BAD" -> R.string.widget_mood_bad
        "NEUTRAL" -> R.string.widget_mood_neutral
        "GOOD" -> R.string.widget_mood_good
        "EXCELLENT" -> R.string.widget_mood_excellent
        else -> R.string.widget_mood_neutral
    }

    private fun openAppPendingIntent(context: Context, target: String): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("umatter://widget/open/$target")
            putExtra("widget_deep_link", target)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        return PendingIntent.getActivity(
            context,
            target.hashCode() and 0xFFFF,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
