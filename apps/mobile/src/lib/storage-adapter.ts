import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type SecureStoreLike = {
  getItemAsync?: (key: string) => Promise<string | null>;
  setItemAsync?: (
    key: string,
    value: string,
    options?: { keychainAccessible?: string | number },
  ) => Promise<void>;
  deleteItemAsync?: (key: string) => Promise<void>;
  WHEN_UNLOCKED_THIS_DEVICE_ONLY?: string | number;
};

type BrowserStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const secureStore = SecureStore as SecureStoreLike;

function canUseSecureStore(): boolean {
  return (
    Platform.OS !== "web" &&
    typeof secureStore.getItemAsync === "function" &&
    typeof secureStore.setItemAsync === "function" &&
    typeof secureStore.deleteItemAsync === "function"
  );
}

function secureStoreOptions(): { keychainAccessible?: string | number } | undefined {
  if (secureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY === undefined) {
    return undefined;
  }
  return {
    keychainAccessible: secureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
}

function getBrowserStorage(): BrowserStorageLike | null {
  try {
    const maybeGlobal = globalThis as typeof globalThis & {
      localStorage?: BrowserStorageLike;
    };
    return maybeGlobal.localStorage ?? null;
  } catch {
    return null;
  }
}

export async function getStoredValue(key: string): Promise<string | null> {
  if (canUseSecureStore()) {
    return secureStore.getItemAsync?.(key) ?? null;
  }

  return getBrowserStorage()?.getItem(key) ?? null;
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (canUseSecureStore()) {
    await secureStore.setItemAsync?.(key, value, secureStoreOptions());
    return;
  }

  getBrowserStorage()?.setItem(key, value);
}

export async function deleteStoredValue(key: string): Promise<void> {
  if (canUseSecureStore()) {
    await secureStore.deleteItemAsync?.(key);
    return;
  }

  getBrowserStorage()?.removeItem(key);
}
