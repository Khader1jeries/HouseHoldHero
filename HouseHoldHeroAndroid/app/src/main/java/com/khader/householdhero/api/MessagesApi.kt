package com.khader.householdhero.api


import com.khader.householdhero.model.CommentRequest
import com.khader.householdhero.model.LoginResponse
import com.khader.householdhero.model.MemberData
import com.khader.householdhero.model.MessageData

import com.khader.householdhero.model.MessageDataCreate
import com.khader.householdhero.model.SubtaskRequest
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.model.VoteApiResponse
import com.khader.householdhero.model.subTasks
import retrofit2.Response

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
interface MessagesApi {
    @POST("messages/")
    suspend fun createMessage(@Body message: MessageDataCreate): LoginResponse
    @GET("messages/android/{email}")
    suspend fun getMessages(@Path("email") email: String): List<MessageData>
}