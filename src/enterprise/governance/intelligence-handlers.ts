import { PermissionIntelligence } from './permission-intelligence';
import { RiskAssessmentService } from './risk-assessment';
import { logger } from '../../services/logging-service';

export async function analyzeUserHandler(req: any, res: any, intelligence: PermissionIntelligence): Promise<void> {
  try {
    const { userId } = req.params;
    const analysis = await intelligence.analyzeUserPermissions(userId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('Failed to analyze user', { error });
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
}

export async function getOverPrivilegedHandler(req: any, res: any, intelligence: PermissionIntelligence): Promise<void> {
  try {
    const users = await intelligence.detectOverPrivilegedUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Failed to get over-privileged users', { error });
    res.status(500).json({ success: false, error: 'Detection failed' });
  }
}

export async function getInsightsHandler(req: any, res: any, intelligence: PermissionIntelligence): Promise<void> {
  try {
    const insights = await intelligence.generateInsights();
    res.json({ success: true, data: insights });
  } catch (error) {
    logger.error('Failed to generate insights', { error });
    res.status(500).json({ success: false, error: 'Insights generation failed' });
  }
}

export async function assessRiskHandler(req: any, res: any, riskAssessment: RiskAssessmentService): Promise<void> {
  try {
    const { userId } = req.params;
    const assessment = await riskAssessment.assessUserRisk(userId);
    res.json({ success: true, data: assessment });
  } catch (error) {
    logger.error('Failed to assess risk', { error });
    res.status(500).json({ success: false, error: 'Risk assessment failed' });
  }
}