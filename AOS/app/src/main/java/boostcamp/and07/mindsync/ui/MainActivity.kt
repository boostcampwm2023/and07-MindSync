package boostcamp.and07.mindsync.ui

import android.view.View
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import boostcamp.and07.mindsync.databinding.ActivityMainBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity

class MainActivity :
    BaseActivity<ActivityMainBinding>(boostcamp.and07.mindsync.R.layout.activity_main) {
    private lateinit var drawerLayout: DrawerLayout

    override fun init() {
        setDrawerSideBar()
    }

    private fun setDrawerSideBar() {
        drawerLayout = binding.drawerLayoutMainSideBar
    }

    fun openDrawerButtonOnClick(view: View) {
        drawerLayout.openDrawer(GravityCompat.START)
    }

    fun foldDrawerButtonOnClick(view: View) {
        drawerLayout.closeDrawers()
    }
}
