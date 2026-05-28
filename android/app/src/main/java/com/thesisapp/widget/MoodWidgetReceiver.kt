package com.thesisapp.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.thesisapp.widget.work.WidgetWorkScheduler

class MoodWidgetReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_REFRESH) {
            WidgetWorkScheduler.enqueueOneShotRefresh(context.applicationContext)
        }
    }

    companion object {
        const val ACTION_REFRESH = "com.thesisapp.widget.ACTION_REFRESH"
    }
}
