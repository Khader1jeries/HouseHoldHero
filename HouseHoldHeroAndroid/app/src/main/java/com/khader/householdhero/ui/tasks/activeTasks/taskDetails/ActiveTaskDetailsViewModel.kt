package com.khader.householdhero.ui.tasks.activeTasks.taskDetails

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.subTasks
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch

class ActiveTaskDetailsViewModel (private val repository: TasksRepository): ViewModel() {
    var task by mutableStateOf<Result<Task>?>(null)
    var subTask by mutableStateOf<Result<List<subTasks>>?>(null)
        private set

    // Add loading state for subtasks update
    var isUpdatingSubtasks by mutableStateOf(false)
        private set

    // Add error state for subtasks update
    var updateError by mutableStateOf<String?>(null)
        private set

    fun fetchTask(taskId:String) {
        viewModelScope.launch {
            val result = repository.getTask(taskId)
            task = result
        }
    }

    fun fetchSubTasks(taskId:String) {
        viewModelScope.launch {
            val result = repository.getSubTask(taskId)
            subTask = result
        }
    }

    // New method to toggle individual subtask status
    fun toggleSubtaskStatus(subtaskId: String) {
        // Get current subtasks
        val currentSubtasks = subTask?.getOrNull()?.toMutableList() ?: return

        // Find and toggle the specific subtask
        val subtaskIndex = currentSubtasks.indexOfFirst { it.id == subtaskId }
        if (subtaskIndex != -1) {
            val updatedSubtask = currentSubtasks[subtaskIndex].copy(
                status = !currentSubtasks[subtaskIndex].status
            )
            currentSubtasks[subtaskIndex] = updatedSubtask

            // Update local state immediately for UI responsiveness
            subTask = Result.success(currentSubtasks)

            // Update via API
            updateSubtasksApi()
        }
    }

    // Renamed and made private since we'll call it from toggleSubtaskStatus
    private fun updateSubtasksApi() {
        viewModelScope.launch {
            try {
                isUpdatingSubtasks = true
                updateError = null

                val subtasks = subTask?.getOrNull() ?: emptyList()
                val taskId = task?.getOrNull()?.id ?: return@launch

                val result = repository.updateSubtasks(taskId, subtasks)

                if (result.isFailure) {
                    updateError = result.exceptionOrNull()?.message ?: "Failed to update subtasks"
                    // Optionally refresh subtasks from server if update failed
                    fetchSubTasks(taskId)
                }

            } catch (e: Exception) {
                updateError = e.message ?: "Failed to update subtasks"
                // Refresh subtasks from server if update failed
                task?.getOrNull()?.id?.let { taskId ->
                    fetchSubTasks(taskId)
                }
            } finally {
                isUpdatingSubtasks = false
            }
        }
    }

    // Keep the original method for manual updates if needed
    fun updateSubtasks() {
        updateSubtasksApi()
    }

    // Helper method to clear error
    fun clearUpdateError() {
        updateError = null
    }
}