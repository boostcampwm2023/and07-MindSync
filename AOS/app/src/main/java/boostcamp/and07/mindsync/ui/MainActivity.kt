package boostcamp.and07.mindsync.ui

import android.view.View
import android.widget.Toast
import androidx.activity.addCallback
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityMainBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity

class MainActivity :
    BaseActivity<ActivityMainBinding>(R.layout.activity_main) {
    private lateinit var drawerLayout: DrawerLayout
    private var backPressedTime: Long = 0L
    private var backPressedToast: Toast? = null

    override fun init() {
        setBackPressedToast()
        setBackPressed()
    }

    private fun setBackPressedToast() {
        backPressedToast = Toast.makeText(
            baseContext,
            getString(R.string.main_back_pressed_message),
            Toast.LENGTH_SHORT,
        )
    }

    private fun setBackPressed() {
        onBackPressedDispatcher.addCallback {
            if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
                drawerLayout.closeDrawers()
            } else {
                if (System.currentTimeMillis() - backPressedTime <= 2000L) {
                    backPressedToast?.cancel()
                    finish()
                } else {
                    backPressedTime = System.currentTimeMillis()
                    backPressedToast?.show()
                }
            }
        }
    }

    fun openDrawerButtonOnClick(view: View) {
        drawerLayout.openDrawer(GravityCompat.START)
    }

    fun foldDrawerButtonOnClick(view: View) {
        drawerLayout.closeDrawers()
    }
}
