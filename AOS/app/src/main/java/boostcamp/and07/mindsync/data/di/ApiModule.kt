package boostcamp.and07.mindsync.data.di

import boostcamp.and07.mindsync.data.network.LoginApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.create
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {
    @Provides
    @Singleton
    fun provideSignupApi(retrofit: Retrofit): LoginApi = retrofit.create()
}
