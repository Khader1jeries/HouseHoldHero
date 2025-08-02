package com.khader.householdhero.ui.leaderboard

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.LeaderboardMember
import com.khader.householdhero.repository.MemberRepository
import kotlinx.coroutines.launch

class LeaderboardViewModel(private val repository: MemberRepository) : ViewModel() {

    var leaderboardState by mutableStateOf(LeaderboardState())
        private set

    data class LeaderboardState(
        val members: List<LeaderboardMember> = emptyList(),
        val isLoading: Boolean = false,
        val errorMessage: String? = null
    )

    init {
        loadLeaderboard()
    }

    fun loadLeaderboard() {
        viewModelScope.launch {
            leaderboardState = leaderboardState.copy(isLoading = true, errorMessage = null)

            repository.getLeaderboard().fold(
                onSuccess = { members ->
                    leaderboardState = leaderboardState.copy(
                        members = members,
                        isLoading = false,
                        errorMessage = null
                    )
                },
                onFailure = { exception ->
                    leaderboardState = leaderboardState.copy(
                        members = emptyList(),
                        isLoading = false,
                        errorMessage = exception.message ?: "Failed to load leaderboard"
                    )
                }
            )
        }
    }

    fun refreshLeaderboard() {
        loadLeaderboard()
    }
}

