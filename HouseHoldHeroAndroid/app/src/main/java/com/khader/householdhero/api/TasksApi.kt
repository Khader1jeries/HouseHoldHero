package com.khader.householdhero.api


import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote

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
    @GET("tasksUnderVote/android/TwoVotes/{email}")
    suspend fun getTwoVotes(@Path("email") email: String): List<TaskUnderVote>
}