package boostcamp.and07.mindsync.ui.dialog

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.fragment.app.DialogFragment
import androidx.navigation.navGraphViewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.DialogEditProfileBinding
import boostcamp.and07.mindsync.ui.profile.ProfileViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class EditNickNameDialog : DialogFragment() {
    private var _binding: DialogEditProfileBinding? = null
    private val binding get() = _binding!!
    private val profileViewModel: ProfileViewModel by navGraphViewModels(R.id.nav_profile)

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
        _binding = DialogEditProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(
        view: View,
        savedInstanceState: Bundle?,
    ) {
        super.onViewCreated(view, savedInstanceState)
        setBinding()
        setupCancelBtn()
        setupModifyBtn()
    }

    override fun onStart() {
        super.onStart()
        resizeDialog()
    }

    private fun setBinding() {
        with(binding) {
            vm = profileViewModel
            lifecycleOwner = viewLifecycleOwner
        }
    }

    private fun setupCancelBtn() {
        binding.btnEditProfileCancel.setOnClickListener {
            dismiss()
        }
    }

    private fun setupModifyBtn() {
        binding.btnEditProfileModify.setOnClickListener {
            profileViewModel.updateNickName(binding.etEditProfileNickname.text)
            dismiss()
        }
    }

    private fun resizeDialog() {
        val params: ViewGroup.LayoutParams? = dialog?.window?.attributes

        val displayMetrics = requireActivity().resources.displayMetrics
        val deviceWidth = displayMetrics.widthPixels

        params?.width = (deviceWidth * 0.8).toInt()
        params?.height = WindowManager.LayoutParams.WRAP_CONTENT
        dialog?.window?.attributes = params as WindowManager.LayoutParams
    }

    override fun onDismiss(dialog: DialogInterface) {
        _binding = null
        super.onDismiss(dialog)
    }
}
