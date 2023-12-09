package boostcamp.and07.mindsync.ui.profile

sealed class ProfileUiEvent {
    data object NavigateToBack : ProfileUiEvent()

    data class ShowMessage(val message: String) : ProfileUiEvent()

    data object UpdateProfileNickName: ProfileUiEvent()
}
