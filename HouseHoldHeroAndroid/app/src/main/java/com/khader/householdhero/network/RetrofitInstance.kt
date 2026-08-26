package com.khader.householdhero.network

import com.khader.householdhero.BuildConfig
import com.khader.householdhero.api.MemberApi
import com.khader.householdhero.api.MessagesApi
import com.khader.householdhero.api.TasksApi
import com.squareup.moshi.Moshi
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

object RetrofitInstance {
    private val BASE_URL = BuildConfig.API_BASE_URL
    private val moshi = Moshi.Builder().build()

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(MoshiConverterFactory.create(moshi)) // ✅ Moshi here
            .build()
    }

    val memberApi: MemberApi by lazy {
        retrofit.create(MemberApi::class.java)
    }

    val tasksApi: TasksApi by lazy {
        retrofit.create(TasksApi::class.java)
    }
    val messagesApi: MessagesApi by lazy {
        retrofit.create(MessagesApi::class.java)
    }

}
