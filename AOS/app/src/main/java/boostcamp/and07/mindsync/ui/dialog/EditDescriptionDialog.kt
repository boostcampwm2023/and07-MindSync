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
import androidx.fragment.app.viewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.DialogEditDescriptionBinding

class EditDescriptionDialog : DialogFragment() {
    private var _binding: DialogEditDescriptionBinding? = null
    private val binding get() = _binding!!
    private val editDescriptionViewModel: EditDescriptionViewModel by viewModels()
    private var submitListener: ((String) -> (Unit))? = null
    private var description: String = ""

    fun setDescription(description: String) {
        this.description = description
    }

    fun setSubmitListener(submitListener: ((String) -> (Unit))) {
        this.submitListener = submitListener
    }

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
        _binding = DialogEditDescriptionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(
        view: View,
        savedInstanceState: Bundle?,
    ) {
        super.onViewCreated(view, savedInstanceState)
        setBinding()
        setViewModel()
        setupCancelBtn()
        setupSubmitBtn()
    }

    override fun onStart() {
        super.onStart()
        resizeDialog()
    }

    private fun setBinding() {
        binding.vm = editDescriptionViewModel
    }

    private fun setViewModel() {
        submitListener?.let {
            editDescriptionViewModel.submitListener = this.submitListener
        }
        if (description.isNotEmpty()) {
            editDescriptionViewModel.setDescription(description)
        }
    }

    private fun setupSubmitBtn() {
        binding.btnSubmit.setOnClickListener {
            editDescriptionViewModel.submitListener?.invoke(editDescriptionViewModel.description.value)
            dismiss()
        }
    }

    private fun setupCancelBtn() {
        binding.btnCancel.setOnClickListener {
            dismiss()
        }
    }

    private fun resizeDialog() {
        val params: ViewGroup.LayoutParams? = dialog?.window?.attributes

        val displayMetrics = requireActivity().resources.displayMetrics
        val deviceWidth = displayMetrics.widthPixels
        val deviceHeight = displayMetrics.heightPixels

        params?.width = (deviceWidth * 0.8).toInt()
        params?.height = (deviceHeight * 0.5).toInt()
        dialog?.window?.attributes = params as WindowManager.LayoutParams
    }

    override fun onDismiss(dialog: DialogInterface) {
        _binding = null
        super.onDismiss(dialog)
    }
}
