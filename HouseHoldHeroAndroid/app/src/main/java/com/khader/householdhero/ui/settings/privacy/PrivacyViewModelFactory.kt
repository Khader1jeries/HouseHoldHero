package com.khader.householdhero.ui.settings.privacy

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.repository.MemberRepository
import com.khader.householdhero.ui.profile.EditProfileViewModel


class PrivacyViewModelFactory(private val repository: MemberRepository) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(PrivacyViewModel::class.java)) { // ✅ Fixed: Check for PrivacyViewModel
            @Suppress("UNCHECKED_CAST")
            return PrivacyViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}