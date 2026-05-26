package com.thesisapp.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import com.thesisapp.widget.work.WidgetWorkScheduler

class MoodWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        MoodWidgetRenderer.render(context, appWidgetManager, appWidgetIds)
    }

    override fun onEnabled(context: Context) {
        WidgetWorkScheduler.schedulePeriodicRefresh(context.applicationContext)
        WidgetWorkScheduler.enqueueOneShotRefresh(context.applicationContext)
    }

    override fun onDisabled(context: Context) {
        WidgetWorkScheduler.cancelPeriodicRefresh(context.applicationContext)
    }
}
