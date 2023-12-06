package boostcamp.and07.mindsync.data.repository.profile

import boostcamp.and07.mindsync.data.model.Profile
import boostcamp.and07.mindsync.data.network.ProfileApi
import kotlinx.coroutines.flow.flow
import okhttp3.MultipartBody
import okhttp3.RequestBody
import javax.inject.Inject

class ProfileRepositoryImpl
    @Inject
    constructor(private val profileApi: ProfileApi) : ProfileRepository {
        override fun getProfile() =
            flow {
                val response = profileApi.getProfile().data
                emit(
                    Profile(
                        id = response.uuid,
                        nickname = response.nickname ?: "",
                        imageUrl = response.image ?: "",
                    ),
                )
            }

        override fun patchProfile(
            nickname: RequestBody,
            image: MultipartBody.Part,
        ) = flow {
            val response = profileApi.patchProfile(nickname, image)
            emit(
                Profile(
                    id = response.data.uuid,
                    nickname = response.data.nickname ?: "",
                    imageUrl = response.data.image ?: "",
                ),
            )
        }
    }
