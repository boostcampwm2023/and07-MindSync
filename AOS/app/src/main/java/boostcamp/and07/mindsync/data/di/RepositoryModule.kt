package boostcamp.and07.mindsync.data.di

import boostcamp.and07.mindsync.data.repository.boardlist.BoardListRepository
import boostcamp.and07.mindsync.data.repository.boardlist.BoardListRepositoryImpl
import boostcamp.and07.mindsync.data.repository.login.LoginRepository
import boostcamp.and07.mindsync.data.repository.login.LoginRepositoryImpl
import boostcamp.and07.mindsync.data.repository.login.TokenRepository
import boostcamp.and07.mindsync.data.repository.login.TokenRepositoryImpl
import boostcamp.and07.mindsync.data.repository.mindmap.MindMapRepository
import boostcamp.and07.mindsync.data.repository.mindmap.MindMapRepositoryImpl
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepositoryImpl
import boostcamp.and07.mindsync.data.repository.profilespace.ProfileSpaceRepository
import boostcamp.and07.mindsync.data.repository.profilespace.ProfileSpaceRepositoryImpl
import boostcamp.and07.mindsync.data.repository.recyclerbin.RecyclerBinRepository
import boostcamp.and07.mindsync.data.repository.recyclerbin.RecyclerBinRepositoryImpl
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.data.repository.space.SpaceRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
interface RepositoryModule {
    @Binds
    fun provideLoginRepository(loginRepositoryImpl: LoginRepositoryImpl): LoginRepository

    @Binds
    fun provideMindMapRepository(mindMapRepositoryImpl: MindMapRepositoryImpl): MindMapRepository

    @Binds
    fun provideRecycleBinRepository(recycleBinRepositoryImpl: RecyclerBinRepositoryImpl): RecyclerBinRepository

    @Binds
    fun provideSpaceRepository(spaceRepositoryImpl: SpaceRepositoryImpl): SpaceRepository

    @Binds
    fun provideBoardListRepository(boardListRepositoryImpl: BoardListRepositoryImpl): BoardListRepository

    @Binds
    fun provideProfileRepository(profileRepositoryImpl: ProfileRepositoryImpl): ProfileRepository

    @Binds
    fun provideTokenRepository(tokenRepositoryImpl: TokenRepositoryImpl): TokenRepository

    @Binds
    fun provideProfileSpaceRepository(profileSpaceRepositoryImpl: ProfileSpaceRepositoryImpl): ProfileSpaceRepository
}
