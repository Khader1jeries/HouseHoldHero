package com.khader.householdhero.model


import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TaskUnderVote(
    val id: String,
    val title: String,
    val description: String,
    val priority: String,
    val adminEmail: String,
    val createdAt: String,
    val startDate: String,
    val dueDate: String,
    val score: Int,
    val yes: List<String>,
    val no: List<String>
)