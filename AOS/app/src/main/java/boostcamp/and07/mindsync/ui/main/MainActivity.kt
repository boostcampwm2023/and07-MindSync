package boostcamp.and07.mindsync.ui.main

import android.view.View
import android.widget.Toast
import androidx.activity.addCallback
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.databinding.ActivityMainBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity

class MainActivity :
    BaseActivity<ActivityMainBinding>(R.layout.activity_main) {
    private lateinit var drawerLayout: DrawerLayout
    private var backPressedTime: Long = 0L
    private var backPressedToast: Toast? = null
    private lateinit var spaceAdapter: SideBarSpaceAdapter
    private lateinit var navController: NavController

    override fun init() {
        drawerLayout = binding.drawerLayoutMainSideBar
        setNavController()
        setBackPressedToast()
        setBackPressed()
        setSideBar()
        setSideBarNavigation()
    }

    private fun setNavController() {
        val navHostFragment =
            (supportFragmentManager.findFragmentById(R.id.fcv_main_nav_host) as NavHostFragment)
        navController = navHostFragment.navController
    }

    private fun setSideBarNavigation() {
        with(binding.includeMainInDrawer) {
            tvSideBarBoardList.setOnClickListener {
                navController.navigate(R.id.action_to_boardListFragment)
            }
            tvSideBarRecycleBin.setOnClickListener {
                navController.navigate(R.id.action_to_recycleBinFragment)
            }
        }
    }

    private fun setBackPressedToast() {
        backPressedToast =
            Toast.makeText(
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

    private fun setSideBar() {
        spaceAdapter = SideBarSpaceAdapter()
        binding.includeMainInDrawer.rvSideBarSpace.adapter = spaceAdapter
        spaceAdapter.submitList(getSampleSpace())
    }

    private fun getSampleSpace(): List<Space> {
        val sampleSpace =
            mutableListOf(
                Space(
                    "0",
                    "space1",
                    "error",
                ),
                Space(
                    "1",
                    "space3",
                    "https://img.freepik.com/premium-vector/" +
                        "cute-kawaii-shiba-inu-dog-cartoon-style" +
                        "-character-mascot-corgi-dog_945253-162.jpg",
                ),
                Space(
                    "2",
                    "space3",
                    "https://image.yes24.com/blogimage/blog/w/o/woojukaki/IMG_20201015_182419.jpg",
                ),
            )
        return sampleSpace.toList()
    }

    fun openDrawerButtonOnClick(view: View) {
        drawerLayout.openDrawer(GravityCompat.START)
    }

    fun foldDrawerButtonOnClick(view: View) {
        drawerLayout.closeDrawers()
    }
}
