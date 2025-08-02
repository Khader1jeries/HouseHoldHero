package com.khader.householdhero.model

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class MessageData(
    val id: String,
    val createdAt: String,
    val to: String,
    val from: String,
    val subject: String,
    val message: String,
    val reply: String?
)
@JsonClass(generateAdapter = true)
data class MessageDataCreate (
    val to: String,
    val from: String,
    val subject: String,
    val message: String,
    val reply: String?
)
