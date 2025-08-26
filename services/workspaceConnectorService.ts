import * as vaultService from './vaultService.ts';
import { logError, logEvent } from './telemetryService.ts';
import { getDecryptedCredential } from './vaultService.ts';
import { simulationState } from './simulationState.ts';
import * as plaidService from './live/plaidService.ts';

// Interface for any action
export interface WorkspaceAction {
  id: string; // e.g., 'jira_create_ticket'
  service: 'Jira' | 'Slack' | 'GitHub' | 'Plaid';
  description: string;
  // Function to define the necessary input fields for this action
  getParameters: () => { [key: string]: { type: 'string' | 'number', required: boolean, default?: string } };
  // The actual logic to execute the action
  execute: (params: any) => Promise<any>;
}

// THE REGISTRY: This is the pattern for all services.
export const ACTION_REGISTRY: Map<string, WorkspaceAction> = new Map();

// --- JIRA EXAMPLE ---
ACTION_REGISTRY.set('jira_create_ticket', {
  id: 'jira_create_ticket',
  service: 'Jira',
  description: 'Creates a new issue in a Jira project.',
  getParameters: () => ({
    projectKey: { type: 'string', required: true },
    summary: { type: 'string', required: true },
    description: { type: 'string', required: false },
    issueType: { type: 'string', required: true, default: 'Task' }
  }),
  execute: async (params) => {
    if (simulationState.isSimulationMode) {
        return { id: `SIM-${Math.floor(Math.random() * 1000)}`, key: 'SIM-123', self: 'http://localhost/jira/rest/api/2/issue/SIM-123', message: "Jira ticket created in simulation." };
    }

    const domain = await getDecryptedCredential('jira_domain');
    const token = await getDecryptedCredential('jira_pat');
    const email = await getDecryptedCredential('jira_email');

    if (!domain || !token || !email) {
        throw new Error("Jira credentials not found in vault. Please connect Jira in the Workspace Connector Hub.");
    }
    
    // The Atlassian Document Format for the description field
    const descriptionDoc = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: params.description || '',
              type: 'text'
            }
          ]
        }
      ]
    };

    const response = await fetch(`https://${domain}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${email}:${token}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
           project: { key: params.projectKey },
           summary: params.summary,
           description: descriptionDoc,
           issuetype: { name: params.issueType || 'Task' }
        }
      })
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Jira API Error (${response.status}): ${errorBody}`);
    }
    return response.json();
  }
});

// --- SLACK EXAMPLE ---
ACTION_REGISTRY.set('slack_post_message', {
  id: 'slack_post_message',
  service: 'Slack',
  description: 'Posts a message to a Slack channel.',
  getParameters: () => ({
    channel: { type: 'string', required: true }, // e.g., #engineering or C1234567
    text: { type: 'string', required: true }
  }),
  execute: async (params) => {
     if (simulationState.isSimulationMode) {
        return { ok: true, channel: params.channel, ts: new Date().getTime() / 1000, message: { text: params.text }, status_message: "Message posted to Slack in simulation." };
    }
    const token = await getDecryptedCredential('slack_bot_token');
    if (!token) {
        throw new Error("Slack credentials not found in vault. Please connect Slack in the Workspace Connector Hub.");
    }
    const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            channel: params.channel,
            text: params.text
        })
    });
     if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Slack API Error: ${errorBody.error}`);
    }
    return response.json();
  }
});


// --- PLAID EXAMPLE ---
ACTION_REGISTRY.set('plaid_link_account', {
    id: 'plaid_link_account',
    service: 'Plaid',
    description: 'Links a new bank account using Plaid.',
    getParameters: () => ({}),
    execute: async () => {
        if (simulationState.isSimulationMode) {
            return { public_token: 'sim_public_token_123', account_id: 'sim_account_id_456', message: "Successfully linked account in simulation." };
        } else {
            // This would trigger the Plaid Link flow for the user.
            return plaidService.linkPlaidAccount();
        }
    }
});


// --- CENTRAL EXECUTION FUNCTION ---
export async function executeWorkspaceAction(actionId: string, params: any): Promise<any> {
    const action = ACTION_REGISTRY.get(actionId);
    if (!action) {
        throw new Error(`Action "${actionId}" not found.`);
    }
    logEvent('workspace_action_execute', { actionId, isSimulation: simulationState.isSimulationMode });
    try {
        const result = await action.execute(params);
        logEvent('workspace_action_success', { actionId, isSimulation: simulationState.isSimulationMode });
        return result;
    } catch (error) {
        logError(error as Error, { context: 'executeWorkspaceAction', actionId, isSimulation: simulationState.isSimulationMode });
        throw error;
    }
}