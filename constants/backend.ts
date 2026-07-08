import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extras = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
  BACKEND_HOST?: string;
};

// Emulator uses 10.0.2.2, physical phone uses your laptop's IP
const defaultHost =
  Platform.OS === 'android' ? '192.168.50.247' : 'localhost';

export const BACKEND_HOST = extras.BACKEND_HOST?.trim() || defaultHost;

// Backend folder in XAMPP
export const API_BASE_URL = `http://${BACKEND_HOST}/uniqueue_api`;

export const LOGIN_URL = `${API_BASE_URL}/login.php`;
export const REGISTER_URL = `${API_BASE_URL}/register.php`;
export const COLLEGES_URL = `${API_BASE_URL}/colleges.php`;
export const PROGRAMS_URL = `${API_BASE_URL}/programs.php`;

console.log('[UniQueue] BACKEND_HOST:', BACKEND_HOST);
console.log('[UniQueue] REGISTER_URL:', REGISTER_URL);