package boostcamp.and07.mindsync.network.request

import kotlinx.serialization.Serializable

@Serializable
data class JoinBoard(
    val boardId: String,
)
