package boostcamp.and07.mindsync.data.repository.boardlist

import boostcamp.and07.mindsync.data.model.Board
import kotlinx.coroutines.flow.Flow
import okhttp3.MultipartBody

interface BoardListRepository {
    fun createBoard(
        boardName: String,
        spaceId: String,
        imageUrl: MultipartBody.Part?,
    ): Flow<Board>

    fun getBoard(spaceId: String): Flow<List<Board>>

    fun deleteBoard(boardId: String): Flow<Boolean>

    fun restoreBoard(boardId: String): Flow<Boolean>
}
