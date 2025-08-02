package com.khader.householdhero.repository

import android.content.Context
import com.khader.householdhero.api.MemberApi
import com.khader.householdhero.model.LeaderboardMember

import com.khader.householdhero.model.LoginRequest
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.ResetPasswordRequest


class MemberRepository(private val api: MemberApi,private val context: Context) {

    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = api.loginMember(LoginRequest(email, password))
            if (response.success) {
                val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
                sharedPrefs.edit().putString("email", email).apply()
                sharedPrefs.edit().putString("adminEmail", response.message).apply()
            }
            Result.success(response)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun checkIfUserExists(email: String): Result<LoginResponse> {
        return try {
            val response = api.checkIfUserExists(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun resetPassword(request: ResetPasswordRequest): Result<LoginResponse> {
        return try {
            val response = api.resetPassword(request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getLeaderboard(): Result<List<LeaderboardMember>> {
        return try {
            // Get adminEmail from SharedPreferences
            val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
            val adminEmail = sharedPrefs.getString("adminEmail", null)
                ?: return Result.failure(Exception("Admin email not found in preferences"))

            val response = api.getLeaderboard(adminEmail)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}