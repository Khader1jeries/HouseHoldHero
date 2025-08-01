package com.khader.householdhero.ui.tasks.futureTasks

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch

class FutureTasksViewModel (private val repository: TasksRepository): ViewModel() {
    var tasks by mutableStateOf<Result<List<Task>>?>(null)
    fun fetchAllFutureTasks() {
        viewModelScope.launch {
            val result = repository.getAllFutureTasks()
            tasks = result
        }
    }}