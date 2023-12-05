package boostcamp.and07.mindsync.data.repository.login

import kotlinx.coroutines.flow.Flow

interface TokenRepository {
    fun getAccessToken(): Flow<String?>
    fun getRefreshToken(): Flow<String?>

    suspend fun saveAccessToken(token: String)
    suspend fun saveRefreshToken(token: String)
    
    suspend fun deleteAccessToken()
    suspend fun deleteRefreshToken()
}