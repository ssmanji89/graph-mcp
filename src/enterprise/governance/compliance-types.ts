export interface ComplianceModule {
  id: string;
  name: string;
  description: string;
  requirements: ComplianceRequirement[];
  enabled: boolean;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  category: 'data-protection' | 'access-control' | 'audit-trail' | 'encryption';
  mandatory: boolean;
  implemented: boolean;
  evidence?: string;
}

export interface ComplianceReport {
  moduleId: string;
  overall: 'compliant' | 'non-compliant' | 'partial';
  requirements: ComplianceRequirement[];
  generatedAt: Date;
  recommendations: string[];
}