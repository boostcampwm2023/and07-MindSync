package boostcamp.and07.mindsync.ui.recyclebin

import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.FragmentRecycleBinBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.boardlist.BoardClickListener
import boostcamp.and07.mindsync.ui.boardlist.BoardListAdapter
import boostcamp.and07.mindsync.ui.boardlist.BoardListFragmentDirections
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class RecycleBinFragment : BaseFragment<FragmentRecycleBinBinding>(R.layout.fragment_recycle_bin) {
    private val recycleBinViewModel: RecycleBinViewModel by viewModels()
    private val boardListAdapter = BoardListAdapter()
    private val args: RecycleBinFragmentArgs by navArgs()

    override fun initView() {
        setBinding()
        setBoardRestoreButton()
        recycleBinViewModel.setSpace(args.spaceId)
    }

    private fun setBinding() {
        binding.vm = recycleBinViewModel
        binding.rvRecyclebinBoard.adapter = boardListAdapter
        boardListAdapter.setBoardClickListener(
            object : BoardClickListener {
                override fun onClick(board: Board) {
                    findNavController().navigate(
                        BoardListFragmentDirections.actionBoardListFragmentToMindMapFragment(
                            board.id,
                        ),
                    )
                }

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
