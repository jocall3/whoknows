/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const linkPlaidAccount = async (): Promise<any> => {
    // LIVE MODE IMPLEMENTATION: Initiate OAuth 2.0 flow with Plaid API here.
    console.warn('LIVE MODE: linkPlaidAccount not implemented.');
    // This would typically open a new window or redirect for the Plaid Link flow.
    // For this stub, we'll just return a promise that doesn't resolve to simulate user interaction.
    return new Promise(() => {}); 
};

export const fetchAccountBalances = async (): Promise<any> => {
    // LIVE MODE IMPLEMENTATION: Make authenticated API call to Plaid to fetch balances.
    console.warn('LIVE MODE: fetchAccountBalances not implemented.');
    return Promise.resolve({ accounts: [] });
};
