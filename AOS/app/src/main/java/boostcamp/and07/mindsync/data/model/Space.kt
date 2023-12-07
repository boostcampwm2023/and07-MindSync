package boostcamp.and07.mindsync.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Space(
    val id: String,
    val name: String,
    val imageUrl: String,
    var isSelected: Boolean = false,
) : java.io.Serializable
