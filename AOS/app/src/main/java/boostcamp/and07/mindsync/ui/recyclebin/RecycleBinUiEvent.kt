package boostcamp.and07.mindsync.ui.recyclebin

sealed class RecycleBinUiEvent {
    data object Success : RecycleBinUiEvent()

    data class Error(val message: String) : RecycleBinUiEvent()
}
