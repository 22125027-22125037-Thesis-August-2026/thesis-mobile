package com.thesisapp.widget.data

import com.thesisapp.widget.util.EntryLite
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

object StreakCalculator {
    private val ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE

    fun fromEntries(entries: List<EntryLite>, today: LocalDate = LocalDate.now()): Pair<Int, LocalDate> {
        val dateSet: Set<LocalDate> = entries
            .mapNotNull { e -> parseEntryDate(e) }
            .toSet()

        if (dateSet.isEmpty()) return 0 to today

        val yesterday = today.minusDays(1)
        val todayPresent = today in dateSet
        val yesterdayPresent = yesterday in dateSet

        if (!todayPresent && !yesterdayPresent) return 0 to today

        var cursor = if (todayPresent) today else yesterday
        var count = 0
        while (cursor in dateSet) {
            count++
            cursor = cursor.minusDays(1)
        }
        val asOf = if (todayPresent) today else yesterday
        return count to asOf
    }

    fun bump(snapshot: WidgetPrefs.WidgetSnapshot, today: LocalDate = LocalDate.now()): Pair<Int, LocalDate> {
        val asOf = snapshot.streakAsOf?.let { runCatching { LocalDate.parse(it, ISO_DATE) }.getOrNull() }
        return when {
            asOf == today -> snapshot.streakCount to today
            asOf == today.minusDays(1) -> (snapshot.streakCount + 1) to today
            else -> 1 to today
        }
    }

    private fun parseEntryDate(e: EntryLite): LocalDate? {
        val date = e.entryDate
        if (!date.isNullOrBlank()) {
            runCatching { return LocalDate.parse(date, ISO_DATE) }
        }
        if (e.createdAtMs > 0L) {
            return Instant.ofEpochMilli(e.createdAtMs).atZone(ZoneId.systemDefault()).toLocalDate()
        }
        return null
    }

    fun formatDate(date: LocalDate): String = ISO_DATE.format(date)
}
