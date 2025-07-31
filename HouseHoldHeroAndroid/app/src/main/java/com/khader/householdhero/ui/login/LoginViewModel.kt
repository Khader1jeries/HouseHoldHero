package com.khader.householdhero.ui.theme.login

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LoginRequest
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.MemberRepository
import com.squareup.moshi.Moshi
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class LoginViewModel(private val repository: MemberRepository) : ViewModel() {

    var loginResult by mutableStateOf<Result<LoginResponse>?>(null)
        private set

    fun login(email: String, password: String) {
        viewModelScope.launch {
            val result = repository.login(email, password)

            result.onSuccess {
                loginResult = Result.success(it)
            }.onFailure { e ->
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

                loginResult = Result.success(LoginResponse(success = false, message = errorMessage))
            }
        }
    }
}