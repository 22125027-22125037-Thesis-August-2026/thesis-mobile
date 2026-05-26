package com.thesisapp.widget.bridge

object WidgetDeepLinkHolder {
    @Volatile
    private var pending: String? = null

    fun set(target: String?) {
        pending = target?.takeIf { it.isNotBlank() }
    }

    fun consume(): String? {
        val v = pending
        pending = null
        return v
    }
}
