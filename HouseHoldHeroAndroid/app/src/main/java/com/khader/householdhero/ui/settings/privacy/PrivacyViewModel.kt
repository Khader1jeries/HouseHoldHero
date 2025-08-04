package com.khader.householdhero.ui.settings.privacy

import android.content.Context
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.ResetPasswordRequest
import com.khader.householdhero.repository.MemberRepository
import kotlinx.coroutines.launch

class PrivacyViewModel (
    private val memberRepo: MemberRepository
) : ViewModel() {
    private var onNavigateToLogin: (() -> Unit)? = null
    fun setNavigationCallback(onNavigateToLogin: () -> Unit) {
        this.onNavigateToLogin = onNavigateToLogin
    }
    fun changePassword(newPassword: String, confirmPassword: String) {
        if (newPassword == confirmPassword){
            viewModelScope.launch {
                try {
                    memberRepo.resetPasswordIn(newPassword)
                } catch (e: Exception) {

                }
            }
        }
    }
    fun deleteAccount() {
        viewModelScope.launch {
            val result = memberRepo.deleteMember()
            if (result.isSuccess) {
                // Handle success (e.g., clear local data, navigate away)


                // Navigate to login screen
                onNavigateToLogin?.invoke()
            } else {
                // Handle failure

            }
        }
    }


}