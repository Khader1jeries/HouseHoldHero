package com.khader.householdhero.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.ErrorResponse
import com.khader.householdhero.model.ResetPasswordRequest
import com.khader.householdhero.network.RetrofitInstance
import com.squareup.moshi.Moshi
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class ResetPasswordViewModel : ViewModel() {

    var result by mutableStateOf<Result<LoginResponse>?>(null)
        private set

    var isLoading by mutableStateOf(false)
        private set

    fun resetPassword(email: String, newPassword: String, confirmPassword: String) {
        // Validation
        if (newPassword.isBlank()) {
            result = Result.success(LoginResponse(success = false, message = "Please enter a new password"))
            return
        }

        if (confirmPassword.isBlank()) {
            result = Result.success(LoginResponse(success = false, message = "Please confirm your password"))
            return
        }

        if (newPassword != confirmPassword) {
            result = Result.success(LoginResponse(success = false, message = "Passwords do not match"))
            return
        }

        if (newPassword.length < 6) {
            result = Result.success(LoginResponse(success = false, message = "Password must be at least 6 characters"))
            return
        }

        viewModelScope.launch {
            isLoading = true
            result = null

            try {
                val response = RetrofitInstance.api.resetPassword(ResetPasswordRequest(email, newPassword))
                result = Result.success(response)
                isLoading = false
            } catch (e: Exception) {
                isLoading = false
                val errorMessage = when (e) {
                    is HttpException -> {
                        val errorJson = e.response()?.errorBody()?.string()
                        val moshi = Moshi.Builder().build()
                        val adapter = moshi.adapter(LoginResponse::class.java)
                        val errorResponse = adapter.fromJson(errorJson)
                        errorResponse?.message ?: "HTTP ${e.code()} error"
                    }
                    is IOException -> "Network error. Please check your internet connection."
                    else -> "Unexpected error: ${e.localizedMessage}"
                }

                // Use LoginResponse just to hold the message
                result = Result.success(LoginResponse(success = false, message = errorMessage))
            }
        }
    }

    fun clearResult() {
        result = null
    }
}