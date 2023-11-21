package boostcamp.and07.mindsync.ui.dialog

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.DialogEditDescriptionBinding

class EditDescriptionDialog : DialogFragment() {
    private var _binding: DialogEditDescriptionBinding? = null
    private val binding get() = _binding!!
    private lateinit var editDialogInterface: EditDialogInterface
    fun setListener(listener: EditDialogInterface) {
        editDialogInterface = listener
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
    ): View? {
        _binding = DialogEditDescriptionBinding.inflate(inflater, container, false)
        binding.run {
            btnCancel.setOnClickListener {
                dismiss()
            }
            btnSubmit.setOnClickListener {
                editDialogInterface.onSubmitClick(binding.etNodeDescription.text.toString())
                dismiss()
            }
        }
        return binding.root
    }

    override fun onStart() {
        super.onStart()
        dialog?.window?.setLayout(
            1000,
            1000,
        )
    }

    override fun onDismiss(dialog: DialogInterface) {
        _binding = null
        super.onDismiss(dialog)
    }
}
