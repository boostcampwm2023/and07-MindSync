package boostcamp.and07.mindsync.ui.recyclebin

sealed class RecycleBinUiEvent {
    data object NavigateToBack : RecycleBinUiEvent()

    data class ShowMessage(val message: String) : RecycleBinUiEvent()
}
