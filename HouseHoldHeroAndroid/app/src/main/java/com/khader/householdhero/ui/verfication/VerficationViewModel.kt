package com.khader.householdhero.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.ErrorResponse
import com.khader.householdhero.repository.MemberRepository
import com.squareup.moshi.Moshi
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class VerficationViewModel(private val repository: MemberRepository) : ViewModel() {

    var result by mutableStateOf<Result<LoginResponse>?>(null)
        private set

    var isLoading by mutableStateOf(false)
        private set

    fun checkVerfication(email:String,Verfication: String) {
        if (Verfication.isBlank()) {
            result = Result.success(LoginResponse(success = false, message = "Please enter an email address"))
            return
        }
        viewModelScope.launch {
            isLoading = true
            result = null

            val response = repository.verfication(email,Verfication)

            response.onSuccess {
                result = Result.success(it)
                isLoading = false
            }.onFailure { e ->
                isLoading = false
                val errorMessage = when (e) {
                    is HttpException -> {
                        val errorJson = e.response()?.errorBody()?.string()
                        val moshi = Moshi.Builder().build()

                        try {
                            val errorAdapter = moshi.adapter(ErrorResponse::class.java)
                            val errorResponse = errorAdapter.fromJson(errorJson)
                            errorResponse?.error ?: "HTTP ${e.code()} error"
                        } catch (_: Exception) {
                            try {
                                val loginAdapter = moshi.adapter(LoginResponse::class.java)
                                val loginResponse = loginAdapter.fromJson(errorJson)
                                loginResponse?.message ?: "HTTP ${e.code()} error"
                            } catch (_: Exception) {
                                "HTTP ${e.code()} error"
                            }
                        }
                    }
                    is IOException -> "Network error. Please check your internet connection."
                    else -> "Unexpected error: ${e.localizedMessage}"
                }

                result = Result.success(LoginResponse(success = false, message = errorMessage))
            }
        }
    }


    fun clearResult() {
        result = null
    }
}