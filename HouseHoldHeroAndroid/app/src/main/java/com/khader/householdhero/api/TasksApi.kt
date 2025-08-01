package com.khader.householdhero.api


import com.khader.householdhero.model.SubtaskRequest
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.model.subTasks
import retrofit2.Response

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
interface TasksApi {
    @GET("tasks/android/{email}")
    suspend fun getTasks(@Path("email") email: String): List<Task>
    @GET("tasks/android/TwoActive/{email}")
    suspend fun getTwoActiveTasks(@Path("email") email: String): List<Task>
    @GET("tasks/android/TwoFuture/{email}")
    suspend fun getTwoFutureTasks(@Path("email") email: String): List<Task>
    @GET("tasks/android/TwoFinished/{email}")
    suspend fun getTwoFinishedTasks(@Path("email") email: String): List<Task>
    @GET("tasksUnderVote/android/TwoVotes/{adminEmail}/{email}")
    suspend fun getTwoVotes(@Path("adminEmail") adminEmail: String,
                            @Path("email") email: String): List<TaskUnderVote>
    @GET("tasksUnderVote/android/AllVotes/{adminEmail}/{email}")
    suspend fun getAllVotes(@Path("adminEmail") adminEmail: String,
                            @Path("email") email: String): List<TaskUnderVote>
    @GET("tasks/android/AllActive/{email}")
    suspend fun getAllActiveTasks(@Path("email") email: String): List<Task>
    @GET("tasks/android/AllFinished/{email}")
    suspend fun getAllFinishedTasks(@Path("email") email: String): List<Task>
    @GET("tasks/android/AllFuture/{email}")
    suspend fun getAllFutureTasks(@Path("email") email: String): List<Task>
    @GET("tasks/{taskId}")
    suspend fun getTask(@Path("taskId") taskId: String):Task
    @GET("tasks/android/subtasks/{taskId}")
    suspend fun getSubTasks(@Path("taskId") taskId: String): List<subTasks>
    @GET("tasksUnderVote/id/{taskId}")
    suspend fun getVote(@Path("taskId") taskId: String): TaskUnderVote
    @GET("tasksUnderVote/android/subtasks/{taskId}")
    suspend fun getVoteSubTasks(@Path("taskId") taskId: String): List<subTasks>
    @PUT("android/subtasks/complete/{taskId}")
    suspend fun updateSubtasks(
        @Path("taskId") taskId: String,
        @Body request: SubtaskRequest
    ): Response<Unit>
}