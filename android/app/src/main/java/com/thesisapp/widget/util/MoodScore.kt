package com.thesisapp.widget.util

object MoodScore {
    fun forTag(moodTag: String): Int = when (moodTag.uppercase()) {
        "TERRIBLE" -> 2
        "BAD" -> 4
        "NEUTRAL" -> 6
        "GOOD" -> 8
        "EXCELLENT" -> 10
        else -> 6
    }

    val ALL_TAGS = listOf("TERRIBLE", "BAD", "NEUTRAL", "GOOD", "EXCELLENT")
}
