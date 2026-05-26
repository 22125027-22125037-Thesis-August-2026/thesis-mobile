package com.thesisapp.widget.work

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object WidgetWorkScheduler {
    private const val PERIODIC_REFRESH_NAME = "umatter-widget-refresh-periodic"
    private const val ONESHOT_REFRESH_NAME = "umatter-widget-refresh-oneshot"

    private fun networkConstraints(): Constraints =
        Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()

    fun schedulePeriodicRefresh(context: Context) {
        val req = PeriodicWorkRequestBuilder<MoodRefreshWorker>(6, TimeUnit.HOURS)
            .setConstraints(networkConstraints())
            .build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            PERIODIC_REFRESH_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            req,
        )
    }

    fun cancelPeriodicRefresh(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(PERIODIC_REFRESH_NAME)
    }

    fun enqueueOneShotRefresh(context: Context) {
        val req = OneTimeWorkRequestBuilder<MoodRefreshWorker>()
            .setConstraints(networkConstraints())
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(
            ONESHOT_REFRESH_NAME,
            ExistingWorkPolicy.REPLACE,
            req,
        )
    }
}
