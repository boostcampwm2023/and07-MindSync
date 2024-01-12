package boostcamp.and07.mindsync.ui.profile

import android.net.Uri
import java.io.File

data class ProfileUiState(
    val serverFetchedImage: Uri = Uri.EMPTY,
    val serverFetchedNickName: String = "",
    val editingNickname: String = "",
    val imageUri: Uri = Uri.EMPTY,
    val nickname: String = "",
    val imageFile: File? = null,
    val isModify: Boolean = false,
    val isShownNicknameDialog: Boolean = false,
)
