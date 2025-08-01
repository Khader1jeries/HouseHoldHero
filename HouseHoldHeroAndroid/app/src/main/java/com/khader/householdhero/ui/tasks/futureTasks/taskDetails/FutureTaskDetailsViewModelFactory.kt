package com.khader.householdhero.ui.tasks.futureTasks.taskDetails

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.TasksRepository

class FutureTaskDetailsViewModelFactory(
    private val context: Context
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FutureTaskDetailsViewModel::class.java)) {
            val repository = TasksRepository(RetrofitInstance.tasksApi, context)
            return FutureTaskDetailsViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}