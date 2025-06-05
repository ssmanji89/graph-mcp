import { PermissionIntelligence } from './permission-intelligence';
import { RiskAssessmentService } from './risk-assessment';
import { RBACManager } from './rbac-manager';
import { AuditCore } from './audit-core';

describe('PermissionIntelligence', () => {
  let rbac: RBACManager;
  let audit: AuditCore;
  let intelligence: PermissionIntelligence;
  let riskAssessment: RiskAssessmentService;

  beforeEach(() => {
    rbac = new RBACManager();
    audit = new AuditCore();
    intelligence = new PermissionIntelligence(rbac, audit);
    riskAssessment = new RiskAssessmentService(intelligence);
  });

  describe('analyzeUserPermissions', () => {
    it('should analyze user permission patterns', async () => {
      const result = await intelligence.analyzeUserPermissions('user1');
      expect(result).toHaveProperty('userId', 'user1');
      expect(result).toHaveProperty('totalRoles');
      expect(result).toHaveProperty('totalPermissions');
      expect(result).toHaveProperty('riskScore');
    });
  });

  describe('detectOverPrivilegedUsers', () => {
    it('should detect over-privileged users', async () => {
      const result = await intelligence.detectOverPrivilegedUsers();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateInsights', () => {
    it('should generate permission insights', async () => {
      const result = await intelligence.generateInsights();
      expect(Array.isArray(result)).toBe(true);
    });
  });
}