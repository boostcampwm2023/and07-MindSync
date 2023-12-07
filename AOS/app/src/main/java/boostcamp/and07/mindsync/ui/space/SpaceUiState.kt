package boostcamp.and07.mindsync.ui.space

import boostcamp.and07.mindsync.data.model.Space
import java.io.File

data class SpaceUiState(
    val space: Space? = null,
    val spaceName: String = "",
    val spaceThumbnail: String = "",
    val spaceThumbnailFile: File? = null,
    val spaceInviteCode: String = "",
)
