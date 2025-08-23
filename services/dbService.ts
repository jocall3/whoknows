import { openDB, DBSchema } from 'idb';
import type { GeneratedFile, EncryptedData } from '../types.ts';

const DB_NAME = 'devcore-db';
const DB_VERSION = 2; // Incremented version for schema change
const FILES_STORE_NAME = 'generated-files';
const VAULT_STORE_NAME = 'vault';

interface DevCoreDB extends DBSchema {
  [FILES_STORE_NAME]: {
    key: string;
    value: GeneratedFile;
    indexes: { 'by-filePath': string };
  };
  [VAULT_STORE_NAME]: {
    key: string;
    value: any;
  };
}

const dbPromise = openDB<DevCoreDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
        const store = db.createObjectStore(FILES_STORE_NAME, {
            keyPath: 'filePath',
        });
        store.createIndex('by-filePath', 'filePath');
    }
    if (oldVersion < 2) {
        db.createObjectStore(VAULT_STORE_NAME, { keyPath: 'id' });
    }
  },
});

// --- Generated Files Store ---
export const saveFile = async (file: GeneratedFile): Promise<void> => {
  const db = await dbPromise;
  await db.put(FILES_STORE_NAME, file);
};

export const getAllFiles = async (): Promise<GeneratedFile[]> => {
  const db = await dbPromise;
  return db.getAll(FILES_STORE_NAME);
};

export const clearAllFiles = async (): Promise<void> => {
  const db = await dbPromise;
  await db.clear(FILES_STORE_NAME);
};

// --- Vault Store ---
export const saveVaultData = async (id: string, data: any): Promise<void> => {
    const db = await dbPromise;
    await db.put(VAULT_STORE_NAME, { id, value: data });
}

export const getVaultData = async (id: string): Promise<any | undefined> => {
    const db = await dbPromise;
    const result = await db.get(VAULT_STORE_NAME, id);
    return result?.value;
}

export const saveEncryptedToken = async (data: EncryptedData): Promise<void> => {
    const db = await dbPromise;
    await db.put(VAULT_STORE_NAME, data);
};

export const getEncryptedToken = async (id: string): Promise<EncryptedData | undefined> => {
    const db = await dbPromise;
    return db.get(VAULT_STORE_NAME, id);
};

export const getAllEncryptedTokenIds = async (): Promise<string[]> => {
    const db = await dbPromise;
    const allKeys = await db.getAllKeys(VAULT_STORE_NAME);
    // Filter out internal vault data like the salt
    return allKeys.filter(key => key !== 'pbkdf2-salt');
}

export const clearVault = async (): Promise<void> => {
    const db = await dbPromise;
    await db.clear(VAULT_STORE_NAME);
};

// --- Global Actions ---
export const clearAllData = async (): Promise<void> => {
    await clearAllFiles();
    await clearVault();
}
