package com.khader.householdhero.ui.tasks.votes

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch

class VotingTasksViewModel(private val repository: TasksRepository): ViewModel() {
    var tasks by mutableStateOf<Result<List<TaskUnderVote>>?>(null)
    fun fetchAllVotes() {

        viewModelScope.launch {
            val result = repository.getAllVotes()
            tasks = result
        }
    }
}