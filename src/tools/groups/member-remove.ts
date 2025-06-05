import { GraphClient } from '../../graph/graph-client.js';

export async function removeMembers(graphClient: GraphClient, params: any) {
  if (!params.userIds || params.userIds.length === 0) {
    throw new Error('userIds is required for remove operation');
  }
  
  const removeResults = [];
  for (const userId of params.userIds) {
    try {
      await graphClient.api(`/groups/${params.groupId}/members/${userId}/$ref`).delete();
      removeResults.push({ userId, status: 'removed' });
    } catch (error) {
      removeResults.push({ 
        userId, status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return {
    operation: 'remove', results: removeResults,
    successCount: removeResults.filter(r => r.status === 'removed').length,
    failureCount: removeResults.filter(r => r.status === 'failed').length
  };
}