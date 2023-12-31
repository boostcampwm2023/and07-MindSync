package boostcamp.and07.mindsync.data.di

import boostcamp.and07.mindsync.data.network.api.BoardApi
import boostcamp.and07.mindsync.data.network.api.LoginApi
import boostcamp.and07.mindsync.data.network.api.LogoutApi
import boostcamp.and07.mindsync.data.network.api.ProfileApi
import boostcamp.and07.mindsync.data.network.api.ProfileSpaceApi
import boostcamp.and07.mindsync.data.network.api.SpaceApi
import boostcamp.and07.mindsync.data.network.api.TokenApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.create
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {
    @Provides
    @Singleton
    fun provideSignupApi(
        @Named(NetworkConst.TOKEN_RETROFIT) retrofit: Retrofit,
    ): LoginApi = retrofit.create()

    @Provides
    @Singleton
    fun provideSpaceApi(
        @Named(NetworkConst.CLIENT_RETROFIT) retrofit: Retrofit,
    ): SpaceApi = retrofit.create()

    @Provides
    @Singleton
    fun provideTokenApi(
        @Named(NetworkConst.TOKEN_RETROFIT) retrofit: Retrofit,
    ): TokenApi = retrofit.create()

    @Provides
    @Singleton
    fun provideLogoutApi(
        @Named(NetworkConst.TOKEN_RETROFIT) retrofit: Retrofit,
    ): LogoutApi = retrofit.create()

    @Provides
    @Singleton
    fun provideProfileApi(
        @Named(NetworkConst.CLIENT_RETROFIT) retrofit: Retrofit,
    ): ProfileApi = retrofit.create()

    @Provides
    @Singleton
    fun provideProfileSpaceApi(
        @Named(NetworkConst.CLIENT_RETROFIT) retrofit: Retrofit,
    ): ProfileSpaceApi = retrofit.create()

    @Provides
    @Singleton
    fun provideBoardApi(
        @Named(NetworkConst.CLIENT_RETROFIT) retrofit: Retrofit,
    ): BoardApi = retrofit.create()
}
