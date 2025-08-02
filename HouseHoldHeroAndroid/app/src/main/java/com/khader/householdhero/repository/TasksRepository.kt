package com.khader.householdhero.repository

import android.content.Context
import com.khader.householdhero.api.TasksApi
import com.khader.householdhero.model.CommentRequest
import com.khader.householdhero.model.SubtaskRequest
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.model.VoteApiResponse
import com.khader.householdhero.model.subTasks

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
    suspend fun getTask(taskId:String): Result<Task> {
        return try {
            val response = api.getTask(taskId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }

}
    suspend fun getSubTask(taskId:String): Result<List<subTasks>> {
        return try {
            val response = api.getSubTasks(taskId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }

    }
    suspend fun getVote(taskId:String): Result<TaskUnderVote> {
        return try {
            val response = api.getVote(taskId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }

    }
    suspend fun getVoteSubTask(taskId:String): Result<List<subTasks>> {
        return try {
            val response = api.getVoteSubTasks(taskId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }

    }
    suspend fun updateSubtasks(taskId: String, subtasks: List<subTasks>): Result<Unit> {
        return try {
            val request = SubtaskRequest(subtasks)

            // Add debugging
            println("🔄 Updating subtasks for task: $taskId")
            println("📦 Subtasks to send: $subtasks")
            println("📦 Request object: $request")

            val response = api.updateSubtasks(taskId, request)

            println("📡 Response code: ${response.code()}")
            println("📡 Response message: ${response.message()}")

            if (!response.isSuccessful) {
                val errorBody = response.errorBody()?.string()
                println("❌ Error body: $errorBody")
            }

            if (response.isSuccessful) {
                println("✅ Subtasks updated successfully")
                Result.success(Unit)
            } else {
                Result.failure(Exception("Error: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            println("❌ Exception in updateSubtasks: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
    suspend fun updateVote(taskId: String, vote: String, userEmail: String): Result<VoteApiResponse> {
        return try {
            val response = api.updateVote(taskId, vote, userEmail)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update vote: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addComment(taskId: String, userEmail: String, comment: String): Result<VoteApiResponse> {
        return try {
            println("🔄 Repository: Adding comment for task $taskId, email: $userEmail")
            val commentRequest = CommentRequest(comment)
            val response = api.addComment(taskId, userEmail, commentRequest)

            println("📡 Repository: Response code: ${response.code()}")
            println("📡 Repository: Response message: ${response.message()}")

            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                println("✅ Repository: Comment added successfully - ${body.message}")
                Result.success(body)
            } else {
                val errorMsg = "Failed to add comment: ${response.code()} ${response.message()}"
                println("❌ Repository: $errorMsg")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            println("❌ Repository: Exception in addComment: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
}
