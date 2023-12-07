package boostcamp.and07.mindsync.ui.login

sealed interface LoginEvent {
    data object Success : LoginEvent

    data class Error(val message: String) : LoginEvent
}
