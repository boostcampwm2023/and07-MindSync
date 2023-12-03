import customEnv from 'src/config/env';

export const jwtConstants = {
  secret: customEnv.JWT_SECRET,
};

export const kakaoOauthConstants = {
  adminKey: customEnv.KAKAO_ADMIN_KEY,
};
