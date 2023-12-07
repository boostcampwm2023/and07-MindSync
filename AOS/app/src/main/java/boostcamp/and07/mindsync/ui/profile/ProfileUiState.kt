package boostcamp.and07.mindsync.ui.profile

import android.net.Uri
import java.io.File

data class ProfileUiState(
    val imageUri: Uri = Uri.EMPTY,
    val nickname: String = "",
    val imageFile: File? = null,
)
