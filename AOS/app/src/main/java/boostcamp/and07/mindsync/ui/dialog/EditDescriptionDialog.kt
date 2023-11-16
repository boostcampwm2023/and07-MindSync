package boostcamp.and07.mindsync.ui.dialog

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import boostcamp.and07.mindsync.databinding.DialogEditDescriptionBinding

class EditDescriptionDialog(context: Context) : Dialog(context) {

    private var _binding: DialogEditDescriptionBinding? = null
    private val binding get() = _binding!!
    private lateinit var confirmDialogInterface: EditDialogInterface
    fun setListener(listener: EditDialogInterface) {
        confirmDialogInterface = listener
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        _binding = DialogEditDescriptionBinding.inflate(LayoutInflater.from(context))
        setContentView(binding.root)
        setCanceledOnTouchOutside(true)
        setCancelable(true)
        this.window?.setLayout(1000, 1000)
        binding.btnCancel.setOnClickListener {
            dismiss()
        }
        binding.btnSubmit.setOnClickListener {
            this.confirmDialogInterface.onSubmitClick(binding.etNodeDescription.text.toString())
            dismiss()
        }
        super.onCreate(savedInstanceState)
    }
}
