package boostcamp.and07.mindsync.ui.boardlist

import boostcamp.and07.mindsync.data.model.Board
import java.io.File

data class BoardListUiState(
    val spaceId: String = "",
    val boards: List<Board> = listOf(),
    val selectBoards: List<Board> = listOf(),
    val isShownDialog: Boolean = false,
    val boardName: String = "",
    val boardImage: String = "",
    val boardThumbnailFile: File? = null,
)
