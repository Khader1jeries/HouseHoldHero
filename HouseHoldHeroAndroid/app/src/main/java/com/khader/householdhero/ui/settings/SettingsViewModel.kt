package com.khader.householdhero.ui.settings

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch

class SettingsViewModel(private val context: Context) : ViewModel() {

    fun logOut(onLogOut: () -> Unit) {
        viewModelScope.launch {
            try {
                // Get SharedPreferences instance
                val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)

                // Clear all data from SharedPreferences
                with(sharedPrefs.edit()) {
                    clear()
                    apply()
                }

                // Initialize/reset any necessary data here if needed
                // For example, you might want to reset some global state or clear caches

                // Call the navigation callback to go to login page
                onLogOut()

            } catch (e: Exception) {
                // Handle error if needed
                // You might want to show an error message to the user
                // For now, we'll still navigate to login even if there's an error
                onLogOut()
            }
        }
    }

    fun clearUserData() {
        // Additional method to clear any other user-related data
        // This can be called from other parts of the app if needed
        val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
        with(sharedPrefs.edit()) {
            remove("email")
            remove("adminEmail")

            apply()
        }
    }
}

class SettingsViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(SettingsViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return SettingsViewModel(context) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}