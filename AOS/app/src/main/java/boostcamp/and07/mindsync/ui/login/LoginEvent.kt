package boostcamp.and07.mindsync.ui.login

sealed interface LoginEvent {
    data object LoginSuccess : LoginEvent

    data class LoginError(val message: String) : LoginEvent
}
