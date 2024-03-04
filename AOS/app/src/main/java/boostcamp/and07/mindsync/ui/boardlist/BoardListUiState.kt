package boostcamp.and07.mindsync.ui.boardlist

import boostcamp.and07.mindsync.data.model.Board

data class BoardListUiState(
    val spaceId: String = "",
    val boards: List<Board> = listOf(),
    val selectBoards: List<Board> = listOf(),
)
