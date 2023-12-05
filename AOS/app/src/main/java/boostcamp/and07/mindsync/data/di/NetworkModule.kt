package boostcamp.and07.mindsync.data.di

import boostcamp.and07.mindsync.BuildConfig
import boostcamp.and07.mindsync.data.repository.login.AccessTokenInterceptor
import boostcamp.and07.mindsync.data.repository.login.TokenRepository
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Singleton
    @Provides
    fun provideAccessTokenInterceptor(tokenRepository: TokenRepository): AccessTokenInterceptor {
        return AccessTokenInterceptor(tokenRepository)
    }

    @Singleton
    @Provides
    fun provideOkHttpClient(
        accessTokenInterceptor: AccessTokenInterceptor,
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(accessTokenInterceptor)
            .build()
    }

    @Singleton
    @Provides
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
            .client(okHttpClient)
            .baseUrl(BuildConfig.BASE_URL)
            .build()
    }
}
