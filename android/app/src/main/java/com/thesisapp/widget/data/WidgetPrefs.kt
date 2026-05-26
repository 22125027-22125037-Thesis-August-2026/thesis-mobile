package com.thesisapp.widget.data

import android.content.Context
import android.content.SharedPreferences

object WidgetPrefs {
    private const val PREFS_NAME = "umatter_widget_prefs"

    private const val KEY_AUTH_TOKEN = "auth_token"
    private const val KEY_PROFILE_ID = "profile_id"
    private const val KEY_BASE_URL = "base_url"
    private const val KEY_LAST_MOOD_TAG = "last_mood_tag"
    private const val KEY_LAST_MOOD_AT = "last_mood_at"
    private const val KEY_STREAK_COUNT = "streak_count"
    private const val KEY_STREAK_AS_OF = "streak_as_of"
    private const val KEY_CACHE_UPDATED_AT = "cache_updated_at"

    data class WidgetSnapshot(
        val authToken: String?,
        val profileId: String?,
        val baseUrl: String?,
        val lastMoodTag: String?,
        val lastMoodAtMs: Long,
        val streakCount: Int,
        val streakAsOf: String?,
        val cacheUpdatedAtMs: Long,
    )

    private fun prefs(context: Context): SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun setAuth(context: Context, token: String, profileId: String, baseUrl: String) {
        prefs(context).edit()
            .putString(KEY_AUTH_TOKEN, token)
            .putString(KEY_PROFILE_ID, profileId)
            .putString(KEY_BASE_URL, baseUrl)
            .apply()
    }

    fun clearAuth(context: Context) {
        prefs(context).edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_PROFILE_ID)
            .remove(KEY_LAST_MOOD_TAG)
            .remove(KEY_LAST_MOOD_AT)
            .remove(KEY_STREAK_COUNT)
            .remove(KEY_STREAK_AS_OF)
            .apply()
    }

    fun setLastMood(context: Context, moodTag: String, atMs: Long) {
        prefs(context).edit()
            .putString(KEY_LAST_MOOD_TAG, moodTag)
            .putLong(KEY_LAST_MOOD_AT, atMs)
            .putLong(KEY_CACHE_UPDATED_AT, System.currentTimeMillis())
            .apply()
    }

    fun setStreak(context: Context, count: Int, asOfDate: String) {
        prefs(context).edit()
            .putInt(KEY_STREAK_COUNT, count)
            .putString(KEY_STREAK_AS_OF, asOfDate)
            .putLong(KEY_CACHE_UPDATED_AT, System.currentTimeMillis())
            .apply()
    }

    fun getSnapshot(context: Context): WidgetSnapshot {
        val p = prefs(context)
        return WidgetSnapshot(
            authToken = p.getString(KEY_AUTH_TOKEN, null),
            profileId = p.getString(KEY_PROFILE_ID, null),
            baseUrl = p.getString(KEY_BASE_URL, null),
            lastMoodTag = p.getString(KEY_LAST_MOOD_TAG, null),
            lastMoodAtMs = p.getLong(KEY_LAST_MOOD_AT, 0L),
            streakCount = p.getInt(KEY_STREAK_COUNT, 0),
            streakAsOf = p.getString(KEY_STREAK_AS_OF, null),
            cacheUpdatedAtMs = p.getLong(KEY_CACHE_UPDATED_AT, 0L),
        )
    }
}
