export function buildTeamPayload(params: any): any {
  const teamData: any = {
    'template@odata.bind': params.template || "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
    displayName: params.displayName,
    description: params.description || '',
    visibility: params.visibility || 'private'
  };

  // Add members if specified
  if (params.members || params.owners) {
    teamData.members = [];
    
    if (params.owners) {
      for (const ownerId of params.owners) {
        teamData.members.push({
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${ownerId}')`,
          roles: ['owner']
        });
      }
    }
    
    if (params.members) {
      for (const memberId of params.members) {
        teamData.members.push({
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${memberId}')`,
          roles: ['member']
        });
      }
    }
  }

  return teamData;
}