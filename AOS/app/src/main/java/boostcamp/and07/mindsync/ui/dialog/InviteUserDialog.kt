package boostcamp.and07.mindsync.ui.dialog

import android.app.Dialog
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.DialogInterface
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Toast
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.lifecycleScope
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.databinding.DialogInviteUserBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class InviteUserDialog : DialogFragment() {
    private var _binding: DialogInviteUserBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var spaceRepository: SpaceRepository

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.attributes?.windowAnimations = R.style.AnimationDialogStyle
        isCancelable = true
        return dialog
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = DialogInviteUserBinding.inflate(inflater, container, false)
        binding.run {
        }
        getInviteCode()
        setCopyButton()
        return binding.root
    }

    override fun onStart() {
        super.onStart()
        resizeDialog()
    }

    private fun getInviteCode() {
        viewLifecycleOwner.lifecycleScope.launch {
            spaceRepository.getInviteSpaceCode("11ee94cb588902308d61176844e12449")
                .collectLatest { inviteCode ->
                    binding.tvInviteUserSpaceCode.text = inviteCode
                    Toast.makeText(requireContext(), "성공!", Toast.LENGTH_SHORT).show()
                }
        }
    }

    private fun setCopyButton() {
        binding.imgbtnInviteUserCopy.setOnClickListener {
            val context = requireContext()
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("", binding.tvInviteUserSpaceCode.text.toString())
            clipboard.setPrimaryClip(clip)
        }
    }

    private fun resizeDialog() {
        val params: ViewGroup.LayoutParams? = dialog?.window?.attributes

        val displayMetrics = requireActivity().resources.displayMetrics
        val deviceWidth = displayMetrics.widthPixels
        val deviceHeight = displayMetrics.heightPixels

        params?.width = (deviceWidth * 0.8).toInt()
        params?.height = (deviceHeight * 0.25).toInt()
        dialog?.window?.attributes = params as WindowManager.LayoutParams
    }

    override fun onDismiss(dialog: DialogInterface) {
        _binding = null
        super.onDismiss(dialog)
    }
}
