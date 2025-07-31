package com.khader.householdhero.ui.tasks

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
class TasksViewModel(    private val tasksRepository: TasksRepository

) : ViewModel() {

    var twoActiveTasksResult by mutableStateOf<Result<List<Task>>?>(null)
        private set
    var twoFutureTasksResult by mutableStateOf<Result<List<Task>>?>(null)
        private set
    var twoFinishedTasksResult by mutableStateOf<Result<List<Task>>?>(null)
        private set
    var twoVotes by mutableStateOf<Result<List<TaskUnderVote>>?>(null)
        private set

    fun fetchTwoActiveTasks() {
        println("📥 ViewModel: fetchTwoActiveTasks called")
        viewModelScope.launch {
            val result = tasksRepository.getTwoActiveTasks()
            println("📦 ViewModel: tasks fetched, result = $result")
            twoActiveTasksResult = result
        }
    }
    fun fetchTwoFutureTasks() {
        println("📥 ViewModel: fetchTwoFutureTasks called")
        viewModelScope.launch {
            val result = tasksRepository.getTwoFutureTasks()
            println("📦 ViewModel: tasks fetched, result = $result")
            twoFutureTasksResult = result
        }
    }
    fun fetchTwoFinishedTasks() {
        println("📥 ViewModel: fetchTwoFinishedTasks called")
        viewModelScope.launch {
            val result = tasksRepository.getTwoFinishedTasks()
            println("📦 ViewModel: tasks fetched, result = $result")
            twoFinishedTasksResult = result
        }
    }
    fun fetchTwoVotes() {
        viewModelScope.launch {
            val result = tasksRepository.getTwoVotes()
            println("📦 ViewModel: tasks fetched, result = $result")
            twoVotes = result
        }
    }
    fun clearResult() {
        twoActiveTasksResult = null
        twoFutureTasksResult = null
        twoFinishedTasksResult=null
        twoVotes=null
    }
}
class TasksViewModelFactory(
    private val repository: TasksRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return TasksViewModel(repository) as T
    }
}