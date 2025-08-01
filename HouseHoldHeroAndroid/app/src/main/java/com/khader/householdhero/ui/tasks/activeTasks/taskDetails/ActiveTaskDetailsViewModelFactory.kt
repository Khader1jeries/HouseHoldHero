package com.khader.householdhero.ui.tasks.activeTasks.taskDetails

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.TasksRepository
import com.khader.householdhero.ui.tasks.activeTasks.ActiveTasksViewModel

class ActiveTaskDetailsViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ActiveTaskDetailsViewModel::class.java)) {
            val repository = TasksRepository(RetrofitInstance.tasksApi, context)
            return ActiveTaskDetailsViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}