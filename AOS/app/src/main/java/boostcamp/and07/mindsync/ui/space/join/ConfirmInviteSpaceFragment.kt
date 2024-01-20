package boostcamp.and07.mindsync.ui.space.join

import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.FragmentConfirmInviteSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ConfirmInviteSpaceFragment :
    BaseFragment<FragmentConfirmInviteSpaceBinding>(R.layout.fragment_confirm_invite_space) {
    private val confirmInviteSpaceViewModel: ConfirmInviteSpaceViewModel by viewModels()
    private val args: ConfirmInviteSpaceFragmentArgs by navArgs()

    override fun initView() {
        setBinding()
        confirmInviteSpaceViewModel.updateSpace(args.space)
        setNoButton()
        collectSpaceEvent()
    }

    private fun setBinding() {
        binding.vm = confirmInviteSpaceViewModel
    }

    private fun setNoButton() {
        binding.btnConfirmInviteSpaceNo.setOnClickListener {
            parentFragmentManager.popBackStack()
        }
    }

    private fun collectSpaceEvent() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                confirmInviteSpaceViewModel.event.collectLatest { spaceEvent ->
                    when (spaceEvent) {
                        is SpaceUiEvent.JoinSpace -> {
                            findNavController().navigate(R.id.action_to_mainActitivty)
                        }

                        is SpaceUiEvent.ShowMessage -> {
                            showMessage(spaceEvent.message)
                        }
                        else -> {}
                    }
                }
            }
        }
    }
}
