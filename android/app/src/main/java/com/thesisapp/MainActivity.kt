package com.thesisapp

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.thesisapp.widget.bridge.WidgetBridgeModule
import com.thesisapp.widget.bridge.WidgetDeepLinkHolder

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "uMatter"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    captureDeepLink(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    captureDeepLink(intent)
    val target = intent.getStringExtra(EXTRA_DEEP_LINK)
    if (!target.isNullOrBlank()) {
      WidgetBridgeModule.emitDeepLink(target)
    }
  }

  private fun captureDeepLink(intent: Intent?) {
    val target = intent?.getStringExtra(EXTRA_DEEP_LINK)
    if (!target.isNullOrBlank()) {
      WidgetDeepLinkHolder.set(target)
    }
  }

  companion object {
    private const val EXTRA_DEEP_LINK = "widget_deep_link"
  }
}
