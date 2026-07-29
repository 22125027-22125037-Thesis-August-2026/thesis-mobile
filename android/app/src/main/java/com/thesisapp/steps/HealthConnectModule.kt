package com.thesisapp.steps

import android.app.Activity
import android.content.Intent
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.Period

/**
 * Bridges Android Health Connect to JS for *historical* per-day step totals.
 *
 * The hardware step counter (see StepCounterModule) only exposes a single
 * cumulative value, so it cannot reconstruct a day the app was never opened.
 * Health Connect stores time-bucketed step records contributed by the system
 * and other fitness apps, which lets us query "steps for date X" and back-fill
 * any skipped days. Daily-total aggregation is done with aggregateGroupByPeriod
 * sliced into local-calendar days.
 */
class HealthConnectModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private val permissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))

    private val requestContract = PermissionController.createRequestPermissionResultContract()

    /** Held while a permission request activity is in flight. */
    private var pendingPermissionPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "HealthConnect"

    override fun invalidate() {
        reactContext.removeActivityEventListener(this)
        super.invalidate()
    }

    private fun clientOrNull(): HealthConnectClient? =
        if (HealthConnectClient.getSdkStatus(reactContext) == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(reactContext)
        } else {
            null
        }

    /** Whether Health Connect is installed/available on this device. */
    @ReactMethod
    fun isAvailable(promise: Promise) {
        promise.resolve(
            HealthConnectClient.getSdkStatus(reactContext) == HealthConnectClient.SDK_AVAILABLE,
        )
    }

    /** Whether the READ_STEPS permission has already been granted. */
    @ReactMethod
    fun hasPermission(promise: Promise) {
        val client = clientOrNull()
        if (client == null) {
            promise.resolve(false)
            return
        }
        scope.launch {
            try {
                val granted = client.permissionController.getGrantedPermissions()
                promise.resolve(granted.containsAll(permissions))
            } catch (e: Exception) {
                promise.reject("HC_PERMISSION_CHECK_FAILED", e)
            }
        }
    }

    /**
     * Launches the Health Connect permission UI (no-op resolve(true) if already
     * granted). Resolves with whether READ_STEPS ends up granted.
     */
    @ReactMethod
    fun requestPermission(promise: Promise) {
        val client = clientOrNull()
        if (client == null) {
            promise.resolve(false)
            return
        }
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("HC_NO_ACTIVITY", "No current activity to launch the permission request")
            return
        }
        scope.launch {
            try {
                val granted = client.permissionController.getGrantedPermissions()
                if (granted.containsAll(permissions)) {
                    promise.resolve(true)
                    return@launch
                }
                pendingPermissionPromise = promise
                val intent = requestContract.createIntent(activity, permissions)
                activity.startActivityForResult(intent, REQUEST_CODE)
            } catch (e: Exception) {
                pendingPermissionPromise = null
                promise.reject("HC_PERMISSION_REQUEST_FAILED", e)
            }
        }
    }

    /**
     * Returns step totals grouped by local calendar day for the inclusive range
     * [startDate, endDate] (both "YYYY-MM-DD"). Days with no records are simply
     * absent from the result. Shape: [{ date: "YYYY-MM-DD", count: number }].
     */
    @ReactMethod
    fun getDailySteps(startDate: String, endDate: String, promise: Promise) {
        val client = clientOrNull()
        if (client == null) {
            promise.reject("HC_UNAVAILABLE", "Health Connect is not available")
            return
        }
        scope.launch {
            try {
                val start = LocalDate.parse(startDate).atStartOfDay()
                // End is exclusive; add a day so the final calendar day is included.
                val end = LocalDate.parse(endDate).plusDays(1).atStartOfDay()
                val request = AggregateGroupByPeriodRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(start, end),
                    timeRangeSlicer = Period.ofDays(1),
                )
                val buckets = client.aggregateGroupByPeriod(request)
                val result = Arguments.createArray()
                for (bucket in buckets) {
                    val count = bucket.result[StepsRecord.COUNT_TOTAL] ?: 0L
                    val map = Arguments.createMap()
                    map.putString("date", bucket.startTime.toLocalDate().toString())
                    map.putDouble("count", count.toDouble())
                    result.pushMap(map)
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("HC_AGGREGATE_FAILED", e)
            }
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
    ) {
        if (requestCode != REQUEST_CODE) return
        val promise = pendingPermissionPromise ?: return
        pendingPermissionPromise = null
        try {
            val granted = requestContract.parseResult(resultCode, data)
            promise.resolve(granted.containsAll(permissions))
        } catch (e: Exception) {
            promise.reject("HC_PERMISSION_RESULT_FAILED", e)
        }
    }

    override fun onNewIntent(intent: Intent) {}

    // Present so NativeEventEmitter consumers never warn (no events emitted here).
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    companion object {
        private const val REQUEST_CODE = 9087
    }
}
