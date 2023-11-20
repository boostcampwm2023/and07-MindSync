package boostcamp.and07.mindsync.ui.dialog

import android.app.Dialog
import android.content.DialogInterface
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.DialogEditDescriptionBinding

class EditDescriptionDialog(private val color: Int) : DialogFragment() {
    private var _binding: DialogEditDescriptionBinding? = null
    private val binding get() = _binding!!
    private lateinit var confirmDialogInterface: EditDialogInterface
    fun setListener(listener: EditDialogInterface) {
        confirmDialogInterface = listener
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
                confirmDialogInterface.onSubmitClick(binding.etNodeDescription.text.toString())
                dismiss()
            }
        }
        return binding.root
    }

    override fun onStart() {
        super.onStart()
        binding.root.backgroundTintList = ColorStateList.valueOf(color)
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
