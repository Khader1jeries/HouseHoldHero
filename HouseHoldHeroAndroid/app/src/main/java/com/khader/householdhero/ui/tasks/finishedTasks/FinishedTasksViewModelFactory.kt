package com.khader.householdhero.ui.tasks.finishedTasks

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.repository.TasksRepository
import com.khader.householdhero.network.RetrofitInstance

class FinishedTasksViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FinishedTasksViewModel::class.java)) {
            val repository = TasksRepository(RetrofitInstance.tasksApi, context)
            return FinishedTasksViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}