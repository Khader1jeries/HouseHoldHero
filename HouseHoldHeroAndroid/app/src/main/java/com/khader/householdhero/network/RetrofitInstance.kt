package com.khader.householdhero.network

import com.khader.householdhero.api.MemberApi
import com.squareup.moshi.Moshi
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

object RetrofitInstance {
    private const val BASE_URL = "http://10.0.2.2:3000/api/"

    private val moshi = Moshi.Builder().build()

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(MoshiConverterFactory.create(moshi)) // ✅ Moshi here
            .build()
    }
    val api: MemberApi by lazy {
        retrofit.create(MemberApi::class.java)
    }
}
