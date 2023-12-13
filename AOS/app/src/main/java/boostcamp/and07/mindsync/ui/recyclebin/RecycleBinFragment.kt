package boostcamp.and07.mindsync.ui.recyclebin

import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.FragmentRecycleBinBinding
import boostcamp.and07.mindsync.ui.RecycleBin.RecycleBinAdapter
import boostcamp.and07.mindsync.ui.base.BaseFragment
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class RecycleBinFragment : BaseFragment<FragmentRecycleBinBinding>(R.layout.fragment_recycle_bin) {
    private val recycleBinViewModel: RecycleBinViewModel by viewModels()
    private val recycleBinAdapter = RecycleBinAdapter()
    private val args: RecycleBinFragmentArgs by navArgs()

    override fun initView() {
        setBinding()
        setBoardRestoreButton()
        recycleBinViewModel.setSpace(args.spaceId)
    }

    private fun setBinding() {
        binding.vm = recycleBinViewModel
        binding.rvRecyclebinBoard.adapter = recycleBinAdapter
        recycleBinAdapter.setRecycleBinClickListener(
            object :RecycleBinClickListener {
                override fun onCheckBoxClick(board: Board) {
                    recycleBinViewModel.selectBoard(board)
                }
            },
        )
    }

    private fun setBoardRestoreButton() {
        binding.btnRecyclebinRestore.setOnClickListener {
            recycleBinViewModel.restoreBoard()
        }
    }
}
