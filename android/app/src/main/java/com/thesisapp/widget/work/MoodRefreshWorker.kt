package com.thesisapp.widget.work

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.thesisapp.widget.MoodWidgetRefresher
import com.thesisapp.widget.data.StreakCalculator
import com.thesisapp.widget.data.WidgetPrefs
import com.thesisapp.widget.util.EntryLite
import com.thesisapp.widget.util.OkHttpProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class MoodRefreshWorker(
    appContext: Context,
    params: WorkerParameters,
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val ctx = applicationContext
        val snapshot = WidgetPrefs.getSnapshot(ctx)
        val token = snapshot.authToken
        val baseUrl = snapshot.baseUrl
        val profileId = snapshot.profileId
        if (token.isNullOrBlank() || baseUrl.isNullOrBlank() || profileId.isNullOrBlank()) {
            return@withContext Result.success()
        }

        val request = Request.Builder()
            .url("${baseUrl.trimEnd('/')}/api/v1/tracking/diaries/$profileId")
            .addHeader("Authorization", "Bearer $token")
            .get()
            .build()

        try {
            OkHttpProvider.client.newCall(request).execute().use { response ->
                if (response.code == 401 || response.code == 403) {
                    WidgetPrefs.clearAuth(ctx)
                    MoodWidgetRefresher.refresh(ctx)
                    return@withContext Result.success()
                }
                if (!response.isSuccessful) {
                    return@withContext if (runAttemptCount < 2) Result.retry() else Result.success()
                }
                val raw = response.body?.string().orEmpty()
                val entries = parseEntries(raw)
                applyEntries(ctx, entries)
                MoodWidgetRefresher.refresh(ctx)
                return@withContext Result.success()
            }
        } catch (_: IOException) {
            return@withContext if (runAttemptCount < 2) Result.retry() else Result.success()
        }
    }

    private fun parseEntries(raw: String): List<EntryLite> {
        if (raw.isBlank()) return emptyList()
        val array: JSONArray = runCatching { JSONArray(raw) }.getOrElse {
            val obj = runCatching { JSONObject(raw) }.getOrNull() ?: return emptyList()
            obj.optJSONArray("data") ?: return emptyList()
        }
        val list = ArrayList<EntryLite>(array.length())
        for (i in 0 until array.length()) {
            val obj = array.optJSONObject(i) ?: continue
            val entryDate = obj.optString("entryDate", "")
            val moodTag = obj.optString("moodTag", null)?.takeIf { it.isNotBlank() }
            val createdAtMs = parseInstantMs(obj.optString("createdAt", ""))
            list.add(EntryLite(entryDate = entryDate, moodTag = moodTag, createdAtMs = createdAtMs))
        }
        return list
    }

    // Handles: "...Z" (UTC), "...+07:00" (OffsetDateTime), "...T..." (LocalDateTime no zone)
    private fun parseInstantMs(value: String): Long {
        if (value.isBlank()) return 0L
        runCatching { return Instant.parse(value).toEpochMilli() }
        runCatching { return OffsetDateTime.parse(value).toInstant().toEpochMilli() }
        runCatching {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
        }
        return 0L
    }

    private fun applyEntries(ctx: Context, entries: List<EntryLite>) {
        val (streak, asOf) = StreakCalculator.fromEntries(entries)
        WidgetPrefs.setStreak(ctx, streak, StreakCalculator.formatDate(asOf))

        val latest = entries
            .filter { !it.moodTag.isNullOrBlank() }
            .maxByOrNull { effectiveMs(it) }

        if (latest != null) {
            WidgetPrefs.setLastMood(ctx, latest.moodTag!!, effectiveMs(latest))
        }
    }

    // Use createdAtMs if valid, else derive from entryDate (start-of-day local)
    private fun effectiveMs(e: EntryLite): Long {
        if (e.createdAtMs > 0L) return e.createdAtMs
        if (e.entryDate.isNotBlank()) {
            runCatching {
                return LocalDate.parse(e.entryDate)
                    .atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
            }
        }
        return 0L
    }
}
