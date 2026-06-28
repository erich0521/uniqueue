import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extras = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
  BACKEND_HOST?: string;
};

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const BACKEND_HOST = extras.BACKEND_HOST?.trim() || defaultHost;
export const REGISTER_URL = `http://${BACKEND_HOST}/UniQueue/backend/register.php`;

if (typeof console !== 'undefined') {
  console.log(`[UniQueue] BACKEND_HOST=${BACKEND_HOST}, REGISTER_URL=${REGISTER_URL}`);
}

