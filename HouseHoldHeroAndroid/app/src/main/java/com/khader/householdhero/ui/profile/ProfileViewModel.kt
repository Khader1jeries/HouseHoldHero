package com.khader.householdhero.ui.profile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.MemberData
import com.khader.householdhero.repository.MemberRepository
import kotlinx.coroutines.launch
import kotlin.math.pow

class ProfileViewModel (private val repository: MemberRepository): ViewModel() {
    var member by mutableStateOf<Result<MemberData>?>(null)
    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)

    fun fetchMember(){
        viewModelScope.launch {
            isLoading = true
            errorMessage = null

            try {
                println("🔍 DEBUG: Starting fetchMember()")

                val result = repository.getMember()

                // Enhanced debugging
                when {
                    result.isSuccess -> {
                        val memberData = result.getOrNull()
                        println("✅ DEBUG: API Success - Member data received:")
                        println("   📧 ID: ${memberData?.id}")
                        println("   👤 Full Name: ${memberData?.fullName}")
                        println("   📅 Created At: ${memberData?.createdAt}")
                        println("   🏆 Score: ${memberData?.score}")
                        println("   ✅ Completed Tasks: ${memberData?.completedTasks}")
                        println("   🔄 Active Tasks: ${memberData?.activeTasks}")
                        println("   📊 Completion Rate: ${memberData?.completionRate}")

                        if (memberData != null) {
                            println("✅ DEBUG: Member is NOT null - setting state")
                        } else {
                            println("❌ DEBUG: Member data is null despite success")
                        }
                    }
                    result.isFailure -> {
                        val exception = result.exceptionOrNull()
                        println("❌ DEBUG: API Failed - Error: ${exception?.message}")
                        println("❌ DEBUG: Exception type: ${exception?.javaClass?.simpleName}")
                        errorMessage = exception?.message
                    }
                }

                member = result
                println("🔧 DEBUG: State updated - member is now: ${member != null}")

            } catch (e: Exception) {
                println("💥 DEBUG: Unexpected error in fetchMember(): ${e.message}")
                errorMessage = e.message
                member = Result.failure(e)
            } finally {
                isLoading = false
            }
        }
    }

    fun calculateLevel(): Int {
        val memberData = member?.getOrNull() ?: return 0
        var level = 0
        while (memberData.score >= 10 * (level + 1).toDouble().pow(2.0)) {
            level++
        }
        return level
    }

    fun calculateLevelProgress(): Float {
        val memberData = member?.getOrNull() ?: return 0f
        val score = memberData.score

        val level = calculateLevel()
        val currentLevelXP = 10 * level.toDouble().pow(2.0)
        val nextLevelXP = 10 * (level + 1).toDouble().pow(2.0)

        val progress = ((score - currentLevelXP) / (nextLevelXP - currentLevelXP)).toFloat()
        return progress.coerceIn(0f, 1f) // Ensure it's between 0% and 100%
    }

    fun pointsNeededToNextLevel(): Int {
        val memberData = member?.getOrNull() ?: return 0
        val score = memberData.score
        val level = calculateLevel()

        val nextLevelXP = 10 * (level + 1).toDouble().pow(2.0)
        return (nextLevelXP - score).toInt().coerceAtLeast(0)
    }
}