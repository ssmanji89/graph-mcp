import { GraphClient } from '../../graph/graph-client.js';

export const mailboxOperations = {
  async getSettings(graphClient: GraphClient, params: any) {
    const userPath = params.userId ? `/users/${params.userId}` : '/me';
    const settings = await graphClient.api(`${userPath}/mailboxSettings`).get();
    return { settings };
  },

  async updateSettings(graphClient: GraphClient, params: any) {
    if (!params.settings) throw new Error('settings is required for update operation');
    
    const userPath = params.userId ? `/users/${params.userId}` : '/me';
    const updatedSettings = await graphClient.api(`${userPath}/mailboxSettings`).patch(params.settings);
    return { settings: updatedSettings };
  },

  async getUsage(graphClient: GraphClient, params: any) {
    const userPath = params.userId ? `/users/${params.userId}` : '/me';
    const usage = await graphClient.api(`${userPath}/mailboxSettings`).get();
    return { usage };
  },

  async listRules(graphClient: GraphClient, params: any) {
    const userPath = params.userId ? `/users/${params.userId}` : '/me';
    const rulesResponse = await graphClient.api(`${userPath}/mailFolders/inbox/messageRules`).get();
    return { rules: rulesResponse.value || [], totalCount: rulesResponse.value?.length || 0 };
  }
};