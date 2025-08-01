package com.khader.householdhero.ui.tasks.finishedTasks.taskDetails

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.TasksRepository

class FinishedTaskDetailsViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FinishedTaskDetailsViewModel::class.java)) {
            val repository = TasksRepository(RetrofitInstance.tasksApi, context)
            return FinishedTaskDetailsViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}