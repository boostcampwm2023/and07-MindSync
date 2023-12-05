package boostcamp.and07.mindsync.ui.space

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
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
    private val _imageFile = MutableStateFlow<File?>(null)
    val imageFile: StateFlow<File?> = _imageFile

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
        _imageFile.value = file
    }

    fun addSpace() {
        _imageFile.value?.let { imageFile ->
            val icon = fileToMultiPart(imageFile)
            viewModelScope.launch(Dispatchers.IO) {
                val result =
                    spaceRepository.addSpace(_spaceName.value, icon)
            }
        }
    }
}
