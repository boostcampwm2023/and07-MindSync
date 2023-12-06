package boostcamp.and07.mindsync.ui.space.generate

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.space.SpaceEvent
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import boostcamp.and07.mindsync.ui.util.SpaceExceptionMessage
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import boostcamp.and07.mindsync.ui.util.toRequestBody
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class AddSpaceViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
    ) : ViewModel() {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState
        private var imageFile: File? = null
        private val _spaceEvent = MutableSharedFlow<SpaceEvent>()
        val spaceEvent = _spaceEvent.asSharedFlow()

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
            imageFile = file
        }

        fun addSpace(imageName: String) {
            imageFile?.let { imageFile ->
                val icon = fileToMultiPart(imageFile, imageName)
                val name = _uiState.value.spaceName.toRequestBody()
                viewModelScope.launch {
                    spaceRepository.addSpace(name, icon)
                        .onSuccess {
                            _spaceEvent.emit(SpaceEvent.Success)
                        }
                        .onFailure {
                            _spaceEvent.emit(SpaceEvent.Error(SpaceExceptionMessage.ERROR_MESSAGE_SPACE_ADD.message))
                        }
                }
            }
        }
    }
