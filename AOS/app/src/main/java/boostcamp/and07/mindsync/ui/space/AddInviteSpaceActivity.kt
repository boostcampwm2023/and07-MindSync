package boostcamp.and07.mindsync.ui.space

import androidx.activity.viewModels
import androidx.fragment.app.viewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityAddInviteSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AddInviteSpaceActivity :
    BaseActivity<ActivityAddInviteSpaceBinding>(R.layout.activity_add_invite_space) {
    private val testInviteCode = "1234"
    private val addInviteSpaceViewModel: AddInviteSpaceViewModel by viewModels()

    override fun init() {
        setBinding()
    }

    private fun setBinding() {
        binding.vm = addInviteSpaceViewModel
        binding.view = this
    }

    fun compareInviteCode() {
        if (testInviteCode != addInviteSpaceViewModel.spaceInviteCode.value) {
            Snackbar.make(binding.root, "초대코드가 일치하지않습니다.", Snackbar.LENGTH_SHORT).show()
        } else {
            Snackbar.make(binding.root, "초대코드가 일치합니다", Snackbar.LENGTH_SHORT).show()
        }
    }
}
