package boostcamp.and07.mindsync

import android.os.Bundle
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.databinding.ActivityMainBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.dialog.EditDescriptionDialog
import boostcamp.and07.mindsync.ui.dialog.EditDialogInterface
import boostcamp.and07.mindsync.ui.view.NodeClickListener

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

    override fun onDoubleClicked(node: Node, color: Int) {
        val dialog = EditDescriptionDialog(color)
        dialog.setListener(object : EditDialogInterface {
            override fun onSubmitClick(description: String) {
            }
        })
        dialog.show(this.supportFragmentManager,"EditDescriptionDialog")
    }
}
