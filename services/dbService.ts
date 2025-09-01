import { openDB, DBSchema } from 'idb';
import type { GeneratedFile, EncryptedData, CustomFeature } from '../types.ts';
import { simulationState } from './simulationState.ts';
import * as liveDB from './live/databaseClient.ts';

const DB_NAME = 'devcore-db';
const DB_VERSION = 3; // Incremented version for new store
const FILES_STORE_NAME = 'generated-files';
const VAULT_STORE_NAME = 'vault-data';
const ENCRYPTED_TOKENS_STORE_NAME = 'encrypted-tokens';
const CUSTOM_FEATURES_STORE_NAME = 'custom-features';


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
  [ENCRYPTED_TOKENS_STORE_NAME]: {
    key: string;
    value: EncryptedData;
  };
  [CUSTOM_FEATURES_STORE_NAME]: {
    key: string;
    value: CustomFeature;
  };
}

const dbPromise = openDB<DevCoreDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    switch (oldVersion) {
        case 0: {
            const store = db.createObjectStore(FILES_STORE_NAME, {
                keyPath: 'filePath',
            });
            store.createIndex('by-filePath', 'filePath');
        }
        // fall-through for new installations
        case 1: {
            if (!db.objectStoreNames.contains(VAULT_STORE_NAME)) {
                db.createObjectStore(VAULT_STORE_NAME);
            }
            if (!db.objectStoreNames.contains(ENCRYPTED_TOKENS_STORE_NAME)) {
                db.createObjectStore(ENCRYPTED_TOKENS_STORE_NAME, { keyPath: 'id' });
            }
        }
        // fall-through for version 2 to 3 upgrade
        case 2: {
             if (!db.objectStoreNames.contains(CUSTOM_FEATURES_STORE_NAME)) {
                db.createObjectStore(CUSTOM_FEATURES_STORE_NAME, { keyPath: 'id' });
            }
        }
    }
  },
});

// --- Generated Files Store ---
export const saveFile = async (file: GeneratedFile): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.put(FILES_STORE_NAME, file);
    } else {
        await liveDB.liveSaveFile(file);
    }
};

export const getAllFiles = async (): Promise<GeneratedFile[]> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.getAll(FILES_STORE_NAME);
    } else {
        return liveDB.liveGetAllFiles();
    }
};

export const getFileByPath = async (filePath: string): Promise<GeneratedFile | undefined> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.get(FILES_STORE_NAME, filePath);
    } else {
        return liveDB.liveGetFileByPath(filePath);
    }
};

export const clearAllFiles = async (): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.clear(FILES_STORE_NAME);
    } else {
        await liveDB.liveClearAllFiles();
    }
};

// --- Vault Store ---
export const saveVaultData = async (key: string, value: any): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.put(VAULT_STORE_NAME, value, key);
    } else {
        await liveDB.liveSaveVaultData(key, value);
    }
};

export const getVaultData = async (key: string): Promise<any | undefined> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.get(VAULT_STORE_NAME, key);
    } else {
        return liveDB.liveGetVaultData(key);
    }
};

// --- Encrypted Tokens Store ---
export const saveEncryptedToken = async (data: EncryptedData): Promise<void> => {
     if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.put(ENCRYPTED_TOKENS_STORE_NAME, data);
    } else {
        await liveDB.liveSaveEncryptedToken(data);
    }
};

export const getEncryptedToken = async (id: string): Promise<EncryptedData | undefined> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.get(ENCRYPTED_TOKENS_STORE_NAME, id);
    } else {
        return liveDB.liveGetEncryptedToken(id);
    }
};

export const getAllEncryptedTokenIds = async (): Promise<string[]> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.getAllKeys(ENCRYPTED_TOKENS_STORE_NAME);
    } else {
        return liveDB.liveGetAllEncryptedTokenIds();
    }
};

// --- Custom Features Store ---
export const saveCustomFeature = async (feature: CustomFeature): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.put(CUSTOM_FEATURES_STORE_NAME, feature);
    } else {
        await liveDB.liveSaveCustomFeature(feature);
    }
};

// Compatibility alias used by some components that import using the
// `db_` prefix (e.g., `db_saveCustomFeature`). Keep this thin wrapper to
// avoid changing many import sites across the codebase.
export const db_saveCustomFeature = saveCustomFeature;

export const getAllCustomFeatures = async (): Promise<CustomFeature[]> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.getAll(CUSTOM_FEATURES_STORE_NAME);
    } else {
        return liveDB.liveGetAllCustomFeatures();
    }
};

export const getCustomFeature = async (id: string): Promise<CustomFeature | undefined> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        return db.get(CUSTOM_FEATURES_STORE_NAME, id);
    } else {
        return liveDB.liveGetCustomFeature(id);
    }
};

export const deleteCustomFeature = async (id: string): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.delete(CUSTOM_FEATURES_STORE_NAME, id);
    } else {
        await liveDB.liveDeleteCustomFeature(id);
    }
};

// --- Encrypted Token Helpers (compatibility) ---
export const deleteEncryptedToken = async (id: string): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.delete(ENCRYPTED_TOKENS_STORE_NAME, id);
    } else {
        if ((liveDB as any).liveDeleteEncryptedToken) {
            await (liveDB as any).liveDeleteEncryptedToken(id);
        } else {
            console.warn('liveDeleteEncryptedToken not implemented in liveDB');
        }
    }
};

export const saveVaultAccessLog = async (entry: any): Promise<void> => {
    // For now, persist vault access logs to the VAULT_STORE_NAME under a special key.
    // This is intentionally simple to avoid schema migrations in this exercise.
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        const logs = (await db.get(VAULT_STORE_NAME, 'access-logs')) || [];
        logs.push(entry);
        await db.put(VAULT_STORE_NAME, logs, 'access-logs');
    } else {
        if ((liveDB as any).liveSaveVaultAccessLog) {
            await (liveDB as any).liveSaveVaultAccessLog(entry);
        } else {
            console.warn('saveVaultAccessLog not implemented in liveDB');
        }
    }
};


// --- Global Actions ---
export const clearAllData = async (): Promise<void> => {
    if (simulationState.isSimulationMode) {
        const db = await dbPromise;
        await db.clear(FILES_STORE_NAME);
        await db.clear(VAULT_STORE_NAME);
        await db.clear(ENCRYPTED_TOKENS_STORE_NAME);
        await db.clear(CUSTOM_FEATURES_STORE_NAME);
    } else {
        await liveDB.liveClearAllData();
    }
}