package com.khader.householdhero.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.ErrorResponse
import com.khader.householdhero.repository.MemberRepository
import com.khader.householdhero.network.RetrofitInstance
import com.squareup.moshi.Moshi
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class ForgotPasswordViewModel(private val repository: MemberRepository) : ViewModel() {

    var result by mutableStateOf<Result<LoginResponse>?>(null)
        private set

    var isLoading by mutableStateOf(false)
        private set

    fun checkEmail(email: String) {
        if (email.isBlank()) {
            result = Result.success(LoginResponse(success = false, message = "Please enter an email address"))
            return
        }

        viewModelScope.launch {
            isLoading = true
            result = null

            try {
                val response = RetrofitInstance.api.checkIfUserExists(email)
                result = Result.success(response)
                isLoading = false
            } catch (e: Exception) {
                isLoading = false
                val errorMessage = when (e) {
                    is HttpException -> {
                        val errorJson = e.response()?.errorBody()?.string()
                        val moshi = Moshi.Builder().build()

                        // Try to parse as ErrorResponse first (your current backend format)
                        try {
                            val errorAdapter = moshi.adapter(ErrorResponse::class.java)
                            val errorResponse = errorAdapter.fromJson(errorJson)
                            errorResponse?.error ?: "HTTP ${e.code()} error"
                        } catch (parseError: Exception) {
                            // If that fails, try LoginResponse format
                            try {
                                val loginAdapter = moshi.adapter(LoginResponse::class.java)
                                val loginResponse = loginAdapter.fromJson(errorJson)
                                loginResponse?.message ?: "HTTP ${e.code()} error"
                            } catch (parseError2: Exception) {
                                "HTTP ${e.code()} error"
                            }
                        }
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