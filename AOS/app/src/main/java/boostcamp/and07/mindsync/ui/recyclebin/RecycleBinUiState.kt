package boostcamp.and07.mindsync.ui.recyclebin

import boostcamp.and07.mindsync.data.model.Board

data class RecycleBinUiState(
    val spaceId: String = "",
    val boards: List<Board> = listOf(),
    val selectBoards: List<Board> = listOf(),
)
