package boostcamp.and07.mindsync.ui.space.list

import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.databinding.FragmentSpaceListBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.boardlist.SpaceListAdapter
import boostcamp.and07.mindsync.ui.main.MainUiEvent
import boostcamp.and07.mindsync.ui.main.MainViewModel
import boostcamp.and07.mindsync.ui.main.SpaceClickListener
import boostcamp.and07.mindsync.ui.util.setClickEvent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SpaceListFragment : BaseFragment<FragmentSpaceListBinding>(R.layout.fragment_space_list) {
    private val spaceListViewModel: MainViewModel by activityViewModels()
    private val spaceListAdapter = SpaceListAdapter()

    override fun initView() {
        setBinding()
        spaceListViewModel.getSpaces()
        collectBoardEvent()
    }

    private fun setBinding() {
        binding.vm = spaceListViewModel
        binding.rvSpaceList.adapter = spaceListAdapter
        spaceListAdapter.setSpaceClickListener(
            object : SpaceClickListener {
                override fun onClickSpace(space: Space) {
                    spaceListViewModel.updateCurrentSpace(space)
                    findNavController().navigate(
                        SpaceListFragmentDirections.actionToBoardListFragment(
                            spaceId = space.id,
                        ),
                    )
                }
            },
        )
        binding.btnSpaceListAddSpace.setClickEvent(lifecycleScope) {
            findNavController().navigate(
                R.id.action_to_addSpaceDialog,
            )
        }
    }

    override fun onResume() {
        super.onResume()
        spaceListViewModel.getSpaces()
    }

    private fun collectBoardEvent() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                spaceListViewModel.event.collectLatest { spaceEvent ->
                    when (spaceEvent) {
                        is MainUiEvent.ShowMessage -> {
                            showMessage(spaceEvent.message)
                        }
                        else -> {}
                    }
                }
            }
        }
    }
}
