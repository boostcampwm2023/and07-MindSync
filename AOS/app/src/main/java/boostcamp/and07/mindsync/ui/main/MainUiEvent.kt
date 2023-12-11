package boostcamp.and07.mindsync.ui.main

sealed class MainUiEvent {
    data class ShowMessage(val message: String) : MainUiEvent()

    data object GetUsers : MainUiEvent()

    data class LeaveSpace(val spaceName: String) : MainUiEvent()
}
