// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as axe from 'axe-core';

// When using a namespace import with a module that has a default export (common with CDNs),
// the actual API is often on the .default property. This handles that gracefully.
const axeApi = (axe as any).default ?? axe;


// Configure axe-core to be less noisy in the console
axeApi.configure({
    reporter: 'v2',
    rules: [
        { id: 'region', enabled: false } // A common false positive in isolated components
    ]
});

export type AxeResult = axe.AxeResults;

/**
 * Runs an axe accessibility audit on a given HTML element.
 * @param context The element or selector string to run the audit on.
 * @returns A promise that resolves with the axe audit results.
 */
export const runAxeAudit = async (context: axe.ElementContext): Promise<AxeResult> => {
    try {
        const results = await axeApi.run(context, {
             resultTypes: ['violations', 'incomplete']
        });
        return results;
    } catch (error) {
        console.error('Error running axe audit:', error);
        throw new Error('Accessibility audit failed to execute.');
    }
};