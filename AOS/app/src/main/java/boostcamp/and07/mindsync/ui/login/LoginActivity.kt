package boostcamp.and07.mindsync.ui.login

import android.content.Intent
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.lifecycle.lifecycleScope
import boostcamp.and07.mindsync.BuildConfig
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityLoginBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.main.MainActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.kakao.sdk.auth.AuthApiClient
import com.kakao.sdk.auth.model.OAuthToken
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
            handleGoogleSignInResult(task)
        }

    override fun init() {
        setObserve()
    }

    private fun setObserve() {
        lifecycleScope.launch {
            loginViewModel.loginEvent.collect { event ->
                when (event) {
                    is LoginEvent.LoginError -> {
                        Toast.makeText(this@LoginActivity, event.message, Toast.LENGTH_SHORT).show()
                    }

                    LoginEvent.LoginSuccess -> {
                        startMainActivity()
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
                    successKakaoLoin()
                }
            }
        }
    }

    private fun checkGoogleSignIn() {
        GoogleSignIn.getLastSignedInAccount(this).let { account ->
            account?.let { successGoogleLogin() }
        }
    }

    fun kakaoSignInOnClick(view: View) {
        val resultCallBack: (OAuthToken?, Throwable?) -> Unit = { token, error ->
            if (error != null) {
                Log.e("LoginActivity", "kakao 로그인 실패", error)
            } else if (token != null) {
                Log.i("LoginActivity", "kakao 로그인 성공 ${token.accessToken}")
                successKakaoLoin()
            }
        }

        if (UserApiClient.instance.isKakaoTalkLoginAvailable(this)) {
            UserApiClient.instance.loginWithKakaoTalk(this) { token, error ->
                if (error != null) {
                    Log.e("LoginActivity", "카카오톡으로 로그인 실패", error)

                    // 사용자가 카카오톡 설치 후 디바이스 권한 요청 화면에서 로그인을 취소한 경우,
                    // 의도적인 로그인 취소로 보고 카카오계정으로 로그인 시도 없이 로그인 취소로 처리 (예: 뒤로 가기)
                    if (error is ClientError && error.reason == ClientErrorCause.Cancelled) {
                        return@loginWithKakaoTalk
                    }

                    // 카카오톡에 연결된 카카오계정이 없는 경우, 카카오계정으로 로그인 시도
                    UserApiClient.instance.loginWithKakaoAccount(
                        this,
                        callback = resultCallBack,
                    )
                } else if (token != null) {
                    Log.i("LoginActivity", "kakao 로그인 성공 ${token.accessToken}")
                    successKakaoLoin()
                }
            }
        } else {
            UserApiClient.instance.loginWithKakaoAccount(this, callback = resultCallBack)
        }
    }

    private fun successKakaoLoin() {
        UserApiClient.instance.me { user, error ->
            if (error != null) {
                Log.e("LoginActivity", "사용자 정보 요청 실패", error)
            } else if (user != null) {
                user.id?.let { userId ->
                    loginViewModel.getTokenWithKakao(userId.toString())
                }
            }
        }
    }

    fun googleSignInOnClick(view: View) {
        val signInIntent: Intent = googleSignInClient.signInIntent
        googleAuthLauncher.launch(signInIntent)
    }

    private fun successGoogleLogin() {
        Log.d("LoginActivity", "successGoogleLogin: success!")
        // TODO : server token 요청하기
    }

    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun handleGoogleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        try {
            val account = completedTask.getResult(ApiException::class.java)

            val name = account.displayName
            val token = account.idToken

            Log.d("LoginActivity", "login success : $name $token")
            // TODO : server token 요청하기
        } catch (e: ApiException) {
            Log.e(
                "LoginActivity",
                "google login error: ${e.message}\n${e.stackTrace}\n${e.cause}",
            )
        }
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
