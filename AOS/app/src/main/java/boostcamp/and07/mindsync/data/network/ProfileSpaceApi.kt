package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.request.ProfileSpaceJoinRequest
import boostcamp.and07.mindsync.data.network.response.space.ProfileSpaceJoinResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface ProfileSpaceApi {

    @POST("profileSpace/join")
    suspend fun joinSpace(
        @Body profileSpaceJoinRequest: ProfileSpaceJoinRequest,
    ): ProfileSpaceJoinResponse
}
