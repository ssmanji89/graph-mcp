import { PermissionIntelligence } from './permission-intelligence';
import { RiskAssessment } from './intelligence-types';
import { logger } from '../../services/logging-service';
import { identifyRiskFactors, calculateOverallRisk } from './risk-utils';
import { generateMitigationStrategies } from './mitigation-utils';

/**
 * Risk Assessment Service
 */
export class RiskAssessmentService {
  private intelligence: PermissionIntelligence;

  constructor(intelligence: PermissionIntelligence) {
    this.intelligence = intelligence;
  }

  /**
   * Assess security risks for a user
   */
  async assessUserRisk(userId: string): Promise<RiskAssessment> {
    try {
      const analysis = await this.intelligence.analyzeUserPermissions(userId);
      const riskFactors = identifyRiskFactors(analysis);
      const overallRisk = calculateOverallRisk(riskFactors);
      const mitigation = generateMitigationStrategies(riskFactors);

      return {
        userId,
        overallRisk,
        riskFactors,
        mitigation
      };
    } catch (error) {
      logger.error('Failed to assess user risk', { error, userId });
      throw error;
    }
  }
}