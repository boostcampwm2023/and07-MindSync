package boostcamp.and07.mindsync.ui.main

sealed class MainUiEvent {
    data class ShowMessage(val message: String) : MainUiEvent()
}
