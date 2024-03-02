package boostcamp.and07.mindsync.ui.space.join

import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.FragmentInputSpaceCodeBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class InputSpaceCodeFragment :
    BaseFragment<FragmentInputSpaceCodeBinding>(R.layout.fragment_input_space_code) {
    private val inputSpaceCodeViewModel: InputSpaceCodeViewModel by viewModels()

    override fun initView() {
        setBinding()
        collectSpaceEvent()
    }

    private fun setBinding() {
        binding.vm = inputSpaceCodeViewModel
        binding.view = this
    }

    private fun collectSpaceEvent() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                inputSpaceCodeViewModel.event.collectLatest { spaceEvent ->
                    when (spaceEvent) {
                        is SpaceUiEvent.NavigationToConfirmSpace -> {
                            findNavController().navigate(
                                InputSpaceCodeFragmentDirections.actionToConfirmInviteSpaceFragment(
                                    spaceEvent.space,
                                ),
                            )
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
