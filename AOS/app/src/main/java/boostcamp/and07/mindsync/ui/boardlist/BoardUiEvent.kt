package boostcamp.and07.mindsync.ui.boardlist

sealed class BoardUiEvent {
    data object NavigateToBack : BoardUiEvent()

    data class ShowMessage(val message: String) : BoardUiEvent()
}
