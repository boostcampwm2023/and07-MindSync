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
import androidx.navigation.fragment.navArgs
import androidx.navigation.navGraphViewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.util.NodeGenerator
import boostcamp.and07.mindsync.data.crdt.OperationType
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.databinding.DialogEditDescriptionBinding
import boostcamp.and07.mindsync.ui.mindmap.MindMapViewModel

class EditDescriptionDialog : DialogFragment() {
    private var _binding: DialogEditDescriptionBinding? = null
    private val binding get() = _binding!!
    private val mindMapViewModel: MindMapViewModel by navGraphViewModels(R.id.nav_graph)
    private val args: EditDescriptionDialogArgs by navArgs()

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
        setupCancelBtn()
        setupSubmitBtn()
        updateOperationType(args.operation.command)
    }

    override fun onStart() {
        super.onStart()
        resizeDialog()
    }

    private fun setBinding() {
        binding.vm = mindMapViewModel
    }

    private fun setupSubmitBtn() {
        binding.btnSubmit.setOnClickListener {
            val node = args.node
            val description = binding.etNodeDescription.text.toString()
            when (args.operation) {
                OperationType.ADD -> {
                    mindMapViewModel.addNode(node, NodeGenerator.makeNode(description, node.id))
                }

                OperationType.UPDATE -> {
                    val newNode =
                        when (node) {
                            is CircleNode -> node.copy(description = description)
                            is RectangleNode -> node.copy(description = description)
                        }
                    mindMapViewModel.updateNode(newNode)
                }

                else -> {}
            }
            dismiss()
        }
    }

    private fun setupCancelBtn() {
        binding.btnCancel.setOnClickListener {
            dismiss()
        }
    }

    private fun updateOperationType(operationType: String) {
        mindMapViewModel.updateOperationType(operationType)
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
