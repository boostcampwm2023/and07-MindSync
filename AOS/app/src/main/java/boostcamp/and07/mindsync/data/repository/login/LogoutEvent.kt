package boostcamp.and07.mindsync.data.repository.login

sealed interface LogoutEvent {
    data object Logout : LogoutEvent
}
