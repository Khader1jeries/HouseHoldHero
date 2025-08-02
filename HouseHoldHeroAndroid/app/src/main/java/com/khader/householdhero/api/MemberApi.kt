package com.khader.householdhero.api

import com.khader.householdhero.model.LeaderboardMember
import com.khader.householdhero.model.LoginRequest
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.MemberData
import com.khader.householdhero.model.ResetPasswordRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface MemberApi {
    // Remove the leading /api/ since it's already in the base URL
    @POST("members/login")
    suspend fun loginMember(@Body request: LoginRequest): LoginResponse
    @GET("members/forgot-password/{email}")
    suspend fun checkIfUserExists(@Path("email") email: String): LoginResponse
    @POST("members/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): LoginResponse
    @GET("members/leaderboard/{adminEmail}")
    suspend fun getLeaderboard(@Path("adminEmail") adminEmail: String): List<LeaderboardMember>
    @GET("members/android/{email}")
    suspend fun getMember(@Path("email") email: String): MemberData
}
