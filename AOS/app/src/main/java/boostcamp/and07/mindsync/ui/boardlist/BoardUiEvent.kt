package boostcamp.and07.mindsync.ui.boardlist

sealed class BoardUiEvent {
    data object Success : BoardUiEvent()

    data class Error(val message: String) : BoardUiEvent()
}
