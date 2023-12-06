package boostcamp.and07.mindsync.ui.space

import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.FragmentConfirmInviteSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ConfirmInviteSpaceFragment :
    BaseFragment<FragmentConfirmInviteSpaceBinding>(R.layout.fragment_confirm_invite_space) {
    private val confirmInviteSpaceViewModel: ConfirmInviteSpaceViewModel by viewModels()
    private val args: ConfirmInviteSpaceFragmentArgs by navArgs()

    override fun initView() {
        setBinding()
        confirmInviteSpaceViewModel.updateSpace(args.space)
        setNoButton()
    }

    private fun setBinding() {
        binding.vm = confirmInviteSpaceViewModel
    }

    private fun setNoButton() {
        binding.btnConfirmInviteSpaceNo.setOnClickListener {
            parentFragmentManager.popBackStack()
        }
    }
}
