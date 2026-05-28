package com.thesisapp.widget.util

import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

object OkHttpProvider {
    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }
}
