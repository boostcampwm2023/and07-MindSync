package boostcamp.and07.mindsync.ui.space

interface SpaceEvent {
    data object Success : SpaceEvent

    data class Error(val message: String) : SpaceEvent
}
