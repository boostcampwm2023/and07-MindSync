package boostcamp.and07.mindsync.ui.space

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class AddInviteSpaceViewModel : ViewModel() {
    private val _spaceInviteCode = MutableStateFlow("")
    val spaceInviteCode: StateFlow<String> = _spaceInviteCode

    fun onSpaceInviteCodeChanged(
        s: CharSequence,
        start: Int,
        before: Int,
        count: Int,
    ) {
        _spaceInviteCode.value = s.toString()
    }
}
