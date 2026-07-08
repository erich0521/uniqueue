import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extras = (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
  BACKEND_HOST?: string;
};

// Emulator uses 10.0.2.2, physical phone uses your laptop's IP
const defaultHost =
  Platform.OS === 'android' ? '192.168.1.21' : 'localhost';

export const BACKEND_HOST = extras.BACKEND_HOST?.trim() || defaultHost;

// Backend folder in XAMPP
export const API_BASE_URL = `http://${BACKEND_HOST}/uniqueue_api`;

export const LOGIN_URL = `${API_BASE_URL}/login.php`;
export const REGISTER_URL = `${API_BASE_URL}/register.php`;
export const COLLEGES_URL = `${API_BASE_URL}/colleges.php`;
export const PROGRAMS_URL = `${API_BASE_URL}/programs.php`;
export const QUEUE_STATUS_URL = `${API_BASE_URL}/queue_status.php`;
export const DOCUMENTS_URL = `${API_BASE_URL}/documents.php`;
export const REQUEST_DOCUMENT_URL = `${API_BASE_URL}/request_document.php`;

console.log('[UniQueue] BACKEND_HOST:', BACKEND_HOST);
console.log('[UniQueue] REGISTER_URL:', REGISTER_URL);
console.log('[UniQueue] QUEUE_STATUS_URL:', QUEUE_STATUS_URL);
console.log('[UniQueue] DOCUMENTS_URL:', DOCUMENTS_URL);
console.log('[UniQueue] REQUEST_DOCUMENT_URL:', REQUEST_DOCUMENT_URL);