import { ComplianceCore } from './compliance-core';
import { logger } from '../../services/logging-service';
import { ComplianceReportRequestSchema } from './compliance-schemas';

export async function generateComplianceReportHandler(
  req: any, 
  res: any, 
  complianceCore: ComplianceCore
): Promise<void> {
  try {
    const validation = ComplianceReportRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed'
      });
    }

    const { moduleId } = validation.data;
    const report = await complianceCore.generateReport(moduleId);
    
    logger.info('Generated compliance report', { moduleId });
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Failed to generate compliance report', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate compliance report'
    });
  }
}

export async function getModulesHandler(req: any, res: any): Promise<void> {
  try {
    const modules = [
      { id: 'gdpr', name: 'GDPR Compliance', enabled: true, requirementCount: 25 },
      { id: 'hipaa', name: 'HIPAA Compliance', enabled: false, requirementCount: 18 },
      { id: 'sox', name: 'SOX Compliance', enabled: true, requirementCount: 32 }
    ];
    res.json({ success: true, data: modules });
  } catch (error) {
    logger.error('Failed to get modules', { error });
    res.status(500).json({ success: false, error: 'Failed to get modules' });
  }
}export async function getOverviewHandler(req: any, res: any): Promise<void> {
  try {
    const overview = { 
      compliant: 1, 
      nonCompliant: 0, 
      partial: 2, 
      total: 3,
      lastUpdated: new Date().toISOString()
    };
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('Failed to get overview', { error });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get overview' 
    });
  }
}