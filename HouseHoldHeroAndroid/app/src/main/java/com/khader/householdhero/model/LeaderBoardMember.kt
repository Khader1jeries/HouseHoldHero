package com.khader.householdhero.model

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class LeaderboardMember(
    val id: String,
    val fullName: String,
    val completedTasks: Int,
    val score: Int,

)