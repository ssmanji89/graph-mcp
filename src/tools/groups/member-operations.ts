import { GraphClient } from '../../graph/graph-client.js';

export async function addMembers(graphClient: GraphClient, params: any) {
  if (!params.userIds || params.userIds.length === 0) {
    throw new Error('userIds is required for add operation');
  }
  
  const addResults = [];
  for (const userId of params.userIds) {
    try {
      await graphClient.api(`/groups/${params.groupId}/members/$ref`).post({
        '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${userId}`
      });
      addResults.push({ userId, status: 'added' });
    } catch (error) {
      addResults.push({ 
        userId, status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return {
    operation: 'add', results: addResults,
    successCount: addResults.filter(r => r.status === 'added').length,
    failureCount: addResults.filter(r => r.status === 'failed').length
  };
}