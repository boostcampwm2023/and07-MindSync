import { config } from 'dotenv';

interface CustomEnv {
  [key: string]: string;
}

const customEnv: CustomEnv = {};
config({ processEnv: customEnv });

export default customEnv;
