package boostcamp.and07.mindsync

import android.os.Bundle
import android.util.Log
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.databinding.ActivityMainBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.view.NodeClickListener
import boostcamp.and07.mindsync.ui.dialog.EditDescriptionDialog
import boostcamp.and07.mindsync.ui.dialog.EditDialogInterface

class MainActivity :
    BaseActivity<ActivityMainBinding>(R.layout.activity_main),
    NodeClickListener {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(binding.root)
    }

    override fun init() {
        binding.customNodeView.setTextViewClickListener(this)
    }

    override fun onDoubleClicked(node: Node) {
        val dialog = EditDescriptionDialog(this)
        dialog.setListener(object : EditDialogInterface {
            override fun onSubmitClick(description: String) {
            }
        })
        dialog.show()
    }
}
