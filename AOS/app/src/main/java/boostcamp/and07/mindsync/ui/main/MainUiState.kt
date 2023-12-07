package boostcamp.and07.mindsync.ui.main

import boostcamp.and07.mindsync.data.model.Space

data class MainUiState(
    val profileImageUrl: String = "",
    val spaces: List<Space> = listOf(),
)
