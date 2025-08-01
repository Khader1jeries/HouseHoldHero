package com.khader.householdhero.ui.tasks.activeTasks

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch

class ActiveTasksViewModel(private val repository: TasksRepository): ViewModel() {
var tasks by mutableStateOf<Result<List<Task>>?>(null)
    fun fetchAllActiveTasks() {
        println("📥 ViewModel: fetchAllActiveTasks called")
        viewModelScope.launch {
            val result = repository.getAllActiveTasks()
            tasks = result
        }
    }
}