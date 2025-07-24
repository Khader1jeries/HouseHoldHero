package com.khader.householdhero.api

import com.khader.householdhero.model.LoginRequest
import com.khader.householdhero.model.LoginResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface MemberApi {
    @POST("/api/members/login")
    suspend fun loginMember(@Body request: LoginRequest): LoginResponse
}