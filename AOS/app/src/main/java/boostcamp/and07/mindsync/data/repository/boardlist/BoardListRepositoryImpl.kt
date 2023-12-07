package boostcamp.and07.mindsync.data.repository.boardlist

import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.data.network.BoardApi
import boostcamp.and07.mindsync.data.network.request.board.CreateBoardRequest
import boostcamp.and07.mindsync.data.network.request.board.GetBoardsRequest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class BoardListRepositoryImpl
    @Inject
    constructor(
        private val boardApi: BoardApi,
    ) : BoardListRepository {
        override fun createBoard(
            boardName: String,
            spaceId: String,
            imageUrl: String,
        ): Flow<Board> =
            flow {
                val response =
                    boardApi.createBoard(
                        CreateBoardRequest(
                            boardName,
                            spaceId,
                            imageUrl,
                        ),
                    )
                emit(
                    Board(
                        id = response.boardId,
                        name = boardName,
                        date = response.date,
                        imageUrl = imageUrl,
                    ),
                )
            }

        override fun getBoard(spaceId: String): Flow<List<Board>> =
            flow {
                val response = boardApi.getBoards(GetBoardsRequest(spaceId))
                emit(
                    response.map { boardsResponse ->
                        Board(
                            id = boardsResponse.boardId,
                            name = boardsResponse.boardName,
                            date = boardsResponse.createdAt,
                            imageUrl = boardsResponse.imageUrl,
                        )
                    },
                )
            }
    }
