package boostcamp.and07.mindsync.ui.login

sealed interface LoginEvent {
    data class Success(val accessToken: String) : LoginEvent

    data class Error(val message: String) : LoginEvent
}
