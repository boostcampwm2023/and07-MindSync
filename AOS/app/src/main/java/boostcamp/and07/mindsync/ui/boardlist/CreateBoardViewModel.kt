package boostcamp.and07.mindsync.ui.boardlist

import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import boostcamp.and07.mindsync.ui.util.toRequestBody
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import java.io.File
import javax.inject.Inject

@HiltViewModel
class CreateBoardViewModel
@Inject
constructor(
    logoutEventRepository: LogoutEventRepository,
) : BaseActivityViewModel(logoutEventRepository) {
    private val _uiState = MutableStateFlow(CreateBoardUiState())
    val uiState: StateFlow<CreateBoardUiState> = _uiState

    private var imageFile: File? = null

    fun onBoardNameChanged(
        inputSpaceName: CharSequence,
        start: Int,
        before: Int,
        count: Int,
    ) {
        _uiState.update { uiState ->
            uiState.copy(boardName = inputSpaceName.toString())
        }
    }

    fun setSpaceImage(boardImage: String) {
        _uiState.update { uiState ->
            uiState.copy(boardImage = boardImage)
        }
    }

    fun addBoard(imageName: String) {
        imageFile?.let { imageFile ->
            val icon = fileToMultiPart(imageFile, imageName)
            val name = _uiState.value.boardName.toRequestBody()
        }
    }
}

data class CreateBoardUiState(
    val boardName: String = "",
    val boardImage: String = "",
)

