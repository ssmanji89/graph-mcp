import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { CreateTeamSchema } from './schemas.js';
import { buildTeamPayload } from './team-builder.js';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

export async function executeCreateTeamImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = CreateTeamSchema.parse(args);
    const teamData = buildTeamPayload(params);
    const newTeam = await graphClient.api('/teams').post(teamData);
    
    auditService.logEvent({
      operation: 'create-team', resource: 'teams', parameters: params,
      success: true, responseTime: Date.now() - startTime, resultId: newTeam.id
    });
    
    return { team: newTeam, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'create-team', resource: 'teams', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}