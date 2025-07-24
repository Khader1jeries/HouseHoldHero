package com.khader.householdhero.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.repository.MemberRepository
import com.squareup.moshi.Moshi
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class ForgotPasswordViewModel(private val repository: MemberRepository) : ViewModel() {

    var result: Result<LoginResponse>? = null
        private set

    fun checkEmail(email: String) {
        viewModelScope.launch {
            try {
                val response = repository.checkIfUserExists(email)
                result = response
            } catch (e: Exception) {
                val message = when (e) {
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

                result = Result.success(LoginResponse(success = false, message = message))
            }
        }
    }
}
