package boostcamp.and07.mindsync.data.network.request.board

import kotlinx.serialization.Serializable

@Serializable
data class CreateBoardRequest(
    val boardName: String,
    val spaceId: String,
    val imageUrl: String,
)
