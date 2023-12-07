package boostcamp.and07.mindsync.data.network.request.board

import kotlinx.serialization.Serializable

@Serializable
data class DeleteBoardRequest(
    val boardId: String,
)
