package com.khader.householdhero.repository

import android.content.Context
import com.khader.householdhero.api.MessagesApi
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.MessageData
import com.khader.householdhero.model.MessageDataCreate

class MessagesRepository(private val api: MessagesApi, private val context: Context) {
    val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
    val email = sharedPrefs.getString("email", null)

    suspend fun createMessage(message: MessageDataCreate): Result<LoginResponse> {
        return try {
            val response = api.createMessage(message)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMessages(): Result<List<MessageData>> {
        return try {
            if (email.isNullOrBlank()) {
                return Result.failure(Exception("Email not found in preferences"))
            }

            val response = api.getMessages(email)

            if (response.success) {
                Result.success(response.data)
            } else {
                Result.failure(Exception("Failed to get messages"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }
}