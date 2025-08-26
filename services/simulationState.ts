/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This is a simple state holder that allows services (which are outside of React's context)
// to know the current simulation mode. It's a pragmatic solution to avoid major refactoring.
// The state is kept in sync with the React GlobalStateContext.
export const simulationState = {
    isSimulationMode: true,
};
