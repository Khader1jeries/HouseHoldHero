package com.khader.householdhero.repository

import android.content.Context
import com.khader.householdhero.api.MemberApi
import com.khader.householdhero.model.LeaderboardMember

import com.khader.householdhero.model.LoginRequest
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.MemberData
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
    suspend fun getMember(): Result<MemberData> {
        return try {
            val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
            val email = sharedPrefs.getString("email", null)

            println("🔍 DEBUG Repository: Starting getMember()")
            println("📧 DEBUG Repository: Email from SharedPrefs: $email")

            if (email.isNullOrBlank()) {
                println("❌ DEBUG Repository: Email is null or blank!")
                return Result.failure(Exception("Email not found in preferences"))
            }

            println("🌐 DEBUG Repository: About to call API with email: $email")
            val response = api.getMember(email)

            println("✅ DEBUG Repository: API call successful")
            println("📦 DEBUG Repository: Raw response: $response")

            Result.success(response)
        } catch (e: Exception) {
            println("💥 DEBUG Repository: Exception occurred: ${e.message}")
            println("💥 DEBUG Repository: Exception type: ${e.javaClass.simpleName}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
}