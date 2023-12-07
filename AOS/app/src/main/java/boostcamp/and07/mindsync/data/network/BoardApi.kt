package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.request.board.CreateBoardRequest
import boostcamp.and07.mindsync.data.network.request.board.DeleteBoardRequest
import boostcamp.and07.mindsync.data.network.response.board.BoardsResponse
import boostcamp.and07.mindsync.data.network.response.board.CreateBoardResponse
import boostcamp.and07.mindsync.data.network.response.board.DeleteBoardResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Query

interface BoardApi {
    @POST("boards/create")
    suspend fun createBoard(
        @Body createBoardRequest: CreateBoardRequest,
    ): CreateBoardResponse

    @GET("boards/list")
    suspend fun getBoards(
        @Query("spaceId") spaceId: String,
    ): BoardsResponse

    @PATCH("boards/delete")
    suspend fun deleteBoard(
        @Body deleteBoardRequest: DeleteBoardRequest,
    ): DeleteBoardResponse
}
