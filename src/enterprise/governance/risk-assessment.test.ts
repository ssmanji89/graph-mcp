import { RiskAssessmentService } from './risk-assessment';
import { PermissionIntelligence } from './permission-intelligence';
import { RBACManager } from './rbac-manager';
import { AuditCore } from './audit-core';

describe('RiskAssessmentService', () => {
  let riskAssessment: RiskAssessmentService;
  let intelligence: PermissionIntelligence;

  beforeEach(() => {
    const rbac = new RBACManager();
    const audit = new AuditCore();
    intelligence = new PermissionIntelligence(rbac, audit);
    riskAssessment = new RiskAssessmentService(intelligence);
  });

  describe('assessUserRisk', () => {
    it('should assess user risk comprehensively', async () => {
      const result = await riskAssessment.assessUserRisk('user1');
      
      expect(result).toHaveProperty('userId', 'user1');
      expect(result).toHaveProperty('overallRisk');
      expect(result).toHaveProperty('riskFactors');
      expect(result).toHaveProperty('mitigation');
      expect(Array.isArray(result.riskFactors)).toBe(true);
      expect(Array.isArray(result.mitigation)).toBe(true);
    });

    it('should handle risk assessment errors gracefully', async () => {
      await expect(riskAssessment.assessUserRisk('invalid-user')).rejects.toThrow();
    });
  });
});