package com.khader.householdhero.repository

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.khader.householdhero.api.TasksApi
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.ui.tasks.activeTasks.ActiveTasksViewModel

class TasksRepository(private val api: TasksApi,    private val context: Context) {
    val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
    val email = sharedPrefs.getString("email", null)
    val adminEmail = sharedPrefs.getString("adminEmail", null)
    suspend fun getTwoActiveTasks(): Result<List<Task>> {
        return try {


            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }

            val response = api.getTwoActiveTasks(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getTwoFutureTasks(): Result<List<Task>> {
        return try {
            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }

            val response = api.getTwoFutureTasks(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getTwoFinishedTasks(): Result<List<Task>> {
        return try {
            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }

            val response = api.getTwoFinishedTasks(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getTwoVotes(): Result<List<TaskUnderVote>> {
        return try {

            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }
            if (adminEmail.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }

            val response = api.getTwoVotes(adminEmail,email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getAllVotes(): Result<List<TaskUnderVote>> {
        return try {

            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }
            if (adminEmail.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }

            val response = api.getAllVotes(adminEmail,email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getAllActiveTasks(): Result<List<Task>> {
        return try {

            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }


            val response = api.getAllActiveTasks(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getAllFinishedTasks(): Result<List<Task>> {
        return try {

            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }


            val response = api.getAllFinishedTasks(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun getAllFutureTasks(): Result<List<Task>> {
        return try {

            if (email.isNullOrBlank()) {
                return Result.failure(Exception("User email not found in SharedPreferences"))
            }


            val response = api.getAllFutureTasks(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

}
