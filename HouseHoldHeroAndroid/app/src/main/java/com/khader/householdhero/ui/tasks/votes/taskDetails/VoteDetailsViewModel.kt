package com.khader.householdhero.ui.tasks.votes.taskDetails

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.model.VoteApiResponse
import com.khader.householdhero.model.subTasks
import com.khader.householdhero.repository.TasksRepository
import kotlinx.coroutines.launch

class VoteDetailsViewModel (private val repository: TasksRepository): ViewModel() {
    var task by mutableStateOf<Result<TaskUnderVote>?>(null)
    var subTask by mutableStateOf<Result<List<subTasks>>?>(null)
        private set
    fun fetchTask(taskId:String) {

        viewModelScope.launch {
            val result = repository.getVote(taskId)
            task = result

        }
    }
    fun fetchSubTasks(taskId:String) {

        viewModelScope.launch {
            val result = repository.getVoteSubTask(taskId)
            subTask = result
        }
    }
    suspend fun submitVote(taskId: String, vote: String, userEmail: String): Result<VoteApiResponse> {

        return repository.updateVote(taskId, vote, userEmail)
    }
    suspend fun addComment(taskId: String, userEmail: String, comment: String): Result<VoteApiResponse> {

        return repository.addComment(taskId, userEmail, comment)
    }
}