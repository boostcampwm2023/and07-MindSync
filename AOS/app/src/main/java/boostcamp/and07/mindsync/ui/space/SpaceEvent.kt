package boostcamp.and07.mindsync.ui.space

import boostcamp.and07.mindsync.data.model.Space

interface SpaceEvent {
    data object Success : SpaceEvent

    data class Error(val message: String) : SpaceEvent

    data class GetSuccess(val space: Space) : SpaceEvent
}
