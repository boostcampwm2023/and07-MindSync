package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.request.board.CreateBoardRequest
import boostcamp.and07.mindsync.data.network.request.board.GetBoardsRequest
import boostcamp.and07.mindsync.data.network.response.board.BoardsResponse
import boostcamp.and07.mindsync.data.network.response.board.CreateBoardResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface BoardApi {
    @POST("boards/create")
    suspend fun createBoard(
        @Body createBoardRequest: CreateBoardRequest,
    ): CreateBoardResponse

    @POST("boards/list")
    suspend fun getBoards(
        @Body getBoardsRequest: GetBoardsRequest,
    ): List<BoardsResponse>
}
