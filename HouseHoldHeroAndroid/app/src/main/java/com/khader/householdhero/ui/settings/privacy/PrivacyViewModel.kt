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
, private val context: Context) : ViewModel() {
    fun changePassword(newPassword: String, confirmPassword: String) {
        if (newPassword == confirmPassword) {
            val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
            val email = sharedPrefs.getString("email", null)
            if (email.isNullOrBlank()) {
                return
            }
            val request = ResetPasswordRequest(
                email = email,
                password = newPassword
            )

            viewModelScope.launch {
                try {
                    memberRepo.resetPassword(request)
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