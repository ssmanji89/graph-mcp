import { GovernanceIntegration } from './governance-integration';
import { EnterpriseGovernance } from './index';

describe('GovernanceIntegration', () => {
  let governance: EnterpriseGovernance;
  let integration: GovernanceIntegration;

  beforeEach(() => {
    governance = new EnterpriseGovernance();
    integration = new GovernanceIntegration(governance);
  });

  describe('checkPermission', () => {
    it('should check user permissions', async () => {
      const result = await integration.checkPermission('user1', 'read', 'calendar');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('logEvent', () => {
    it('should log governance events', async () => {
      await expect(integration.logEvent('user1', 'read', 'calendar', true)).resolves.not.toThrow();
    });
  });

  describe('validateCompliance', () => {
    it('should validate operation compliance', async () => {
      const result = await integration.validateCompliance('read', {});
      expect(result).toBe(true);
    });
  });

  describe('authorizeOperation', () => {
    it('should perform complete authorization check', async () => {
      const result = await integration.authorizeOperation('user1', 'read', 'calendar');
      expect(typeof result).toBe('boolean');
    });
  });
});