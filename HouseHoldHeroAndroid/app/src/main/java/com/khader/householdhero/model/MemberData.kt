package com.khader.householdhero.model

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class MemberData (
    val email:String,
    val fullName:String,
    val createdAt:String,
    val score:Int,
    val completedTasks:Int,
    val activeTasks:Int,
    val completionRate: Double,
    val firstName: String,
    val lastName: String,
    val phoneNumber: String,
    val countryCode:String
)
@JsonClass(generateAdapter = true)
data class EditMemberData (
    val firstName:String,
    val lastName:String,
    val countryCode:String,
    val phoneNumber:String,
)
@JsonClass(generateAdapter = true)
data class MessagesApiResponse(
    val success: Boolean,
    val data: List<MessageData>
)