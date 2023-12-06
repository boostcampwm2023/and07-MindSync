import customEnv from 'src/config/env';

export const jwtConstants = {
  accessSecret: customEnv.JWT_ACCESS_SECRET,
  refreshSecret: customEnv.JWT_REFRESH_SECRET,
};

export const kakaoOauthConstants = {
  adminKey: customEnv.KAKAO_ADMIN_KEY,
};
