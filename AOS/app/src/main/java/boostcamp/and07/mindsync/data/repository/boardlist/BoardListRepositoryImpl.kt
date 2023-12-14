package boostcamp.and07.mindsync.data.repository.boardlist

import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.data.network.api.BoardApi
import boostcamp.and07.mindsync.data.network.request.board.DeleteBoardRequest
import boostcamp.and07.mindsync.data.network.request.board.RestoreBoardRequest
import boostcamp.and07.mindsync.ui.util.toRequestBody
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MultipartBody
import javax.inject.Inject

class BoardListRepositoryImpl
    @Inject
    constructor(
        private val boardApi: BoardApi,
    ) : BoardListRepository {
        override fun createBoard(
            boardName: String,
            spaceId: String,
            imageUrl: MultipartBody.Part?,
        ): Flow<Board> =
            flow {
                val response =
                    boardApi.createBoard(
                        boardName.toRequestBody(),
                        spaceId.toRequestBody(),
                        imageUrl,
                    )
                response.data?.let { data ->
                    emit(
                        Board(
                            id = data.boardId,
                            name = boardName,
                            date = data.date,
                            imageUrl = data.imageUrl,
                        ),
                    )
                }
            }

        override fun getBoard(
            spaceId: String,
            isDeleted: Boolean,
        ): Flow<List<Board>> =
            flow {
                val response = boardApi.getBoards(spaceId)
                emit(
                    response.data.filter { board -> board.isDeleted == isDeleted }.map { board ->
                        Board(
                            id = board.boardId,
                            name = board.boardName,
                            date = board.createdAt,
                            imageUrl = board.imageUrl,
                        )
                    },
                )
            }

        override fun deleteBoard(boardId: String): Flow<Boolean> =
            flow {
                val response = boardApi.deleteBoard(DeleteBoardRequest(boardId))
                emit(true)
            }

        override fun restoreBoard(boardId: String): Flow<Boolean> =
            flow {
                val response = boardApi.restoreBoard(RestoreBoardRequest(boardId))
                emit(true)
            }
    }
