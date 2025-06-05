// Enterprise Governance Module Exports
export * from './rbac-types';
export * from './compliance-types';
export * from './audit-types';
export * from './intelligence-types';
export * from './rbac-manager';
export * from './compliance-core';
export * from './audit-core';
export * from './governance-integration';
export * from './governance-middleware';
export * from './permission-intelligence';
export * from './risk-assessment';

// Main enterprise governance service
import { RBACManager } from './rbac-manager';
import { ComplianceCore } from './compliance-core';
import { AuditCore } from './audit-core';
import { PermissionIntelligence } from './permission-intelligence';
import { RiskAssessmentService } from './risk-assessment';

export class EnterpriseGovernance {
  public readonly rbac: RBACManager;
  public readonly compliance: ComplianceCore;
  public readonly audit: AuditCore;
  public readonly intelligence: PermissionIntelligence;
  public readonly riskAssessment: RiskAssessmentService;

  constructor() {
    this.rbac = new RBACManager();
    this.compliance = new ComplianceCore();
    this.audit = new AuditCore();
    this.intelligence = new PermissionIntelligence(this.rbac, this.audit);
    this.riskAssessment = new RiskAssessmentService(this.intelligence);
  }

  /**
   * Initialize enterprise governance
   */
  async initialize(): Promise<void> {
    await this.compliance.initialize();
    await this.audit.initialize();
  }
}

export const enterpriseGovernance = new EnterpriseGovernance();