package com.thesisapp.steps

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Bridges the Android hardware step counter (Sensor.TYPE_STEP_COUNTER) to JS.
 *
 * The hardware step counter reports the cumulative number of steps taken since
 * the last device reboot and keeps counting in low-power mode even while the app
 * is closed. Daily-baseline math lives in JS (see src/services/stepTracker.ts).
 */
class StepCounterModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val sensorManager: SensorManager? =
        reactContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

    private val stepSensor: Sensor? =
        sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

    /** Latest cumulative count observed while a live subscription is active. */
    @Volatile
    private var lastKnownCount: Long = -1L

    private var subscriptionListener: SensorEventListener? = null
    private var listenerCount = 0

    override fun getName(): String = "StepCounter"

    override fun invalidate() {
        stopListeningInternal()
        super.invalidate()
    }

    @ReactMethod
    fun isStepCountingAvailable(promise: Promise) {
        promise.resolve(stepSensor != null)
    }

    /**
     * Resolves with the cumulative step count since boot. Because the sensor is
     * event-driven, this registers a one-shot listener and resolves on the first
     * reading (or with the last cached value if a subscription is already live).
     */
    @ReactMethod
    fun getCurrentStepCount(promise: Promise) {
        val manager = sensorManager
        val sensor = stepSensor
        if (manager == null || sensor == null) {
            promise.reject("STEP_SENSOR_UNAVAILABLE", "Step counter sensor is not available")
            return
        }

        if (lastKnownCount >= 0) {
            promise.resolve(lastKnownCount.toDouble())
            return
        }

        val handler = Handler(Looper.getMainLooper())
        val resolved = java.util.concurrent.atomic.AtomicBoolean(false)
        var oneShot: SensorEventListener? = null

        oneShot = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                if (resolved.compareAndSet(false, true)) {
                    val count = event.values[0].toLong()
                    lastKnownCount = count
                    manager.unregisterListener(this)
                    promise.resolve(count.toDouble())
                }
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }

        manager.registerListener(oneShot, sensor, SensorManager.SENSOR_DELAY_UI)

        // Fallback: TYPE_STEP_COUNTER only delivers an event when steps change, so
        // resolve with 0 if nothing arrives shortly (e.g. user standing still).
        handler.postDelayed({
            if (resolved.compareAndSet(false, true)) {
                manager.unregisterListener(oneShot)
                promise.resolve(if (lastKnownCount >= 0) lastKnownCount.toDouble() else 0.0)
            }
        }, 2000)
    }

    /** Begin emitting live "StepCounterUpdate" events while a screen is subscribed. */
    @ReactMethod
    fun startUpdates(promise: Promise) {
        val manager = sensorManager
        val sensor = stepSensor
        if (manager == null || sensor == null) {
            promise.reject("STEP_SENSOR_UNAVAILABLE", "Step counter sensor is not available")
            return
        }

        listenerCount += 1
        if (subscriptionListener == null) {
            val listener = object : SensorEventListener {
                override fun onSensorChanged(event: SensorEvent) {
                    val count = event.values[0].toLong()
                    lastKnownCount = count
                    emitUpdate(count)
                }

                override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
            }
            subscriptionListener = listener
            manager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
        }
        promise.resolve(null)
    }

    /** Tear down the live subscription when the last subscriber unmounts. */
    @ReactMethod
    fun stopUpdates(promise: Promise) {
        if (listenerCount > 0) listenerCount -= 1
        if (listenerCount <= 0) {
            stopListeningInternal()
        }
        promise.resolve(null)
    }

    // Required so NativeEventEmitter does not warn on addListener/removeListeners.
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    private fun stopListeningInternal() {
        listenerCount = 0
        subscriptionListener?.let { sensorManager?.unregisterListener(it) }
        subscriptionListener = null
    }

    private fun emitUpdate(count: Long) {
        val ctx = reactApplicationContext ?: return
        if (!ctx.hasActiveReactInstance()) return
        val params: WritableMap = Arguments.createMap().apply {
            putDouble("steps", count.toDouble())
        }
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_STEP_UPDATE, params)
    }

    companion object {
        const val EVENT_STEP_UPDATE = "StepCounterUpdate"
    }
}
