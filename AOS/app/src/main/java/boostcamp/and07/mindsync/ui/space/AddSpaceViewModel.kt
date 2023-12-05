package boostcamp.and07.mindsync.ui.space

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.util.SpaceExceptionMessage
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import boostcamp.and07.mindsync.ui.util.toRequestBody
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class AddSpaceViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
    ) : ViewModel() {
        private val _spaceName = MutableStateFlow<String>("")
        val spaceName: StateFlow<String> = _spaceName
        private val _spaceThumbnail = MutableStateFlow<String>("")
        val spaceThumbnail: StateFlow<String> = _spaceThumbnail
        private var imageFile: File? = null
        private val _spaceEvent = MutableSharedFlow<SpaceEvent>()
        val spaceEvent = _spaceEvent.asSharedFlow()

        fun onSpaceNameChanged(
            inputSpaceName: CharSequence,
            start: Int,
            before: Int,
            count: Int,
        ) {
            _spaceName.value = inputSpaceName.toString()
        }

        fun setSpaceThumbnail(thumbnailUrl: String) {
            _spaceThumbnail.value = thumbnailUrl
        }

        fun setImageFile(file: File) {
            imageFile =경 file
        }

        fun addSpace() {
            imageFile?.let { imageFile ->
                val icon = fileToMultiPart(imageFile)
                val name = _spaceName.value.toRequestBody()
                viewModelScope.launch(Dispatchers.IO) {
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
