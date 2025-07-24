package com.khader.householdhero.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LoginResponse
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
            } catch (e: HttpException) {
                val errorMessage = try {
                    val errorJson = e.response()?.errorBody()?.string()
                    if (!errorJson.isNullOrBlank()) {
                        val moshi = Moshi.Builder().build()
                        val adapter = moshi.adapter(LoginResponse::class.java)
                        val errorResponse = adapter.fromJson(errorJson)
                        errorResponse?.message ?: "Server error: HTTP ${e.code()}"
                    } else {
                        "Server error: HTTP ${e.code()}"
                    }
                } catch (parseException: Exception) {
                    "Server error: HTTP ${e.code()}"
                }
                result = Result.success(LoginResponse(success = false, message = errorMessage))
            } catch (e: IOException) {
                result = Result.success(LoginResponse(success = false, message = "Network error. Please check your internet connection."))
            } catch (e: Exception) {
                result = Result.success(LoginResponse(success = false, message = "Unexpected error: ${e.localizedMessage ?: "Unknown error"}"))
            } finally {
                isLoading = false
            }
        }
    }

    fun clearResult() {
        result = null
    }
}