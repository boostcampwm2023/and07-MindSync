package boostcamp.and07.mindsync.ui.main

import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.response.user.UserData

data class MainUiState(
    val profileImageUrl: String = "",
    val spaces: List<Space> = listOf(),
    val nowSpace: Space? = null,
    val users: List<UserData> = listOf(),
)
