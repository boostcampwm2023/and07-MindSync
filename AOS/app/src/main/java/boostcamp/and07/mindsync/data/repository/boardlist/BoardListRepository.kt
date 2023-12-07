package boostcamp.and07.mindsync.data.repository.boardlist

import boostcamp.and07.mindsync.data.model.Board
import kotlinx.coroutines.flow.Flow

interface BoardListRepository {
    fun createBoard(
        boardName: String,
        spaceId: String,
        imageUrl: String,
    ): Flow<Board>

    fun getBoard(spaceId: String): Flow<List<Board>>

    fun deleteBoard(boardId: String): Flow<Unit>
}
