package com.khader.householdhero.ui.tasks.activeTasks.taskDetails

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch

class ActiveTaskDetailsViewModel (private val repository: TasksRepository): ViewModel() {
    var task by mutableStateOf<Result<Task>?>(null)
    fun fetchTask(taskId:String) {

        viewModelScope.launch {
            val result = repository.getTask(taskId)
            task = result
        }
    }
}