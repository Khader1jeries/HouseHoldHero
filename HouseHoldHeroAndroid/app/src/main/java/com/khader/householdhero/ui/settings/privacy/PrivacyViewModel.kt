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
    // Empty functions for delete account - to be implemented later
    fun deleteAccount() {
        // TODO: Implement delete account functionality
    }

    fun confirmDeleteAccount() {
        // TODO: Implement confirm delete account functionality
    }
}