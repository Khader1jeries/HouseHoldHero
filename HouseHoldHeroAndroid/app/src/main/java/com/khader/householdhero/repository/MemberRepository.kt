package com.khader.householdhero.repository

import android.content.Context
import com.khader.householdhero.api.MemberApi
import com.khader.householdhero.model.EditMemberData
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

            if (email.isNullOrBlank()) {
                return Result.failure(Exception("Email not found in preferences"))
            }
            val response = api.getMember(email)
            Result.success(response)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }
    suspend fun updateMember(
        updateData: MemberData
    ): Result<Unit> {

        return try {
            val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
            val email = sharedPrefs.getString("email", null)
            if (email.isNullOrBlank()) {
                return Result.failure(Exception("Email not found in preferences"))
            }
            val response = api.updateMember(email, updateData)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Update failed with code ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun resetPasswordIn(password: String): Result<LoginResponse> {
        return try {
            val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
            val email = sharedPrefs.getString("email", null)
            if (email.isNullOrBlank()) {
                return Result.failure(Exception("Email not found in preferences"))
            }
            val req = ResetPasswordRequest(
                email = email,
                password = password
            )
            val response = api.resetPassword(req)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}