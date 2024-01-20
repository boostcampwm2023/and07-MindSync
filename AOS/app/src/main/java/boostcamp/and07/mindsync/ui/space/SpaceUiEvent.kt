package boostcamp.and07.mindsync.ui.space

import boostcamp.and07.mindsync.data.model.Space

sealed class SpaceUiEvent {
    data object NavigateToBack : SpaceUiEvent()

    data class ShowMessage(val message: String) : SpaceUiEvent()

    data object JoinSpace : SpaceUiEvent()

    data class NavigationToConfirmSpace(val space: Space) : SpaceUiEvent()

    data object SuccessAdd : SpaceUiEvent()
}
