package boostcamp.and07.mindsync.ui

import android.app.Application
import boostcamp.and07.mindsync.BuildConfig
import com.kakao.sdk.common.KakaoSdk
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MindSyncApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        KakaoSdk.init(this, BuildConfig.KAKAO_CLIENT_ID)
    }
}
