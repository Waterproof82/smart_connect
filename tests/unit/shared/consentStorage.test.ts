/**
 * Consent Storage Tests
 *
 * Pure module, no React/DOM coupling beyond an injectable `Storage`.
 * RGPD/LSSI-CE: absent / corrupt / version-mismatch / stale (>24mo) / valid.
 */

import {
  CONSENT_KEY,
  VERSION,
  MAX_AGE_MS,
  readConsent,
  buildConsent,
  writeConsent,
  type ConsentRecord,
} from "../../../src/shared/utils/consentStorage";

/** In-memory Storage stub — same shape as localStorage, injectable per test. */
class StorageStub implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/** Storage stub whose setItem always throws (Safari private mode simulation). */
class ThrowingStorageStub extends StorageStub {
  setItem(): void {
    throw new Error("QuotaExceededError");
  }
}

describe("consentStorage constants", () => {
  it("exposes the sc_consent_v1 key", () => {
    expect(CONSENT_KEY).toBe("sc_consent_v1");
  });

  it("exposes version 1", () => {
    expect(VERSION).toBe(1);
  });

  it("exposes a 24-month (730 day) max age in ms", () => {
    expect(MAX_AGE_MS).toBe(63072000000);
  });
});

describe("readConsent", () => {
  let storage: StorageStub;

  beforeEach(() => {
    storage = new StorageStub();
  });

  it("returns null when no consent is stored (absent)", () => {
    expect(readConsent(storage)).toBeNull();
  });

  it("returns null when the stored value is corrupt JSON", () => {
    storage.setItem(CONSENT_KEY, "{not-valid-json");
    expect(readConsent(storage)).toBeNull();
  });

  it("returns null when the stored value is valid JSON but not a consent record", () => {
    storage.setItem(CONSENT_KEY, JSON.stringify({ foo: "bar" }));
    expect(readConsent(storage)).toBeNull();
  });

  it("returns null when categories.necessary is not literally true", () => {
    storage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        version: VERSION,
        timestamp: Date.now(),
        categories: { necessary: false, analytics: true },
      }),
    );
    expect(readConsent(storage)).toBeNull();
  });

  it("returns null when the stored version does not match the current version", () => {
    storage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        version: VERSION + 1,
        timestamp: Date.now(),
        categories: { necessary: true, analytics: true },
      }),
    );
    expect(readConsent(storage)).toBeNull();
  });

  it("returns null when the record is older than 24 months", () => {
    storage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        version: VERSION,
        timestamp: Date.now() - (MAX_AGE_MS + 1000),
        categories: { necessary: true, analytics: true },
      }),
    );
    expect(readConsent(storage)).toBeNull();
  });

  it("returns the record when it is valid, current version, and within age", () => {
    const record: ConsentRecord = {
      version: VERSION,
      timestamp: Date.now() - 1000,
      categories: { necessary: true, analytics: true },
    };
    storage.setItem(CONSENT_KEY, JSON.stringify(record));
    expect(readConsent(storage)).toEqual(record);
  });

  it("returns null when storage.getItem itself throws", () => {
    const throwingStorage: Storage = {
      ...storage,
      getItem: () => {
        throw new Error("SecurityError");
      },
    } as unknown as Storage;
    expect(readConsent(throwingStorage)).toBeNull();
  });
});

describe("buildConsent", () => {
  it("builds a record with the current version and given analytics flag", () => {
    const before = Date.now();
    const record = buildConsent(true);
    const after = Date.now();

    expect(record.version).toBe(VERSION);
    expect(record.categories).toEqual({ necessary: true, analytics: true });
    expect(record.timestamp).toBeGreaterThanOrEqual(before);
    expect(record.timestamp).toBeLessThanOrEqual(after);
  });

  it("builds a record with analytics: false on reject", () => {
    const record = buildConsent(false);
    expect(record.categories).toEqual({ necessary: true, analytics: false });
  });
});

describe("writeConsent", () => {
  it("persists the record as JSON under CONSENT_KEY", () => {
    const storage = new StorageStub();
    const record = buildConsent(true);

    writeConsent(record, storage);

    expect(JSON.parse(storage.getItem(CONSENT_KEY)!)).toEqual(record);
  });

  it("round-trips through readConsent", () => {
    const storage = new StorageStub();
    const record = buildConsent(false);

    writeConsent(record, storage);

    expect(readConsent(storage)).toEqual(record);
  });

  it("does not throw when storage.setItem throws (e.g. Safari private mode)", () => {
    const storage = new ThrowingStorageStub();
    const record = buildConsent(true);

    expect(() => writeConsent(record, storage)).not.toThrow();
  });
});
