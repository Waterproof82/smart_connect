/**
 * Secure Storage Utility
 * @module shared/utils/secureStorage
 * 
 * Provides encrypted localStorage/sessionStorage operations
 * Security: OWASP A02:2021 - Cryptographic Failures (Data at Rest)
 * 
 * Features:
 * - AES-256 encryption for sensitive data
 * - Automatic encryption/decryption
 * - Type-safe API
 * - Fallback for unsupported browsers
 */

import CryptoJS from 'crypto-js';

/**
 * Encryption key derived from app name + domain
 * In production, this should be an environment variable
 */
const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_ENCRYPTION_KEY || 'smartconnect-ai-2026-secure-key';

/**
 * Storage types
 */
type StorageType = 'local' | 'session';

/**
 * Gets the appropriate storage object
 */
function getStorage(type: StorageType): Storage {
  return type === 'local' ? localStorage : sessionStorage;
}

/**
 * Encrypts data using AES-256
 */
function encrypt(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.warn('Encryption failed, storing plain text', error);
    return data;
  }
}

/**
 * Decrypts AES-256 encrypted data
 */
function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedData; // Fallback if decryption fails
  } catch (error) {
    console.warn('Decryption failed, returning original data', error);
    return encryptedData;
  }
}

/**
 * Securely stores encrypted data in localStorage or sessionStorage
 * 
 * @param key Storage key
 * @param value Value to store (will be encrypted)
 * @param type Storage type ('local' or 'session')
 * 
 * @example
 * secureStorage.setItem('ab_test_group', 'A', 'local');
 */
export function setItem(
  key: string,
  value: string,
  type: StorageType = 'local'
): void {
  try {
    const storage = getStorage(type);
    const encrypted = encrypt(value);
    storage.setItem(key, encrypted);
  } catch (error) {
    console.error('SecureStorage: Failed to set item', error);
  }
}

/**
 * Retrieves and decrypts data from localStorage or sessionStorage
 * 
 * @param key Storage key
 * @param type Storage type ('local' or 'session')
 * @returns Decrypted value or null if not found
 * 
 * @example
 * const group = secureStorage.getItem('ab_test_group', 'local');
 */
export function getItem(
  key: string,
  type: StorageType = 'local'
): string | null {
  try {
    const storage = getStorage(type);
    const encrypted = storage.getItem(key);
    
    if (!encrypted) {
      return null;
    }
    
    return decrypt(encrypted);
  } catch (error) {
    console.error('SecureStorage: Failed to get item', error);
    return null;
  }
}

/**
 * Removes item from storage
 * 
 * @param key Storage key
 * @param type Storage type ('local' or 'session')
 * 
 * @example
 * secureStorage.removeItem('ab_test_group', 'local');
 */
export function removeItem(
  key: string,
  type: StorageType = 'local'
): void {
  try {
    const storage = getStorage(type);
    storage.removeItem(key);
  } catch (error) {
    console.error('SecureStorage: Failed to remove item', error);
  }
}

/**
 * Clears all items from storage
 * 
 * @param type Storage type ('local' or 'session')
 * 
 * @example
 * secureStorage.clear('local');
 */
export function clear(type: StorageType = 'local'): void {
  try {
    const storage = getStorage(type);
    storage.clear();
  } catch (error) {
    console.error('SecureStorage: Failed to clear storage', error);
  }
}

/**
 * Checks if key exists in storage
 * 
 * @param key Storage key
 * @param type Storage type ('local' or 'session')
 * @returns True if key exists
 */
export function hasItem(
  key: string,
  type: StorageType = 'local'
): boolean {
  try {
    const storage = getStorage(type);
    return storage.getItem(key) !== null;
  } catch (error) {
    console.error('SecureStorage: Failed to check item', error);
    return false;
  }
}

/**
 * Stores object as encrypted JSON
 * 
 * @param key Storage key
 * @param value Object to store
 * @param type Storage type
 */
export function setObject<T>(
  key: string,
  value: T,
  type: StorageType = 'local'
): void {
  try {
    const json = JSON.stringify(value);
    setItem(key, json, type);
  } catch (error) {
    console.error('SecureStorage: Failed to set object', error);
  }
}

/**
 * Retrieves and parses encrypted JSON object
 * 
 * @param key Storage key
 * @param type Storage type
 * @returns Parsed object or null
 */
export function getObject<T>(
  key: string,
  type: StorageType = 'local'
): T | null {
  try {
    const json = getItem(key, type);
    
    if (!json) {
      return null;
    }
    
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('SecureStorage: Failed to get object', error);
    return null;
  }
}

// Default export with all methods
export const secureStorage = {
  setItem,
  getItem,
  removeItem,
  clear,
  hasItem,
  setObject,
  getObject,
};
