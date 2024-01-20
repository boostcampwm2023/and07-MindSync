package boostcamp.and07.mindsync.ui.base

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.databinding.ViewDataBinding
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import boostcamp.and07.mindsync.ui.login.LoginActivity
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

abstract class BaseActivity<T : ViewDataBinding>(private val layoutResId: Int) :
    AppCompatActivity() {
    private var _binding: T? = null
    val binding get() = _binding!!

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        _binding = DataBindingUtil.setContentView(this, layoutResId)
        binding.lifecycleOwner = this
        init()
    }

    abstract fun init()

    abstract fun getViewModel(): BaseActivityViewModel

    private fun collectEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                getViewModel().events.collectLatest { event ->
                    when (event) {
                        ViewEvent.Logout -> logout()
                    }
                }
            }
        }
    }

    open fun logout() {
        getViewModel().logout()
        navigateToLoginActivity()
    }

    open fun navigateToLoginActivity() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    fun showMessage(message: String) {
        Snackbar.make(this.binding.root, message, Snackbar.LENGTH_LONG).show()
    }

    override fun onDestroy() {
        super.onDestroy()
        _binding = null
    }
}
