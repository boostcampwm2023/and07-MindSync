package boostcamp.and07.mindsync.ui.recyclebin

import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.FragmentRecycleBinBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class RecycleBinFragment : BaseFragment<FragmentRecycleBinBinding>(R.layout.fragment_recycle_bin) {
    private val recycleBinViewModel: RecycleBinViewModel by viewModels()
    private val recycleBinAdapter = RecycleBinAdapter()
    private val args: RecycleBinFragmentArgs by navArgs()

    override fun initView() {
        setBinding()
        setBoardRestoreButton()
        collectRecycleBinEvent()
        recycleBinViewModel.setSpace(args.spaceId)
    }

    private fun setBinding() {
        binding.vm = recycleBinViewModel
        binding.rvRecyclebinBoard.adapter = recycleBinAdapter
        recycleBinAdapter.setRecycleBinClickListener(
            object : RecycleBinClickListener {
                override fun onCheckBoxClick(board: Board) {
                    recycleBinViewModel.selectBoard(board)
                }
            },
        )
    }

    private fun collectRecycleBinEvent() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                recycleBinViewModel.uiEvent.collectLatest { recycleBinEvent ->
                    when (recycleBinEvent) {
                        is RecycleBinUiEvent.ShowMessage -> {
                            showMessage(recycleBinEvent.message)
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    private fun setBoardRestoreButton() {
        binding.btnRecyclebinRestore.setOnClickListener {
            recycleBinViewModel.restoreBoard()
        }
    }
}
