package boostcamp.and07.mindsync.data.di

import boostcamp.and07.mindsync.BuildConfig
import boostcamp.and07.mindsync.data.network.AccessTokenInterceptor
import boostcamp.and07.mindsync.data.network.TokenAuthenticator
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Singleton
    @Provides
    @Named(NetworkConst.CLIENT)
    fun provideOkHttpClient(
        accessTokenInterceptor: AccessTokenInterceptor,
        tokenAuthenticator: TokenAuthenticator,
    ): OkHttpClient {
        val headerLogging = HttpLoggingInterceptor()
        headerLogging.level = HttpLoggingInterceptor.Level.HEADERS
        return OkHttpClient.Builder()
            .addInterceptor(accessTokenInterceptor)
            .addInterceptor(headerLogging)
            .authenticator(tokenAuthenticator)
            .build()
    }

    @Singleton
    @Provides
    @Named(NetworkConst.TOKEN_CLIENT)
    fun provideOkHttpTokenClient(): OkHttpClient {
        val headerLogging = HttpLoggingInterceptor()
        headerLogging.level = HttpLoggingInterceptor.Level.HEADERS
        return OkHttpClient.Builder()
            .addInterceptor(headerLogging)
            .build()
    }

    @Singleton
    @Provides
    @Named(NetworkConst.TOKEN_RETROFIT)
    fun provideTokenRetrofit(@Named(NetworkConst.TOKEN_CLIENT) okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .addConverterFactory(Json.asConverterFactory(NetworkConst.APPLICATION_JSON.toMediaType()))
            .client(okHttpClient)
            .baseUrl(BuildConfig.BASE_URL)
            .build()
    }

    @Singleton
    @Provides
    @Named(NetworkConst.CLIENT_RETROFIT)
    fun provideClientRetrofit(@Named(NetworkConst.CLIENT) okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .addConverterFactory(Json.asConverterFactory(NetworkConst.APPLICATION_JSON.toMediaType()))
            .client(okHttpClient)
            .baseUrl(BuildConfig.BASE_URL)
            .build()
    }
}
