package boostcamp.and07.mindsync.ui.profile

import android.net.Uri

data class ProfileUiState(
    val imageUri: Uri = Uri.EMPTY,
    val nickname: String = "",
)
