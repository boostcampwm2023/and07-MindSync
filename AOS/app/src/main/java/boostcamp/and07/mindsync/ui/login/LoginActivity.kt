package boostcamp.and07.mindsync.ui.login

import android.content.Intent
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import boostcamp.and07.mindsync.BuildConfig
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityLoginBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.main.MainActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.kakao.sdk.auth.AuthApiClient
import com.kakao.sdk.common.model.ClientError
import com.kakao.sdk.common.model.ClientErrorCause
import com.kakao.sdk.user.UserApiClient
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LoginActivity : BaseActivity<ActivityLoginBinding>(R.layout.activity_login) {
    private val loginViewModel: LoginViewModel by viewModels()
    private val googleSignInClient: GoogleSignInClient by lazy { getGoogleClient() }
    private val googleAuthLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            loginViewModel.handleGoogleSignInResult(task)
        }

    override fun init() {
        setObserve()
    }

    private fun setObserve() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                loginViewModel.loginEvent.collect { event ->
                    when (event) {
                        is LoginEvent.Error -> {
                            Toast.makeText(this@LoginActivity, event.message, Toast.LENGTH_SHORT)
                                .show()
                        }

                        is LoginEvent.Success -> {
                            startMainActivity()
                        }
                    }
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        checkKakaoSignIn()
        checkGoogleSignIn()
    }

    private fun checkKakaoSignIn() {
        if (AuthApiClient.instance.hasToken()) {
            UserApiClient.instance.accessTokenInfo { _, error ->
                if (error == null) {
                    loginViewModel.successKakaoLoin()
                }
            }
        }
    }

    private fun checkGoogleSignIn() {
        GoogleSignIn.getLastSignedInAccount(this).let { account ->
            account?.let { loginViewModel.successGoogleLogin() }
        }
    }

    fun kakaoSignInOnClick(view: View) {
        val resultCallBack = loginViewModel.getResultCallBack()
        if (UserApiClient.instance.isKakaoTalkLoginAvailable(this)) {
            UserApiClient.instance.loginWithKakaoTalk(this) { token, error ->
                if (error != null) {
                    if (error is ClientError && error.reason == ClientErrorCause.Cancelled) {
                        return@loginWithKakaoTalk
                    }
                    // 카카오톡에 연결된 카카오계정이 없는 경우, 카카오계정으로 로그인 시도
                    UserApiClient.instance.loginWithKakaoAccount(
                        this,
                        callback = resultCallBack,
                    )
                } else if (token != null) {
                    loginViewModel.successKakaoLoin()
                }
            }
        } else {
            UserApiClient.instance.loginWithKakaoAccount(this, callback = resultCallBack)
        }
    }

    fun googleSignInOnClick(view: View) {
        val signInIntent: Intent = googleSignInClient.signInIntent
        googleAuthLauncher.launch(signInIntent)
    }

    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun getGoogleClient(): GoogleSignInClient {
        val googleSignInOption =
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestProfile()
                .requestEmail()
                .requestIdToken(BuildConfig.GOOGLE_SERVER_CLIENT_ID)
                .build()
        return GoogleSignIn.getClient(this, googleSignInOption)
    }
}
