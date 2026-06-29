// No-op cache for CF Workers (no Redis available)
export async function cacheGet(_key: string) {
  return null;
}

export async function cacheSet(_key: string, _value: unknown, _ttl = 86400) {
  // no-op
}
