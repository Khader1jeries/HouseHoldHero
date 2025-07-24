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
import kotlinx.coroutines.launch

class LoginViewModel(private val repository: MemberRepository) : ViewModel() {

    var loginResult by mutableStateOf<Result<LoginResponse>?>(null)
        private set

    fun login(email: String, password: String) {
        viewModelScope.launch {
            try {
                val response = RetrofitInstance.api.loginMember(LoginRequest(email, password))
                loginResult = Result.success(response)
            } catch (e: Exception) {
                loginResult = Result.failure(e)
            }
        }
    }
}