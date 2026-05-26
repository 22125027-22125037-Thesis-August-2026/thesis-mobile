package com.thesisapp.widget

import android.content.Context

object MoodWidgetRefresher {
    fun refresh(context: Context) {
        MoodWidgetRenderer.renderAll(context.applicationContext)
    }
}
