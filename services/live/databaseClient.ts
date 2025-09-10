/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GeneratedFile, EncryptedData, CustomFeature } from '../../types.ts';

// LIVE MODE IMPLEMENTATION: Connect to production-grade database (e.g., PostgreSQL, AlloyDB) here.

export const queryProductionDB = async (query: string, params: any[]): Promise<any> => {
    console.warn('LIVE MODE: queryProductionDB not implemented.');
    return Promise.resolve([]);
};

export const mutateProductionDB = async (query: string, params: any[]): Promise<any> => {
    console.warn('LIVE MODE: mutateProductionDB not implemented.');
    return Promise.resolve({ rowCount: 0 });
};

// --- Stubs for dbService functions ---

export const liveSaveFile = async (file: GeneratedFile): Promise<void> => {
    console.warn('LIVE MODE: liveSaveFile not implemented.', file);
    return Promise.resolve();
};

export const liveGetAllFiles = async (): Promise<GeneratedFile[]> => {
    console.warn('LIVE MODE: liveGetAllFiles not implemented.');
    return Promise.resolve([]);
};

export const liveGetFileByPath = async (filePath: string): Promise<GeneratedFile | undefined> => {
    console.warn('LIVE MODE: liveGetFileByPath not implemented.', filePath);
    return Promise.resolve(undefined);
};

export const liveClearAllFiles = async (): Promise<void> => {
    console.warn('LIVE MODE: liveClearAllFiles not implemented.');
    return Promise.resolve();
};

export const liveSaveVaultData = async (key: string, value: any): Promise<void> => {
    console.warn('LIVE MODE: liveSaveVaultData not implemented.', key, value);
    return Promise.resolve();
};

export const liveGetVaultData = async (key: string): Promise<any | undefined> => {
    console.warn('LIVE MODE: liveGetVaultData not implemented.', key);
    return Promise.resolve(undefined);
};

export const liveSaveEncryptedToken = async (data: EncryptedData): Promise<void> => {
    console.warn('LIVE MODE: liveSaveEncryptedToken not implemented.', data);
    return Promise.resolve();
};

export const liveGetEncryptedToken = async (id: string): Promise<EncryptedData | undefined> => {
    console.warn('LIVE MODE: liveGetEncryptedToken not implemented.', id);
    return Promise.resolve(undefined);
};

export const liveGetAllEncryptedTokenIds = async (): Promise<string[]> => {
    console.warn('LIVE MODE: liveGetAllEncryptedTokenIds not implemented.');
    return Promise.resolve([]);
};

export const liveSaveCustomFeature = async (feature: CustomFeature): Promise<void> => {
    console.warn('LIVE MODE: liveSaveCustomFeature not implemented.', feature);
    return Promise.resolve();
};

export const liveGetAllCustomFeatures = async (): Promise<CustomFeature[]> => {
    console.warn('LIVE MODE: liveGetAllCustomFeatures not implemented.');
    return Promise.resolve([]);
};

export const liveGetCustomFeature = async (id: string): Promise<CustomFeature | undefined> => {
    console.warn('LIVE MODE: liveGetCustomFeature not implemented.', id);
    return Promise.resolve(undefined);
};

export const liveDeleteCustomFeature = async (id: string): Promise<void> => {
    console.warn('LIVE MODE: liveDeleteCustomFeature not implemented.', id);
    return Promise.resolve();
};

export const liveClearAllData = async (): Promise<void> => {
    console.warn('LIVE MODE: liveClearAllData not implemented.');
    return Promise.resolve();
};
