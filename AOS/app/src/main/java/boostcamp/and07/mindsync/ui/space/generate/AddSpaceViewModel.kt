package boostcamp.and07.mindsync.ui.space.generate

import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import boostcamp.and07.mindsync.ui.util.toRequestBody
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class AddSpaceViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
        logoutEventRepository: LogoutEventRepository,
    ) : BaseActivityViewModel(logoutEventRepository) {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState
        private val _event = MutableSharedFlow<SpaceUiEvent>()
        val event = _event.asSharedFlow()
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(SpaceUiEvent.ShowMessage(throwable.message.toString())) }
            }

        fun onSpaceNameChanged(
            inputSpaceName: CharSequence,
            start: Int,
            before: Int,
            count: Int,
        ) {
            _uiState.update { uiState ->
                uiState.copy(spaceName = inputSpaceName.toString())
            }
        }

        fun setSpaceThumbnail(thumbnailUrl: String) {
            _uiState.update { uiState ->
                uiState.copy(spaceThumbnail = thumbnailUrl)
            }
        }

        fun setImageFile(file: File) {
            _uiState.update { uiState ->
                uiState.copy(spaceThumbnailFile = file)
            }
        }

        fun addSpace(imageName: String) {
            val icon =
                _uiState.value.spaceThumbnailFile?.let { imageFile ->
                    fileToMultiPart(imageFile, imageName)
                }
            val name = _uiState.value.spaceName.toRequestBody()
            viewModelScope.launch(coroutineExceptionHandler) {
                spaceRepository.addSpace(name, icon).collectLatest { space ->
                    _event.emit(SpaceUiEvent.SuccessAdd)
                }
            }
        }
    }
