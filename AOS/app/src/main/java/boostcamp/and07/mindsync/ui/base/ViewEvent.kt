package boostcamp.and07.mindsync.ui.base

sealed interface ViewEvent {
    data object Logout : ViewEvent
}
