package com.khader.householdhero.ui.profile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.MemberData
import com.khader.householdhero.repository.MemberRepository
import kotlinx.coroutines.launch

class EditProfileViewModel(private val repository: MemberRepository) : ViewModel() {

    var member by mutableStateOf<Result<MemberData>?>(null)
        private set

    var updateResult by mutableStateOf<Result<Boolean>?>(null)
        private set

    fun fetchMember() {
        viewModelScope.launch {
            val result = repository.getMember()
            member = result
        }
    }

    fun updateProfile(
        firstName: String,
        lastName: String,
        phone: String,
        countryCode: String,
        email: String
    ) {
        viewModelScope.launch {
            try {



                // Simulate API call delay
                kotlinx.coroutines.delay(1500)

                // For now, just return success
                updateResult = Result.success(true)

                // Update local member data to reflect changes
                member?.getOrNull()?.let { currentMember ->
                    val updatedMember = currentMember.copy(
                        email=email,
                        firstName = firstName,
                        lastName = lastName,
                        phoneNumber = phone,
                        countryCode = countryCode
                    )
                    member = Result.success(updatedMember)
                    repository.updateMember(updatedMember)
                }

            } catch (e: Exception) {
                updateResult = Result.failure(e)
            }
        }
    }

    fun clearUpdateResult() {
        updateResult = null
    }
}

