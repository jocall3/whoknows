// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import type { FeatureCategory } from '../types.ts';

export const CHROME_VIEW_IDS = ['features-list'] as const;

export const SLOTS: FeatureCategory[] = ['Global Economic Operating System', 'Computational Compassion at Scale', 'The Meta-Creation Platform', 'The Governance Layer'];

export const FEATURE_CATEGORIES = [
    'Global Economic Operating System',
    'Computational Compassion at Scale',
    'The Meta-Creation Platform',
    'The Governance Layer',
    'Core', 'Workflow', 'AI Tools', 'Testing', 'Git', 'Deployment', 'Data',
    'Local Dev', 'Performance & Auditing', 'Deployment & CI/CD', 'Security',
    'Productivity', 'Cloud', 'Custom'
] as const;