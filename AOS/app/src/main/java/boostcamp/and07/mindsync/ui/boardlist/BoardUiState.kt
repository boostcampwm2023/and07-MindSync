package boostcamp.and07.mindsync.ui.boardlist

import boostcamp.and07.mindsync.data.model.Board

data class BoardUiState(
    val boards: List<Board?> = listOf(),
    val selectBoard: List<Board>? = listOf(),
)
