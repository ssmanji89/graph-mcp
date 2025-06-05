import { GraphClient } from '../../graph/graph-client.js';

export const channelOperations = {
  async list(graphClient: GraphClient, params: any) {
    const channelsResponse = await graphClient.api(`/teams/${params.teamId}/channels`).get();
    return { channels: channelsResponse.value || [], totalCount: channelsResponse.value?.length || 0 };
  },

  async create(graphClient: GraphClient, params: any) {
    if (!params.displayName) throw new Error('displayName is required for create operation');
    
    const channelData: any = {
      displayName: params.displayName,
      description: params.description || '',
      membershipType: params.membershipType || 'standard'
    };
    
    const newChannel = await graphClient.api(`/teams/${params.teamId}/channels`).post(channelData);
    return { channel: newChannel };
  },

  async get(graphClient: GraphClient, params: any) {
    if (!params.channelId) throw new Error('channelId is required for get operation');
    const channel = await graphClient.api(`/teams/${params.teamId}/channels/${params.channelId}`).get();
    return { channel };
  },

  async update(graphClient: GraphClient, params: any) {
    if (!params.channelId) throw new Error('channelId is required for update operation');
    
    const updateData: any = {};
    if (params.displayName) updateData.displayName = params.displayName;
    if (params.description !== undefined) updateData.description = params.description;
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('At least one property (displayName, description) is required for update');
    }
    
    const updatedChannel = await graphClient.api(`/teams/${params.teamId}/channels/${params.channelId}`).patch(updateData);
    return { channel: updatedChannel };
  },

  async delete(graphClient: GraphClient, params: any) {
    if (!params.channelId) throw new Error('channelId is required for delete operation');
    await graphClient.api(`/teams/${params.teamId}/channels/${params.channelId}`).delete();
    return { success: true, message: 'Channel deleted successfully' };
  }
};