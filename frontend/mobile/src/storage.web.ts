function storage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function getItem(key: string): Promise<string | null> {
  return storage()?.getItem(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  storage()?.setItem(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  storage()?.removeItem(key);
}
