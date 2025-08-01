package com.khader.householdhero.ui.tasks.activeTasks

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.repository.TasksRepository
import com.khader.householdhero.network.RetrofitInstance

class ActiveTasksViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ActiveTasksViewModel::class.java)) {
            val repository = TasksRepository(RetrofitInstance.tasksApi, context)
            return ActiveTasksViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}