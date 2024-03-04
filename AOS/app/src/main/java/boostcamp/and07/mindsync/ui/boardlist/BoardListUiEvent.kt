package boostcamp.and07.mindsync.ui.boardlist

sealed class BoardListUiEvent {
    data object NavigateToBack : BoardListUiEvent()

    data class ShowMessage(val message: String) : BoardListUiEvent()
}
