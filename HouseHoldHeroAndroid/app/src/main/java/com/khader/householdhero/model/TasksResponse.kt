package com.khader.householdhero.model


import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class Task(
    val id: String,
    val title: String,
    val description: String,
    val priority: String,
    val assignedTo: String,
    val createdAt: String,
    val startDate: String,
    val dueDate: String,
    val score: Int,
    val status: Boolean,

)
data class subTasks(
    val id:String,
    val score: Double,
    val status: Boolean

)