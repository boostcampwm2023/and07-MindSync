package boostcamp.and07.mindsync.ui.space

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class AddSpaceViewModel : ViewModel() {
    private val _spaceName = MutableStateFlow<String>("")
    val spaceName: StateFlow<String> = _spaceName

    fun onSpaceNameChanged(s: CharSequence, start: Int, before: Int, count: Int) {
        _spaceName.value = s.toString()
    }
}
