package com.thesisapp.widget.bridge

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.thesisapp.widget.MoodWidgetRefresher
import com.thesisapp.widget.data.StreakCalculator
import com.thesisapp.widget.data.WidgetPrefs
import com.thesisapp.widget.work.WidgetWorkScheduler
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class WidgetBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        instance = this
    }

    override fun getName(): String = "WidgetBridge"

    override fun invalidate() {
        if (instance === this) instance = null
        super.invalidate()
    }

    @ReactMethod
    fun setAuth(token: String, profileId: String, baseUrl: String, promise: Promise) {
        try {
            val ctx = reactApplicationContext.applicationContext
            WidgetPrefs.setAuth(ctx, token, profileId, baseUrl)
            WidgetWorkScheduler.schedulePeriodicRefresh(ctx)
            WidgetWorkScheduler.enqueueOneShotRefresh(ctx)
            MoodWidgetRefresher.refresh(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_BRIDGE_SET_AUTH", e)
        }
    }

    @ReactMethod
    fun clearAuth(promise: Promise) {
        try {
            val ctx = reactApplicationContext.applicationContext
            WidgetPrefs.clearAuth(ctx)
            WidgetWorkScheduler.cancelPeriodicRefresh(ctx)
            MoodWidgetRefresher.refresh(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_BRIDGE_CLEAR_AUTH", e)
        }
    }

    @ReactMethod
    fun cacheLastMood(moodTag: String, isoAt: String, promise: Promise) {
        try {
            val ctx = reactApplicationContext.applicationContext
            val atMs = parseIsoToMs(isoAt) ?: System.currentTimeMillis()
            WidgetPrefs.setLastMood(ctx, moodTag, atMs)
            // Bump streak immediately so widget reflects correct count without waiting for MoodRefreshWorker
            val snapshot = WidgetPrefs.getSnapshot(ctx)
            val (newCount, newAsOf) = StreakCalculator.bump(snapshot, LocalDate.now())
            WidgetPrefs.setStreak(ctx, newCount, StreakCalculator.formatDate(newAsOf))
            MoodWidgetRefresher.refresh(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_BRIDGE_CACHE_MOOD", e)
        }
    }

    @ReactMethod
    fun requestRefresh(promise: Promise) {
        try {
            val ctx = reactApplicationContext.applicationContext
            WidgetWorkScheduler.enqueueOneShotRefresh(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_BRIDGE_REFRESH", e)
        }
    }

    @ReactMethod
    fun consumePendingDeepLink(promise: Promise) {
        try {
            val target = WidgetDeepLinkHolder.consume()
            promise.resolve(target)
        } catch (e: Exception) {
            promise.reject("WIDGET_BRIDGE_CONSUME_DEEPLINK", e)
        }
    }

    private fun parseIsoToMs(value: String?): Long? {
        if (value.isNullOrBlank()) return null
        return runCatching { Instant.parse(value).toEpochMilli() }
            .getOrElse {
                runCatching {
                    DateTimeFormatter.ISO_DATE_TIME.parse(value, Instant::from).toEpochMilli()
                }.getOrNull()
            }
    }

    companion object {
        @Volatile
        private var instance: WidgetBridgeModule? = null

        fun emitDeepLink(target: String) {
            val module = instance ?: return
            val ctx = module.reactApplicationContext ?: return
            if (!ctx.hasActiveReactInstance()) return
            val params: WritableMap = com.facebook.react.bridge.Arguments.createMap().apply {
                putString("target", target)
            }
            ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(EVENT_DEEP_LINK, params)
        }

        const val EVENT_DEEP_LINK = "WidgetDeepLink"
    }
}
