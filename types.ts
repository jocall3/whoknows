import type React from 'react';
import { CHROME_VIEW_IDS } from './constants.ts';

export type ChromeViewType = typeof CHROME_VIEW_IDS[number];
export type FeatureId = string;

export interface Feature {
  id: FeatureId;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  component: React.FC<any>;
  aiConfig?: {
    model: string;
    systemInstruction?: string;
  };
}

export type ViewType = FeatureId | ChromeViewType;

export interface GeneratedFile {
  filePath: string;
  content: string;
  description: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: ViewType;
  props?: any;
  action?: () => void;
}

export interface StructuredPrSummary {
    title: string;
    summary: string;
    changes: string[];
}

export interface User {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  email: string | null;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
}

export type Theme = 'light' | 'dark';

export interface StructuredExplanation {
    summary: string;
    lineByLine: { lines: string; explanation: string }[];
    complexity: { time: string; space: string };
    suggestions: string[];
}

export interface ColorTheme {
    primary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
}

export interface SemanticColorTheme {
    palette: {
        primary: { value: string; name: string; };
        secondary: { value: string; name: string; };
        accent: { value: string; name: string; };
        neutral: { value: string; name: string; };
    };
    theme: {
        background: { value: string; name: string; };
        surface: { value: string; name: string; };
        textPrimary: { value: string; name: string; };
        textSecondary: { value: string; name: string; };
    };
    accessibility: {
        primaryOnSurface: { ratio: number; score: string; };
        textPrimaryOnSurface: { ratio: number; score: string; };
        textSecondaryOnSurface: { ratio: number; score: string; };
    };
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
}

// --- New Vault Types ---
export interface VaultState {
    isInitialized: boolean;
    isUnlocked: boolean;
}

export interface EncryptedData {
    id: string; // e.g., 'github_pat'
    ciphertext: ArrayBuffer;
    iv: Uint8Array;
}
