package com.khader.householdhero.model

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class MemberData (
    val id:String,
    val fullName:String,
    val createdAt:String,
    val score:Int,
    val completedTasks:Int,
    val activeTasks:Int,
    val completionRate: Double
)