export interface PermissionAnalysis {
  userId: string;
  totalRoles: number;
  totalPermissions: number;
  unusedPermissions: string[];
  riskScore: number;
  recommendations: string[];
}

export interface OverPrivilegedUser {
  userId: string;
  riskScore: number;
  unusedPermissionCount: number;
  recommendations: string[];
}

export interface PermissionInsight {
  type: 'over_privileged' | 'unused_permissions' | 'role_sprawl' | 'permission_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  description: string;
  recommendation: string;
}

export interface RiskAssessment {
  userId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigation: string[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
}

export interface PermissionRecommendation {
  userId: string;
  action: 'remove' | 'add' | 'modify';
  permission: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}