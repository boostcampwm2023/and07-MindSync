import customEnv from 'config/env';

export const jwtConstants = {
  secret: customEnv.JWT_SECRET,
};
