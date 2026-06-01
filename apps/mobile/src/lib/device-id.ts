import * as Crypto from "expo-crypto";
import { getStoredValue, setStoredValue } from "./storage-adapter";

const DEVICE_ID_KEY = "tissint.device_id.v1";

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getStoredValue(DEVICE_ID_KEY);
  if (existing) return existing;

  const value = Crypto.randomUUID();
  await setStoredValue(DEVICE_ID_KEY, value);
  return value;
}
