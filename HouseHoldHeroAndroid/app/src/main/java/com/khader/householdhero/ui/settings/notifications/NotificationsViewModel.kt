package com.khader.householdhero.ui.settings.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.khader.householdhero.model.MessageData
import com.khader.householdhero.model.MessageDataCreate
import com.khader.householdhero.repository.MessagesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotificationsViewModel(
    private val messagesRepository: MessagesRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    private val _messages = MutableStateFlow<List<MessageData>>(emptyList())
    val messages: StateFlow<List<MessageData>> = _messages.asStateFlow()

    init {
        loadMessages()
    }

    fun sendMessage(subject: String, message: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            val sharedPrefs = messagesRepository.sharedPrefs
            val userEmail = sharedPrefs.getString("email", null)
            val adminEmail = sharedPrefs.getString("adminEmail", null)

            if (userEmail.isNullOrBlank() || adminEmail.isNullOrBlank()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "User email or admin email not found"
                )
                return@launch
            }

            val messageData = MessageDataCreate(
                to = adminEmail,
                from = userEmail,
                subject = subject,
                message = message,
                reply = null // Changed to null instead of empty string
            )

            messagesRepository.createMessage(messageData).fold(
                onSuccess = { response ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Message sent successfully!"
                    )
                    // Reload messages after sending
                    loadMessages()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "Failed to send message"
                    )
                }
            )
        }
    }

    fun loadMessages() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingMessages = true)

            messagesRepository.getMessages().fold(
                onSuccess = { messageList ->
                    _messages.value = messageList
                    _uiState.value = _uiState.value.copy(isLoadingMessages = false)
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoadingMessages = false,
                        error = exception.message ?: "Failed to load messages"
                    )
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun clearSuccessMessage() {
        _uiState.value = _uiState.value.copy(successMessage = null)
    }
}

data class NotificationsUiState(
    val isLoading: Boolean = false,
    val isLoadingMessages: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)